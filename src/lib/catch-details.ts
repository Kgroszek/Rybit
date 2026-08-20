"server-only";

import type { Prisma } from "@prisma/client";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { CatchDetailsData } from "@/components/catches/types";
import { canExposeCatchPublicly, getCatchImageForSharing } from "@/lib/catch-sharing";
import { prisma } from "@/lib/prisma";

const catchDetailsSelect = {
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
  createdAt: true,
  updatedAt: true,
  lake: {
    select: {
      slug: true,
    },
  },
} as const;

export async function getOwnedCatchDetails(
  id: string,
  userId: string,
  authenticatedClient?: SupabaseClient | null
): Promise<CatchDetailsData | null> {
  const fishingCatch = await prisma.fishingCatch.findFirst({
    where: { id, userId },
    select: catchDetailsSelect,
  });

  if (!fishingCatch) return null;

  const imageUrl = await getCatchImageForSharing(fishingCatch, authenticatedClient);
  return serializeCatchDetails(fishingCatch, imageUrl, true);
}

export const getPublicCatchDetails = cache(async function getPublicCatchDetails(id: string): Promise<CatchDetailsData | null> {
  const fishingCatch = await prisma.fishingCatch.findUnique({
    where: { id },
    select: catchDetailsSelect,
  });

  if (!fishingCatch || !canExposeCatchPublicly(fishingCatch)) {
    return null;
  }

  const imageUrl = await getCatchImageForSharing(fishingCatch);
  return serializeCatchDetails(fishingCatch, imageUrl, false);
});

type RawCatchDetails = Prisma.FishingCatchGetPayload<{ select: typeof catchDetailsSelect }>;

function serializeCatchDetails(
  fishingCatch: RawCatchDetails,
  imageUrl: string | null,
  includePrivateFields: boolean
): CatchDetailsData {
  return {
    id: fishingCatch.id,
    userId: fishingCatch.userId,
    userName: fishingCatch.userName ?? null,
    fishName: fishingCatch.fishName,
    weight: fishingCatch.weight,
    length: fishingCatch.length,
    method: fishingCatch.method,
    bait: fishingCatch.bait,
    caughtAt: fishingCatch.caughtAt.toISOString(),
    lakeId: fishingCatch.lakeId,
    lakeName: fishingCatch.lakeName,
    lakeSlug: fishingCatch.lake?.slug ?? null,
    tripId: includePrivateFields ? fishingCatch.tripId : null,
    tripTitle: includePrivateFields ? fishingCatch.tripTitle : null,
    imageUrl,
    imagePath: fishingCatch.imagePath,
    note: includePrivateFields ? fishingCatch.note : null,
    isPublic: fishingCatch.isPublic,
    rankingStatus: fishingCatch.rankingStatus,
    catchScore: fishingCatch.catchScore,
    catchScoreTier: fishingCatch.catchScoreTier,
    catchScoreSource: fishingCatch.catchScoreSource,
    catchScoreVersion: fishingCatch.catchScoreVersion,
    createdAt: fishingCatch.createdAt.toISOString(),
    updatedAt: fishingCatch.updatedAt.toISOString(),
  };
}
