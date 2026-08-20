"use client";

import Link from "next/link";
import { useMemo } from "react";

import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  calculateDistanceInKm,
  formatDistanceInKm,
  isValidLocation,
} from "@/lib/location";
import type { LakeListDto } from "@/lib/lakes";
import { cn } from "@/lib/cn";

type NearestLake = LakeListDto & {
  calculatedDistance: number | null;
};

type NearestLakesProps = {
  lakes: LakeListDto[];
  limit?: number;
  fullHeight?: boolean;
};

export function NearestLakes({
  lakes,
  limit = 3,
  fullHeight = false,
}: NearestLakesProps) {
  const { userLocation } =
    useUserLocation();

  const nearestLakes =
    useMemo<NearestLake[]>(() => {
      const validLakes =
        lakes.filter((lake) =>
          isValidLocation({
            lat: lake.lat,
            lng: lake.lng,
          })
        );

      if (
        !userLocation ||
        !isValidLocation(userLocation)
      ) {
        return validLakes
          .slice(0, limit)
          .map((lake) => ({
            ...lake,
            calculatedDistance: null,
          }));
      }

      return validLakes
        .map((lake) => ({
          ...lake,
          calculatedDistance:
            calculateDistanceInKm(
              userLocation,
              {
                lat: lake.lat,
                lng: lake.lng,
              }
            ),
        }))
        .sort(
          (
            firstLake,
            secondLake
          ) =>
            (firstLake.calculatedDistance ??
              Infinity) -
            (secondLake.calculatedDistance ??
              Infinity)
        )
        .slice(0, limit);
    }, [
      lakes,
      limit,
      userLocation,
    ]);

  return (
    <Card
      className={cn(
        "flex min-h-0 flex-col overflow-hidden p-5 sm:p-6",
        fullHeight && "h-full"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
            W pobliżu
          </p>

          <h2 className="mt-1 font-display text-xl font-extrabold tracking-[-0.025em] text-text">
            Najbliższe łowiska
          </h2>

          {(!userLocation ||
            !isValidLocation(
              userLocation
            )) && (
            <p className="mt-2 text-xs leading-5 text-text-secondary">
              Użyj „Moja lokalizacja” na
              mapie, aby policzyć
              odległość.
            </p>
          )}
        </div>

        <Link
          href="/lowiska"
          className="hidden shrink-0 items-center gap-1 text-xs font-bold text-primary transition-colors hover:text-primary-hover sm:flex xl:hidden"
        >
          Wszystkie
          <ArrowSmallRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div
        className={cn(
          "mt-4 divide-y divide-border",
          fullHeight &&
            "min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
        )}
      >
        {nearestLakes.map(
          (lake, index) => (
            <Link
              key={lake.id}
              href={`/lowiska/${lake.slug}`}
              className="group flex min-h-[78px] w-full items-center gap-3 rounded-xl px-1 py-3 transition-colors hover:bg-surface-muted"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-control bg-primary-100">
                {lake.images[0] ? (
                  <img
                    src={lake.images[0]}
                    alt={lake.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-display text-[10px] font-extrabold text-primary">
                    RYBIO
                  </div>
                )}

                {index === 0 &&
                  userLocation &&
                  isValidLocation(
                    userLocation
                  ) && (
                    <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#F97316] ring-4 ring-orange-100/80" />
                  )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-text transition-colors group-hover:text-primary-700">
                  {lake.name}
                </p>

                <p className="mt-1 truncate text-xs font-medium text-text-secondary">
                  {formatRating(
                    lake.rating
                  )}
                  {" • "}
                  {lake.fish
                    .split(",")[0]
                    ?.trim() ||
                    "Brak informacji"}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-extrabold tabular-nums text-text">
                  {lake.calculatedDistance !==
                    null &&
                  Number.isFinite(
                    lake.calculatedDistance
                  )
                    ? formatDistanceInKm(
                        lake.calculatedDistance
                      )
                    : "—"}
                </p>

                <ArrowRightIcon className="ml-auto mt-1.5 h-4 w-4 text-text-muted transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          )
        )}
      </div>

      {fullHeight && (
        <div className="mt-4 border-t border-border pt-4">
          <ButtonLink
            href="/lowiska?view=map"
            variant="outline"
            size="sm"
            fullWidth
          >
            Zobacz wszystkie łowiska
          </ButtonLink>
        </div>
      )}
    </Card>
  );
}

function formatRating(
  rating: number | string | null | undefined
) {
  const value = Number(rating || 0);

  return value > 0
    ? `Ocena ${value
        .toFixed(1)
        .replace(".", ",")}`
    : "Brak ocen";
}
