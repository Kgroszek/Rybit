import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LakesPage } from "@/components/dashboard/LakesPage";
import {
  getLakeFilterOptions,
  getPaginatedLakes,
} from "@/lib/lakes";

type LowiskaPageProps = {
  searchParams?: Promise<{
    view?: string;
    page?: string;
    q?: string;
    owner?: string;
    fishing?: string;
    voivodeship?: string;
    fish?: string;
    amenities?: string;
    sort?: string;
  }>;
};


function getStringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getPageParam(value: string | string[] | undefined) {
  const parsed = Number.parseInt(getStringParam(value), 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getAmenitiesParam(value: string | string[] | undefined) {
  const raw = getStringParam(value);

  if (!raw || raw === "none") {
    return [];
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}


export default async function LowiskaPage({
  searchParams,
}: LowiskaPageProps) {
  const params = (await searchParams) ?? {};

  const initialView =
    params.view === "map"
      ? "map"
      : params.view === "list"
        ? "list"
        : "grid";

  const initialFilters = {
    search: getStringParam(params.q),
    ownerType: getStringParam(params.owner) || "all",
    fishingType: getStringParam(params.fishing) || "all",
    voivodeship: getStringParam(params.voivodeship) || "all",
    fish: getStringParam(params.fish) || "all",
    amenities: getAmenitiesParam(params.amenities),
    sort: getStringParam(params.sort) || "rating",
  };

  const [result, filterOptions] = await Promise.all([
    getPaginatedLakes({
      page: getPageParam(params.page),
      search: initialFilters.search,
      ownerType: initialFilters.ownerType,
      fishingType: initialFilters.fishingType,
      voivodeship: initialFilters.voivodeship,
      fish: initialFilters.fish,
      amenities: initialFilters.amenities,
      sort: initialFilters.sort,
    }),
    getLakeFilterOptions(),
  ]);

  return (
    <DashboardLayout>
      <LakesPage
        lakes={result.lakes}
        initialView={initialView}
        initialPagination={{
          page: result.page,
          pageSize: result.pageSize,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        }}
        filterOptions={filterOptions}
        initialFilters={initialFilters}
      />
    </DashboardLayout>
  );
}
