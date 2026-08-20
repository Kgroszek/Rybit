"use client";

import { useMemo } from "react";

import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { Card } from "@/components/ui/Card";
import { InteractiveRow } from "@/components/ui/InteractiveRow";
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
  const { userLocation } = useUserLocation();

  const hasLocation = Boolean(userLocation && isValidLocation(userLocation));

  const nearestLakes = useMemo<NearestLake[]>(() => {
    const validLakes = lakes.filter((lake) =>
      isValidLocation({ lat: lake.lat, lng: lake.lng })
    );

    if (!userLocation || !isValidLocation(userLocation)) {
      return validLakes.slice(0, limit).map((lake) => ({
        ...lake,
        calculatedDistance: null,
      }));
    }

    return validLakes
      .map((lake) => ({
        ...lake,
        calculatedDistance: calculateDistanceInKm(userLocation, {
          lat: lake.lat,
          lng: lake.lng,
        }),
      }))
      .sort(
        (firstLake, secondLake) =>
          (firstLake.calculatedDistance ?? Infinity) -
          (secondLake.calculatedDistance ?? Infinity)
      )
      .slice(0, limit);
  }, [lakes, limit, userLocation]);

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden p-5 sm:p-6",
        fullHeight && "h-full"
      )}
    >
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
          {hasLocation ? "W pobliżu" : "Na start"}
        </p>

        <h2 className="mt-1 font-display text-xl font-bold tracking-[-0.025em] text-text">
          {hasLocation ? "Najbliższe łowiska" : "Wybrane łowiska"}
        </h2>

        {!hasLocation && (
          <p className="mt-2 text-xs leading-5 text-text-secondary">
            Użyj „Moja lokalizacja” na mapie, aby policzyć odległość i posortować
            miejsca.
          </p>
        )}
      </div>

      <div className="mt-4 flex-1 divide-y divide-border overflow-x-hidden">
        {nearestLakes.map((lake) => (
          <InteractiveRow
            key={lake.id}
            href={`/lowiska/${lake.slug}`}
            className="min-h-[74px] px-1"
          >
            <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-control bg-primary-100">
              {lake.images[0] ? (
                <img
                  src={lake.images[0]}
                  alt={lake.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-[10px] font-bold text-primary">
                  RYBIO
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-text transition-colors group-hover:text-primary-700">
                {lake.name}
              </p>
              <p className="mt-1 truncate text-xs font-medium text-text-secondary">
                {formatRating(lake.rating)}
                {" • "}
                {lake.fish.split(",")[0]?.trim() || "Brak informacji"}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-bold tabular-nums text-text">
                {lake.calculatedDistance !== null &&
                Number.isFinite(lake.calculatedDistance)
                  ? formatDistanceInKm(lake.calculatedDistance)
                  : "—"}
              </p>
              <ArrowRightIcon className="ml-auto mt-1.5 h-4 w-4 text-text-muted transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
          </InteractiveRow>
        ))}
      </div>
    </Card>
  );
}

function formatRating(rating: number | string | null | undefined) {
  const value = Number(rating || 0);
  return value > 0 ? `Ocena ${value.toFixed(1).replace(".", ",")}` : "Brak ocen";
}
