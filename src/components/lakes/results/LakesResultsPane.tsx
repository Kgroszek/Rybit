"use client";

import { useEffect, useRef } from "react";

import { LAKE_SORT_OPTIONS } from "@/components/lakes/constants";
import { LakeResultCard } from "@/components/lakes/results/LakeResultCard";
import { getLakeResultLabel } from "@/components/lakes/utils";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import type {
  LakeExplorerMode,
  LakeExplorerResult,
  LakeExplorerSort,
} from "@/lib/lake-explorer-types";
import type { UserLocation } from "@/lib/location";

type LakesResultsLayout = "split" | "wide";

export function LakesResultsPane({
  result,
  mode,
  detailBasePath,
  userLocation,
  sort,
  layout = "split",
  selectedLakeId,
  favouriteLakeIds,
  pendingFavouriteLakeIds,
  isRefreshing,
  isLoadingMore,
  error,
  hasMore,
  onSortChange,
  onHoverChange,
  onToggleFavourite,
  onLoadMore,
  onClearSearch,
}: {
  result: LakeExplorerResult;
  mode: LakeExplorerMode;
  detailBasePath: string;
  userLocation: UserLocation | null;
  sort: LakeExplorerSort;
  layout?: LakesResultsLayout;
  selectedLakeId: string | null;
  favouriteLakeIds: Set<string>;
  pendingFavouriteLakeIds: Set<string>;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string;
  hasMore: boolean;
  onSortChange: (sort: LakeExplorerSort) => void;
  onHoverChange: (lakeId: string | null) => void;
  onToggleFavourite: (lakeId: string, slug: string) => void;
  onLoadMore: () => void;
  onClearSearch: () => void;
}) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const usesInternalScroll = layout === "split";

  useEffect(() => {
    if (isRefreshing && usesInternalScroll) {
      scrollContainerRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [isRefreshing, usesInternalScroll]);

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element || !hasMore || isLoadingMore || isRefreshing) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: usesInternalScroll ? scrollContainerRef.current : null,
        rootMargin: "240px 0px 240px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    hasMore,
    isLoadingMore,
    isRefreshing,
    onLoadMore,
    usesInternalScroll,
  ]);

  return (
    <section
      className={cn(
        "flex min-h-0 flex-col bg-background",
        usesInternalScroll && "lg:h-full"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-border bg-surface px-4 py-4 sm:flex-row sm:items-end sm:justify-between",
          usesInternalScroll && "lg:shrink-0",
          layout === "wide" && "lg:px-5"
        )}
      >
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary">
            Wyniki
          </p>
          <p className="mt-1 text-sm font-bold text-text">
            {result.totalCount} {getLakeResultLabel(result.totalCount)}
          </p>

          {result.lakes.length < result.totalCount && (
            <p className="mt-1 text-[11px] text-text-muted">
              Wyświetlono {result.lakes.length}
            </p>
          )}
        </div>

        <label className="w-full sm:w-[190px]">
          <span className="sr-only">Sortowanie</span>
          <Select
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as LakeExplorerSort)
            }
            className="h-10 text-xs"
          >
            {LAKE_SORT_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={
                  option.value === "distance-asc" && !userLocation
                }
              >
                {option.label}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {error && (
        <div
          className={cn(
            "mx-3 mt-3 rounded-control border border-danger-border bg-danger-subtle px-3 py-2 text-xs font-semibold leading-5 text-danger-foreground",
            usesInternalScroll && "lg:shrink-0",
            layout === "wide" && "lg:mx-5"
          )}
        >
          {error}
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className={cn(
          "relative min-h-0 flex-1",
          usesInternalScroll && "lg:overflow-y-auto"
        )}
      >
        <div
          className={cn(
            "p-3 sm:p-4",
            layout === "split"
              ? "space-y-2.5"
              : "grid gap-3 lg:p-5 xl:grid-cols-2"
          )}
        >
          {result.lakes.length > 0 ? (
            <>
              {result.lakes.map((lake) => (
                <LakeResultCard
                  key={lake.id}
                  lake={lake}
                  mode={mode}
                  detailBasePath={detailBasePath}
                  userLocation={userLocation}
                  selected={selectedLakeId === lake.id}
                  favourite={favouriteLakeIds.has(lake.id)}
                  favouritePending={pendingFavouriteLakeIds.has(lake.id)}
                  onHoverChange={onHoverChange}
                  onToggleFavourite={() =>
                    onToggleFavourite(lake.id, lake.slug)
                  }
                />
              ))}

              {hasMore && (
                <div
                  className={cn(
                    layout === "wide" && "xl:col-span-2"
                  )}
                >
                  <div
                    ref={loadMoreRef}
                    aria-hidden="true"
                    className="h-px"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={onLoadMore}
                    isLoading={isLoadingMore}
                    loadingLabel="Pobieram kolejne…"
                    className="mt-2"
                  >
                    Pokaż kolejne łowiska
                  </Button>
                </div>
              )}
            </>
          ) : !isRefreshing ? (
            <div className={cn(layout === "wide" && "xl:col-span-2")}>
              <EmptyState
                title="Brak łowisk w tym obszarze"
                description="Przesuń mapę, zmień filtry albo wróć do widoku całej Polski."
                action={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClearSearch}
                  >
                    Wyczyść filtry
                  </Button>
                }
              />
            </div>
          ) : null}
        </div>

        {isRefreshing && (
          <div className="pointer-events-none absolute inset-0 bg-background/72 p-3 backdrop-blur-[1px] sm:p-4 lg:p-5">
            <div
              className={cn(
                "gap-3",
                layout === "split"
                  ? "space-y-2.5"
                  : "grid xl:grid-cols-2"
              )}
            >
              {Array.from({ length: layout === "wide" ? 6 : 4 }).map(
                (_, index) => (
                  <Skeleton
                    key={index}
                    className="h-[130px] w-full rounded-card"
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
