import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const BUCKET_NAME = "lake-images";
const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  const sanitizedFileName = fileName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");

  return sanitizedFileName || "image.jpg";
}

function isValidImage(file: File) {
  return file.type.startsWith("image/") && file.size <= MAX_IMAGE_SIZE;
}

export async function POST(request: Request, { params }: RouteProps) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { message: "Brak uprawnień administratora." },
      { status: 403 }
    );
  }

  const { id } = await params;

  const lake = await prisma.lake.findUnique({
    where: {
      id,
    },
    include: {
      images: true,
    },
  });

  if (!lake) {
    return NextResponse.json(
      { message: "Nie znaleziono łowiska." },
      { status: 404 }
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Nie udało się odczytać przesłanych zdjęć." },
      { status: 400 }
    );
  }

  const images = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (images.length === 0) {
    return NextResponse.json(
      { message: "Wybierz przynajmniej jedno zdjęcie." },
      { status: 400 }
    );
  }

  if (lake.images.length + images.length > MAX_IMAGES) {
    return NextResponse.json(
      {
        message: `Łowisko może mieć maksymalnie ${MAX_IMAGES} zdjęć.`,
      },
      { status: 400 }
    );
  }

  const invalidImage = images.find((image) => !isValidImage(image));

  if (invalidImage) {
    return NextResponse.json(
      {
        message: "Zdjęcia muszą być plikami graficznymi i mieć maksymalnie 5 MB.",
      },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const uploadedImages: {
    imagePath: string;
    url: string;
  }[] = [];

  try {
    for (const [index, image] of images.entries()) {
      const cleanFileName = sanitizeFileName(image.name);

      const imagePath = `lakes/${lake.id}/${Date.now()}-${index}-${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(imagePath, image, {
          cacheControl: "3600",
          upsert: false,
          contentType: image.type,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(imagePath);

      uploadedImages.push({
        imagePath,
        url: publicUrl,
      });
    }

    await prisma.lakeImage.createMany({
      data: uploadedImages.map((image) => ({
        lakeId: lake.id,
        imagePath: image.imagePath,
        url: image.url,
      })),
    });

    const createdImages = await prisma.lakeImage.findMany({
      where: {
        lakeId: lake.id,
        imagePath: {
          in: uploadedImages.map((image) => image.imagePath),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      message: "Zdjęcia zostały dodane.",
      images: createdImages,
    });
  } catch (error) {
    if (uploadedImages.length > 0) {
      await supabase.storage
        .from(BUCKET_NAME)
        .remove(uploadedImages.map((image) => image.imagePath));
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Nie udało się dodać zdjęć.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { message: "Brak uprawnień administratora." },
      { status: 403 }
    );
  }

  const { id } = await params;

  const image = await prisma.lakeImage.findUnique({
    where: {
      id,
    },
  });

  if (!image) {
    return NextResponse.json(
      { message: "Nie znaleziono zdjęcia." },
      { status: 404 }
    );
  }

  const supabase = createAdminClient();

  if (image.imagePath) {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([image.imagePath]);

    if (error) {
      return NextResponse.json(
        {
          message: error.message || "Nie udało się usunąć pliku ze Storage.",
        },
        { status: 500 }
      );
    }
  }

  await prisma.lakeImage.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    message: "Zdjęcie łowiska zostało usunięte.",
  });
}