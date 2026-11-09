import type {
  LakeExplorerBounds,
  LakeExplorerFilters,
  LakeExplorerSort,
} from "@/lib/lake-explorer-types";

export const DEFAULT_POLAND_BOUNDS: LakeExplorerBounds = {
  north: 55.15,
  south: 48.85,
  east: 24.25,
  west: 13.95,
};

export const DEFAULT_LAKE_EXPLORER_FILTERS: LakeExplorerFilters = {
  search: "",
  ownerType: "all",
  fishingType: "all",
  voivodeship: "all",
  fish: "all",
  amenities: [],
  sort: "rating-desc",
};

export type LakeExplorerSearchParams = Record<
  string,
  string | string[] | undefined
>;

function firstValue(
  value: string | string[] | undefined
) {
  return Array.isArray(value)
    ? value[0] ?? ""
    : value ?? "";
}

function normalizeSort(
  value: string
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

function normalizeOwnerType(value: string) {
  return value === "pzw" ||
    value === "commercial"
    ? value
    : "all";
}

function normalizeFishingType(value: string) {
  return value === "general" ||
    value === "spinning" ||
    value === "carp"
    ? value
    : "all";
}

function normalizeAmenities(value: string) {
  if (!value || value === "none") {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeLakeExplorerBounds(
  value: unknown
): LakeExplorerBounds | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate =
    value as Partial<LakeExplorerBounds>;

  const north = Number(candidate.north);
  const south = Number(candidate.south);
  const east = Number(candidate.east);
  const west = Number(candidate.west);

  if (
    !Number.isFinite(north) ||
    !Number.isFinite(south) ||
    !Number.isFinite(east) ||
    !Number.isFinite(west)
  ) {
    return null;
  }

  const normalized = {
    north: clamp(north, -90, 90),
    south: clamp(south, -90, 90),
    east: clamp(east, -180, 180),
    west: clamp(west, -180, 180),
  };

  if (
    normalized.north <= normalized.south ||
    normalized.east <= normalized.west
  ) {
    return null;
  }

  return normalized;
}

export function parseBoundsParam(
  value: string | null | undefined
): LakeExplorerBounds {
  if (!value) {
    return DEFAULT_POLAND_BOUNDS;
  }

  const parts = value
    .split(",")
    .map((part) => Number(part));

  if (
    parts.length !== 4 ||
    parts.some(
      (part) => !Number.isFinite(part)
    )
  ) {
    return DEFAULT_POLAND_BOUNDS;
  }

  return (
    normalizeLakeExplorerBounds({
      north: parts[0],
      south: parts[1],
      east: parts[2],
      west: parts[3],
    }) ?? DEFAULT_POLAND_BOUNDS
  );
}

export function parseLakeExplorerSearchParams(
  params: LakeExplorerSearchParams
) {
  const ownerType = normalizeOwnerType(
    firstValue(params.owner)
  );

  const fishingType = normalizeFishingType(
    firstValue(params.fishing)
  );

  const voivodeship =
    firstValue(params.voivodeship).trim() ||
    "all";

  const fish =
    firstValue(params.fish).trim() || "all";

  const filters: LakeExplorerFilters = {
    search: firstValue(params.q)
      .trim()
      .slice(0, 120),
    ownerType,
    fishingType,
    voivodeship,
    fish,
    amenities: normalizeAmenities(
      firstValue(params.amenities)
    ),
    sort: normalizeSort(
      firstValue(params.sort)
    ),
  };

  const bounds = parseBoundsParam(
    firstValue(params.bbox)
  );

  const mobileView:
    | "list"
    | "map" =
    firstValue(params.view) === "map"
      ? "map"
      : "list";

  return {
    filters,
    bounds,
    mobileView,
  };
}

export function roundBounds(
  bounds: LakeExplorerBounds,
  precision = 5
): LakeExplorerBounds {
  const factor = 10 ** precision;

  return {
    north:
      Math.round(bounds.north * factor) /
      factor,
    south:
      Math.round(bounds.south * factor) /
      factor,
    east:
      Math.round(bounds.east * factor) /
      factor,
    west:
      Math.round(bounds.west * factor) /
      factor,
  };
}

export function areBoundsEqual(
  first: LakeExplorerBounds,
  second: LakeExplorerBounds,
  tolerance = 0.0005
) {
  return (
    Math.abs(first.north - second.north) <=
      tolerance &&
    Math.abs(first.south - second.south) <=
      tolerance &&
    Math.abs(first.east - second.east) <=
      tolerance &&
    Math.abs(first.west - second.west) <=
      tolerance
  );
}

export function isDefaultPolandBounds(
  bounds: LakeExplorerBounds
) {
  return areBoundsEqual(
    bounds,
    DEFAULT_POLAND_BOUNDS,
    0.00001
  );
}

export function serializeBounds(
  bounds: LakeExplorerBounds
) {
  const value = roundBounds(bounds);

  return [
    value.north,
    value.south,
    value.east,
    value.west,
  ].join(",");
}

export function buildLakeExplorerUrlParams({
  filters,
  bounds,
  mobileView,
}: {
  filters: LakeExplorerFilters;
  bounds: LakeExplorerBounds;
  mobileView: "list" | "map";
}) {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set("q", filters.search.trim());
  }

  if (filters.ownerType !== "all") {
    params.set("owner", filters.ownerType);
  }

  if (filters.fishingType !== "all") {
    params.set(
      "fishing",
      filters.fishingType
    );
  }

  if (filters.voivodeship !== "all") {
    params.set(
      "voivodeship",
      filters.voivodeship
    );
  }

  if (filters.fish !== "all") {
    params.set("fish", filters.fish);
  }

  if (filters.amenities.length > 0) {
    params.set(
      "amenities",
      [...filters.amenities]
        .sort()
        .join(",")
    );
  }

  if (filters.sort !== "rating-desc") {
    params.set("sort", filters.sort);
  }

  if (!isDefaultPolandBounds(bounds)) {
    params.set("bbox", serializeBounds(bounds));
  }

  if (mobileView === "map") {
    params.set("view", "map");
  }

  return params;
}
