import React from "react";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import sharp from "sharp";

import { CatchShareCard } from "@/components/catches/CatchShareCard";
import { GraphicCatchShareCard } from "@/components/catches/cards/GraphicCatchShareCard";
import { getCatchCardTemplate } from "@/lib/catch-card-templates";
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

export async function GET(
  request: Request,
  { params }: RouteProps
) {
  const { id } = await params;
  const url = new URL(request.url);

  const requestedFormat =
    url.searchParams.get("format") === "story"
      ? "story"
      : "post";

  const variant =
    url.searchParams.get("variant") === "clean"
      ? "clean"
      : "collector";

  const shouldDownload =
    url.searchParams.get("download") === "1";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fishingCatch =
    await prisma.fishingCatch.findUnique({
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

  const isOwner =
    user?.id === fishingCatch.userId;

  const isPublic =
    canExposeCatchPublicly(fishingCatch);

  if (!isOwner && !isPublic) {
    return NextResponse.json(
      {
        message:
          "Nie masz dostępu do tej karty połowu.",
      },
      {
        status: user ? 403 : 401,
      }
    );
  }

  const shareImageUrl =
    await getCatchImageForSharing(
      fishingCatch,
      isOwner ? supabase : null
    );

  const imageUrl =
    await prepareCatchImage(shareImageUrl);

  const graphicTemplate =
    getCatchCardTemplate(
      fishingCatch.fishName
    );

  const outputFormat =
    graphicTemplate?.format ??
    requestedFormat;

  const templateUrl = graphicTemplate
    ? await loadTemplateImage(
        graphicTemplate.publicPath
      )
    : null;

  const image =
    graphicTemplate && templateUrl
      ? React.createElement(
          GraphicCatchShareCard,
          {
            fishingCatch,
            imageUrl,
            templateUrl,
          }
        )
      : React.createElement(
          CatchShareCard,
          {
            fishingCatch,
            imageUrl,
            format: requestedFormat,
            variant,
          }
        );

  const response =
    new ImageResponse(image, {
      width:
        graphicTemplate?.width ?? 1080,
      height:
        graphicTemplate?.height ??
        (requestedFormat === "story"
          ? 1920
          : 1350),
    });

  response.headers.set(
    "Content-Type",
    "image/png"
  );

  if (shouldDownload) {
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${getSafeCatchFileName(
        fishingCatch.fishName,
        outputFormat,
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

async function prepareCatchImage(
  imageUrl: string | null
) {
  if (!imageUrl) {
    return null;
  }

  try {
    const response = await fetch(imageUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "[catch-card] Nie udało się pobrać zdjęcia połowu:",
        response.status,
        response.statusText
      );
      return null;
    }

    const source = Buffer.from(
      await response.arrayBuffer()
    );

    const contentType =
      normalizeImageMime(
        response.headers.get("content-type")
      );

    if (
      contentType === "image/jpeg" ||
      contentType === "image/png"
    ) {
      return `data:${contentType};base64,${source.toString("base64")}`;
    }

    try {
      const png = await sharp(source, {
        failOn: "none",
        animated: false,
        pages: 1,
      })
        .rotate()
        .resize({
          width: 1400,
          height: 1600,
          fit: "inside",
          withoutEnlargement: true,
        })
        .png()
        .toBuffer();

      return `data:image/png;base64,${png.toString("base64")}`;
    } catch (error) {
      console.error(
        "[catch-card] Nie udało się przekonwertować zdjęcia, używam oryginału:",
        error
      );

      return `data:${contentType};base64,${source.toString("base64")}`;
    }
  } catch (error) {
    console.error(
      "[catch-card] Błąd przygotowania zdjęcia połowu:",
      error
    );
    return null;
  }
}

async function loadTemplateImage(
  publicPath: string
) {
  try {
    const relativePath =
      publicPath.replace(/^\/+/, "");

    const file = await readFile(
      join(
        process.cwd(),
        "public",
        relativePath
      )
    );

    return `data:image/png;base64,${file.toString("base64")}`;
  } catch (error) {
    console.error(
      "[catch-card] Błąd wczytywania szablonu karty:",
      error
    );
    return null;
  }
}

function normalizeImageMime(
  value: string | null
) {
  const normalized =
    value?.split(";")[0].trim().toLowerCase() ??
    "";

  if (normalized === "image/jpeg") {
    return "image/jpeg";
  }

  if (normalized === "image/png") {
    return "image/png";
  }

  if (normalized === "image/webp") {
    return "image/webp";
  }

  return "image/webp";
}