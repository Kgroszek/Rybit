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

export function NearestLakes() {
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

  const nearestLakes = useMemo(() => {
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
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-bold">Najbliższe łowiska</h2>

          {!userLocation && (
            <p className="mt-1 text-xs text-slate-500">
              Kliknij „Moja lokalizacja” na mapie, aby policzyć odległość.
            </p>
          )}
        </div>

        <button className="text-sm font-semibold text-blue-600">
          Zobacz
        </button>
      </div>

      <div className="space-y-4">
        {nearestLakes.map((lake) => (
          <div key={lake.name} className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-100 to-blue-100" />

            <div className="flex-1">
              <p className="font-semibold">{lake.name}</p>

              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <span>★ {lake.rating}</span>
                <span>•</span>
                <span>{lake.fish.split(",")[0]}</span>
              </div>
            </div>

            <p className="text-right text-sm font-semibold text-slate-600">
              {lake.calculatedDistance
                ? `${lake.calculatedDistance.toFixed(1)} km`
                : lake.distance}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}