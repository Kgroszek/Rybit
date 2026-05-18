import { prisma } from "@/lib/prisma";

export type UserFishRecord = {
  fishName: string;
  catchesCount: number;

  bestWeight: number | null;
  bestWeightDate: Date | null;
  bestWeightLakeName: string | null;

  bestLength: number | null;
  bestLengthDate: Date | null;
  bestLengthLakeName: string | null;
};

export async function getUserFishRecords(userId: string) {
  const catches = await prisma.fishingCatch.findMany({
    where: {
      userId,
    },
    orderBy: {
      caughtAt: "desc",
    },
    select: {
      fishName: true,
      weight: true,
      length: true,
      lakeName: true,
      caughtAt: true,
    },
  });

  const recordsMap = new Map<string, UserFishRecord>();

  for (const item of catches) {
    const fishName = item.fishName.trim();

    if (!fishName) {
      continue;
    }

    const existingRecord = recordsMap.get(fishName);

    if (!existingRecord) {
      recordsMap.set(fishName, {
        fishName,
        catchesCount: 1,

        bestWeight: item.weight,
        bestWeightDate: item.weight !== null ? item.caughtAt : null,
        bestWeightLakeName: item.weight !== null ? item.lakeName : null,

        bestLength: item.length,
        bestLengthDate: item.length !== null ? item.caughtAt : null,
        bestLengthLakeName: item.length !== null ? item.lakeName : null,
      });

      continue;
    }

    existingRecord.catchesCount += 1;

    if (
      item.weight !== null &&
      (existingRecord.bestWeight === null ||
        item.weight > existingRecord.bestWeight)
    ) {
      existingRecord.bestWeight = item.weight;
      existingRecord.bestWeightDate = item.caughtAt;
      existingRecord.bestWeightLakeName = item.lakeName;
    }

    if (
      item.length !== null &&
      (existingRecord.bestLength === null ||
        item.length > existingRecord.bestLength)
    ) {
      existingRecord.bestLength = item.length;
      existingRecord.bestLengthDate = item.caughtAt;
      existingRecord.bestLengthLakeName = item.lakeName;
    }
  }

  return Array.from(recordsMap.values()).sort((firstRecord, secondRecord) => {
    const firstBestWeight = firstRecord.bestWeight || 0;
    const secondBestWeight = secondRecord.bestWeight || 0;

    if (secondBestWeight !== firstBestWeight) {
      return secondBestWeight - firstBestWeight;
    }

    const firstBestLength = firstRecord.bestLength || 0;
    const secondBestLength = secondRecord.bestLength || 0;

    if (secondBestLength !== firstBestLength) {
      return secondBestLength - firstBestLength;
    }

    return firstRecord.fishName.localeCompare(secondRecord.fishName);
  });
}