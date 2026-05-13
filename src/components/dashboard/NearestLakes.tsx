"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { LakeDto } from "@/lib/lakes";

type UserLocation = {
  lat: number;
  lng: number;
};

type NearestLake = LakeDto & {
  calculatedDistance: number | null;
};

type NearestLakesProps = {
  lakes: LakeDto[];
};

function calculateDistanceInKm(
  firstPoint: UserLocation,
  secondPoint: UserLocation
) {
  const earthRadiusInKm = 6371;

  const latDifference = degreesToRadians(secondPoint.lat - firstPoint.lat);
  const lngDifference = degreesToRadians(secondPoint.lng - firstPoint.lng);

  const firstLatInRadians = degreesToRadians(firstPoint.lat);
  const secondLatInRadians = degreesToRadians(secondPoint.lat);

  const haversineValue =
    Math.sin(latDifference / 2) * Math.sin(latDifference / 2) +
    Math.cos(firstLatInRadians) *
      Math.cos(secondLatInRadians) *
      Math.sin(lngDifference / 2) *
      Math.sin(lngDifference / 2);

  const centralAngle =
    2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));

  return earthRadiusInKm * centralAngle;
}

function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

export function NearestLakes({ lakes }: NearestLakesProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    const savedLocation = localStorage.getItem("rybit-user-location");

    if (savedLocation) {
      setUserLocation(JSON.parse(savedLocation));
    }

    function handleLocationUpdated(event: Event) {
      const customEvent = event as CustomEvent<UserLocation>;
      setUserLocation(customEvent.detail);
    }

    window.addEventListener("rybit:user-location-updated", handleLocationUpdated);

    return () => {
      window.removeEventListener(
        "rybit:user-location-updated",
        handleLocationUpdated
      );
    };
  }, []);

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
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-bold">Najbliższe łowiska</h2>

          {!userLocation && (
            <p className="mt-1 text-xs text-slate-500">
              Kliknij „Moja lokalizacja” na mapie, aby policzyć odległość.
            </p>
          )}
        </div>

        <Link
          href="/lowiska"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Zobacz
        </Link>
      </div>

      <div className="space-y-4">
        {nearestLakes.map((lake) => (
          <Link
            key={lake.id}
            href={`/lowiska/${lake.slug}`}
            className="flex items-center gap-3 rounded-2xl transition hover:bg-slate-50"
          >
            <div className="h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br from-emerald-100 to-blue-100" />

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-950">
                {lake.name}
              </p>

              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <span>★ {lake.rating}</span>
                <span>•</span>
                <span className="truncate">{lake.fish.split(",")[0]}</span>
              </div>
            </div>

            <p className="shrink-0 text-right text-sm font-semibold text-slate-600">
              {lake.calculatedDistance !== null
                ? `${lake.calculatedDistance.toFixed(1)} km`
                : lake.distance}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}