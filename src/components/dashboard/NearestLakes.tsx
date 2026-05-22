"use client";

import Link from "next/link";
import { useMemo } from "react";

import { calculateDistanceInKm, formatDistanceInKm } from "@/lib/location";
import { useUserLocation } from "@/hooks/useUserLocation";
import type { LakeDto } from "@/lib/lakes";

type NearestLake = LakeDto & {
  calculatedDistance: number | null;
};

type NearestLakesProps = {
  lakes: LakeDto[];
};

export function NearestLakes({ lakes }: NearestLakesProps) {
  const { userLocation } = useUserLocation();

  const nearestLakes = useMemo<NearestLake[]>(() => {
    if (!userLocation) {
      return lakes.slice(0, 3).map((lake) => ({
        ...lake,
        calculatedDistance: null,
      }));
    }

    return lakes
      .map((lake) => {
        const calculatedDistance = calculateDistanceInKm(userLocation, {
          lat: lake.lat,
          lng: lake.lng,
        });

        return {
          ...lake,
          calculatedDistance,
        };
      })
      .sort((firstLake, secondLake) => {
        const firstDistance = firstLake.calculatedDistance ?? Infinity;
        const secondDistance = secondLake.calculatedDistance ?? Infinity;

        return firstDistance - secondDistance;
      })
      .slice(0, 3);
  }, [lakes, userLocation]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Najbliższe łowiska
          </h2>

          {!userLocation && (
            <p className="mt-1 text-sm text-slate-500">
              Włącz lokalizację, aby policzyć odległość.
            </p>
          )}
        </div>

        <Link
          href="/lowiska"
          className="text-sm font-bold text-blue-600 transition hover:text-blue-700"
        >
          Zobacz
        </Link>
      </div>

      <div className="space-y-4">
        {nearestLakes.map((lake) => (
          <Link
            key={lake.id}
            href={`/lowiska/${lake.slug}`}
            className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-slate-50"
          >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-cyan-100">
              {lake.images[0] ? (
                <img
                  src={lake.images[0]}
                  alt={lake.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-slate-950">
                {lake.name}
              </p>

              <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                ★ {lake.rating} • {lake.fish.split(",")[0] || "Brak informacji"}
              </p>
            </div>

            <p className="shrink-0 text-sm font-black text-slate-600">
              {lake.calculatedDistance !== null
                ? formatDistanceInKm(lake.calculatedDistance)
                : lake.distance}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}