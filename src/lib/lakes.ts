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

export type LakeRecordFishDto = {
  id: string;
  fishName: string;
  weightKg: number;
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
  openingHours: string | null;
  recordFish: LakeRecordFishDto[];
  equipmentRequirements: string[];
  contact: {
    name: string;
    phone: string;
    email: string;
    website: string;
  };
  catchRankings: {
    byWeight: CatchRankingItem[];
    byLength: CatchRankingItem[];
  };
};

type LakeFromDatabase = Awaited<ReturnType<typeof getLakesFromDatabase>>[number];

async function getLakesFromDatabase() {
  return prisma.lake.findMany({
    include: {
      fishSpecies: true,
      priceList: true,
      rules: true,
      recordFish: {
        orderBy: {
          weightKg: "desc",
        },
      },
      equipmentRequirements: {
        orderBy: {
          createdAt: "asc",
        },
      },
      images: true,
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
    openingHours: lake.openingHours || null,
    recordFish: lake.recordFish.map((item) => ({
      id: item.id,
      fishName: item.fishName,
      weightKg: item.weightKg,
    })),
    equipmentRequirements: lake.equipmentRequirements.map((item) => item.text),
    contact: {
      name: lake.contactName || "",
      phone: lake.contactPhone || "",
      email: lake.contactEmail || "",
      website: lake.contactWebsite || "",
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

export async function getLakes() {
  const lakes = await getLakesFromDatabase();

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
      recordFish: {
        orderBy: {
          weightKg: "desc",
        },
      },
      equipmentRequirements: {
        orderBy: {
          createdAt: "asc",
        },
      },
      images: true,
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
    openingHours: null,
    recordFish: [],
    equipmentRequirements: [],
    contact: {
      name: "",
      phone: "",
      email: "",
      website: "",
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