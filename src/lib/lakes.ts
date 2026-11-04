import type { Prisma } from "@prisma/client";

import { normalizeFishList } from "@/lib/fish-names";
import { prisma } from "@/lib/prisma";

export type CatchRankingItem = {
  id: string;
  userId: string;
  userName: string | null;
  fishName: string;
  weight: number | null;
  length: number | null;
  method: string;
  bait: string | null;
  caughtAt: string;
  imageUrl: string;
  note: string | null;
};

export type LakeAmenitiesDto = {
  cottages: boolean;
  campfire: boolean;
  noKill: boolean;
  tent: boolean;
  parking: boolean;
  pier: boolean;
  toilet: boolean;
  shop: boolean;
  nightFishing: boolean;
  boatRental: boolean;
  gearRental: boolean;
  shelter: boolean;
  coveredSpots: boolean;
  playground: boolean;
  cardPayment: boolean;
};

export type LakeFishRecordDto = {
  id: string;
  fishName: string;
  weightKg: number;
};

export type LakeOpeningHoursDto = {
  isOpenAllDay: boolean;
  text: string | null;
};

export type LakeListDto = {
  id: string;
  name: string;
  slug: string;
  rating: string;
  distance: string;
  fish: string;
  fishSpecies: string[];
  type: "pzw" | "commercial";
  fishingType: "general" | "spinning" | "carp";
  lat: number;
  lng: number;
  address: {
    street: string;
    city: string;
    postalCode: string;
    voivodeship: string;
  };
  description: string;
  amenities: LakeAmenitiesDto;
  images: string[];
};

export type LakeFilterOptions = {
  voivodeships: string[];
  fishOptions: string[];
  allLakesCount: number;
};

export type LakeDto = LakeListDto & {
  details: {
    area: string;
    averageDepth: string;
    bottomType: string;
    waterType: string;
  };
  priceList: string[];
  priceListUrl: string | null;
  rules: string[];
  rulesUrl: string | null;
  contact: {
    name: string;
    phone: string;
    email: string;
    website: string;
  };
  fishRecords: LakeFishRecordDto[];
  gearRequirements: string[];
  openingHours: LakeOpeningHoursDto;
  catchRankings: {
    byWeight: CatchRankingItem[];
    byLength: CatchRankingItem[];
  };
};

const ACCOMMODATION_SEARCH_TERMS = [
  "nocleg",
  "noclegi",
  "domek",
  "domki",
  "apartament",
  "pokoje",
] as const;

export function buildAccommodationLakeWhere(): Prisma.LakeWhereInput {
  const textConditions: Prisma.LakeWhereInput[] =
    ACCOMMODATION_SEARCH_TERMS.flatMap((term) => [
      {
        description: {
          contains: term,
          mode: "insensitive",
        },
      },
      {
        fish: {
          contains: term,
          mode: "insensitive",
        },
      },
      {
        fishSpecies: {
          some: {
            name: {
              contains: term,
              mode: "insensitive",
            },
          },
        },
      },
    ]);

  return {
    OR: [
      {
        cottages: true,
      },
      ...textConditions,
    ],
  };
}

type LakeFromDatabase = Awaited<ReturnType<typeof getLakesFromDatabase>>[number];

async function getLakesFromDatabase(where: Prisma.LakeWhereInput = {}) {
  return prisma.lake.findMany({
    where,
    include: {
      fishSpecies: true,
      priceList: true,
      rules: true,
      images: true,
      fishRecords: {
        orderBy: {
          weightKg: "desc",
        },
      },
      gearRequirements: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

function mapCatchToRankingItem(item: {
  id: string;
  userId: string;
  userName: string | null;
  fishName: string;
  weight: number | null;
  length: number | null;
  method: string;
  bait: string | null;
  caughtAt: Date;
  imageUrl: string | null;
  note: string | null;
}): CatchRankingItem {
  return {
    id: item.id,
    userId: item.userId,
    userName: item.userName,
    fishName: item.fishName,
    weight: item.weight,
    length: item.length,
    method: item.method,
    bait: item.bait,
    caughtAt: item.caughtAt.toISOString(),
    imageUrl: item.imageUrl || "",
    note: item.note,
  };
}

function mapLakeToDto(
  lake: LakeFromDatabase,
  catchRankings: LakeDto["catchRankings"] = {
    byWeight: [],
    byLength: [],
  }
): LakeDto {
  return {
    id: lake.id,
    name: lake.name,
    slug: lake.slug,
    rating: Number(lake.rating).toFixed(1),
    distance: "0 km",
    fish: lake.fish,
    fishSpecies: lake.fishSpecies.map((fish) => fish.name),
    type: lake.ownerType as "pzw" | "commercial",
    fishingType: lake.fishingType as "general" | "spinning" | "carp",
    lat: lake.lat,
    lng: lake.lng,
    address: {
      street: lake.street,
      city: lake.city,
      postalCode: lake.postalCode,
      voivodeship: lake.voivodeship,
    },
    description: lake.description,
    amenities: {
      cottages: lake.cottages,
      campfire: lake.campfire,
      noKill: lake.noKill,
      tent: lake.tent,
      parking: lake.parking,
      pier: lake.pier,
      toilet: lake.toilet,
      shop: lake.shop,
      nightFishing: lake.nightFishing,
      boatRental: lake.boatRental,
      gearRental: lake.gearRental,
      shelter: lake.shelter,
      coveredSpots: lake.coveredSpots,
      playground: lake.playground,
      cardPayment: lake.cardPayment,
    },
    details: {
      area: lake.area || "",
      averageDepth: lake.averageDepth || "",
      bottomType: lake.bottomType || "",
      waterType: lake.waterType || "",
    },
    priceList: lake.priceList.map((item) => item.text),
    priceListUrl: lake.priceListUrl,
    rules: lake.rules.map((rule) => rule.text),
    rulesUrl: lake.rulesUrl,
    contact: {
      name: lake.contactName || "",
      phone: lake.contactPhone || "",
      email: lake.contactEmail || "",
      website: lake.contactWebsite || "",
    },
    fishRecords: lake.fishRecords.map((record) => ({
      id: record.id,
      fishName: record.fishName,
      weightKg: record.weightKg,
    })),
    gearRequirements: lake.gearRequirements.map((requirement) => requirement.text),
    openingHours: {
      isOpenAllDay: lake.isOpenAllDay,
      text: lake.openingHours,
    },
    images: lake.images.map((image) => image.url),
    catchRankings,
  };
}

function mapLakeToListDto(lake: {
  id: string;
  name: string;
  slug: string;
  rating: number | { toString: () => string };
  fish: string;
  ownerType: string;
  fishingType: string;
  lat: number;
  lng: number;
  street: string;
  city: string;
  postalCode: string;
  voivodeship: string;
  description: string;
  cottages: boolean;
  campfire: boolean;
  noKill: boolean;
  tent: boolean;
  parking: boolean;
  pier: boolean;
  toilet: boolean;
  shop: boolean;
  nightFishing: boolean;
  boatRental: boolean;
  gearRental: boolean;
  shelter: boolean;
  coveredSpots: boolean;
  playground: boolean;
  cardPayment: boolean;
  fishSpecies: {
    name: string;
  }[];
  images: {
    url: string;
  }[];
}): LakeListDto {
  return {
    id: lake.id,
    name: lake.name,
    slug: lake.slug,
    rating: Number(lake.rating).toFixed(1),
    distance: "0 km",
    fish: lake.fish,
    fishSpecies: lake.fishSpecies.map((fish) => fish.name),
    type: lake.ownerType as "pzw" | "commercial",
    fishingType: lake.fishingType as "general" | "spinning" | "carp",
    lat: lake.lat,
    lng: lake.lng,
    address: {
      street: lake.street,
      city: lake.city,
      postalCode: lake.postalCode,
      voivodeship: lake.voivodeship,
    },
    description: lake.description,
    amenities: {
      cottages: lake.cottages,
      campfire: lake.campfire,
      noKill: lake.noKill,
      tent: lake.tent,
      parking: lake.parking,
      pier: lake.pier,
      toilet: lake.toilet,
      shop: lake.shop,
      nightFishing: lake.nightFishing,
      boatRental: lake.boatRental,
      gearRental: lake.gearRental,
      shelter: lake.shelter,
      coveredSpots: lake.coveredSpots,
      playground: lake.playground,
      cardPayment: lake.cardPayment,
    },
    images: lake.images.map((image) => image.url),
  };
}

export async function getLakeFilterOptions(
  where: Prisma.LakeWhereInput = {}
): Promise<LakeFilterOptions> {
  const [voivodeshipRows, fishRows, allLakesCount] = await Promise.all([
    prisma.lake.findMany({
      where,
      distinct: ["voivodeship"],
      select: {
        voivodeship: true,
      },
      orderBy: {
        voivodeship: "asc",
      },
    }),
    prisma.lake.findMany({
      where,
      select: {
        fish: true,
        fishSpecies: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.lake.count({
      where,
    }),
  ]);

  const voivodeships = Array.from(
    new Map(
      voivodeshipRows
        .map((item) => item.voivodeship.trim())
        .filter(Boolean)
        .map((item) => [item.toLocaleLowerCase("pl-PL"), item] as const)
    ).values()
  ).sort((a, b) =>
    a.localeCompare(b, "pl", {
      sensitivity: "base",
    })
  );

  const rawFishValues = fishRows.flatMap((lake) => [
    ...lake.fish
      .split(/[,;/|]/)
      .map((item) => item.trim())
      .filter(Boolean),
    ...lake.fishSpecies.map((fish) => fish.name),
  ]);

  return {
    voivodeships,
    fishOptions: normalizeFishList(rawFishValues),
    allLakesCount,
  };
}

export async function getLakesList() {
  const lakes = await prisma.lake.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      rating: true,
      fish: true,
      ownerType: true,
      fishingType: true,
      lat: true,
      lng: true,
      street: true,
      city: true,
      postalCode: true,
      voivodeship: true,
      description: true,

      cottages: true,
      campfire: true,
      noKill: true,
      tent: true,
      parking: true,
      pier: true,
      toilet: true,
      shop: true,
      nightFishing: true,
      boatRental: true,
      gearRental: true,
      shelter: true,
      coveredSpots: true,
      playground: true,
      cardPayment: true,

      fishSpecies: {
        select: {
          name: true,
        },
      },

      images: {
        select: {
          url: true,
        },
        take: 1,
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return lakes.map((lake) => mapLakeToListDto(lake));
}

export async function getLakes(where: Prisma.LakeWhereInput = {}) {
  const lakes = await getLakesFromDatabase(where);

  return lakes.map((lake) => mapLakeToDto(lake));
}

export async function getLakeBySlug(slug: string) {
  const lake = await prisma.lake.findUnique({
    where: {
      slug,
    },
    include: {
      fishSpecies: true,
      priceList: true,
      rules: true,
      images: true,
      fishRecords: {
        orderBy: {
          weightKg: "desc",
        },
      },
      gearRequirements: true,
    },
  });

  if (!lake) {
    return null;
  }

  const [catchesByWeight, catchesByLength] = await Promise.all([
    prisma.fishingCatch.findMany({
      where: {
        lakeId: lake.id,
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
        id: true,
        userId: true,
        userName: true,
        fishName: true,
        weight: true,
        length: true,
        method: true,
        bait: true,
        caughtAt: true,
        imageUrl: true,
        note: true,
      },
    }),

    prisma.fishingCatch.findMany({
      where: {
        lakeId: lake.id,
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
        id: true,
        userId: true,
        userName: true,
        fishName: true,
        weight: true,
        length: true,
        method: true,
        bait: true,
        caughtAt: true,
        imageUrl: true,
        note: true,
      },
    }),
  ]);

  return mapLakeToDto(lake, {
    byWeight: catchesByWeight.map(mapCatchToRankingItem),
    byLength: catchesByLength.map(mapCatchToRankingItem),
  });
}

export async function getLakesDashboard(): Promise<LakeDto[]> {
  const lakes = await prisma.lake.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      rating: true,
      fish: true,
      ownerType: true,
      fishingType: true,
      lat: true,
      lng: true,
      city: true,
      voivodeship: true,
      images: {
        select: {
          url: true,
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return lakes.map((lake) => ({
    id: lake.id,
    name: lake.name,
    slug: lake.slug,
    rating: Number(lake.rating).toFixed(1),
    distance: "0 km",
    fish: lake.fish,
    fishSpecies: [],
    type: lake.ownerType as "pzw" | "commercial",
    fishingType: lake.fishingType as "general" | "spinning" | "carp",
    lat: lake.lat,
    lng: lake.lng,
    address: {
      street: "",
      city: lake.city,
      postalCode: "",
      voivodeship: lake.voivodeship,
    },
    description: "",
    amenities: {
      cottages: false,
      campfire: false,
      noKill: false,
      tent: false,
      parking: false,
      pier: false,
      toilet: false,
      shop: false,
      nightFishing: false,
      boatRental: false,
      gearRental: false,
      shelter: false,
      coveredSpots: false,
      playground: false,
      cardPayment: false,
    },
    details: {
      area: "",
      averageDepth: "",
      bottomType: "",
      waterType: "",
    },
    priceList: [],
    priceListUrl: null,
    rules: [],
    rulesUrl: null,
    contact: {
      name: "",
      phone: "",
      email: "",
      website: "",
    },
    fishRecords: [],
    gearRequirements: [],
    openingHours: {
      isOpenAllDay: false,
      text: null,
    },
    images: lake.images.map((image) => image.url),
    catchRankings: {
      byWeight: [],
      byLength: [],
    },
  }));
}

function calculateDistanceInKm(
  firstLat: number,
  firstLng: number,
  secondLat: number,
  secondLng: number
) {
  const earthRadiusKm = 6371;

  const latDifference = ((secondLat - firstLat) * Math.PI) / 180;
  const lngDifference = ((secondLng - firstLng) * Math.PI) / 180;

  const firstLatRadians = (firstLat * Math.PI) / 180;
  const secondLatRadians = (secondLat * Math.PI) / 180;

  const a =
    Math.sin(latDifference / 2) * Math.sin(latDifference / 2) +
    Math.cos(firstLatRadians) *
      Math.cos(secondLatRadians) *
      Math.sin(lngDifference / 2) *
      Math.sin(lngDifference / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export async function getRecommendedNearbyLakes(slug: string, limit = 3) {
  const lakes = await getLakes();

  const currentLake = lakes.find((lake) => lake.slug === slug);

  if (!currentLake) {
    return [];
  }

  return lakes
    .filter((lake) => lake.slug !== currentLake.slug)
    .map((lake) => {
      const distanceInKm = calculateDistanceInKm(
        currentLake.lat,
        currentLake.lng,
        lake.lat,
        lake.lng
      );

      const isSameCity =
        lake.address.city.toLowerCase() ===
        currentLake.address.city.toLowerCase();

      const isSameVoivodeship =
        lake.address.voivodeship.toLowerCase() ===
        currentLake.address.voivodeship.toLowerCase();

      return {
        ...lake,
        nearbyDistanceInKm: distanceInKm,
        nearbyScore:
          (isSameCity ? 1000 : 0) +
          (isSameVoivodeship ? 500 : 0) -
          distanceInKm +
          Number(lake.rating || 0),
      };
    })
    .sort((firstLake, secondLake) => {
      return secondLake.nearbyScore - firstLake.nearbyScore;
    })
    .slice(0, limit);
}
