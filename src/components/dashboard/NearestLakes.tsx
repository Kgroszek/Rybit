"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useUserLocation } from "@/hooks/useUserLocation";
import {
  calculateDistanceInKm,
  formatDistanceInKm,
} from "@/lib/location";
import type { LakeListDto } from "@/lib/lakes";
import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

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

  const nearestLakes = useMemo<NearestLake[]>(() => {
    if (!userLocation) {
      return lakes.slice(0, limit).map((lake) => ({
        ...lake,
        calculatedDistance: null,
      }));
    }

    return lakes
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
    <section
      className={`flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${
        fullHeight ? "h-full flex-1" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-blue-600">
            W pobliżu
          </p>

          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">
            Najbliższe łowiska
          </h2>

          {!userLocation && (
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Włącz lokalizację na mapie, aby policzyć odległość.
            </p>
          )}
        </div>

        <Link
          href="/lowiska"
          className="shrink-0 text-xs font-bold text-blue-600 transition hover:text-blue-700 flex items-center gap-1 mt-[-4px]"
        >
          Zobacz wszystkie 
          <ArrowSmallRightIcon
                              className="
                                h-5 w-5
                                text-stale-500
                                transition-colors
                               
                              "
                            />
        </Link>
        
      </div>

      <div
        className={`mt-4 divide-y divide-slate-100 ${
          fullHeight ? "min-h-0 flex-1 overflow-y-auto pr-1" : ""
        }`}
      >
        {nearestLakes.map((lake, index) => (
          <Link
            key={lake.id}
            href={`/lowiska/${lake.slug}`}
            className="group flex items-center gap-3 py-3 transition first:pt-1 hover:translate-x-0.5"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-100 via-blue-100 to-emerald-100">
              {lake.images[0] ? (
                <img
                  src={lake.images[0]}
                  alt={lake.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-blue-400">
                  RYBIO
                </div>
              )}

              {index === 0 && userLocation && (
                <span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.18)]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-950 transition group-hover:text-blue-600">
                {lake.name}
              </p>

              <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                {Number(lake.rating || 0) > 0
                  ? `★ ${Number(lake.rating).toFixed(1)}`
                  : "Brak ocen"}{" "}
                • {lake.fish.split(",")[0]?.trim() || "Brak informacji"}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-extrabold text-slate-700">
                {lake.calculatedDistance !== null
                  ? formatDistanceInKm(lake.calculatedDistance)
                  : "—"}
              </p>
              <span className="mt-1 inline-block text-xs font-black text-slate-300 transition group-hover:text-blue-600">
                <ArrowRightIcon
                              className="
                                h-5 w-5
                                text-stale-500
                                transition-colors
                               
                              "
                            />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {fullHeight && (
        <div className="mt-auto border-t border-slate-100 pt-3">
          <Link
            href="/lowiska?view=map"
            className="flex items-center justify-between text-xs font-extrabold text-slate-500 transition hover:text-blue-600"
          >
            <span>Otwórz pełną mapę łowisk</span>
            <ArrowRightIcon
                              className="
                                h-5 w-5
                                text-stale-500
                                transition-colors
                               
                              "
                            />
          </Link>
        </div>
      )}
    </section>
  );
}
