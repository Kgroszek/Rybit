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

export type LakeDto = {
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
  amenities: {
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
  images: string[];
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
    rating: lake.rating.toFixed(1),
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
      area: lake.area,
      averageDepth: lake.averageDepth,
      bottomType: lake.bottomType,
      waterType: lake.waterType,
    },
    priceList: lake.priceList.map((item) => item.text),
    priceListUrl: lake.priceListUrl,
    rules: lake.rules.map((rule) => rule.text),
    rulesUrl: lake.rulesUrl,
    contact: {
      name: lake.contactName,
      phone: lake.contactPhone,
      email: lake.contactEmail,
      website: lake.contactWebsite,
    },
    images: lake.images.map((image) => image.url),
    catchRankings,
  };
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