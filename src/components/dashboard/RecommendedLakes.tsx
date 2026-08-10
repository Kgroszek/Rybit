"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { LakeListDto } from "@/lib/lakes";

type UserLocation = {
  lat: number;
  lng: number;
};

type RecommendedLake = LakeListDto & {
  calculatedDistance: number | null;
};

type RecommendedLakesProps = {
  lakes: LakeListDto[];
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
    2 *
    Math.atan2(
      Math.sqrt(haversineValue),
      Math.sqrt(1 - haversineValue)
    );

  return earthRadiusInKm * centralAngle;
}

function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

function getLakeTypeLabel(type: string) {
  if (type === "pzw") {
    return "PZW";
  }

  if (type === "commercial") {
    return "Komercyjne";
  }

  return "Inne";
}

function getFishingTypeLabel(type: string) {
  if (type === "spinning") {
    return "Spinningowe";
  }

  if (type === "carp") {
    return "Karpiowe";
  }

  if (type === "general") {
    return "Ogólne";
  }

  return "Inne";
}

export function RecommendedLakes({ lakes }: RecommendedLakesProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedLocation = localStorage.getItem("rybit-user-location");

      if (!savedLocation) {
        return;
      }

      try {
        setUserLocation(JSON.parse(savedLocation) as UserLocation);
      } catch {
        setUserLocation(null);
      }
    }, 0);

    function handleLocationUpdated(event: Event) {
      const customEvent = event as CustomEvent<UserLocation>;
      setUserLocation(customEvent.detail);
    }

    window.addEventListener(
      "rybit:user-location-updated",
      handleLocationUpdated
    );

    return () => {
      window.clearTimeout(timeoutId);

      window.removeEventListener(
        "rybit:user-location-updated",
        handleLocationUpdated
      );
    };
  }, []);

  const recommendedLakes = useMemo<RecommendedLake[]>(() => {
    if (!userLocation) {
      return lakes.slice(0, 5).map((lake) => ({
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
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Polecane łowiska dla Ciebie
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {userLocation
              ? "Najbliższe miejsca na podstawie Twojej lokalizacji."
              : "Kliknij „Moja lokalizacja” na mapie, aby zobaczyć najbliższe miejsca."}
          </p>
        </div>

        <Link
          href="/lowiska"
          className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Zobacz wszystkie
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {recommendedLakes.map((lake) => (
          <article
            key={lake.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative h-32 overflow-hidden bg-gradient-to-br from-emerald-100 via-blue-100 to-sky-200">
              {lake.images[0] ? (
                <img
                  src={lake.images[0]}
                  alt={lake.name}
                  className="h-full w-full object-cover"
                />
              ) : null}

              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    lake.type === "commercial"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {getLakeTypeLabel(lake.type)}
                </span>

                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                  {getFishingTypeLabel(lake.fishingType)}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-bold text-slate-950">
                {lake.name}
              </h3>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span>★ {lake.rating}</span>

                <span>
                  {lake.calculatedDistance !== null
                    ? `${lake.calculatedDistance.toFixed(1)} km`
                    : "Brak danych"}
                </span>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                {lake.fish}
              </p>

              <Link
                href={`/lowiska/${lake.slug}`}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Zobacz łowisko
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
