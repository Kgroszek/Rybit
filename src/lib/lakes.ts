import { prisma } from "@/lib/prisma";
import type {
  CatchRankingItem,
  LakeDto,
  LakeListDto,
} from "@/lib/lake-types";

/**
 * Kompatybilne re-exporty typów.
 *
 * Starsze komponenty mogą nadal importować typy z "@/lib/lakes",
 * ale cały system listowania/filtrowania znajduje się już w lake-explorer.ts.
 */
export type {
  CatchRankingItem,
  LakeAmenityKey,
  LakeAmenitiesDto,
  LakeDto,
  LakeFilterOptions,
  LakeFishRecordDto,
  LakeListDto,
  LakeListQuery,
  LakeListSort,
  LakeOpeningHoursDto,
  PaginatedLakesResult,
} from "@/lib/lake-types";

/**
 * Tymczasowy alias kompatybilności dla istniejących importów.
 * Implementacja należy do jednego systemu: lake-explorer.ts.
 */
export {
  getLakeExplorerFilterOptions as getLakeFilterOptions,
} from "@/lib/lake-explorer";

type LakeFromDatabase = NonNullable<
  Awaited<ReturnType<typeof getLakeRecordBySlug>>
>;

async function getLakeRecordBySlug(slug: string) {
  return prisma.lake.findUnique({
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
  catchRankings: LakeDto["catchRankings"]
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
    fishingMethods: Array.isArray(lake.fishingMethods)
      ? lake.fishingMethods
      : [],
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
    gearRequirements: lake.gearRequirements.map(
      (requirement) => requirement.text
    ),
    openingHours: {
      isOpenAllDay: lake.isOpenAllDay,
      text: lake.openingHours,
    },
    images: lake.images.map((image) => image.url),
    catchRankings,
  };
}

/**
 * Szczegół łowiska.
 *
 * To jest jedyna publiczna funkcja w tym pliku pobierająca pełne dane łowiska.
 * Listy, mapy, filtry i paginacja należą do lake-explorer.ts.
 */
export async function getLakeBySlug(slug: string) {
  const lake = await getLakeRecordBySlug(slug);

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

/**
 * Lekki zestaw do dashboardu.
 * Nie jest to publiczny system listowania łowisk i nie obsługuje filtrów.
 */
export async function getLakesDashboard(): Promise<LakeListDto[]> {
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

  return lakes.map((lake) => ({
    id: lake.id,
    name: lake.name,
    slug: lake.slug,
    rating: Number(lake.rating).toFixed(1),
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
    amenities: {
      cottages: false,
      campfire: false,
      noKill: false,
      tent: false,
      parking: false,
      pier: false,
      toilet: false,
      sanitaryFacilities: false,
      shop: false,
      nightFishing: false,
      boatRental: false,
      camperCaravan: false,
      electricityHookup: false,
      gearRental: false,
      shelter: false,
      coveredSpots: false,
      playground: false,
      cardPayment: false,
    },
    images: lake.images.map((image) => image.url),
  }));
}
