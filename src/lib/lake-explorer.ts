import { Prisma } from "@prisma/client";

import { getFishSearchTerms } from "@/lib/fish-names";
import {
  DEFAULT_POLAND_BOUNDS,
  normalizeLakeExplorerBounds,
} from "@/lib/lake-explorer-params";
import type {
  LakeExplorerBounds,
  LakeExplorerMapResult,
  LakeExplorerQuery,
  LakeExplorerResult,
  LakeExplorerSort,
  LakeMapPointDto,
} from "@/lib/lake-explorer-types";
import type {
  LakeAmenityKey,
  LakeListDto,
} from "@/lib/lakes";
import { prisma } from "@/lib/prisma";

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 20;

const amenityKeys: LakeAmenityKey[] = [
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

const lakeExplorerSelect = {
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

const lakeMapSelect = {
  id: true,
  name: true,
  slug: true,
  rating: true,
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
  max: number
) {
  const parsed = Number.parseInt(
    String(value ?? ""),
    10
  );

  if (
    !Number.isFinite(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return Math.min(parsed, max);
}

function normalizeCoordinate(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function normalizeSort(
  value: unknown
): LakeExplorerSort {
  if (
    value === "distance-asc" ||
    value === "distance"
  ) {
    return "distance-asc";
  }

  if (
    value === "name-asc" ||
    value === "name"
  ) {
    return "name-asc";
  }

  if (value === "name-desc") {
    return "name-desc";
  }

  return "rating-desc";
}

function normalizeOwnerType(value: unknown) {
  return value === "pzw" ||
    value === "commercial"
    ? value
    : "all";
}

function normalizeFishingType(
  value: unknown
) {
  return value === "general" ||
    value === "spinning" ||
    value === "carp"
    ? value
    : "all";
}

function normalizeAmenities(
  values: unknown
): LakeAmenityKey[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(
    new Set(
      values
        .map((value) =>
          String(value).trim()
        )
        .filter(
          (
            value
          ): value is LakeAmenityKey =>
            amenityKeys.includes(
              value as LakeAmenityKey
            )
        )
    )
  );
}

type NormalizedLakeExplorerQuery = {
  page: number;
  pageSize: number;
  search: string;
  ownerType: string;
  fishingType: string;
  voivodeship: string;
  fish: string;
  amenities: LakeAmenityKey[];
  sort: LakeExplorerSort;
  bounds: LakeExplorerBounds;
  userLat: number | null;
  userLng: number | null;
};

function normalizeQuery(
  input: LakeExplorerQuery
): NormalizedLakeExplorerQuery {
  return {
    page: normalizePositiveInteger(
      input.page,
      1,
      100_000
    ),
    pageSize: normalizePositiveInteger(
      input.pageSize,
      DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    ),
    search: String(input.search ?? "")
      .trim()
      .slice(0, 120),
    ownerType: normalizeOwnerType(
      input.ownerType
    ),
    fishingType: normalizeFishingType(
      input.fishingType
    ),
    voivodeship:
      String(input.voivodeship ?? "")
        .trim()
        .slice(0, 80) || "all",
    fish:
      String(input.fish ?? "")
        .trim()
        .slice(0, 80) || "all",
    amenities: normalizeAmenities(
      input.amenities
    ),
    sort: normalizeSort(input.sort),
    bounds:
      normalizeLakeExplorerBounds(
        input.bounds
      ) ?? DEFAULT_POLAND_BOUNDS,
    userLat: normalizeCoordinate(
      input.userLat
    ),
    userLng: normalizeCoordinate(
      input.userLng
    ),
  };
}

function buildExplorerWhere(
  query: NormalizedLakeExplorerQuery
): Prisma.LakeWhereInput {
  const where: Prisma.LakeWhereInput = {};
  const andConditions: Prisma.LakeWhereInput[] =
    [
      {
        lat: {
          gte: query.bounds.south,
          lte: query.bounds.north,
        },
        lng: {
          gte: query.bounds.west,
          lte: query.bounds.east,
        },
      },
    ];

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
    where.fishingType =
      query.fishingType;
  }

  if (query.voivodeship !== "all") {
    where.voivodeship =
      query.voivodeship;
  }

  if (query.fish !== "all") {
    const terms =
      getFishSearchTerms(query.fish);

    if (terms.length > 0) {
      andConditions.push({
        OR: terms.flatMap((term) => [
          {
            fish: {
              contains: term,
              mode: "insensitive" as const,
            },
          },
          {
            fishSpecies: {
              some: {
                name: {
                  contains: term,
                  mode:
                    "insensitive" as const,
                },
              },
            },
          },
        ]),
      });
    }
  }

  const amenityWhere: Record<
    LakeAmenityKey,
    Prisma.LakeWhereInput
  > = {
    cottages: { cottages: true },
    campfire: { campfire: true },
    noKill: { noKill: true },
    tent: { tent: true },
    parking: { parking: true },
    pier: { pier: true },
    toilet: { toilet: true },
    sanitaryFacilities: {
      sanitaryFacilities: true,
    },
    shop: { shop: true },
    nightFishing: {
      nightFishing: true,
    },
    boatRental: {
      boatRental: true,
    },
    camperCaravan: {
      camperCaravan: true,
    },
    electricityHookup: {
      electricityHookup: true,
    },
    gearRental: {
      gearRental: true,
    },
    shelter: { shelter: true },
    coveredSpots: {
      coveredSpots: true,
    },
    playground: {
      playground: true,
    },
    cardPayment: {
      cardPayment: true,
    },
  };

  for (const amenity of query.amenities) {
    andConditions.push(
      amenityWhere[amenity]
    );
  }

  where.AND = andConditions;

  return where;
}

function getOrderBy(
  sort: LakeExplorerSort
): Prisma.LakeOrderByWithRelationInput[] {
  if (sort === "name-asc") {
    return [
      { name: "asc" },
      { id: "asc" },
    ];
  }

  if (sort === "name-desc") {
    return [
      { name: "desc" },
      { id: "asc" },
    ];
  }

  return [
    { rating: "desc" },
    { createdAt: "desc" },
    { id: "asc" },
  ];
}

function mapLakeToListDto(
  lake: Prisma.LakeGetPayload<{
    select: typeof lakeExplorerSelect;
  }>
): LakeListDto {
  return {
    id: lake.id,
    name: lake.name,
    slug: lake.slug,
    rating: Number(lake.rating).toFixed(
      1
    ),
    fish: lake.fish,
    fishSpecies: lake.fishSpecies.map(
      (item) => item.name
    ),
    type: lake.ownerType as
      | "pzw"
      | "commercial",
    fishingType: lake.fishingType as
      | "general"
      | "spinning"
      | "carp",
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
      sanitaryFacilities:
        lake.sanitaryFacilities,
      shop: lake.shop,
      nightFishing:
        lake.nightFishing,
      boatRental: lake.boatRental,
      camperCaravan:
        lake.camperCaravan,
      electricityHookup:
        lake.electricityHookup,
      gearRental: lake.gearRental,
      shelter: lake.shelter,
      coveredSpots:
        lake.coveredSpots,
      playground: lake.playground,
      cardPayment: lake.cardPayment,
    },
    images: lake.images.map(
      (image) => image.url
    ),
  };
}

function mapLakeToMapPoint(
  lake: Prisma.LakeGetPayload<{
    select: typeof lakeMapSelect;
  }>
): LakeMapPointDto {
  return {
    id: lake.id,
    name: lake.name,
    slug: lake.slug,
    rating: Number(lake.rating).toFixed(
      1
    ),
    type: lake.ownerType as
      | "pzw"
      | "commercial",
    fishingType: lake.fishingType as
      | "general"
      | "spinning"
      | "carp",
    lat: lake.lat,
    lng: lake.lng,
    city: lake.city,
    voivodeship: lake.voivodeship,
    imageUrl: lake.images[0]?.url ?? null,
  };
}

function calculateDistanceInKm(
  firstLat: number,
  firstLng: number,
  secondLat: number,
  secondLng: number
) {
  const earthRadiusKm = 6371;

  const latDifference =
    ((secondLat - firstLat) *
      Math.PI) /
    180;

  const lngDifference =
    ((secondLng - firstLng) *
      Math.PI) /
    180;

  const firstLatRadians =
    (firstLat * Math.PI) / 180;

  const secondLatRadians =
    (secondLat * Math.PI) / 180;

  const a =
    Math.sin(latDifference / 2) **
      2 +
    Math.cos(firstLatRadians) *
      Math.cos(secondLatRadians) *
      Math.sin(lngDifference / 2) **
        2;

  const centralAngle =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusKm * centralAngle;
}

async function getDistanceSortedIds(
  where: Prisma.LakeWhereInput,
  userLat: number,
  userLng: number
) {
  const rows =
    await prisma.lake.findMany({
      where,
      select: {
        id: true,
        name: true,
        lat: true,
        lng: true,
      },
    });

  return rows
    .map((lake) => ({
      id: lake.id,
      name: lake.name,
      distance: calculateDistanceInKm(
        userLat,
        userLng,
        lake.lat,
        lake.lng
      ),
    }))
    .sort((first, second) => {
      if (
        first.distance !==
        second.distance
      ) {
        return (
          first.distance -
          second.distance
        );
      }

      return first.name.localeCompare(
        second.name,
        "pl"
      );
    })
    .map((lake) => lake.id);
}

export async function getLakeExplorerResults(
  input: LakeExplorerQuery
): Promise<LakeExplorerResult> {
  const query = normalizeQuery(input);
  const where = buildExplorerWhere(query);

  if (
    query.sort === "distance-asc" &&
    query.userLat !== null &&
    query.userLng !== null
  ) {
    const orderedIds =
      await getDistanceSortedIds(
        where,
        query.userLat,
        query.userLng
      );

    const totalCount = orderedIds.length;
    const totalPages = Math.max(
      1,
      Math.ceil(
        totalCount / query.pageSize
      )
    );

    const page = Math.min(
      query.page,
      totalPages
    );

    const startIndex =
      (page - 1) * query.pageSize;

    const pageIds = orderedIds.slice(
      startIndex,
      startIndex + query.pageSize
    );

    if (pageIds.length === 0) {
      return {
        lakes: [],
        page,
        pageSize: query.pageSize,
        totalCount,
        totalPages,
      };
    }

    const rows =
      await prisma.lake.findMany({
        where: {
          id: {
            in: pageIds,
          },
        },
        select: lakeExplorerSelect,
      });

    const rowsById = new Map(
      rows.map((lake) => [
        lake.id,
        lake,
      ])
    );

    return {
      lakes: pageIds
        .map((id) =>
          rowsById.get(id)
        )
        .filter(
          (
            lake
          ): lake is NonNullable<
            typeof lake
          > => Boolean(lake)
        )
        .map(mapLakeToListDto),
      page,
      pageSize: query.pageSize,
      totalCount,
      totalPages,
    };
  }

  const totalCount =
    await prisma.lake.count({
      where,
    });

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalCount / query.pageSize
    )
  );

  const page = Math.min(
    query.page,
    totalPages
  );

  const rows =
    await prisma.lake.findMany({
      where,
      select: lakeExplorerSelect,
      orderBy: getOrderBy(query.sort),
      skip:
        (page - 1) * query.pageSize,
      take: query.pageSize,
    });

  return {
    lakes: rows.map(mapLakeToListDto),
    page,
    pageSize: query.pageSize,
    totalCount,
    totalPages,
  };
}

export async function getLakeExplorerMapResults(
  input: LakeExplorerQuery
): Promise<LakeExplorerMapResult> {
  const query = normalizeQuery(input);
  const where = buildExplorerWhere(query);

  const [rows, totalCount] =
    await Promise.all([
      prisma.lake.findMany({
        where,
        select: lakeMapSelect,
        orderBy: [
          { rating: "desc" },
          { id: "asc" },
        ],
      }),
      prisma.lake.count({ where }),
    ]);

  return {
    lakes: rows.map(
      mapLakeToMapPoint
    ),
    totalCount,
  };
}
