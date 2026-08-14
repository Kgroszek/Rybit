"use client";
import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

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
  return type === "commercial" ? "Komercyjne" : "PZW";
}

function getFishingTypeLabel(type: string) {
  if (type === "spinning") return "Spinningowe";
  if (type === "carp") return "Karpiowe";
  if (type === "general") return "Ogólne";
  return "Inne";
}

export function RecommendedLakes({
  lakes,
}: RecommendedLakesProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedLocation = localStorage.getItem("rybit-user-location");

      if (!savedLocation) return;

      try {
        setUserLocation(JSON.parse(savedLocation) as UserLocation);
      } catch {
        setUserLocation(null);
      }
    }, 0);

    function handleLocationUpdated(event: Event) {
      setUserLocation((event as CustomEvent<UserLocation>).detail);
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
      return [...lakes]
        .sort(
          (firstLake, secondLake) =>
            Number(secondLake.rating || 0) -
            Number(firstLake.rating || 0)
        )
        .slice(0, 3)
        .map((lake) => ({
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
      .slice(0, 3);
  }, [lakes, userLocation]);

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600">
            Polecane
          </p>

          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
            Polecane łowiska dla Ciebie
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {userLocation
              ? "Wybrane spośród łowisk położonych najbliżej Twojej zapisanej lokalizacji."
              : "Włącz lokalizację na mapie, aby Rybio mogło polecić Ci łowiska znajdujące się najbliżej."}
          </p>
        </div>

        <Link
          href="/lowiska"
          className="hidden shrink-0 text-sm font-extrabold text-blue-600 transition hover:text-blue-700 sm:flex items-center gap-1"
        >
          Zobacz wszystkie
          <ArrowSmallRightIcon className="h-4 w-4 text-stale-500 transition-colors" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {recommendedLakes.map((lake) => {
          const fish =
            lake.fishSpecies.slice(0, 3).join(" • ") ||
            lake.fish
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
              .slice(0, 3)
              .join(" • ");

          return (
            <Link
              key={lake.id}
              href={`/lowiska/${lake.slug}`}
              className="group relative min-h-[340px] overflow-hidden rounded-[24px] bg-slate-900 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
            >
              {lake.images[0] ? (
                <img
                  src={lake.images[0]}
                  alt={lake.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.055]"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,.42),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,.34),transparent_38%),linear-gradient(145deg,#0f172a,#1e3a5f)]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/5" />

              <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border border-white/30 px-3 py-1 text-[10px] font-extrabold backdrop-blur ${
                    lake.type === "commercial"
                      ? "bg-emerald-500/90 text-white"
                      : "bg-blue-600/90 text-white"
                  }`}
                >
                  {getLakeTypeLabel(lake.type)}
                </span>

                <span className="rounded-full border border-white/30 bg-white/90 px-3 py-1 text-[10px] font-extrabold text-slate-700 backdrop-blur">
                  {getFishingTypeLabel(lake.fishingType)}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <div className="flex items-center gap-3 text-xs font-bold text-white/75">
                  <span>
                    {Number(lake.rating || 0) > 0
                      ? `★ ${Number(lake.rating).toFixed(1)}`
                      : "Brak ocen"}
                  </span>

                  {lake.calculatedDistance !== null && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-white/40" />
                      <span>{lake.calculatedDistance.toFixed(1)} km</span>
                    </>
                  )}
                </div>

                <h3 className="mt-2 text-xl font-bold tracking-tight">
                  {lake.name}
                </h3>

                <p className="mt-1 truncate text-sm text-white/70">
                  {lake.address.city}
                  {lake.address.voivodeship
                    ? `, woj. ${lake.address.voivodeship}`
                    : ""}
                </p>

                {fish && (
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/65">
                    {fish}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
                  <span className="text-sm font-bold">
                    Zobacz łowisko
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg backdrop-blur transition duration-300 group-hover:-translate-y-0.5 group-hover:bg-white group-hover:text-slate-950">
                    <ArrowRightIcon className="h-4 w-4 text-stale-500 transition-colors" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/lowiska"
        className="mt-4 flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-blue-600 sm:hidden"
      >
        Zobacz wszystkie łowiska
      </Link>
    </section>
  );
}
