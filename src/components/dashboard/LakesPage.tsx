"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { MapSection } from "@/components/dashboard/MapSection";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  calculateDistanceInKm,
  getDistanceLabel,
  type UserLocation,
} from "@/lib/location";
import type {
  LakeDto,
  LakeFilterOptions,
  LakeListDto,
  PaginatedLakesResult,
} from "@/lib/lakes";

type OwnerTypeFilter = "all" | "pzw" | "commercial";
type FishingTypeFilter = "all" | "general" | "spinning" | "carp";
type SortType = "rating" | "name" | "distance";
type ViewMode = "grid" | "list" | "map";

type ActiveFilterItem = {
  key: string;
  label: string;
  onRemove: () => void;
};

type AmenityKey =
  | "cottages"
  | "campfire"
  | "noKill"
  | "tent"
  | "parking"
  | "pier"
  | "toilet"
  | "shop"
  | "nightFishing"
  | "boatRental"
  | "gearRental"
  | "shelter"
  | "coveredSpots"
  | "playground"
  | "cardPayment";

type LakesPageProps = {
  lakes: LakeListDto[];
  initialView?: "grid" | "list" | "map";
  initialPagination: Omit<PaginatedLakesResult, "lakes">;
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

const ITEMS_PER_PAGE = 15;

const amenityFilters: {
  key: AmenityKey;
  label: string;
}[] = [
  { key: "noKill", label: "No Kill" },
  { key: "parking", label: "Parking" },
  { key: "cottages", label: "Domki" },
  { key: "tent", label: "Namiot" },
  { key: "pier", label: "Pomost" },
  { key: "toilet", label: "Toaleta" },
  { key: "shop", label: "Sklep" },
  { key: "nightFishing", label: "Wędkowanie nocne" },
  { key: "boatRental", label: "Wypożyczalnia łodzi" },
  { key: "gearRental", label: "Wypożyczalnia sprzętu" },
  { key: "shelter", label: "Altana" },
  { key: "coveredSpots", label: "Zadaszone stanowiska" },
  { key: "playground", label: "Plac zabaw" },
  { key: "cardPayment", label: "Płatność kartą" },
];


const URL_FILTER_KEYS = [
  "q",
  "owner",
  "fishing",
  "voivodeship",
  "fish",
  "amenities",
  "sort",
  "page",
] as const;

function isAmenityKey(value: string): value is AmenityKey {
  return amenityFilters.some((amenity) => amenity.key === value);
}

function parseOwnerType(value: string | null): OwnerTypeFilter {
  if (value === "pzw" || value === "commercial") {
    return value;
  }

  return "all";
}

function parseFishingType(value: string | null): FishingTypeFilter {
  if (
    value === "general" ||
    value === "spinning" ||
    value === "carp"
  ) {
    return value;
  }

  return "all";
}

function parseSortType(value: string | null): SortType {
  if (value === "name" || value === "distance") {
    return value;
  }

  return "rating";
}

function parseAmenities(value: string | null): AmenityKey[] {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(isAmenityKey)
    )
  );
}

function getSortTypeLabel(type: SortType) {
  if (type === "name") return "Nazwa A-Z";
  if (type === "distance") return "Najbliżej";

  return "Najwyższa ocena";
}

function getOwnerTypeLabel(type: string) {
  if (type === "pzw") return "PZW";
  if (type === "commercial") return "Komercyjne";

  return "Inne";
}

function getFishingTypeLabel(type: string) {
  if (type === "general") return "Ogólne";
  if (type === "spinning") return "Spinningowe";
  if (type === "carp") return "Karpiowe";

  return "Inne";
}

function getLakeDistanceLabel(
  userLocation: UserLocation | null,
  lake: LakeListDto
) {
  return getDistanceLabel(userLocation, {
    lat: lake.lat,
    lng: lake.lng,
  });
}

export function LakesPage({
  lakes,
  initialView = "grid",
  initialPagination,
  filterOptions,
  initialFilters,
}: LakesPageProps) {
  const { userLocation } = useUserLocation();

  const isUrlStateReady = useRef(false);
  const lastUrlQuery = useRef("");
  const requestId = useRef(0);

  const [serverResult, setServerResult] = useState<PaginatedLakesResult>({
    lakes,
    ...initialPagination,
  });
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const [search, setSearch] = useState(initialFilters.search);
  const [ownerType, setOwnerType] = useState<OwnerTypeFilter>(
    parseOwnerType(initialFilters.ownerType)
  );
  const [fishingType, setFishingType] = useState<FishingTypeFilter>(
    parseFishingType(initialFilters.fishingType)
  );
  const [sortType, setSortType] = useState<SortType>(
    parseSortType(initialFilters.sort)
  );
  const [voivodeship, setVoivodeship] = useState(
    initialFilters.voivodeship || "all"
  );
  const [fish, setFish] = useState(initialFilters.fish || "all");
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityKey[]>(
    initialFilters.amenities.filter(isAmenityKey)
  );
  const [areAdvancedFiltersOpen, setAreAdvancedFiltersOpen] = useState(false);
  const [areMobileFiltersOpen, setAreMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [currentPage, setCurrentPage] = useState(initialPagination.page);

  const voivodeships = filterOptions.voivodeships;
  const fishOptions = filterOptions.fishOptions;
  const filteredLakes = serverResult.lakes;
  const paginatedLakes = serverResult.lakes;
  const totalPages = serverResult.totalPages;

  const activeFilterItems: ActiveFilterItem[] = [];

  if (search.trim()) {
    activeFilterItems.push({
      key: "search",
      label: `Szukaj: ${search.trim()}`,
      onRemove: () => setSearch(""),
    });
  }

  if (ownerType !== "all") {
    activeFilterItems.push({
      key: "ownerType",
      label: `Rodzaj: ${getOwnerTypeLabel(ownerType)}`,
      onRemove: () => setOwnerType("all"),
    });
  }

  if (fishingType !== "all") {
    activeFilterItems.push({
      key: "fishingType",
      label: `Typ: ${getFishingTypeLabel(fishingType)}`,
      onRemove: () => setFishingType("all"),
    });
  }

  if (voivodeship !== "all") {
    activeFilterItems.push({
      key: "voivodeship",
      label: `Województwo: ${voivodeship}`,
      onRemove: () => setVoivodeship("all"),
    });
  }

  if (fish !== "all") {
    activeFilterItems.push({
      key: "fish",
      label: `Ryba: ${fish}`,
      onRemove: () => setFish("all"),
    });
  }

  selectedAmenities.forEach((amenityKey) => {
    const amenity = amenityFilters.find(
      (item) => item.key === amenityKey
    );

    activeFilterItems.push({
      key: `amenity-${amenityKey}`,
      label: amenity?.label ?? amenityKey,
      onRemove: () =>
        setSelectedAmenities((current) =>
          current.filter((item) => item !== amenityKey)
        ),
    });
  });

  if (sortType !== "rating") {
    activeFilterItems.push({
      key: "sort",
      label: `Sortowanie: ${getSortTypeLabel(sortType)}`,
      onRemove: () => setSortType("rating"),
    });
  }

  const activeFiltersCount = activeFilterItems.length;

  useEffect(() => {
    function restoreFiltersFromUrl() {
      const params = new URLSearchParams(window.location.search);

      setSearch(params.get("q")?.trim() ?? "");
      setOwnerType(parseOwnerType(params.get("owner")));
      setFishingType(parseFishingType(params.get("fishing")));
      setVoivodeship(params.get("voivodeship")?.trim() || "all");
      setFish(params.get("fish")?.trim() || "all");
      setSelectedAmenities(parseAmenities(params.get("amenities")));
      setSortType(parseSortType(params.get("sort")));

      const nextPage = Number.parseInt(params.get("page") ?? "1", 10);
      setCurrentPage(
        Number.isFinite(nextPage) && nextPage > 0 ? nextPage : 1
      );

      lastUrlQuery.current = params.toString();
    }

    restoreFiltersFromUrl();
    isUrlStateReady.current = true;

    window.addEventListener("popstate", restoreFiltersFromUrl);

    return () => {
      window.removeEventListener("popstate", restoreFiltersFromUrl);
    };
  }, []);

  useEffect(() => {
    if (!isUrlStateReady.current) {
      return;
    }

    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;

    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      const params = new URLSearchParams(window.location.search);

      URL_FILTER_KEYS.forEach((key) => {
        params.delete(key);
      });

      if (search.trim()) {
        params.set("q", search.trim());
      }

      if (ownerType !== "all") {
        params.set("owner", ownerType);
      }

      if (fishingType !== "all") {
        params.set("fishing", fishingType);
      }

      if (voivodeship !== "all") {
        params.set("voivodeship", voivodeship);
      }

      if (fish !== "all") {
        params.set("fish", fish);
      }

      if (selectedAmenities.length > 0) {
        params.set(
          "amenities",
          [...selectedAmenities].sort().join(",")
        );
      }

      if (sortType !== "rating") {
        params.set("sort", sortType);
      }

      if (currentPage > 1) {
        params.set("page", String(currentPage));
      }

      const nextQuery = params.toString();

      if (nextQuery !== lastUrlQuery.current) {
        lastUrlQuery.current = nextQuery;

        const nextUrl = `${window.location.pathname}${
          nextQuery ? `?${nextQuery}` : ""
        }${window.location.hash}`;

        window.history.pushState(null, "", nextUrl);
      }

      setIsServerLoading(true);
      setServerError("");

      try {
        const response = await fetch("/api/lakes/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: currentPage,
            pageSize: initialPagination.pageSize,
            search: search.trim(),
            ownerType,
            fishingType,
            voivodeship,
            fish,
            amenities: selectedAmenities,
            sort: sortType,
            userLat: userLocation?.lat ?? null,
            userLng: userLocation?.lng ?? null,
          }),
          signal: controller.signal,
        });

        const data = (await response.json().catch(() => null)) as
          | PaginatedLakesResult
          | { message?: string }
          | null;

        if (!response.ok || !data || !("lakes" in data)) {
          throw new Error(
            data && "message" in data && data.message
              ? data.message
              : "Nie udało się pobrać łowisk."
          );
        }

        if (requestId.current !== currentRequestId) {
          return;
        }

        setServerResult(data);

        if (data.page !== currentPage) {
          setCurrentPage(data.page);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setServerError(
          error instanceof Error
            ? error.message
            : "Nie udało się pobrać łowisk."
        );
      } finally {
        if (
          !controller.signal.aborted &&
          requestId.current === currentRequestId
        ) {
          setIsServerLoading(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    search,
    ownerType,
    fishingType,
    voivodeship,
    fish,
    selectedAmenities,
    sortType,
    currentPage,
    userLocation,
    initialPagination.pageSize,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    ownerType,
    fishingType,
    voivodeship,
    fish,
    selectedAmenities,
    sortType,
    viewMode,
  ]);


  function toggleAmenity(amenity: AmenityKey) {
    setSelectedAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity]
    );
  }

  function clearFilters() {
    setSearch("");
    setOwnerType("all");
    setFishingType("all");
    setVoivodeship("all");
    setFish("all");
    setSelectedAmenities([]);
    setSortType("rating");
    setAreAdvancedFiltersOpen(false);
    setCurrentPage(1);
  }

  return (
    <div id="lista-lowisk">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Łowiska
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Przeglądaj bazę łowisk, filtruj miejsca według rodzaju, typu
            łowienia, ryb, lokalizacji i dostępnych udogodnień.
          </p>
        </div>

        <Link
          href="/lowiska/zglos"
          className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Dodaj łowisko
        </Link>
      </div>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Wyniki:{" "}
                <strong className="font-bold text-slate-950">
                  {serverResult.totalCount}
                </strong>{" "}
                / {filterOptions.allLakesCount}
              </p>

              {serverResult.totalCount > serverResult.pageSize && viewMode !== "map" && (
                <p className="mt-1 text-xs font-bold text-slate-400">
                  Strona {currentPage} z {totalPages}
                </p>
              )}

              {activeFiltersCount > 0 && (
                <p className="mt-1 text-xs font-bold text-blue-600">
                  Aktywne filtry: {activeFiltersCount}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setAreMobileFiltersOpen((current) => !current)}
              className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              {areMobileFiltersOpen ? "Ukryj filtry" : "Filtry"}
            </button>
          </div>

          <div className="inline-flex w-fit rounded-2xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Kafelki
            </button>

            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                viewMode === "map"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Mapa
            </button>
          </div>
        </div>

        <div
          className={`mt-4 md:mt-0 ${
            areMobileFiltersOpen ? "block" : "hidden md:block"
          }`}
        >
          <div className="grid gap-4 xl:grid-cols-[1.3fr_260px]">
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Szukaj łowiska
              </span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Wpisz nazwę, miasto, województwo albo gatunek ryby..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Sortowanie
              </span>

              <select
                value={sortType}
                onChange={(event) =>
                  setSortType(event.target.value as SortType)
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500"
              >
                <option value="rating">Najwyższa ocena</option>
                <option value="name">Nazwa A-Z</option>
                <option value="distance">Najbliżej</option>
              </select>
            </label>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Rodzaj łowiska
              </p>

              <div className="flex flex-wrap gap-2">
                <FilterButton
                  label="Wszystkie"
                  isActive={ownerType === "all"}
                  onClick={() => setOwnerType("all")}
                />

                <FilterButton
                  label="PZW"
                  isActive={ownerType === "pzw"}
                  onClick={() => setOwnerType("pzw")}
                />

                <FilterButton
                  label="Komercyjne"
                  isActive={ownerType === "commercial"}
                  onClick={() => setOwnerType("commercial")}
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Typ łowienia
              </p>

              <div className="flex flex-wrap gap-2">
                <FilterButton
                  label="Wszystkie"
                  isActive={fishingType === "all"}
                  onClick={() => setFishingType("all")}
                />

                <FilterButton
                  label="Ogólne"
                  isActive={fishingType === "general"}
                  onClick={() => setFishingType("general")}
                />

                <FilterButton
                  label="Spinningowe"
                  isActive={fishingType === "spinning"}
                  onClick={() => setFishingType("spinning")}
                />

                <FilterButton
                  label="Karpiowe"
                  isActive={fishingType === "carp"}
                  onClick={() => setFishingType("carp")}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Województwo
              </span>

              <select
                value={voivodeship}
                onChange={(event) => setVoivodeship(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500"
              >
                <option value="all">Wszystkie województwa</option>

                {voivodeships.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Gatunek ryby
              </span>

              <select
                value={fish}
                onChange={(event) => setFish(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500"
              >
                <option value="all">Wszystkie ryby</option>

                {fishOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => setAreAdvancedFiltersOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              <span>Udogodnienia i filtry zaawansowane</span>
              <span>{areAdvancedFiltersOpen ? "Zwiń" : "Rozwiń"}</span>
            </button>

            {areAdvancedFiltersOpen && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {amenityFilters.map((amenity) => (
                  <CheckboxFilter
                    key={amenity.key}
                    label={amenity.label}
                    checked={selectedAmenities.includes(amenity.key)}
                    onChange={() => toggleAmenity(amenity.key)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 md:flex-row md:items-center md:justify-between">
            <div className="hidden flex-wrap items-center gap-2 text-sm text-slate-500 md:flex">
              <span>
                Wyniki:{" "}
                <strong className="font-bold text-slate-950">
                  {serverResult.totalCount}
                </strong>{" "}
                / {filterOptions.allLakesCount}
              </span>

              {serverResult.totalCount > serverResult.pageSize && viewMode !== "map" && (
                <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                  Strona {currentPage} z {totalPages}
                </span>
              )}

              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  Aktywne filtry: {activeFiltersCount}
                </span>
              )}

              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-bold text-blue-600 transition hover:text-blue-700"
              >
                Wyczyść wszystko
              </button>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="text-left text-sm font-bold text-blue-600 transition hover:text-blue-700 md:hidden"
            >
              Wyczyść wszystko
            </button>

            <div className="hidden w-fit rounded-2xl border border-slate-200 bg-white p-1 md:inline-flex">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  viewMode === "grid" || viewMode === "map"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Kafelki
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </section>

      {activeFilterItems.length > 0 && (
        <section className="mb-6 rounded-3xl border border-blue-100 bg-blue-50/70 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <p className="text-sm font-black text-blue-950">
                  Aktywne filtry
                </p>

                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-blue-700 shadow-sm">
                  {activeFilterItems.length}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilterItems.map((filterItem) => (
                  <button
                    key={filterItem.key}
                    type="button"
                    onClick={filterItem.onRemove}
                    className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-2 text-left text-xs font-bold text-blue-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                    aria-label={`Usuń filtr: ${filterItem.label}`}
                  >
                    <span className="truncate">{filterItem.label}</span>
                    <span
                      aria-hidden="true"
                      className="text-base leading-none text-blue-500"
                    >
                      ×
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="w-fit shrink-0 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700"
            >
              Wyczyść wszystko
            </button>
          </div>
        </section>
      )}

      {serverError && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {serverError}
        </div>
      )}

      {isServerLoading && (
        <div className="mb-4 text-sm font-bold text-blue-600">
          Aktualizuję wyniki…
        </div>
      )}

      <div className={isServerLoading ? "opacity-70 transition-opacity" : ""}>
        {filteredLakes.length > 0 ? (
          viewMode === "map" ? (
            <>
              <div className="md:hidden">
                <MapSection lakes={filteredLakes as unknown as LakeDto[]} />
              </div>

              <div className="hidden grid items-stretch gap-5 md:grid md:grid-cols-2 2xl:grid-cols-3">
                {filteredLakes.map((lake) => (
                  <LakeGridCard
                    key={lake.id}
                    lake={lake}
                    userLocation={userLocation}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid items-stretch gap-5 md:grid-cols-2 2xl:grid-cols-3">
                  {paginatedLakes.map((lake) => (
                    <LakeGridCard
                      key={lake.id}
                      lake={lake}
                      userLocation={userLocation}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedLakes.map((lake) => (
                    <LakeListItem
                      key={lake.id}
                      lake={lake}
                      userLocation={userLocation}
                    />
                  ))}
                </div>
              )}

              {serverResult.totalCount > serverResult.pageSize && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-bold text-slate-950">
              Brak łowisk dla wybranych filtrów
            </p>

            <p className="mt-2 text-slate-500">
              Zmień kryteria wyszukiwania albo wyczyść filtry.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Wyczyść filtry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = getPaginationPages(currentPage, totalPages);

  function goToPage(page: number) {
    onPageChange(page);

    setTimeout(() => {
      document.getElementById("lista-lowisk")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">
        Strona {currentPage} z {totalPages}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => goToPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Poprzednia
        </button>

        {pages.map((page, index) =>
          page === "dots" ? (
            <span
              key={`dots-${index}`}
              className="px-2 text-sm font-black text-slate-400"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Następna
        </button>
      </div>
    </div>
  );
}

function getPaginationPages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "dots"> = [1];

  if (currentPage > 4) {
    pages.push("dots");
  }

  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  for (let page = startPage; page <= endPage; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 3) {
    pages.push("dots");
  }

  pages.push(totalPages);

  return pages;
}

function LakeGridCard({
  lake,
  userLocation,
}: {
  lake: LakeListDto;
  userLocation: UserLocation | null;
}) {
  const image = lake.images[0];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-44 shrink-0 overflow-hidden bg-slate-100">
        <LakeImagePreview image={image} lakeName={lake.name} />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              lake.type === "commercial"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {getOwnerTypeLabel(lake.type)}
          </span>

          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
            {getFishingTypeLabel(lake.fishingType)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="line-clamp-2 break-words text-xl font-bold text-slate-950">
              {lake.name}
            </h2>

            <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-500">
              {lake.address.city}, woj. {lake.address.voivodeship}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
            ★ {lake.rating}
          </div>
        </div>

        <div className="min-h-[44px]">
          <p className="line-clamp-2 text-sm leading-6 text-slate-500">
            {lake.fish || "Brak informacji"}
          </p>
        </div>

        <div className="mt-4 flex min-h-[26px] flex-wrap gap-2">
          {lake.amenities.noKill && <SmallBadge label="No Kill" />}
          {lake.amenities.parking && <SmallBadge label="Parking" />}
          {lake.amenities.nightFishing && <SmallBadge label="Nocka" />}
          {lake.amenities.cottages && <SmallBadge label="Domki" />}
          {lake.amenities.cardPayment && <SmallBadge label="Karta" />}

          {!lake.amenities.noKill &&
            !lake.amenities.parking &&
            !lake.amenities.nightFishing &&
            !lake.amenities.cottages &&
            !lake.amenities.cardPayment && (
              <SmallBadge label="Brak informacji" />
            )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-500">
            {getLakeDistanceLabel(userLocation, lake)}
          </p>

          <Link
            href={`/lowiska/${lake.slug}`}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Zobacz szczegóły
          </Link>
        </div>
      </div>
    </article>
  );
}

function LakeListItem({
  lake,
  userLocation,
}: {
  lake: LakeListDto;
  userLocation: UserLocation | null;
}) {
  const image = lake.images[0];

  return (
    <article className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md lg:grid-cols-[280px_1fr]">
      <div className="relative h-56 bg-slate-100 lg:h-full">
        <LakeImagePreview image={image} lakeName={lake.name} />
      </div>

      <div className="flex flex-col p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  lake.type === "commercial"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {getOwnerTypeLabel(lake.type)}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {getFishingTypeLabel(lake.fishingType)}
              </span>
            </div>

            <h2 className="break-words text-2xl font-bold text-slate-950">
              {lake.name}
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {lake.address.street}, {lake.address.city}, woj.{" "}
              {lake.address.voivodeship}
            </p>
          </div>

          <div className="w-fit shrink-0 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
            ★ {lake.rating}
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          <span className="font-bold text-slate-950">Ryby:</span>{" "}
          {lake.fish || "Brak informacji"}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {lake.amenities.noKill && <SmallBadge label="No Kill" />}
          {lake.amenities.parking && <SmallBadge label="Parking" />}
          {lake.amenities.nightFishing && <SmallBadge label="Nocka" />}
          {lake.amenities.cottages && <SmallBadge label="Domki" />}
          {lake.amenities.cardPayment && <SmallBadge label="Karta" />}

          {!lake.amenities.noKill &&
            !lake.amenities.parking &&
            !lake.amenities.nightFishing &&
            !lake.amenities.cottages &&
            !lake.amenities.cardPayment && (
              <SmallBadge label="Brak informacji" />
            )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-500">
            {getLakeDistanceLabel(userLocation, lake)}
          </p>

          <Link
            href={`/lowiska/${lake.slug}`}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Zobacz szczegóły
          </Link>
        </div>
      </div>
    </article>
  );
}

function LakeImagePreview({
  image,
  lakeName,
}: {
  image?: string | null;
  lakeName: string;
}) {
  const [hasImageError, setHasImageError] = useState(false);

  if (!image || hasImageError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 px-6 text-center">
        <p className="text-sm font-bold text-slate-500">
          Brak zdjęcia łowiska
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Do tego łowiska nie dodano jeszcze zdjęcia.
        </p>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={lakeName}
      loading="lazy"
      onError={() => setHasImageError(true)}
      className="h-full w-full object-cover"
    />
  );
}

function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}

function CheckboxFilter({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 accent-blue-600"
      />

      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </label>
  );
}

function SmallBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      {label}
    </span>
  );
}