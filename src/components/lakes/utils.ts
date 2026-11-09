import {
  CARD_AMENITIES,
  FISHING_TYPE_OPTIONS,
  OWNER_TYPE_OPTIONS,
} from "@/components/lakes/constants";
import {
  calculateDistanceInKm,
  formatDistanceInKm,
  isValidLocation,
  type UserLocation,
} from "@/lib/location";
import type { LakeListDto } from "@/lib/lakes";

export function getOwnerTypeLabel(
  value: string
) {
  return (
    OWNER_TYPE_OPTIONS.find(
      (item) => item.value === value
    )?.label ?? "Inne"
  );
}

export function getFishingTypeLabel(
  value: string
) {
  return (
    FISHING_TYPE_OPTIONS.find(
      (item) => item.value === value
    )?.label ?? "Inne"
  );
}

export function getLakeResultLabel(
  count: number
) {
  if (count === 1) {
    return "łowisko";
  }

  const lastTwo = count % 100;
  const lastOne = count % 10;

  if (
    lastOne >= 2 &&
    lastOne <= 4 &&
    (lastTwo < 12 ||
      lastTwo > 14)
  ) {
    return "łowiska";
  }

  return "łowisk";
}

export function formatLakeRating(
  rating: string | number
) {
  const value = Number(rating || 0);

  return value > 0
    ? `Ocena ${value
        .toFixed(1)
        .replace(".", ",")}`
    : "Brak ocen";
}

export function getLakeFishSummary(
  lake: LakeListDto,
  limit = 3
) {
  const fish =
    lake.fishSpecies.length > 0
      ? lake.fishSpecies
      : lake.fish
          .split(",")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean);

  return fish
    .slice(0, limit)
    .join(" • ");
}

export function getVisibleAmenities(
  lake: LakeListDto,
  limit = 3
) {
  return CARD_AMENITIES.filter(
    (item) =>
      Boolean(
        lake.amenities[item.key]
      )
  )
    .map((item) => item.label)
    .slice(0, limit);
}

export function getLakeDistance(
  userLocation: UserLocation | null,
  lake: Pick<
    LakeListDto,
    "lat" | "lng"
  >
) {
  if (
    !userLocation ||
    !isValidLocation(userLocation)
  ) {
    return null;
  }

  const target = {
    lat: lake.lat,
    lng: lake.lng,
  };

  if (!isValidLocation(target)) {
    return null;
  }

  return formatDistanceInKm(
    calculateDistanceInKm(
      userLocation,
      target
    )
  );
}

export function makeLakeDetailHref(
  detailBasePath: string,
  slug: string
) {
  return `${detailBasePath.replace(
    /\/$/,
    ""
  )}/${slug}`;
}
