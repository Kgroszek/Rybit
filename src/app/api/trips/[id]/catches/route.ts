import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getTripApiAccess,
  getUserDisplayName,
} from "@/lib/trip-api-access";

type RouteProps = { params: Promise<{ id: string }> };

const BUCKET = "catch-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const FUTURE_TOLERANCE = 2 * 60 * 1000;

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
}

function parseOptionalNumber(value: string) {
  if (!value) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
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
        { message: "Nie masz uprawnień do dodawania połowów do tej wyprawy." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const fishName = getText(formData, "fishName");
    const method = getText(formData, "method");
    const caughtAtValue = getText(formData, "caughtAt");
    const bait = getText(formData, "bait");
    const note = getText(formData, "note");
    const weight = parseOptionalNumber(getText(formData, "weight"));
    const length = parseOptionalNumber(getText(formData, "length"));
    const isPublic = getText(formData, "isPublic") === "true";
    const imageValue = formData.get("image");
    const image = imageValue instanceof File && imageValue.size > 0 ? imageValue : null;

    if (!fishName || !method || !caughtAtValue) {
      return NextResponse.json(
        { message: "Gatunek, metoda i data połowu są wymagane." },
        { status: 400 }
      );
    }

    const caughtAt = new Date(caughtAtValue);
    if (Number.isNaN(caughtAt.getTime()) || caughtAt.getTime() > Date.now() + FUTURE_TOLERANCE) {
      return NextResponse.json({ message: "Podaj prawidłową datę połowu." }, { status: 400 });
    }

    if (image && (!image.type.startsWith("image/") || image.size > MAX_FILE_SIZE)) {
      return NextResponse.json(
        { message: "Zdjęcie musi być plikiem graficznym do 5 MB." },
        { status: 400 }
      );
    }

    if (isPublic && !access.trip.lakeId) {
      return NextResponse.json(
        { message: "Publiczny połów wymaga łowiska przypisanego do wyprawy." },
        { status: 400 }
      );
    }

    if (isPublic && !image) {
      return NextResponse.json(
        { message: "Aby dodać połów do rankingu, dodaj zdjęcie." },
        { status: 400 }
      );
    }

    if (isPublic && weight === null && length === null) {
      return NextResponse.json(
        { message: "Aby dodać połów do rankingu, wpisz wagę lub długość." },
        { status: 400 }
      );
    }

    let imagePath: string | null = null;
    let imageUrl: string | null = null;

    if (image) {
      const fileName = sanitizeFileName(image.name) || "catch.jpg";
      imagePath = `${access.user.id}/trips/${id}/catches/${Date.now()}-${fileName}`;

      const { error: uploadError } = await access.supabase.storage
        .from(BUCKET)
        .upload(imagePath, image, {
          cacheControl: "3600",
          upsert: false,
          contentType: image.type,
        });

      if (uploadError) {
        return NextResponse.json({ message: uploadError.message }, { status: 500 });
      }

      const {
        data: { publicUrl },
      } = access.supabase.storage.from(BUCKET).getPublicUrl(imagePath);
      imageUrl = publicUrl;
    }

    try {
      const actorName = getUserDisplayName(access.user);

      const fishingCatch = await prisma.$transaction(async (tx) => {
        const created = await tx.fishingCatch.create({
          data: {
            userId: access.user.id,
            userName: actorName,
            fishName,
            weight,
            length,
            method,
            bait: bait || null,
            caughtAt,
            lakeId: access.trip.lakeId,
            lakeName: access.trip.lakeName,
            tripId: access.trip.id,
            tripTitle: access.trip.title,
            imageUrl,
            imagePath,
            note: note || null,
            isPublic,
            rankingStatus: "pending",
          },
        });

        await tx.tripActivity.create({
          data: {
            tripId: id,
            actorUserId: access.user.id,
            actorName,
            action: "catch_added",
            metadata: { catchId: created.id, fishName },
          },
        });

        return created;
      });

      return NextResponse.json({ message: "Połów został dodany.", catch: fishingCatch }, { status: 201 });
    } catch (dbError) {
      if (imagePath) {
        await access.supabase.storage.from(BUCKET).remove([imagePath]);
      }
      throw dbError;
    }
  } catch (error) {
    console.error("[trip catches POST]", error);
    return NextResponse.json({ message: "Nie udało się dodać połowu." }, { status: 500 });
  }
}
