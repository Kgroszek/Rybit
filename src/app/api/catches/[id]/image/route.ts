import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { checkAndUnlockAchievements } from "@/lib/achievements";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const BUCKET_NAME = "catch-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
}

async function getUserCatch(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { message: "Musisz być zalogowany." },
        { status: 401 }
      ),
      user: null,
      fishingCatch: null,
      supabase,
    };
  }

  const fishingCatch = await prisma.fishingCatch.findUnique({
    where: {
      id,
    },
  });

  if (!fishingCatch) {
    return {
      error: NextResponse.json(
        { message: "Nie znaleziono połowu." },
        { status: 404 }
      ),
      user,
      fishingCatch: null,
      supabase,
    };
  }

  if (fishingCatch.userId !== user.id) {
    return {
      error: NextResponse.json(
        { message: "Nie masz dostępu do tego połowu." },
        { status: 403 }
      ),
      user,
      fishingCatch: null,
      supabase,
    };
  }

  return {
    error: null,
    user,
    fishingCatch,
    supabase,
  };
}

export async function POST(request: Request, { params }: RouteProps) {
  const { id } = await params;

  const result = await getUserCatch(id);

  if (result.error) {
    return result.error;
  }

  if (!result.user || !result.fishingCatch) {
    return NextResponse.json(
      { message: "Nie udało się pobrać danych użytkownika." },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json(
      { message: "Nie przesłano zdjęcia." },
      { status: 400 }
    );
  }

  if (!image.type.startsWith("image/")) {
    return NextResponse.json(
      { message: "Plik musi być zdjęciem." },
      { status: 400 }
    );
  }

  if (image.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { message: "Zdjęcie może mieć maksymalnie 5 MB." },
      { status: 400 }
    );
  }

  if (result.fishingCatch.imagePath) {
    await result.supabase.storage
      .from(BUCKET_NAME)
      .remove([result.fishingCatch.imagePath]);
  }

  const cleanFileName = sanitizeFileName(image.name);
  const imagePath = `${result.user.id}/${id}-${Date.now()}-${cleanFileName}`;

  const { error: uploadError } = await result.supabase.storage
    .from(BUCKET_NAME)
    .upload(imagePath, image, {
      cacheControl: "3600",
      upsert: false,
      contentType: image.type,
    });

  if (uploadError) {
    return NextResponse.json(
      { message: uploadError.message || "Nie udało się wysłać zdjęcia." },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = result.supabase.storage.from(BUCKET_NAME).getPublicUrl(imagePath);

  const updatedCatch = await prisma.fishingCatch.update({
    where: {
      id,
    },
    data: {
      imagePath,
      imageUrl: publicUrl,
    },
  });

  await checkAndUnlockAchievements(result.user.id);

  return NextResponse.json(updatedCatch);
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const { id } = await params;

  const result = await getUserCatch(id);

  if (result.error) {
    return result.error;
  }

  if (!result.fishingCatch) {
    return NextResponse.json(
      { message: "Nie znaleziono połowu." },
      { status: 404 }
    );
  }

  if (result.fishingCatch.imagePath) {
    await result.supabase.storage
      .from(BUCKET_NAME)
      .remove([result.fishingCatch.imagePath]);
  }

  const updatedCatch = await prisma.fishingCatch.update({
    where: {
      id,
    },
    data: {
      imagePath: null,
      imageUrl: null,
    },
  });

  await checkAndUnlockAchievements(result.fishingCatch.userId);

  return NextResponse.json(updatedCatch);
}