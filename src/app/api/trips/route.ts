import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeFishingMethods, type FishingMethod } from "@/lib/fishing-methods";

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
  sanitaryFacilities: boolean;
  shop: boolean;
  nightFishing: boolean;
  boatRental: boolean;
  camperCaravan: boolean;
  electricityHookup: boolean;
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

/**
 * Lekki DTO używany wyłącznie na listach, mapach i kartach łowisk.
 *
 * Celowo NIE zawiera:
 * - pełnego opisu,
 * - cennika,
 * - regulaminu,
 * - danych kontaktowych,
 * - rekordów ryb,
 * - wymagań sprzętowych,
 * - godzin otwarcia,
 * - rankingów połowów,
 * - pełnej galerii.
 *
 * `images` zawiera maksymalnie jedno zdjęcie okładkowe.
 */
export type LakeListDto = {
  id: string;
  name: string;
  slug: string;
  rating: string;
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
  amenities: LakeAmenitiesDto;
  images: string[];
};

export type LakeDto = LakeListDto & {
  fishingMethods: FishingMethod[];
  description: string;
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

type LakeFromDatabase = Awaited<ReturnType<typeof getLakesFromDatabase>>[number];

async function getLakesFromDatabase() {
  return prisma.lake.findMany({
    include: {
      fishSpecies: true,
      priceList: true,
      rules: true,
      images: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      },
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
    fish: lake.fish,
    fishSpecies: lake.fishSpecies.map((fish) => fish.name),
    type: lake.ownerType as "pzw" | "commercial",
    fishingType: lake.fishingType as "general" | "spinning" | "carp",
    fishingMethods: normalizeFishingMethods(lake.fishingMethods),
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
      sanitaryFacilities: lake.sanitaryFacilities,
      shop: lake.shop,
      nightFishing: lake.nightFishing,
      boatRental: lake.boatRental,
      camperCaravan: lake.camperCaravan,
      electricityHookup: lake.electricityHookup,
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
  cottages: boolean;
  campfire: boolean;
  noKill: boolean;
  tent: boolean;
  parking: boolean;
  pier: boolean;
  toilet: boolean;
  sanitaryFacilities: boolean;
  shop: boolean;
  nightFishing: boolean;
  boatRental: boolean;
  camperCaravan: boolean;
  electricityHookup: boolean;
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
    amenities: {
      cottages: lake.cottages,
      campfire: lake.campfire,
      noKill: lake.noKill,
      tent: lake.tent,
      parking: lake.parking,
      pier: lake.pier,
      toilet: lake.toilet,
      sanitaryFacilities: lake.sanitaryFacilities,
      shop: lake.shop,
      nightFishing: lake.nightFishing,
      boatRental: lake.boatRental,
      camperCaravan: lake.camperCaravan,
      electricityHookup: lake.electricityHookup,
      gearRental: lake.gearRental,
      shelter: lake.shelter,
      coveredSpots: lake.coveredSpots,
      playground: lake.playground,
      cardPayment: lake.cardPayment,
    },
    images: lake.images.map((image) => image.url),
  };
}


export const LAKES_PAGE_SIZE = 15;

export type LakeListSort =
  | "rating-desc"
  | "name-asc"
  | "name-desc"
  | "distance-asc";

export type LakeAmenityKey = keyof LakeAmenitiesDto;

export type LakeListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  ownerType?: string;
  fishingType?: string;
  voivodeship?: string;
  fish?: string;
  amenities?: string[];
  sort?: string;
  userLat?: number | null;
  userLng?: number | null;
};

export type PaginatedLakesResult = {
  lakes: LakeListDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type LakeFilterOptions = {
  voivodeships: string[];
  fishOptions: string[];
  allLakesCount: number;
};

const lakeAmenityKeys: LakeAmenityKey[] = [
  "cottages",
  "campfire",
  "noKill",
  "tent",
  "parking",
  "pier",
  "toilet",
  "sanitaryFacilities",
  "shop",
  "nightFishing",
  "boatRental",
  "camperCaravan",
  "electricityHookup",
  "gearRental",
  "shelter",
  "coveredSpots",
  "playground",
  "cardPayment",
];

const lakeListSelect = {
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
  cottages: true,
  campfire: true,
  noKill: true,
  tent: true,
  parking: true,
  pier: true,
  toilet: true,
  sanitaryFacilities: true,
  shop: true,
  nightFishing: true,
  boatRental: true,
  camperCaravan: true,
  electricityHookup: true,
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
    orderBy: [
      {
        sortOrder: "asc" as const,
      },
      {
        createdAt: "asc" as const,
      },
    ],
  },
} satisfies Prisma.LakeSelect;

function normalizePositiveInteger(
  value: unknown,
  fallback: number,
  max = 10_000
) {
  const parsed = Number.parseInt(String(value ?? ""), 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
}

function normalizeLakeListSort(value: unknown): LakeListSort {
  if (
    value === "name-asc" ||
    value === "name" ||
    value === "name-desc" ||
    value === "distance-asc" ||
    value === "distance"
  ) {
    if (value === "name") return "name-asc";
    if (value === "distance") return "distance-asc";

    return value;
  }

  return "rating-desc";
}

function normalizeOwnerType(value: unknown) {
  return value === "pzw" || value === "commercial" ? value : "all";
}

function normalizeFishingType(value: unknown) {
  return value === "general" || value === "spinning" || value === "carp"
    ? value
    : "all";
}

function normalizeAmenities(values: unknown): LakeAmenityKey[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(
    new Set(
      values
        .map((value) => String(value).trim())
        .filter((value): value is LakeAmenityKey =>
          lakeAmenityKeys.includes(value as LakeAmenityKey)
        )
    )
  );
}

function normalizeCoordinate(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

type NormalizedLakeListQuery = {
  page: number;
  pageSize: number;
  search: string;
  ownerType: string;
  fishingType: string;
  voivodeship: string;
  fish: string;
  amenities: LakeAmenityKey[];
  sort: LakeListSort;
  userLat: number | null;
  userLng: number | null;
};

export function normalizeLakeListQuery(
  input: LakeListQuery
): NormalizedLakeListQuery {
  const search = String(input.search ?? "").trim().slice(0, 120);
  const voivodeship =
    String(input.voivodeship ?? "").trim().slice(0, 80) || "all";
  const fish = String(input.fish ?? "").trim().slice(0, 80) || "all";

  return {
    page: normalizePositiveInteger(input.page, 1),
    pageSize: Math.min(
      normalizePositiveInteger(input.pageSize, LAKES_PAGE_SIZE, 50),
      50
    ),
    search,
    ownerType: normalizeOwnerType(input.ownerType),
    fishingType: normalizeFishingType(input.fishingType),
    voivodeship,
    fish,
    amenities: normalizeAmenities(input.amenities),
    sort: normalizeLakeListSort(input.sort),
    userLat: normalizeCoordinate(input.userLat),
    userLng: normalizeCoordinate(input.userLng),
  };
}

function buildLakeListWhere(
  query: ReturnType<typeof normalizeLakeListQuery>
): Prisma.LakeWhereInput {
  const where: Prisma.LakeWhereInput = {};
  const andConditions: Prisma.LakeWhereInput[] = [];

  if (query.search) {
    where.OR = [
      {
        name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        fish: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        city: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        voivodeship: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        street: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        fishSpecies: {
          some: {
            name: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  if (query.ownerType !== "all") {
    where.ownerType = query.ownerType;
  }

  if (query.fishingType !== "all") {
    where.fishingType = query.fishingType;
  }

  if (query.voivodeship !== "all") {
    where.voivodeship = query.voivodeship;
  }

  if (query.fish !== "all") {
    andConditions.push({
      OR: [
        {
          fish: {
            contains: query.fish,
            mode: "insensitive",
          },
        },
        {
          fishSpecies: {
            some: {
              name: {
                equals: query.fish,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    });
  }

  const amenityWhere: Record<LakeAmenityKey, Prisma.LakeWhereInput> = {
    cottages: { cottages: true },
    campfire: { campfire: true },
    noKill: { noKill: true },
    tent: { tent: true },
    parking: { parking: true },
    pier: { pier: true },
    toilet: { toilet: true },
    sanitaryFacilities: { sanitaryFacilities: true },
    shop: { shop: true },
    nightFishing: { nightFishing: true },
    boatRental: { boatRental: true },
    camperCaravan: { camperCaravan: true },
    electricityHookup: { electricityHookup: true },
    gearRental: { gearRental: true },
    shelter: { shelter: true },
    coveredSpots: { coveredSpots: true },
    playground: { playground: true },
    cardPayment: { cardPayment: true },
  };

  for (const amenity of query.amenities) {
    andConditions.push(amenityWhere[amenity]);
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return where;
}

function getLakeListOrderBy(
  sort: LakeListSort
): Prisma.LakeOrderByWithRelationInput[] {
  if (sort === "name-asc") {
    return [{ name: "asc" }, { id: "asc" }];
  }

  if (sort === "name-desc") {
    return [{ name: "desc" }, { id: "asc" }];
  }

  return [{ rating: "desc" }, { createdAt: "desc" }, { id: "asc" }];
}

function calculateServerDistanceInKm(
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

async function getDistanceSortedLakeIds(
  where: Prisma.LakeWhereInput,
  userLat: number,
  userLng: number
) {
  const matchingLakes = await prisma.lake.findMany({
    where,
    select: {
      id: true,
      lat: true,
      lng: true,
      name: true,
    },
  });

  return matchingLakes
    .map((lake) => ({
      id: lake.id,
      name: lake.name,
      distance: calculateServerDistanceInKm(
        userLat,
        userLng,
        lake.lat,
        lake.lng
      ),
    }))
    .sort((firstLake, secondLake) => {
      if (firstLake.distance !== secondLake.distance) {
        return firstLake.distance - secondLake.distance;
      }

      return firstLake.name.localeCompare(secondLake.name, "pl");
    })
    .map((lake) => lake.id);
}

export async function getPaginatedLakes(
  input: LakeListQuery = {}
): Promise<PaginatedLakesResult> {
  const query = normalizeLakeListQuery(input);
  const where = buildLakeListWhere(query);

  if (
    query.sort === "distance-asc" &&
    query.userLat !== null &&
    query.userLng !== null
  ) {
    const orderedIds = await getDistanceSortedLakeIds(
      where,
      query.userLat,
      query.userLng
    );

    const totalCount = orderedIds.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / query.pageSize));
    const page = Math.min(query.page, totalPages);
    const startIndex = (page - 1) * query.pageSize;
    const pageIds = orderedIds.slice(startIndex, startIndex + query.pageSize);

    if (pageIds.length === 0) {
      return {
        lakes: [],
        page,
        pageSize: query.pageSize,
        totalCount,
        totalPages,
      };
    }

    const rows = await prisma.lake.findMany({
      where: {
        id: {
          in: pageIds,
        },
      },
      select: lakeListSelect,
    });

    const rowsById = new Map(rows.map((lake) => [lake.id, lake]));

    return {
      lakes: pageIds
        .map((id) => rowsById.get(id))
        .filter((lake): lake is NonNullable<typeof lake> => Boolean(lake))
        .map((lake) => mapLakeToListDto(lake)),
      page,
      pageSize: query.pageSize,
      totalCount,
      totalPages,
    };
  }

  const totalCount = await prisma.lake.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / query.pageSize));
  const page = Math.min(query.page, totalPages);

  const rows = await prisma.lake.findMany({
    where,
    select: lakeListSelect,
    orderBy: getLakeListOrderBy(query.sort as LakeListSort),
    skip: (page - 1) * query.pageSize,
    take: query.pageSize,
  });

  return {
    lakes: rows.map((lake) => mapLakeToListDto(lake)),
    page,
    pageSize: query.pageSize,
    totalCount,
    totalPages,
  };
}

export async function getLakeFilterOptions(): Promise<LakeFilterOptions> {
  const [voivodeshipRows, fishRows, allLakesCount] = await Promise.all([
    prisma.lake.findMany({
      distinct: ["voivodeship"],
      select: {
        voivodeship: true,
      },
      orderBy: {
        voivodeship: "asc",
      },
    }),
    prisma.fishSpecies.findMany({
      distinct: ["name"],
      select: {
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.lake.count(),
  ]);

  return {
    voivodeships: voivodeshipRows
      .map((item) => item.voivodeship.trim())
      .filter(Boolean),
    fishOptions: fishRows.map((item) => item.name.trim()).filter(Boolean),
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
      cottages: true,
      campfire: true,
      noKill: true,
      tent: true,
      parking: true,
      pier: true,
      toilet: true,
      sanitaryFacilities: true,
      shop: true,
      nightFishing: true,
      boatRental: true,
      camperCaravan: true,
      electricityHookup: true,
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
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
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
      images: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      },
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

export async function getLakesDashboard(): Promise<LakeListDto[]> {
  return getLakesList();
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