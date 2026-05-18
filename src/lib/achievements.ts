import { prisma } from "@/lib/prisma";

type AchievementDefinition = {
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
};

const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    key: "first_catch",
    title: "Pierwsza ryba",
    description: "Dodaj swój pierwszy połów.",
    icon: "🐟",
    category: "catches",
  },
  {
    key: "first_photo",
    title: "Pierwsze zdjęcie",
    description: "Dodaj pierwszy połów ze zdjęciem.",
    icon: "📸",
    category: "photos",
  },
  {
    key: "first_ranking_catch",
    title: "Rankingowiec",
    description: "Dodaj pierwszy publiczny połów do rankingu łowiska.",
    icon: "🏆",
    category: "ranking",
  },
  {
    key: "five_catches",
    title: "Regularny wędkarz",
    description: "Dodaj 5 połowów.",
    icon: "🎣",
    category: "catches",
  },
  {
    key: "twenty_five_catches",
    title: "Pasjonat",
    description: "Dodaj 25 połowów.",
    icon: "🔥",
    category: "catches",
  },
  {
    key: "heavy_fish_5kg",
    title: "Łowca okazów",
    description: "Dodaj rybę ważącą minimum 5 kg.",
    icon: "💪",
    category: "records",
  },
  {
    key: "meter_fish",
    title: "Metrówka",
    description: "Dodaj rybę o długości minimum 100 cm.",
    icon: "📏",
    category: "records",
  },
  {
    key: "three_lakes",
    title: "Odkrywca łowisk",
    description: "Dodaj połowy na 3 różnych łowiskach.",
    icon: "🗺️",
    category: "lakes",
  },
];

export async function seedAchievements() {
  await Promise.all(
    ACHIEVEMENTS.map((achievement) =>
      prisma.achievement.upsert({
        where: {
          key: achievement.key,
        },
        update: {
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
        },
        create: {
          key: achievement.key,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
        },
      })
    )
  );
}

export async function getUserAchievements(userId: string) {
  await seedAchievements();

  const [allAchievements, unlockedAchievements] = await Promise.all([
    prisma.achievement.findMany({
      orderBy: {
        createdAt: "asc",
      },
    }),

    prisma.userAchievement.findMany({
      where: {
        userId,
      },
      include: {
        achievement: true,
      },
      orderBy: {
        unlockedAt: "desc",
      },
    }),
  ]);

  const unlockedAchievementIds = new Set(
    unlockedAchievements.map((item) => item.achievementId)
  );

  return allAchievements.map((achievement) => {
    const unlockedAchievement = unlockedAchievements.find(
      (item) => item.achievementId === achievement.id
    );

    return {
      id: achievement.id,
      key: achievement.key,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      isUnlocked: unlockedAchievementIds.has(achievement.id),
      unlockedAt: unlockedAchievement?.unlockedAt ?? null,
    };
  });
}

export async function checkAndUnlockAchievements(userId: string) {
  await seedAchievements();

  const [
    totalCatches,
    catchesWithPhoto,
    publicRankingCatches,
    heavyFish,
    meterFish,
    catchesWithLake,
  ] = await Promise.all([
    prisma.fishingCatch.count({
      where: {
        userId,
      },
    }),

    prisma.fishingCatch.count({
      where: {
        userId,
        imageUrl: {
          not: null,
        },
      },
    }),

    prisma.fishingCatch.count({
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
    }),

    prisma.fishingCatch.count({
      where: {
        userId,
        weight: {
          gte: 5,
        },
      },
    }),

    prisma.fishingCatch.count({
      where: {
        userId,
        length: {
          gte: 100,
        },
      },
    }),

    prisma.fishingCatch.findMany({
      where: {
        userId,
        lakeId: {
          not: null,
        },
      },
      select: {
        lakeId: true,
      },
    }),
  ]);

  const uniqueLakesCount = new Set(
    catchesWithLake
      .map((item) => item.lakeId)
      .filter((lakeId): lakeId is string => Boolean(lakeId))
  ).size;

  const achievementKeysToUnlock: string[] = [];

  if (totalCatches >= 1) {
    achievementKeysToUnlock.push("first_catch");
  }

  if (catchesWithPhoto >= 1) {
    achievementKeysToUnlock.push("first_photo");
  }

  if (publicRankingCatches >= 1) {
    achievementKeysToUnlock.push("first_ranking_catch");
  }

  if (totalCatches >= 5) {
    achievementKeysToUnlock.push("five_catches");
  }

  if (totalCatches >= 25) {
    achievementKeysToUnlock.push("twenty_five_catches");
  }

  if (heavyFish >= 1) {
    achievementKeysToUnlock.push("heavy_fish_5kg");
  }

  if (meterFish >= 1) {
    achievementKeysToUnlock.push("meter_fish");
  }

  if (uniqueLakesCount >= 3) {
    achievementKeysToUnlock.push("three_lakes");
  }

  const unlockedAchievements = [];

  for (const key of achievementKeysToUnlock) {
    const unlockedAchievement = await unlockAchievement(userId, key);

    if (unlockedAchievement) {
      unlockedAchievements.push(unlockedAchievement);
    }
  }

  return unlockedAchievements;
}

async function unlockAchievement(userId: string, achievementKey: string) {
  const achievement = await prisma.achievement.findUnique({
    where: {
      key: achievementKey,
    },
  });

  if (!achievement) {
    return null;
  }

  const existingUserAchievement = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId,
        achievementId: achievement.id,
      },
    },
  });

  if (existingUserAchievement) {
    return null;
  }

  const userAchievement = await prisma.userAchievement.create({
    data: {
      userId,
      achievementId: achievement.id,
    },
    include: {
      achievement: true,
    },
  });

  await prisma.userNotification.create({
    data: {
      userId,
      title: `Nowe osiągnięcie: ${achievement.title}`,
      message: achievement.description,
      href: "/profil",
      type: "achievement",
    },
  });

  return userAchievement;
}