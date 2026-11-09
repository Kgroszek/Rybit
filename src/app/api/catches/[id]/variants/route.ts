import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { removeImageVariants, uploadImageVariants } from "@/lib/server/image-variants";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const CATCH_IMAGES_BUCKET = "catch-images";

async function getOwnedCatch(id: string) {
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
      fishingCatch: null,
    };
  }

  const fishingCatch = await prisma.fishingCatch.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      imagePath: true,
    },
  });

  if (!fishingCatch) {
    return {
      error: NextResponse.json(
        { message: "Nie znaleziono połowu." },
        { status: 404 }
      ),
      fishingCatch: null,
    };
  }

  if (fishingCatch.userId !== user.id) {
    return {
      error: NextResponse.json(
        { message: "Nie masz dostępu do tego połowu." },
        { status: 403 }
      ),
      fishingCatch: null,
    };
  }

  return {
    error: null,
    fishingCatch,
  };
}

export async function POST(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const result = await getOwnedCatch(id);

  if (result.error) {
    return result.error;
  }

  const imagePath = result.fishingCatch?.imagePath;

  if (!imagePath) {
    return NextResponse.json({
      message: "Połów nie ma zdjęcia do przetworzenia.",
      variants: [],
    });
  }

  const storage = createAdminClient();

  const { data, error } = await storage.storage
    .from(CATCH_IMAGES_BUCKET)
    .download(imagePath);

  if (error || !data) {
    return NextResponse.json(
      {
        message:
          error?.message || "Nie udało się pobrać zdjęcia połowu.",
      },
      { status: 500 }
    );
  }

  const variants = await uploadImageVariants({
    supabase: storage,
    bucket: CATCH_IMAGES_BUCKET,
    originalPath: imagePath,
    source: data,
  });

  return NextResponse.json({
    message: "Warianty zdjęcia zostały przygotowane.",
    variants,
  });
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const result = await getOwnedCatch(id);

  if (result.error) {
    return result.error;
  }

  const imagePath = result.fishingCatch?.imagePath;

  if (imagePath) {
    const storage = createAdminClient();

    await removeImageVariants({
      supabase: storage,
      bucket: CATCH_IMAGES_BUCKET,
      originalPath: imagePath,
    });
  }

  return NextResponse.json({
    message: "Warianty zdjęcia zostały usunięte.",
  });
}
