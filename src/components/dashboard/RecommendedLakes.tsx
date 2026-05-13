"use client";

import { useEffect, useMemo, useState } from "react";
import { lakes } from "@/data/dashboardData";

type UserLocation = {
  lat: number;
  lng: number;
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

export function RecommendedLakes() {
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

  const recommendedLakes = useMemo(() => {
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
        return firstLake.calculatedDistance - secondLake.calculatedDistance;
      })
      .slice(0, 3);
  }, [userLocation]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Polecane łowiska dla Ciebie</h2>

          <p className="mt-1 text-sm text-slate-500">
            {userLocation
              ? "Najbliższe miejsca na podstawie Twojej lokalizacji."
              : "Kliknij „Moja lokalizacja” na mapie, aby zobaczyć najbliższe miejsca."}
          </p>
        </div>

        <button className="shrink-0 text-sm font-semibold text-blue-600">
          Zobacz wszystkie
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {recommendedLakes.map((lake) => (
          <article
            key={lake.name}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative h-32 bg-gradient-to-br from-emerald-100 via-blue-100 to-sky-200">
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
              <h3 className="text-lg font-bold">{lake.name}</h3>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span>★ {lake.rating}</span>

                <span>
                  {lake.calculatedDistance
                    ? `${lake.calculatedDistance.toFixed(1)} km`
                    : lake.distance}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-500">{lake.fish}</p>

              <button className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                Zobacz łowisko
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}