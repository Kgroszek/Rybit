import React from "react";
import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";

import { CatchShareCard } from "@/components/catches/CatchShareCard";
import {
  canExposeCatchPublicly,
  getCatchImageForSharing,
  getSafeCatchFileName,
} from "@/lib/catch-sharing";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const url = new URL(request.url);

  const format =
    url.searchParams.get("format") === "story" ? "story" : "post";

  const variant =
    url.searchParams.get("variant") === "clean"
      ? "clean"
      : "collector";

  const shouldDownload = url.searchParams.get("download") === "1";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fishingCatch = await prisma.fishingCatch.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
      userName: true,
      fishName: true,
      weight: true,
      length: true,
      method: true,
      bait: true,
      caughtAt: true,
      lakeId: true,
      lakeName: true,
      tripId: true,
      tripTitle: true,
      imageUrl: true,
      imagePath: true,
      note: true,
      isPublic: true,
      rankingStatus: true,
      catchScore: true,
      catchScoreTier: true,
      catchScoreSource: true,
      catchScoreVersion: true,
    },
  });

  if (!fishingCatch) {
    return NextResponse.json(
      {
        message: "Nie znaleziono połowu.",
      },
      {
        status: 404,
      }
    );
  }

  const isOwner = user?.id === fishingCatch.userId;
  const isPublic = canExposeCatchPublicly(fishingCatch);

  if (!isOwner && !isPublic) {
    return NextResponse.json(
      {
        message: "Nie masz dostępu do tej karty połowu.",
      },
      {
        status: user ? 403 : 401,
      }
    );
  }

  const imageUrl = await getCatchImageForSharing(
    fishingCatch,
    isOwner ? supabase : null
  );

  const image = React.createElement(CatchShareCard, {
    fishingCatch,
    imageUrl,
    format,
    variant,
  });

  const response = new ImageResponse(image, {
    width: 1080,
    height: format === "story" ? 1920 : 1350,
  });

  response.headers.set("Content-Type", "image/png");

  if (shouldDownload) {
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${getSafeCatchFileName(
        fishingCatch.fishName,
        format,
        variant
      )}"`
    );
  }

  response.headers.set(
    "Cache-Control",
    isPublic && !isOwner
      ? "public, max-age=300, s-maxage=300"
      : "private, no-store"
  );

  return response;
}
