import { prisma } from "@/lib/prisma";

export type UserRankingBadge = {
  id: string;
  type: "weight" | "length";
  place: 1 | 2 | 3;
  lakeId: string;
  lakeName: string;
  lakeSlug: string;
  catchId: string;
  fishName: string;
  value: number;
  unit: "kg" | "cm";
};

export async function getUserRankingBadges(userId: string) {
  const userRankingCatches = await prisma.fishingCatch.findMany({
    where: {
      userId,
      isPublic: true,
      rankingStatus: "approved",
      imageUrl: {
        not: null,
      },
      lakeId: {
        not: null,
      },
    },
    select: {
      lakeId: true,
    },
  });

  const lakeIds = Array.from(
    new Set(
      userRankingCatches
        .map((item) => item.lakeId)
        .filter((lakeId): lakeId is string => Boolean(lakeId))
    )
  );

  const badges: UserRankingBadge[] = [];

  for (const lakeId of lakeIds) {
    const [topWeightCatches, topLengthCatches] = await Promise.all([
      prisma.fishingCatch.findMany({
        where: {
          lakeId,
          isPublic: true,
          rankingStatus: "approved",
          imageUrl: {
            not: null,
          },
          weight: {
            not: null,
          },
        },
        orderBy: {
          weight: "desc",
        },
        take: 3,
        select: {
          id: true,
          userId: true,
          fishName: true,
          weight: true,
          lakeId: true,
          lakeName: true,
          lake: {
            select: {
              slug: true,
            },
          },
        },
      }),

      prisma.fishingCatch.findMany({
        where: {
          lakeId,
          isPublic: true,
          rankingStatus: "approved",
          imageUrl: {
            not: null,
          },
          length: {
            not: null,
          },
        },
        orderBy: {
          length: "desc",
        },
        take: 3,
        select: {
          id: true,
          userId: true,
          fishName: true,
          length: true,
          lakeId: true,
          lakeName: true,
          lake: {
            select: {
              slug: true,
            },
          },
        },
      }),
    ]);

    topWeightCatches.forEach((item, index) => {
      if (item.userId !== userId || !item.weight || !item.lakeId) {
        return;
      }

      const place = (index + 1) as 1 | 2 | 3;

      badges.push({
        id: `weight-${item.id}`,
        type: "weight",
        place,
        lakeId: item.lakeId,
        lakeName: item.lakeName || "Łowisko",
        lakeSlug: item.lake?.slug || item.lakeId,
        catchId: item.id,
        fishName: item.fishName,
        value: item.weight,
        unit: "kg",
      });
    });

    topLengthCatches.forEach((item, index) => {
      if (item.userId !== userId || !item.length || !item.lakeId) {
        return;
      }

      const place = (index + 1) as 1 | 2 | 3;

      badges.push({
        id: `length-${item.id}`,
        type: "length",
        place,
        lakeId: item.lakeId,
        lakeName: item.lakeName || "Łowisko",
        lakeSlug: item.lake?.slug || item.lakeId,
        catchId: item.id,
        fishName: item.fishName,
        value: item.length,
        unit: "cm",
      });
    });
  }

  return badges.sort((firstBadge, secondBadge) => {
    if (firstBadge.place !== secondBadge.place) {
      return firstBadge.place - secondBadge.place;
    }

    return firstBadge.type.localeCompare(secondBadge.type);
  });
}