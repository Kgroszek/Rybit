"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import { CloseIcon } from "@/components/icons/CloseIcon";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  formatLakeRating,
  getFishingTypeLabel,
  makeLakeDetailHref,
} from "@/components/lakes/utils";
import type {
  LakeExplorerBounds,
  LakeMapPointDto,
} from "@/lib/lake-explorer-types";
import type { UserLocation } from "@/lib/location";

const LakesMapClient = dynamic(
  () =>
    import(
      "@/components/lakes/map/LakesMapClient"
    ).then(
      (module) => module.LakesMapClient
    ),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-full min-h-0 w-full rounded-none" />
    ),
  }
);

export function LakesMap({
  points,
  activeBounds,
  userLocation,
  focusLocation,
  selectedLakeId,
  hoveredLakeId,
  detailBasePath,
  isRefreshing,
  isLocationLoading,
  isDefaultArea,
  onViewportChange,
  onResetArea,
  onRequestLocation,
  onSelectLake,
}: {
  points: LakeMapPointDto[];
  activeBounds: LakeExplorerBounds;
  userLocation: UserLocation | null;
  focusLocation:
    | (UserLocation & {
        token: number;
      })
    | null;
  selectedLakeId: string | null;
  hoveredLakeId: string | null;
  detailBasePath: string;
  isRefreshing: boolean;
  isLocationLoading: boolean;
  isDefaultArea: boolean;
  onViewportChange: (
    bounds: LakeExplorerBounds
  ) => void;
  onResetArea: () => void;
  onRequestLocation: () => void;
  onSelectLake: (
    lakeId: string | null
  ) => void;
}) {
  const selectedLake =
    selectedLakeId
      ? points.find(
          (point) =>
            point.id ===
            selectedLakeId
        ) ?? null
      : null;

  return (
    <div className="relative h-[calc(100dvh-220px)] min-h-[520px] max-h-[760px] overflow-hidden bg-surface-muted lg:h-full lg:min-h-0 lg:max-h-none">
      <LakesMapClient
        points={points}
        activeBounds={activeBounds}
        userLocation={userLocation}
        focusLocation={focusLocation}
        selectedLakeId={selectedLakeId}
        hoveredLakeId={hoveredLakeId}
        onViewportChange={
          onViewportChange
        }
        onSelectLake={onSelectLake}
      />

      <div className="pointer-events-none absolute inset-x-3 top-3 z-[1000] flex items-start justify-between gap-3 sm:inset-x-4 sm:top-4">
        <div className="pointer-events-auto flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRequestLocation}
            isLoading={isLocationLoading}
            loadingLabel="Lokalizacja…"
            className="bg-surface/95 backdrop-blur"
          >
            Moja lokalizacja
          </Button>

          {!isDefaultArea && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onResetArea}
              className="bg-surface/95 backdrop-blur"
            >
              Cała Polska
            </Button>
          )}
        </div>

        <div className="rounded-full border border-border bg-surface/95 px-3 py-1.5 text-[11px] font-bold text-text-secondary shadow-card backdrop-blur">
          {points.length} na mapie
        </div>
      </div>

      {isRefreshing && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] inline-flex items-center gap-2 rounded-full border border-border bg-surface/95 px-3 py-2 text-xs font-semibold text-text-secondary shadow-card backdrop-blur">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-200 border-t-primary" />
          Aktualizuję mapę
        </div>
      )}

      {selectedLake && (
        <div className="absolute bottom-4 right-4 z-[1002] w-[min(360px,calc(100%-32px))] overflow-hidden rounded-card border border-border bg-surface shadow-float">
          <div className="flex gap-3 p-3">
            {selectedLake.imageUrl ? (
              <img
                src={
                  selectedLake.imageUrl
                }
                alt={selectedLake.name}
                className="h-20 w-24 shrink-0 rounded-control object-cover"
              />
            ) : (
              <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-control bg-primary-100 font-display text-[10px] font-bold text-primary">
                RYBIO
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-text">
                    {selectedLake.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-text-secondary">
                    {
                      selectedLake.city
                    }
                    {selectedLake.voivodeship
                      ? `, woj. ${selectedLake.voivodeship}`
                      : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onSelectLake(null)
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
                  aria-label="Zamknij podgląd łowiska"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-text-secondary">
                <span>
                  {formatLakeRating(
                    selectedLake.rating
                  )}
                </span>
                <span>
                  {getFishingTypeLabel(
                    selectedLake.fishingType
                  )}
                </span>
              </div>

              <Link
                href={makeLakeDetailHref(
                  detailBasePath,
                  selectedLake.slug
                )}
                className="mt-2 inline-flex text-xs font-bold text-primary transition-colors hover:text-primary-hover"
              >
                Zobacz łowisko
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-[999] hidden -translate-x-1/2 items-center gap-4 rounded-full border border-border bg-surface/90 px-3 py-2 text-[10px] font-semibold text-text-secondary shadow-card backdrop-blur xl:flex">
        <LegendDot
          color="var(--rybio-map-pzw)"
          label="PZW"
        />
        <LegendDot
          color="var(--rybio-map-commercial)"
          label="Komercyjne"
        />
        {userLocation && (
          <LegendDot
            color="var(--rybio-map-user)"
            label="Twoja lokalizacja"
          />
        )}
      </div>
    </div>
  );
}

function LegendDot({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: color,
        }}
      />
      {label}
    </span>
  );
}
