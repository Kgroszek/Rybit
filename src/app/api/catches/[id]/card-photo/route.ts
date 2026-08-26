import { NextResponse } from "next/server";

import {
  CATCH_IMAGES_BUCKET,
  canExposeCatchPublicly,
} from "@/lib/catch-sharing";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getStorageAdminClient } from "@/lib/supabase/storage-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fishingCatch = await prisma.fishingCatch.findUnique({
    where: { id },
    select: {
      userId: true,
      imagePath: true,
      imageUrl: true,
      isPublic: true,
      rankingStatus: true,
    },
  });

  if (!fishingCatch) {
    return NextResponse.json(
      { message: "Nie znaleziono połowu." },
      { status: 404 }
    );
  }

  const isOwner = user?.id === fishingCatch.userId;
  const isPublic = canExposeCatchPublicly(fishingCatch);

  if (!isOwner && !isPublic) {
    return NextResponse.json(
      { message: "Nie masz dostępu do zdjęcia tego połowu." },
      { status: user ? 403 : 401 }
    );
  }

  if (fishingCatch.imagePath) {
    const adminClient = getStorageAdminClient();

    if (adminClient) {
      const { data } = await adminClient.storage
        .from(CATCH_IMAGES_BUCKET)
        .download(fishingCatch.imagePath);

      if (data) {
        return imageResponse(data);
      }
    }

    if (isOwner) {
      const { data } = await supabase.storage
        .from(CATCH_IMAGES_BUCKET)
        .download(fishingCatch.imagePath);

      if (data) {
        return imageResponse(data);
      }
    }
  }

  if (fishingCatch.imageUrl) {
    try {
      const response = await fetch(fishingCatch.imageUrl, {
        cache: "no-store",
      });

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const contentType =
          response.headers.get("content-type") || "application/octet-stream";

        return new Response(buffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "private, no-store",
          },
        });
      }
    } catch {}
  }

  return NextResponse.json(
    { message: "Nie udało się pobrać zdjęcia połowu." },
    { status: 404 }
  );
}

function imageResponse(blob: Blob) {
  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Type": blob.type || "application/octet-stream",
      "Cache-Control": "private, no-store",
    },
  });
}
