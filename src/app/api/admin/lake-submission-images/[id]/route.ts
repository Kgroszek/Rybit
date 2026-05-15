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

  const image = await prisma.lakeSubmissionImage.findUnique({
    where: {
      id,
    },
    include: {
      submission: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!image) {
    return NextResponse.json(
      { message: "Nie znaleziono zdjęcia." },
      { status: 404 }
    );
  }

  if (image.submission.status !== "pending") {
    return NextResponse.json(
      { message: "Zdjęcia można usuwać tylko z oczekujących zgłoszeń." },
      { status: 400 }
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

  await prisma.lakeSubmissionImage.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    message: "Zdjęcie zgłoszenia zostało usunięte.",
  });
}