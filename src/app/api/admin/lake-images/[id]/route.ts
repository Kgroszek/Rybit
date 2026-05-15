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
        { message: error.message || "Nie udało się usunąć pliku ze Storage." },
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