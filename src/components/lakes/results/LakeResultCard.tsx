"use client";

import Link from "next/link";

import { HeartIcon } from "@/components/icons/HeartIcon";
import {
  formatLakeRating,
  getFishingTypeLabel,
  getLakeDistance,
  getLakeFishSummary,
  getOwnerTypeLabel,
  getVisibleAmenities,
  makeLakeDetailHref,
} from "@/components/lakes/utils";
import { cn } from "@/lib/cn";
import type { LakeExplorerMode } from "@/lib/lake-explorer-types";
import type { UserLocation } from "@/lib/location";
import type { LakeListDto } from "@/lib/lakes";

export function LakeResultCard({
  lake,
  mode,
  detailBasePath,
  userLocation,
  selected,
  favourite,
  favouritePending,
  onHoverChange,
  onToggleFavourite,
}: {
  lake: LakeListDto;
  mode: LakeExplorerMode;
  detailBasePath: string;
  userLocation: UserLocation | null;
  selected: boolean;
  favourite: boolean;
  favouritePending: boolean;
  onHoverChange: (
    lakeId: string | null
  ) => void;
  onToggleFavourite: () => void;
}) {
  const image = lake.images[0];
  const fishSummary =
    getLakeFishSummary(lake, 3);

  const amenities =
    getVisibleAmenities(lake, 2);

  const distance =
    getLakeDistance(
      userLocation,
      lake
    );

  return (
    <article
      id={`lake-result-${lake.id}`}
      className={cn(
        "relative overflow-hidden rounded-card border bg-surface transition-[border-color,background-color,box-shadow,transform] duration-200",
        selected
          ? "border-primary-300 bg-primary-50/55 shadow-card"
          : "border-border hover:border-primary-200 hover:bg-primary-50/20 hover:shadow-card"
      )}
      onMouseEnter={() =>
        onHoverChange(lake.id)
      }
      onMouseLeave={() =>
        onHoverChange(null)
      }
    >
      <Link
        href={makeLakeDetailHref(
          detailBasePath,
          lake.slug
        )}
        className="group grid min-h-[128px] grid-cols-[112px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[132px_minmax(0,1fr)]"
        aria-label={`Zobacz łowisko ${lake.name}`}
      >
        <div className="relative min-h-[104px] overflow-hidden rounded-control bg-primary-100">
          {image ? (
            <img
              src={image}
              alt={lake.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-[11px] font-bold text-primary">
              RYBIO
            </div>
          )}

          <span
            className={cn(
              "absolute left-2 top-2 rounded-full px-2 py-1 text-[9px] font-extrabold text-white shadow-sm",
              lake.type ===
                "commercial"
                ? "bg-success"
                : "bg-primary"
            )}
          >
            {getOwnerTypeLabel(
              lake.type
            )}
          </span>
        </div>

        <div
          className={cn(
            "min-w-0 py-0.5",
            mode ===
              "authenticated" &&
              "pr-8"
          )}
        >
          <p className="line-clamp-2 text-sm font-bold leading-5 text-text transition-colors group-hover:text-primary-700 sm:text-[15px]">
            {lake.name}
          </p>

          <p className="mt-1 truncate text-xs font-medium text-text-muted">
            {lake.address.city}
            {lake.address.voivodeship
              ? `, woj. ${lake.address.voivodeship}`
              : ""}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-text-secondary">
            <span>
              {formatLakeRating(
                lake.rating
              )}
            </span>

            {distance && (
              <>
                <span className="h-1 w-1 rounded-full bg-border-strong" />
                <span>{distance}</span>
              </>
            )}

            <span className="h-1 w-1 rounded-full bg-border-strong" />
            <span>
              {getFishingTypeLabel(
                lake.fishingType
              )}
            </span>
          </div>

          {fishSummary && (
            <p className="mt-2 truncate text-xs text-text-secondary">
              {fishSummary}
            </p>
          )}

          {amenities.length > 0 && (
            <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
              {amenities.map(
                (amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-surface-muted px-2 py-1 text-[9px] font-bold text-text-secondary"
                  >
                    {amenity}
                  </span>
                )
              )}
            </div>
          )}
        </div>
      </Link>

      {mode === "authenticated" && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleFavourite();
          }}
          disabled={favouritePending}
          aria-pressed={favourite}
          aria-label={
            favourite
              ? `Usuń ${lake.name} z ulubionych`
              : `Dodaj ${lake.name} do ulubionych`
          }
          className={cn(
            "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border bg-surface/95 backdrop-blur transition-[border-color,color,background-color,transform] hover:scale-105 disabled:pointer-events-none disabled:opacity-55",
            favourite
              ? "border-danger-border text-danger"
              : "border-border text-text-muted hover:border-primary-200 hover:text-primary"
          )}
        >
          <HeartIcon
            className={cn(
              "h-4 w-4",
              favourite &&
                "fill-current"
            )}
          />
        </button>
      )}
    </article>
  );
}
