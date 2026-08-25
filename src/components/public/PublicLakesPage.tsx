import { LakesExplorer } from "@/components/lakes/LakesExplorer";
import {
  DEFAULT_POLAND_BOUNDS,
} from "@/lib/lake-explorer-params";
import type {
  LakeExplorerFilters,
  LakeExplorerMapResult,
  LakeExplorerSort,
  LakeMapPointDto,
} from "@/lib/lake-explorer-types";
import type {
  LakeFilterOptions,
  LakeListDto,
  PaginatedLakesResult,
} from "@/lib/lakes";

type PublicLakesPageProps = {
  lakes: LakeListDto[];
  initialPagination?: Omit<
    PaginatedLakesResult,
    "lakes"
  >;
  initialMapResult?: LakeExplorerMapResult;
  filterOptions?: LakeFilterOptions;
  initialOwnerType?: string;
  initialFishingType?: string;
  initialVoivodeship?: string;
  initialFish?: string;
  initialAmenities?: string[];
  initialSearch?: string;
  initialSort?: string;
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
 * Compatibility wrapper dla SEO landingów.
 *
 * Jeżeli caller przekazuje cały zestaw `lakes`, przygotowujemy z niego
 * kompletny SSR: pierwszą stronę listy + wszystkie punkty mapy.
 *
 * Jeżeli caller ma już paginowany SSR, może przekazać `initialMapResult`.
 * Wtedy klient dostaje komplet danych i nie musi ponownie pobierać tej samej
 * pierwszej strony zaraz po hydration.
 */
export function PublicLakesPage({
  lakes,
  initialPagination,
  initialMapResult,
  filterOptions,
  initialOwnerType = "all",
  initialFishingType = "all",
  initialVoivodeship = "all",
  initialFish = "all",
  initialAmenities = [],
  initialSearch = "",
  initialSort = "rating-desc",
}: PublicLakesPageProps) {
  const pagination =
    initialPagination ?? {
      page: 1,
      pageSize: 20,
      totalCount: lakes.length,
      totalPages: Math.max(
        1,
        Math.ceil(
          lakes.length / 20
        )
      ),
    };

  const listLakes =
    initialPagination
      ? lakes
      : lakes.slice(
          0,
          pagination.pageSize
        );

  const derivedMapResult: LakeExplorerMapResult = {
    lakes: lakes.map(toMapPoint),
    totalCount:
      initialPagination
        ? pagination.totalCount
        : lakes.length,
  };

  const initialDataComplete =
    !initialPagination ||
    Boolean(initialMapResult);

  const options =
    filterOptions ?? {
      voivodeships: Array.from(
        new Set(
          lakes
            .map(
              (lake) =>
                lake.address
                  .voivodeship
            )
            .filter(Boolean)
        )
      ).sort((a, b) =>
        a.localeCompare(b, "pl")
      ),
      fishOptions: Array.from(
        new Set(
          lakes.flatMap(
            (lake) =>
              lake.fishSpecies
          )
        )
      ).sort((a, b) =>
        a.localeCompare(b, "pl")
      ),
      allLakesCount:
        pagination.totalCount,
    };

  const filters: LakeExplorerFilters =
    {
      search: initialSearch,
      ownerType:
        initialOwnerType,
      fishingType:
        initialFishingType,
      voivodeship:
        initialVoivodeship,
      fish: initialFish,
      amenities:
        initialAmenities,
      sort: normalizeSort(
        initialSort
      ),
    };

  return (
    <LakesExplorer
      mode="public"
      detailBasePath="/lowiska-w-polsce"
      initialDataComplete={
        initialDataComplete
      }
      syncUrl={false}
      initialData={{
        result: {
          lakes: listLakes,
          ...pagination,
        },
        mapResult:
          initialMapResult ??
          derivedMapResult,
        filterOptions: options,
        filters,
        bounds:
          DEFAULT_POLAND_BOUNDS,
        mobileView: "list",
      }}
    />
  );
}
