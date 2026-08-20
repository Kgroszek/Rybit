import { LakesExplorer } from "@/components/lakes/LakesExplorer";
import {
  DEFAULT_POLAND_BOUNDS,
} from "@/lib/lake-explorer-params";
import type {
  LakeExplorerFilters,
  LakeExplorerSort,
  LakeMapPointDto,
} from "@/lib/lake-explorer-types";
import type {
  LakeFilterOptions,
  LakeListDto,
  PaginatedLakesResult,
} from "@/lib/lakes";

type LakesPageProps = {
  lakes: LakeListDto[];
  initialView?:
    | "grid"
    | "list"
    | "map";
  initialPagination: Omit<
    PaginatedLakesResult,
    "lakes"
  >;
  filterOptions: LakeFilterOptions;
  initialFilters: {
    search: string;
    ownerType: string;
    fishingType: string;
    voivodeship: string;
    fish: string;
    amenities: string[];
    sort: string;
  };
};

function normalizeSort(
  value: string
): LakeExplorerSort {
  if (
    value === "distance" ||
    value === "distance-asc"
  ) {
    return "distance-asc";
  }

  if (
    value === "name" ||
    value === "name-asc"
  ) {
    return "name-asc";
  }

  if (value === "name-desc") {
    return "name-desc";
  }

  return "rating-desc";
}

function toMapPoint(
  lake: LakeListDto
): LakeMapPointDto {
  return {
    id: lake.id,
    name: lake.name,
    slug: lake.slug,
    rating: lake.rating,
    type: lake.type,
    fishingType:
      lake.fishingType,
    lat: lake.lat,
    lng: lake.lng,
    city: lake.address.city,
    voivodeship:
      lake.address.voivodeship,
    imageUrl:
      lake.images[0] ?? null,
  };
}

/**
 * Compatibility wrapper.
 *
 * Nowe /lowiska renderuje LakesExplorer
 * bezpośrednio z Server Component.
 * Ten wrapper zostaje, aby nie łamać
 * ewentualnych starszych importów.
 */
export function LakesPage({
  lakes,
  initialView = "list",
  initialPagination,
  filterOptions,
  initialFilters,
}: LakesPageProps) {
  const filters: LakeExplorerFilters =
    {
      ...initialFilters,
      sort: normalizeSort(
        initialFilters.sort
      ),
    };

  return (
    <LakesExplorer
      mode="authenticated"
      detailBasePath="/lowiska"
      initialDataComplete={false}
      initialData={{
        result: {
          lakes,
          ...initialPagination,
        },
        mapResult: {
          lakes:
            lakes.map(toMapPoint),
          totalCount:
            initialPagination.totalCount,
        },
        filterOptions,
        filters,
        bounds:
          DEFAULT_POLAND_BOUNDS,
        mobileView:
          initialView === "map"
            ? "map"
            : "list",
        favouriteLakeIds: [],
      }}
    />
  );
}
