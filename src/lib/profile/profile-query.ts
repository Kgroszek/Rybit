import { getUserAchievements } from "@/lib/achievements";
import { getUserFishRecords } from "@/lib/fish-records";
import { prisma } from "@/lib/prisma";
import { getUserRankingBadges } from "@/lib/ranking-badges";

import type {
  ProfileOverviewData,
  ProfileProgressData,
} from "@/lib/profile/profile-types";

export async function getProfileOverviewData(
  userId: string
): Promise<ProfileOverviewData> {
  const [
    favourites,
    favouritesCount,
    ratings,
    ratingsCount,
    submissions,
    submissionsCount,
    catchesCount,
    publicCatchesCount,
  ] = await Promise.all([
    prisma.favourite.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        lake: {
          select: {
            name: true,
            slug: true,
            fish: true,
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    prisma.favourite.count({
      where: {
        userId,
      },
    }),

    prisma.rating.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        value: true,
        updatedAt: true,
        lake: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    }),

    prisma.rating.count({
      where: {
        userId,
      },
    }),

    prisma.lakeSubmission.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        city: true,
        voivodeship: true,
        ownerType: true,
        status: true,
        adminNote: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),

    prisma.lakeSubmission.count({
      where: {
        userId,
      },
    }),

    prisma.fishingCatch.count({
      where: {
        userId,
      },
    }),

    prisma.fishingCatch.count({
      where: {
        userId,
        isPublic: true,
        rankingStatus: "approved",
      },
    }),
  ]);

  return {
    counts: {
      favourites: favouritesCount,
      ratings: ratingsCount,
      submissions: submissionsCount,
      catches: catchesCount,
      publicCatches: publicCatchesCount,
    },
    favourites: favourites.map((favourite) => ({
      id: favourite.id,
      lake: {
        name: favourite.lake.name,
        slug: favourite.lake.slug,
        fish: favourite.lake.fish || "",
        rating: Number(favourite.lake.rating || 0),
      },
    })),
    ratings: ratings.map((rating) => ({
      id: rating.id,
      value: rating.value,
      updatedAt: rating.updatedAt,
      lake: {
        name: rating.lake.name,
        slug: rating.lake.slug,
      },
    })),
    submissions,
  };
}

export async function getProfileProgressData(
  userId: string
): Promise<ProfileProgressData> {
  const [achievements, rankingBadges, fishRecords] = await Promise.all([
    getUserAchievements(userId),
    getUserRankingBadges(userId),
    getUserFishRecords(userId),
  ]);

  return {
    achievements,
    rankingBadges,
    fishRecords,
  };
}
