"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { LakesExplorerToolbar } from "@/components/lakes/filters/LakesExplorerToolbar";
import { LakesFilterDialog } from "@/components/lakes/filters/LakesFilterDialog";
import { useLakeFavourites } from "@/components/lakes/hooks/useLakeFavourites";
import { useLakesExplorer } from "@/components/lakes/hooks/useLakesExplorer";
import { LakesMap } from "@/components/lakes/map/LakesMap";
import { LakesResultsPane } from "@/components/lakes/results/LakesResultsPane";
import { ButtonLink } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import {
  DEFAULT_LAKE_EXPLORER_FILTERS,
  DEFAULT_POLAND_BOUNDS,
  isDefaultPolandBounds,
} from "@/lib/lake-explorer-params";
import type {
  LakeExplorerBounds,
  LakeExplorerInitialData,
  LakeExplorerMode,
  LakeExplorerSort,
} from "@/lib/lake-explorer-types";
import {
  isValidLocation,
  requestUserLocation,
} from "@/lib/location";
import { cn } from "@/lib/cn";

type DesktopExplorerView = "split" | "list";

const DESKTOP_VIEW_STORAGE_KEY = "rybio:lakes-desktop-view";

export function LakesExplorer({
  mode,
  detailBasePath,
  initialData,
  initialDataComplete = true,
  syncUrl = true,
}: {
  mode: LakeExplorerMode;
  detailBasePath: string;
  initialData: LakeExplorerInitialData;
  initialDataComplete?: boolean;
  syncUrl?: boolean;
}) {
  const toast = useToast();

  const explorer = useLakesExplorer({
    initialData,
    initialDataComplete,
    syncUrl,
  });

  const favourites = useLakeFavourites({
    mode,
    initialFavouriteLakeIds: initialData.favouriteLakeIds,
  });

  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedLakeId, setSelectedLakeId] = useState<string | null>(null);
  const [hoveredLakeId, setHoveredLakeId] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [desktopView, setDesktopViewState] =
    useState<DesktopExplorerView>("split");
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);

  const [focusLocation, setFocusLocation] = useState<
    | {
        lat: number;
        lng: number;
        token: number;
      }
    | null
  >(null);

  const locationToken = useRef(0);

  const openFilterDialog = useCallback(() => {
    setFilterDialogOpen(true);
  }, []);

  const closeFilterDialog = useCallback(() => {
    setFilterDialogOpen(false);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    function syncDesktopViewport() {
      setIsDesktopViewport(mediaQuery.matches);
    }

    syncDesktopViewport();
    mediaQuery.addEventListener("change", syncDesktopViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncDesktopViewport);
    };
  }, []);

  useEffect(() => {
    try {
      const savedView = window.localStorage.getItem(
        DESKTOP_VIEW_STORAGE_KEY
      );

      if (savedView === "split" || savedView === "list") {
        setDesktopViewState(savedView);
      }
    } catch {
      // Preferencja widoku nie jest krytyczna dla działania explorera.
    }
  }, []);

  const setDesktopView = useCallback((view: DesktopExplorerView) => {
    setDesktopViewState(view);

    try {
      window.localStorage.setItem(DESKTOP_VIEW_STORAGE_KEY, view);
    } catch {
      // Brak localStorage nie powinien blokować zmiany widoku.
    }
  }, []);

  useEffect(() => {
    if (
      selectedLakeId &&
      !explorer.mapResult.lakes.some((lake) => lake.id === selectedLakeId)
    ) {
      setSelectedLakeId(null);
    }

    if (
      hoveredLakeId &&
      !explorer.mapResult.lakes.some((lake) => lake.id === hoveredLakeId)
    ) {
      setHoveredLakeId(null);
    }
  }, [explorer.mapResult.lakes, hoveredLakeId, selectedLakeId]);

  /**
   * Wyniki są automatycznie synchronizowane z viewportem.
   * Hook posiada debounce requestów, więc tutaj zapisujemy wyłącznie
   * ostatni zakończony bbox zwrócony przez Leaflet.
   */
  const handleViewportChange = useCallback(
    (bounds: LakeExplorerBounds) => {
      explorer.setActiveBounds(bounds);
    },
    [explorer.setActiveBounds]
  );

  const handleSelectLake = useCallback((lakeId: string | null) => {
    setSelectedLakeId(lakeId);

    if (!lakeId) {
      return;
    }

    window.setTimeout(() => {
      document.getElementById(`lake-result-${lakeId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 0);
  }, []);

  async function handleRequestLocation() {
    if (isLocationLoading) {
      return;
    }

    setIsLocationLoading(true);

    try {
      const rawLocation = await requestUserLocation({
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 60_000,
      });

      const location = {
        lat: Number(rawLocation.lat),
        lng: Number(rawLocation.lng),
      };

      /**
       * Leaflet rzuca wyjątek dla LatLng(NaN, NaN), dlatego walidujemy
       * dane dokładnie przed zapisaniem ich do stanu mapy.
       */
      if (!isValidLocation(location)) {
        throw new Error(
          "Przeglądarka zwróciła nieprawidłowe współrzędne lokalizacji."
        );
      }

      explorer.setUserLocation(location);

      locationToken.current += 1;

      setFocusLocation({
        ...location,
        token: locationToken.current,
      });

      explorer.patchFilters({
        sort: "distance-asc",
      });

      toast.success({
        title: "Lokalizacja jest aktywna",
        description:
          "Mapa została ustawiona w Twojej okolicy, a wyniki są sortowane od najbliższych i aktualizują się automatycznie po przesunięciu mapy.",
      });
    } catch (error) {
      toast.error({
        title: "Nie udało się pobrać lokalizacji",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsLocationLoading(false);
    }
  }

  function handleClearFilters() {
    explorer.setFilters({
      ...DEFAULT_LAKE_EXPLORER_FILTERS,
      amenities: [],
    });
  }

  function handleSortChange(sort: LakeExplorerSort) {
    if (sort === "distance-asc" && !explorer.userLocation) {
      void handleRequestLocation();
      return;
    }

    explorer.patchFilters({
      sort,
    });
  }

  const splitHeightClass =
    mode === "authenticated"
      ? "lg:h-[calc(100dvh-190px)] lg:min-h-[650px] lg:max-h-[900px]"
      : "lg:h-[760px] lg:min-h-[680px]";

  /**
   * Leaflet nie powinien być montowany wewnątrz `display:none`.
   * Na mobile mapa jest więc tworzona dopiero po przełączeniu na widok Mapy.
   * Na desktopie tworzymy ją tylko dla trybu split.
   */
  const shouldRenderMap =
    explorer.mobileView === "map" ||
    (isDesktopViewport && desktopView === "split");

  const publicInfo = useMemo(
    () =>
      mode === "public" ? (
        <div className="flex flex-col gap-2 rounded-control border border-info-border bg-info-subtle px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="leading-6 text-info-foreground">
            Zaloguj się, aby zapisywać ulubione łowiska i korzystać z pełnego
            dziennika wypraw.
          </p>
          <Link
            href="/login"
            className="shrink-0 text-sm font-bold text-primary transition-colors hover:text-primary-hover"
          >
            Zaloguj się
          </Link>
        </div>
      ) : null,
    [mode]
  );

  return (
    <section
      id="lista-lowisk"
      className={cn(
        mode === "public" &&
          "mx-auto max-w-[1720px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
      )}
    >
      {mode === "authenticated" && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
              Baza łowisk
            </p>

            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.035em] text-text sm:text-4xl">
              Znajdź łowisko na kolejny wyjazd
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary sm:text-base">
              Przeszukuj bazę, filtruj miejsca i odkrywaj łowiska bezpośrednio
              na mapie.
            </p>
          </div>

          <ButtonLink href="/lowiska/zglos" variant="outline">
            Dodaj łowisko
          </ButtonLink>
        </div>
      )}

      <LakesExplorerToolbar
        filters={explorer.filters}
        filterOptions={initialData.filterOptions}
        onChange={explorer.setFilters}
        onOpenFilters={openFilterDialog}
        onClearFilters={handleClearFilters}
      />

      {publicInfo && <div className="mt-3">{publicInfo}</div>}

      <div className="mt-4 flex items-center justify-between gap-3 lg:hidden">
        <div className="inline-flex rounded-control border border-border bg-surface p-1 shadow-card">
          <ViewButton
            active={explorer.mobileView === "list"}
            onClick={() => explorer.setMobileView("list")}
          >
            Lista
          </ViewButton>

          <ViewButton
            active={explorer.mobileView === "map"}
            onClick={() => explorer.setMobileView("map")}
          >
            Mapa
          </ViewButton>
        </div>

        <p className="text-xs font-semibold text-text-secondary">
          {explorer.result.totalCount} wyników
        </p>
      </div>

      <div className="mt-4 hidden items-center justify-between gap-4 lg:flex">
        <div className="inline-flex rounded-control border border-border bg-surface p-1 shadow-card">
          <ViewButton
            active={desktopView === "split"}
            onClick={() => setDesktopView("split")}
          >
            Mapa + lista
          </ViewButton>

          <ViewButton
            active={desktopView === "list"}
            onClick={() => setDesktopView("list")}
          >
            Tylko lista
          </ViewButton>
        </div>

        <p className="text-xs font-semibold text-text-secondary">
          {explorer.result.totalCount} wyników w aktualnym obszarze
        </p>
      </div>

      <div
        className={cn(
          "mt-4 overflow-hidden rounded-panel border border-border bg-surface shadow-card",
          desktopView === "split"
            ? cn(
                "lg:grid lg:grid-cols-[440px_minmax(0,1fr)] xl:grid-cols-[470px_minmax(0,1fr)]",
                splitHeightClass
              )
            : "lg:block"
        )}
      >
        <div
          className={cn(
            "min-h-0 border-border",
            explorer.mobileView === "list" ? "block" : "hidden",
            "lg:block",
            desktopView === "split" && "lg:border-r"
          )}
        >
          <LakesResultsPane
            result={explorer.result}
            mode={mode}
            detailBasePath={detailBasePath}
            userLocation={explorer.userLocation}
            sort={explorer.filters.sort}
            layout={desktopView === "list" ? "wide" : "split"}
            selectedLakeId={selectedLakeId}
            favouriteLakeIds={favourites.favouriteLakeIds}
            pendingFavouriteLakeIds={favourites.pendingLakeIds}
            isRefreshing={explorer.isRefreshing}
            isLoadingMore={explorer.isLoadingMore}
            error={explorer.error}
            hasMore={explorer.hasMore}
            onSortChange={handleSortChange}
            onHoverChange={setHoveredLakeId}
            onToggleFavourite={(lakeId, slug) =>
              void favourites.toggleFavourite({
                lakeId,
                slug,
              })
            }
            onLoadMore={explorer.loadMore}
            onClearSearch={handleClearFilters}
          />
        </div>

        <div
          className={cn(
            "min-h-0",
            explorer.mobileView === "map" ? "block" : "hidden",
            desktopView === "split"
              ? "lg:block lg:min-h-0"
              : "lg:hidden"
          )}
        >
          {shouldRenderMap ? (
            <LakesMap
              points={explorer.mapResult.lakes}
              activeBounds={explorer.activeBounds}
              userLocation={explorer.userLocation}
              focusLocation={focusLocation}
              selectedLakeId={selectedLakeId}
              hoveredLakeId={hoveredLakeId}
              detailBasePath={detailBasePath}
              isRefreshing={explorer.isRefreshing}
              isLocationLoading={isLocationLoading}
              isDefaultArea={isDefaultPolandBounds(explorer.activeBounds)}
              onViewportChange={handleViewportChange}
              onResetArea={() => explorer.setActiveBounds(DEFAULT_POLAND_BOUNDS)}
              onRequestLocation={() => void handleRequestLocation()}
              onSelectLake={handleSelectLake}
            />
          ) : null}
        </div>
      </div>

      <LakesFilterDialog
        open={filterDialogOpen}
        filters={explorer.filters}
        filterOptions={initialData.filterOptions}
        onClose={closeFilterDialog}
        onApply={explorer.setFilters}
      />
    </section>
  );
}

function ViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-9 rounded-xl px-4 py-2 text-xs font-bold transition-colors",
        active
          ? "bg-primary text-white"
          : "text-text-secondary hover:bg-surface-muted hover:text-text"
      )}
    >
      {children}
    </button>
  );
}
