import { prisma } from "@/lib/prisma";

type AchievementDefinition = {
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
};

export type UserAchievementView = {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string | null;
  category: string;
  isUnlocked: boolean;
  unlockedAt: Date | null;
};

const ACHIEVEMENTS: AchievementDefinition[] = [
  // Połowy
  {
    key: "first_catch",
    title: "Pierwsza ryba",
    description: "Dodaj pierwszy połów.",
    icon: "🐟",
    category: "Połowy",
  },
  {
    key: "fifty_catches",
    title: "Regularny wędkarz",
    description: "Dodaj 50 połowów.",
    icon: "🎣",
    category: "Połowy",
  },
  {
    key: "one_hundred_catches",
    title: "Zapalony wędkarz",
    description: "Dodaj 100 połowów.",
    icon: "🔥",
    category: "Połowy",
  },
  {
    key: "two_hundred_fifty_catches",
    title: "Pasjonat",
    description: "Dodaj 250 połowów.",
    icon: "🏕️",
    category: "Połowy",
  },
  {
    key: "five_hundred_catches",
    title: "Prawdziwy łowca",
    description: "Dodaj 500 połowów.",
    icon: "👑",
    category: "Połowy",
  },
  {
    key: "one_thousand_catches",
    title: "Legenda łowiska",
    description: "Dodaj 1000 połowów.",
    icon: "🏆",
    category: "Połowy",
  },
  {
    key: "weekend_catch",
    title: "Weekendowy wędkarz",
    description: "Dodaj połów złowiony w sobotę lub niedzielę.",
    icon: "🗓️",
    category: "Połowy",
  },
  {
    key: "night_catch",
    title: "Nocny łowca",
    description: "Dodaj połów złowiony między 22:00 a 05:00.",
    icon: "🌙",
    category: "Połowy",
  },
  {
    key: "morning_catch",
    title: "Poranne branie",
    description: "Dodaj połów złowiony między 05:00 a 08:00.",
    icon: "🌅",
    category: "Połowy",
  },
  {
    key: "season_angler",
    title: "Wędkarz sezonu",
    description: "Dodaj 150 połowów w jednym miesiącu.",
    icon: "📅",
    category: "Połowy",
  },

  // Zdjęcia
  {
    key: "first_photo",
    title: "Pierwsze zdjęcie",
    description: "Dodaj pierwszy połów ze zdjęciem.",
    icon: "📸",
    category: "Zdjęcia",
  },
  {
    key: "twenty_photo_catches",
    title: "Fotograf nad wodą",
    description: "Dodaj 20 połowów ze zdjęciem.",
    icon: "🖼️",
    category: "Zdjęcia",
  },
  {
    key: "eighty_photo_catches",
    title: "Galeria trofeów",
    description: "Dodaj 80 połowów ze zdjęciem.",
    icon: "🏞️",
    category: "Zdjęcia",
  },
  {
    key: "public_catch_photo",
    title: "Dowód jest",
    description: "Dodaj zdjęcie do publicznego połowu.",
    icon: "✅",
    category: "Zdjęcia",
  },
  {
    key: "two_hundred_fifty_photo_catches",
    title: "Dokumentalista",
    description: "Dodaj zdjęcia do 250 połowów.",
    icon: "🎥",
    category: "Zdjęcia",
  },

  // Rankingi
  {
    key: "first_ranking_catch",
    title: "Rankingowiec",
    description: "Dodaj pierwszy publiczny połów do rankingu łowiska.",
    icon: "🏆",
    category: "Rankingi",
  },
  {
    key: "top_five_weight",
    title: "Pretendent",
    description: "Traf do TOP 5 najcięższych ryb na łowisku.",
    icon: "🥇",
    category: "Rankingi",
  },
  {
    key: "top_five_length",
    title: "Długi okaz",
    description: "Traf do TOP 5 najdłuższych ryb na łowisku.",
    icon: "📏",
    category: "Rankingi",
  },
  {
    key: "double_ranking_record",
    title: "Podwójny rekordzista",
    description: "Traf do rankingu wagi i długości jednocześnie.",
    icon: "⚔️",
    category: "Rankingi",
  },
  {
    key: "king_of_lake_weight",
    title: "Król łowiska",
    description: "Zajmij 1. miejsce w rankingu najcięższej ryby.",
    icon: "👑",
    category: "Rankingi",
  },
  {
    key: "king_of_lake_length",
    title: "Mistrz długości",
    description: "Zajmij 1. miejsce w rankingu najdłuższej ryby.",
    icon: "🏅",
    category: "Rankingi",
  },
  {
    key: "twenty_ranking_catches",
    title: "Stały rankingowiec",
    description: "Dodaj 20 publicznych połowów do rankingów.",
    icon: "🎖️",
    category: "Rankingi",
  },
  {
    key: "ranking_three_lakes",
    title: "Rywal",
    description: "Dodaj publiczne połowy na 3 różnych łowiskach.",
    icon: "⚡",
    category: "Rankingi",
  },

  // Rekordy ryb
  {
    key: "heavy_fish_5kg",
    title: "Łowca okazów",
    description: "Dodaj rybę ważącą minimum 5 kg.",
    icon: "💪",
    category: "Rekordy",
  },
  {
    key: "heavy_fish_15kg",
    title: "Ciężka sztuka",
    description: "Dodaj rybę ważącą minimum 15 kg.",
    icon: "🪨",
    category: "Rekordy",
  },
  {
    key: "heavy_fish_20kg",
    title: "Potwór z głębin",
    description: "Dodaj rybę ważącą minimum 20 kg.",
    icon: "🐉",
    category: "Rekordy",
  },
  {
    key: "meter_fish",
    title: "Metrówka",
    description: "Dodaj rybę o długości minimum 100 cm.",
    icon: "📏",
    category: "Rekordy",
  },
  {
    key: "giant_fish_150cm",
    title: "Prawdziwy gigant",
    description: "Dodaj rybę o długości minimum 150 cm.",
    icon: "🐋",
    category: "Rekordy",
  },
  {
    key: "small_fish_under_20cm",
    title: "Mały, ale cieszy",
    description: "Dodaj rybę poniżej 20 cm.",
    icon: "🐠",
    category: "Rekordy",
  },
  {
    key: "complete_catch_data",
    title: "Komplet danych",
    description:
      "Dodaj połów z wagą, długością, przynętą, metodą, łowiskiem i zdjęciem.",
    icon: "✅",
    category: "Rekordy",
  },

  // Gatunki
  {
    key: "first_species",
    title: "Pierwszy gatunek",
    description: "Dodaj pierwszy unikalny gatunek.",
    icon: "🧬",
    category: "Gatunki",
  },
  {
    key: "five_species",
    title: "Różnorodny połów",
    description: "Dodaj 5 różnych gatunków ryb.",
    icon: "🐠",
    category: "Gatunki",
  },
  {
    key: "ten_species",
    title: "Kolekcjoner gatunków",
    description: "Dodaj 10 różnych gatunków ryb.",
    icon: "📚",
    category: "Gatunki",
  },
  {
    key: "twenty_species",
    title: "Ichtiolog amator",
    description: "Dodaj 20 różnych gatunków ryb.",
    icon: "🔬",
    category: "Gatunki",
  },
  {
    key: "first_carp",
    title: "Karpiarz",
    description: "Dodaj pierwszego karpia.",
    icon: "🐟",
    category: "Gatunki",
  },
  {
    key: "first_pike",
    title: "Szczupakowy tropiciel",
    description: "Dodaj pierwszego szczupaka.",
    icon: "🦈",
    category: "Gatunki",
  },
  {
    key: "first_zander",
    title: "Sandaczowy wieczór",
    description: "Dodaj pierwszego sandacza.",
    icon: "🌆",
    category: "Gatunki",
  },
  {
    key: "first_catfish",
    title: "Sumiarz",
    description: "Dodaj pierwszego suma.",
    icon: "🐋",
    category: "Gatunki",
  },
  {
    key: "classic_float_fish",
    title: "Spławikowy klasyk",
    description: "Dodaj pierwszą płoć, leszcza albo lina.",
    icon: "🪱",
    category: "Gatunki",
  },

  // Łowiska
  {
    key: "first_lake_catch",
    title: "Pierwsze łowisko",
    description: "Dodaj połów z przypisanym łowiskiem.",
    icon: "📍",
    category: "Łowiska",
  },
  {
    key: "five_lakes",
    title: "Odkrywca łowisk",
    description: "Dodaj połowy na 5 różnych łowiskach.",
    icon: "🗺️",
    category: "Łowiska",
  },
  {
    key: "fifteen_lakes",
    title: "Podróżnik",
    description: "Dodaj połowy na 15 różnych łowiskach.",
    icon: "🧭",
    category: "Łowiska",
  },
  {
    key: "thirty_lakes",
    title: "Wędkarz terenowy",
    description: "Dodaj połowy na 30 różnych łowiskach.",
    icon: "🥾",
    category: "Łowiska",
  },
  {
    key: "fifty_catches_one_lake",
    title: "Stały bywalec",
    description: "Dodaj 50 połowów na tym samym łowisku.",
    icon: "🏡",
    category: "Łowiska",
  },
  {
    key: "one_hundred_catches_one_lake",
    title: "Lokals",
    description: "Dodaj 100 połowów na tym samym łowisku.",
    icon: "📌",
    category: "Łowiska",
  },
  {
    key: "commercial_lake_catch",
    title: "Łowca komercyjny",
    description: "Dodaj połów na łowisku komercyjnym.",
    icon: "💳",
    category: "Łowiska",
  },
  {
    key: "pzw_lake_catch",
    title: "PZW team",
    description: "Dodaj połów na łowisku PZW.",
    icon: "🌊",
    category: "Łowiska",
  },

  // Wyprawy
  {
    key: "first_trip",
    title: "Pierwsza wyprawa",
    description: "Zaplanuj pierwszą wyprawę.",
    icon: "🚗",
    category: "Wyprawy",
  },
  {
    key: "ten_trips",
    title: "Organizator",
    description: "Zaplanuj 10 wypraw.",
    icon: "📝",
    category: "Wyprawy",
  },
  {
    key: "fifty_trips",
    title: "W trasie",
    description: "Zaplanuj 50 wypraw.",
    icon: "🛣️",
    category: "Wyprawy",
  },
  {
    key: "first_finished_trip",
    title: "Sezon rozpoczęty",
    description: "Oznacz pierwszą wyprawę jako zakończoną.",
    icon: "✅",
    category: "Wyprawy",
  },
  {
    key: "ten_finished_trips",
    title: "Zrealizowany plan",
    description: "Zakończ 10 wypraw.",
    icon: "🏁",
    category: "Wyprawy",
  },
  {
    key: "trip_with_checklist",
    title: "Wyprawa z checklistą",
    description: "Utwórz checklistę do wyprawy.",
    icon: "📋",
    category: "Wyprawy",
  },
  {
    key: "perfectly_packed",
    title: "Perfekcyjnie spakowany",
    description: "Odhacz wszystkie elementy checklisty.",
    icon: "🎒",
    category: "Wyprawy",
  },
  {
    key: "trip_note",
    title: "Notatnik wędkarza",
    description: "Dodaj notatkę do wyprawy.",
    icon: "🗒️",
    category: "Wyprawy",
  },

  // Ekwipunek
  {
    key: "first_gear",
    title: "Pierwszy sprzęt",
    description: "Dodaj pierwszy element ekwipunku.",
    icon: "🎒",
    category: "Ekwipunek",
  },
  {
    key: "ten_gear_items",
    title: "Dobrze przygotowany",
    description: "Dodaj 10 elementów ekwipunku.",
    icon: "🧰",
    category: "Ekwipunek",
  },
  {
    key: "twenty_five_gear_items",
    title: "Mobilny magazyn",
    description: "Dodaj 25 elementów ekwipunku.",
    icon: "📦",
    category: "Ekwipunek",
  },
  {
    key: "fifty_gear_items",
    title: "Sprzętowy kolekcjoner",
    description: "Dodaj 50 elementów ekwipunku.",
    icon: "🏬",
    category: "Ekwipunek",
  },
  {
    key: "spinning_gear",
    title: "Spinningista",
    description: "Dodaj sprzęt do metody spinningowej.",
    icon: "🌀",
    category: "Ekwipunek",
  },
  {
    key: "feeder_gear",
    title: "Feederowiec",
    description: "Dodaj sprzęt do feedera.",
    icon: "🌾",
    category: "Ekwipunek",
  },
  {
    key: "carp_gear",
    title: "Karpiarz sprzętowy",
    description: "Dodaj sprzęt karpiowy.",
    icon: "🎣",
    category: "Ekwipunek",
  },
  {
    key: "bait_or_accessory_gear",
    title: "Zapas musi być",
    description: "Dodaj przynęty albo akcesoria.",
    icon: "🪱",
    category: "Ekwipunek",
  },

  // Społeczność
  {
    key: "first_lake_submission",
    title: "Pomocnik społeczności",
    description: "Zgłoś pierwsze łowisko.",
    icon: "🤝",
    category: "Społeczność",
  },
  {
    key: "five_lake_submissions",
    title: "Kartograf",
    description: "Zgłoś 5 łowisk.",
    icon: "🗺️",
    category: "Społeczność",
  },
  {
    key: "twenty_lake_submissions",
    title: "Budowniczy bazy",
    description: "Zgłoś 20 łowisk.",
    icon: "🏗️",
    category: "Społeczność",
  },
  {
    key: "accepted_lake_submission",
    title: "Zweryfikowany wkład",
    description: "Twoje zgłoszenie łowiska zostanie zaakceptowane.",
    icon: "✅",
    category: "Społeczność",
  },
  {
    key: "first_rating",
    title: "Recenzent",
    description: "Oceń pierwsze łowisko.",
    icon: "⭐",
    category: "Społeczność",
  },
  {
    key: "five_ratings",
    title: "Głos społeczności",
    description: "Oceń 5 łowisk.",
    icon: "🌟",
    category: "Społeczność",
  },
  {
    key: "twenty_five_ratings",
    title: "Krytyk łowisk",
    description: "Oceń 25 łowisk.",
    icon: "📝",
    category: "Społeczność",
  },
  {
    key: "first_favourite",
    title: "Ulubione miejsce",
    description: "Dodaj pierwsze łowisko do ulubionych.",
    icon: "❤️",
    category: "Społeczność",
  },
  {
    key: "twenty_five_favourites",
    title: "Kolekcjoner miejscówek",
    description: "Dodaj 25 łowisk do ulubionych.",
    icon: "💙",
    category: "Społeczność",
  },
  {
    key: "first_correction_report",
    title: "Poprawiacz danych",
    description: "Zgłoś poprawkę do łowiska.",
    icon: "🛠️",
    category: "Społeczność",
  },

  // Specjalne
  {
    key: "full_profile",
    title: "Pełny profil",
    description: "Ustaw nazwę profilu.",
    icon: "👤",
    category: "Specjalne",
  },
  {
    key: "public_angler",
    title: "Publiczny wędkarz",
    description: "Posiadaj publiczny profil z minimum 1 publicznym połowem.",
    icon: "🌍",
    category: "Specjalne",
  },
  {
    key: "versatile_angler",
    title: "Wszechstronny",
    description: "Dodaj połowy na 3 różne metody.",
    icon: "🧩",
    category: "Specjalne",
  },
  {
    key: "method_specialist",
    title: "Metodowy specjalista",
    description: "Dodaj 500 połowów jedną metodą.",
    icon: "🎯",
    category: "Specjalne",
  },
  {
    key: "great_complete_catch",
    title: "Wielki komplet",
    description:
      "Dodaj połów z łowiskiem, zdjęciem, wagą, długością, przynętą i notatką.",
    icon: "💎",
    category: "Specjalne",
  },
  {
    key: "active_user",
    title: "Aktywny użytkownik",
    description: "Wykonaj łącznie 10 aktywności: połowy, oceny, wyprawy, sprzęt.",
    icon: "⚡",
    category: "Specjalne",
  },
  {
    key: "rybit_start",
    title: "Rybitowy start",
    description: "Dodaj pierwszy połów, pierwszą wyprawę i pierwszy sprzęt.",
    icon: "🚀",
    category: "Specjalne",
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

export async function getUserAchievements(
  userId: string
): Promise<UserAchievementView[]> {
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
    catches,
    trips,
    gearItems,
    ratingsCount,
    favouritesCount,
    lakeSubmissions,
    correctionReportsCount,
  ] = await Promise.all([
    prisma.fishingCatch.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        fishName: true,
        weight: true,
        length: true,
        bait: true,
        method: true,
        caughtAt: true,
        lakeId: true,
        imageUrl: true,
        isPublic: true,
        rankingStatus: true,
        note: true,
        userName: true,
        lake: {
          select: {
            ownerType: true,
          },
        },
      },
    }),

    prisma.fishingTrip.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        status: true,
        checklistId: true,
        note: true,
      },
    }),

    prisma.fishingGear.findMany({
      where: {
        userId,
      },
      select: {
        category: true,
        fishingMethod: true,
      },
    }),

    prisma.rating.count({
      where: {
        userId,
      },
    }),

    prisma.favourite.count({
      where: {
        userId,
      },
    }),

    prisma.lakeSubmission.findMany({
      where: {
        userId,
      },
      select: {
        status: true,
      },
    }),

    prisma.lakeCorrectionReport.count({
      where: {
        userId,
      },
    }),
  ]);

  const totalCatches = catches.length;
  const totalTrips = trips.length;
  const totalGear = gearItems.length;
  const totalSubmissions = lakeSubmissions.length;

  const publicCatches = catches.filter(
    (item) => item.isPublic && item.rankingStatus === "approved"
  );

  const rankingCatches = publicCatches.filter(
    (item) => item.imageUrl && item.lakeId
  );

  const catchesWithPhoto = catches.filter((item) => item.imageUrl);
  const publicCatchesWithPhoto = publicCatches.filter((item) => item.imageUrl);

  const uniqueSpeciesCount = new Set(
    catches.map((item) => item.fishName).filter(Boolean)
  ).size;

  const uniqueMethodsCount = new Set(
    catches.map((item) => item.method).filter(Boolean)
  ).size;

  const methodCounts = catches.reduce<Record<string, number>>(
    (accumulator, item) => {
      accumulator[item.method] = (accumulator[item.method] || 0) + 1;
      return accumulator;
    },
    {}
  );

  const maxCatchesOneMethod = Math.max(0, ...Object.values(methodCounts));

  const uniqueLakeIds = catches
    .map((item) => item.lakeId)
    .filter((lakeId): lakeId is string => Boolean(lakeId));

  const uniqueLakesCount = new Set(uniqueLakeIds).size;

  const lakeCatchCounts = uniqueLakeIds.reduce<Record<string, number>>(
    (accumulator, lakeId) => {
      accumulator[lakeId] = (accumulator[lakeId] || 0) + 1;
      return accumulator;
    },
    {}
  );

  const maxCatchesOnOneLake = Math.max(0, ...Object.values(lakeCatchCounts));

  const maxCatchesInOneMonth = getMaxCatchesInOneMonth(catches);

  const publicRankingLakeIds = rankingCatches
    .map((item) => item.lakeId)
    .filter((lakeId): lakeId is string => Boolean(lakeId));

  const publicRankingUniqueLakesCount = new Set(publicRankingLakeIds).size;

  const hasWeekendCatch = catches.some((item) => {
    const day = item.caughtAt.getDay();
    return day === 0 || day === 6;
  });

  const hasNightCatch = catches.some((item) => {
    const hour = item.caughtAt.getHours();
    return hour >= 22 || hour < 5;
  });

  const hasMorningCatch = catches.some((item) => {
    const hour = item.caughtAt.getHours();
    return hour >= 5 && hour < 8;
  });

  const hasCompleteCatchData = catches.some((item) => {
    return (
      item.weight !== null &&
      item.length !== null &&
      Boolean(item.bait) &&
      Boolean(item.method) &&
      Boolean(item.lakeId) &&
      Boolean(item.imageUrl)
    );
  });

  const hasGreatCompleteCatch = catches.some((item) => {
    return (
      item.weight !== null &&
      item.length !== null &&
      Boolean(item.bait) &&
      Boolean(item.lakeId) &&
      Boolean(item.imageUrl) &&
      Boolean(item.note)
    );
  });

  const hasPublicCatchWithPhoto = publicCatchesWithPhoto.length > 0;

  const hasCarp = catches.some((item) =>
    normalizeText(item.fishName).includes("karp")
  );

  const hasPike = catches.some((item) =>
    normalizeText(item.fishName).includes("szczupak")
  );

  const hasZander = catches.some((item) =>
    normalizeText(item.fishName).includes("sandacz")
  );

  const hasCatfish = catches.some((item) =>
    normalizeText(item.fishName).includes("sum")
  );

  const hasClassicFloatFish = catches.some((item) => {
    const fishName = normalizeText(item.fishName);

    return (
      fishName.includes("ploc") ||
      fishName.includes("płoć") ||
      fishName.includes("leszcz") ||
      fishName.includes("lin")
    );
  });

  const hasCommercialLakeCatch = catches.some(
    (item) => item.lake?.ownerType === "commercial"
  );

  const hasPzwLakeCatch = catches.some((item) => item.lake?.ownerType === "pzw");

  const finishedTrips = trips.filter((trip) => trip.status === "finished");
  const tripsWithChecklist = trips.filter((trip) => trip.checklistId);
  const tripsWithNote = trips.filter((trip) => trip.note);

  const hasSpinningGear = gearItems.some(
    (item) => item.fishingMethod === "spinning"
  );

  const hasFeederGear = gearItems.some(
    (item) =>
      item.fishingMethod === "feeder" ||
      item.fishingMethod === "method_feeder"
  );

  const hasCarpGear = gearItems.some((item) => item.fishingMethod === "carp");

  const hasBaitOrAccessoryGear = gearItems.some(
    (item) => item.category === "bait" || item.category === "accessory"
  );

  const hasFullProfile = catches.some(
    (item) =>
      item.userName &&
      item.userName.trim() &&
      item.userName.trim() !== "Użytkownik"
  );

  const hasRybitStart =
    totalCatches >= 1 && totalTrips >= 1 && totalGear >= 1;

  const totalActivities =
    totalCatches + ratingsCount + totalTrips + totalGear;

  const rankingStats = await getRankingStats(userId);

  const achievementKeysToUnlock: string[] = [];

  // Połowy
  if (totalCatches >= 1) achievementKeysToUnlock.push("first_catch");
  if (totalCatches >= 50) achievementKeysToUnlock.push("fifty_catches");
  if (totalCatches >= 100) achievementKeysToUnlock.push("one_hundred_catches");
  if (totalCatches >= 250) {
    achievementKeysToUnlock.push("two_hundred_fifty_catches");
  }
  if (totalCatches >= 500) achievementKeysToUnlock.push("five_hundred_catches");
  if (totalCatches >= 1000) {
    achievementKeysToUnlock.push("one_thousand_catches");
  }

  if (hasWeekendCatch) achievementKeysToUnlock.push("weekend_catch");
  if (hasNightCatch) achievementKeysToUnlock.push("night_catch");
  if (hasMorningCatch) achievementKeysToUnlock.push("morning_catch");
  if (maxCatchesInOneMonth >= 150) achievementKeysToUnlock.push("season_angler");

  // Zdjęcia
  if (catchesWithPhoto.length >= 1) achievementKeysToUnlock.push("first_photo");
  if (catchesWithPhoto.length >= 20) {
    achievementKeysToUnlock.push("twenty_photo_catches");
  }
  if (catchesWithPhoto.length >= 80) {
    achievementKeysToUnlock.push("eighty_photo_catches");
  }
  if (hasPublicCatchWithPhoto) achievementKeysToUnlock.push("public_catch_photo");
  if (catchesWithPhoto.length >= 250) {
    achievementKeysToUnlock.push("two_hundred_fifty_photo_catches");
  }

  // Rankingi
  if (rankingCatches.length >= 1) achievementKeysToUnlock.push("first_ranking_catch");
  if (rankingStats.isInTopFiveWeight) achievementKeysToUnlock.push("top_five_weight");
  if (rankingStats.isInTopFiveLength) achievementKeysToUnlock.push("top_five_length");
  if (rankingStats.isInTopFiveWeight && rankingStats.isInTopFiveLength) {
    achievementKeysToUnlock.push("double_ranking_record");
  }
  if (rankingStats.isFirstInWeight) achievementKeysToUnlock.push("king_of_lake_weight");
  if (rankingStats.isFirstInLength) achievementKeysToUnlock.push("king_of_lake_length");
  if (rankingCatches.length >= 20) achievementKeysToUnlock.push("twenty_ranking_catches");
  if (publicRankingUniqueLakesCount >= 3) achievementKeysToUnlock.push("ranking_three_lakes");

  // Rekordy
  if (catches.some((item) => item.weight !== null && item.weight >= 5)) {
    achievementKeysToUnlock.push("heavy_fish_5kg");
  }
  if (catches.some((item) => item.weight !== null && item.weight >= 15)) {
    achievementKeysToUnlock.push("heavy_fish_15kg");
  }
  if (catches.some((item) => item.weight !== null && item.weight >= 20)) {
    achievementKeysToUnlock.push("heavy_fish_20kg");
  }
  if (catches.some((item) => item.length !== null && item.length >= 100)) {
    achievementKeysToUnlock.push("meter_fish");
  }
  if (catches.some((item) => item.length !== null && item.length >= 150)) {
    achievementKeysToUnlock.push("giant_fish_150cm");
  }
  if (catches.some((item) => item.length !== null && item.length < 20)) {
    achievementKeysToUnlock.push("small_fish_under_20cm");
  }
  if (hasCompleteCatchData) achievementKeysToUnlock.push("complete_catch_data");

  // Gatunki
  if (uniqueSpeciesCount >= 1) achievementKeysToUnlock.push("first_species");
  if (uniqueSpeciesCount >= 5) achievementKeysToUnlock.push("five_species");
  if (uniqueSpeciesCount >= 10) achievementKeysToUnlock.push("ten_species");
  if (uniqueSpeciesCount >= 20) achievementKeysToUnlock.push("twenty_species");
  if (hasCarp) achievementKeysToUnlock.push("first_carp");
  if (hasPike) achievementKeysToUnlock.push("first_pike");
  if (hasZander) achievementKeysToUnlock.push("first_zander");
  if (hasCatfish) achievementKeysToUnlock.push("first_catfish");
  if (hasClassicFloatFish) achievementKeysToUnlock.push("classic_float_fish");

  // Łowiska
  if (uniqueLakesCount >= 1) achievementKeysToUnlock.push("first_lake_catch");
  if (uniqueLakesCount >= 5) achievementKeysToUnlock.push("five_lakes");
  if (uniqueLakesCount >= 15) achievementKeysToUnlock.push("fifteen_lakes");
  if (uniqueLakesCount >= 30) achievementKeysToUnlock.push("thirty_lakes");
  if (maxCatchesOnOneLake >= 50) achievementKeysToUnlock.push("fifty_catches_one_lake");
  if (maxCatchesOnOneLake >= 100) achievementKeysToUnlock.push("one_hundred_catches_one_lake");
  if (hasCommercialLakeCatch) achievementKeysToUnlock.push("commercial_lake_catch");
  if (hasPzwLakeCatch) achievementKeysToUnlock.push("pzw_lake_catch");

  // Wyprawy
  if (totalTrips >= 1) achievementKeysToUnlock.push("first_trip");
  if (totalTrips >= 10) achievementKeysToUnlock.push("ten_trips");
  if (totalTrips >= 50) achievementKeysToUnlock.push("fifty_trips");
  if (finishedTrips.length >= 1) achievementKeysToUnlock.push("first_finished_trip");
  if (finishedTrips.length >= 10) achievementKeysToUnlock.push("ten_finished_trips");
  if (tripsWithChecklist.length >= 1) achievementKeysToUnlock.push("trip_with_checklist");
  if (tripsWithNote.length >= 1) achievementKeysToUnlock.push("trip_note");

  // Uwaga: perfectly_packed wymaga sprawdzenia TripChecklistItem.
  const hasPerfectlyPackedChecklist = await checkPerfectlyPackedChecklist(userId);
  if (hasPerfectlyPackedChecklist) achievementKeysToUnlock.push("perfectly_packed");

  // Ekwipunek
  if (totalGear >= 1) achievementKeysToUnlock.push("first_gear");
  if (totalGear >= 10) achievementKeysToUnlock.push("ten_gear_items");
  if (totalGear >= 25) achievementKeysToUnlock.push("twenty_five_gear_items");
  if (totalGear >= 50) achievementKeysToUnlock.push("fifty_gear_items");
  if (hasSpinningGear) achievementKeysToUnlock.push("spinning_gear");
  if (hasFeederGear) achievementKeysToUnlock.push("feeder_gear");
  if (hasCarpGear) achievementKeysToUnlock.push("carp_gear");
  if (hasBaitOrAccessoryGear) achievementKeysToUnlock.push("bait_or_accessory_gear");

  // Społeczność
  if (totalSubmissions >= 1) achievementKeysToUnlock.push("first_lake_submission");
  if (totalSubmissions >= 5) achievementKeysToUnlock.push("five_lake_submissions");
  if (totalSubmissions >= 20) achievementKeysToUnlock.push("twenty_lake_submissions");
  if (
  lakeSubmissions.some(
    (item) => item.status === "approved" || item.status === "accepted"
  )
) {
  achievementKeysToUnlock.push("accepted_lake_submission");
}
  if (ratingsCount >= 1) achievementKeysToUnlock.push("first_rating");
  if (ratingsCount >= 5) achievementKeysToUnlock.push("five_ratings");
  if (ratingsCount >= 25) achievementKeysToUnlock.push("twenty_five_ratings");
  if (favouritesCount >= 1) achievementKeysToUnlock.push("first_favourite");
  if (favouritesCount >= 25) achievementKeysToUnlock.push("twenty_five_favourites");
  if (correctionReportsCount >= 1) achievementKeysToUnlock.push("first_correction_report");

  // Specjalne
  if (hasFullProfile) achievementKeysToUnlock.push("full_profile");
  if (publicCatches.length >= 1) achievementKeysToUnlock.push("public_angler");
  if (uniqueMethodsCount >= 3) achievementKeysToUnlock.push("versatile_angler");
  if (maxCatchesOneMethod >= 500) achievementKeysToUnlock.push("method_specialist");
  if (hasGreatCompleteCatch) achievementKeysToUnlock.push("great_complete_catch");
  if (totalActivities >= 10) achievementKeysToUnlock.push("active_user");
  if (hasRybitStart) achievementKeysToUnlock.push("rybit_start");

  const uniqueAchievementKeys = Array.from(new Set(achievementKeysToUnlock));

  const unlockedAchievements = [];

  for (const key of uniqueAchievementKeys) {
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

function getMaxCatchesInOneMonth(
  catches: {
    caughtAt: Date;
  }[]
) {
  const counts = catches.reduce<Record<string, number>>((accumulator, item) => {
    const year = item.caughtAt.getFullYear();
    const month = item.caughtAt.getMonth() + 1;
    const key = `${year}-${month}`;

    accumulator[key] = (accumulator[key] || 0) + 1;

    return accumulator;
  }, {});

  return Math.max(0, ...Object.values(counts));
}

async function getRankingStats(userId: string) {
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
      id: true,
      lakeId: true,
      weight: true,
      length: true,
    },
  });

  const userLakeIds = Array.from(
    new Set(
      userRankingCatches
        .map((item) => item.lakeId)
        .filter((lakeId): lakeId is string => Boolean(lakeId))
    )
  );

  let isInTopFiveWeight = false;
  let isInTopFiveLength = false;
  let isFirstInWeight = false;
  let isFirstInLength = false;

  for (const lakeId of userLakeIds) {
    const [topWeight, topLength] = await Promise.all([
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
        take: 5,
        select: {
          userId: true,
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
        take: 5,
        select: {
          userId: true,
        },
      }),
    ]);

    if (topWeight.some((item) => item.userId === userId)) {
      isInTopFiveWeight = true;
    }

    if (topLength.some((item) => item.userId === userId)) {
      isInTopFiveLength = true;
    }

    if (topWeight[0]?.userId === userId) {
      isFirstInWeight = true;
    }

    if (topLength[0]?.userId === userId) {
      isFirstInLength = true;
    }
  }

  return {
    isInTopFiveWeight,
    isInTopFiveLength,
    isFirstInWeight,
    isFirstInLength,
  };
}

async function checkPerfectlyPackedChecklist(userId: string) {
  const checklists = await prisma.tripChecklist.findMany({
    where: {
      userId,
    },
    include: {
      items: true,
    },
  });

  return checklists.some((checklist) => {
    if (checklist.items.length === 0) {
      return false;
    }

    return checklist.items.every((item) => item.isPacked);
  });
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}