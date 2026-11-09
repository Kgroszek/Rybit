import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getTripApiAccess,
  getUserDisplayName,
} from "@/lib/trip-api-access";

type RouteProps = { params: Promise<{ id: string }> };

const BUCKET = "catch-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const access = await getTripApiAccess(id);

    if (!access.ok) {
      return NextResponse.json({ message: access.message }, { status: access.status });
    }

    if (!access.canEdit) {
      return NextResponse.json(
        { message: "Nie masz uprawnień do dodawania zdjęć." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const images = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File && value.size > 0);

    const legacyImage = formData.get("image");
    if (images.length === 0 && legacyImage instanceof File && legacyImage.size > 0) {
      images.push(legacyImage);
    }

    const caption = String(formData.get("caption") ?? "").trim();

    if (images.length === 0) {
      return NextResponse.json({ message: "Wybierz co najmniej jedno zdjęcie." }, { status: 400 });
    }

    if (images.length > 10) {
      return NextResponse.json({ message: "Możesz dodać maksymalnie 10 zdjęć jednocześnie." }, { status: 400 });
    }

    if (caption.length > 300) {
      return NextResponse.json(
        { message: "Opis zdjęcia może mieć maksymalnie 300 znaków." },
        { status: 400 }
      );
    }

    for (const image of images) {
      if (!image.type.startsWith("image/") || image.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: `Plik „${image.name}” nie jest poprawnym zdjęciem lub przekracza 5 MB.` },
          { status: 400 }
        );
      }
    }

    const uploaded: Array<{ imagePath: string; publicUrl: string; name: string }> = [];

    try {
      for (let index = 0; index < images.length; index += 1) {
        const image = images[index];
        const fileName = sanitizeFileName(image.name) || `trip-photo-${index + 1}.jpg`;
        const imagePath = `${access.user.id}/trips/${id}/media/${Date.now()}-${index}-${fileName}`;

        const { error: uploadError } = await access.supabase.storage
          .from(BUCKET)
          .upload(imagePath, image, {
            cacheControl: "3600",
            upsert: false,
            contentType: image.type,
          });

        if (uploadError) {
          throw new Error(uploadError.message || "Nie udało się wysłać zdjęcia.");
        }

        const {
          data: { publicUrl },
        } = access.supabase.storage.from(BUCKET).getPublicUrl(imagePath);

        uploaded.push({ imagePath, publicUrl, name: image.name });
      }

      const actorName = getUserDisplayName(access.user);

      const media = await prisma.$transaction(async (tx) => {
        const created = [];

        for (const item of uploaded) {
          created.push(
            await tx.tripMedia.create({
              data: {
                tripId: id,
                userId: access.user.id,
                userName: actorName,
                url: item.publicUrl,
                imagePath: item.imagePath,
                caption: caption || null,
              },
            })
          );
        }

        await tx.tripActivity.create({
          data: {
            tripId: id,
            actorUserId: access.user.id,
            actorName,
            action: created.length > 1 ? "media_added_bulk" : "media_added",
            metadata: {
              count: created.length,
              mediaIds: created.map((item) => item.id),
            },
          },
        });

        return created;
      });

      return NextResponse.json(
        {
          message: media.length === 1 ? "Zdjęcie zostało dodane." : `Dodano ${media.length} zdjęć.`,
          media,
        },
        { status: 201 }
      );
    } catch (error) {
      if (uploaded.length > 0) {
        await access.supabase.storage.from(BUCKET).remove(uploaded.map((item) => item.imagePath));
      }
      throw error;
    }
  } catch (error) {
    console.error("[trip media POST]", error);
    return NextResponse.json({ message: "Nie udało się dodać zdjęć." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const access = await getTripApiAccess(id);

    if (!access.ok) {
      return NextResponse.json({ message: access.message }, { status: access.status });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const mediaId = String(body?.mediaId ?? "").trim();

    const media = await prisma.tripMedia.findFirst({
      where: { id: mediaId, tripId: id },
      select: { id: true, userId: true, imagePath: true, caption: true },
    });

    if (!media) {
      return NextResponse.json({ message: "Nie znaleziono zdjęcia." }, { status: 404 });
    }

    if (!access.isOwner && media.userId !== access.user.id) {
      return NextResponse.json(
        { message: "Możesz usunąć tylko własne zdjęcie." },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.tripMedia.delete({ where: { id: media.id } });
      await tx.tripActivity.create({
        data: {
          tripId: id,
          actorUserId: access.user.id,
          actorName: getUserDisplayName(access.user),
          action: "media_deleted",
          metadata: {
            mediaId: media.id,
            caption: media.caption,
          },
        },
      });
    });

    if (media.imagePath) {
      const { error: storageError } = await access.supabase.storage
        .from(BUCKET)
        .remove([media.imagePath]);

      if (storageError) {
        console.warn("[trip media DELETE] Nie udało się usunąć pliku ze storage:", storageError);
      }
    }

    return NextResponse.json({ message: "Zdjęcie zostało usunięte." });
  } catch (error) {
    console.error("[trip media DELETE]", error);
    return NextResponse.json({ message: "Nie udało się usunąć zdjęcia." }, { status: 500 });
  }
}
