"use client";

import Link from "next/link";
import { useMemo } from "react";

import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  calculateDistanceInKm,
  isValidLocation,
} from "@/lib/location";
import type { LakeListDto } from "@/lib/lakes";

type RecommendedLake = LakeListDto & {
  calculatedDistance: number | null;
};

function getLakeTypeLabel(type: string) {
  return type === "commercial" ? "Komercyjne" : "PZW";
}

function getFishingTypeLabel(type: string) {
  if (type === "spinning") return "Spinningowe";
  if (type === "carp") return "Karpiowe";
  if (type === "general") return "Ogólne";
  return "Inne";
}

export function RecommendedLakes({ lakes }: { lakes: LakeListDto[] }) {
  const { userLocation } = useUserLocation();

  const recommendedLakes = useMemo<RecommendedLake[]>(() => {
    const validLakes = lakes
      .filter((lake) => isValidLocation({ lat: lake.lat, lng: lake.lng }))
      .map((lake) => ({
        ...lake,
        calculatedDistance:
          userLocation && isValidLocation(userLocation)
            ? calculateDistanceInKm(userLocation, {
                lat: lake.lat,
                lng: lake.lng,
              })
            : null,
      }));

    return validLakes
      .sort((firstLake, secondLake) => {
        const ratingDifference =
          Number(secondLake.rating || 0) - Number(firstLake.rating || 0);

        if (ratingDifference !== 0) return ratingDifference;

        return (
          (firstLake.calculatedDistance ?? Infinity) -
          (secondLake.calculatedDistance ?? Infinity)
        );
      })
      .slice(0, 3);
  }, [lakes, userLocation]);

  return (
    <section>
      <SectionHeader
        eyebrow="Odkrywaj"
        title="Najlepiej oceniane łowiska"
        description={
          userLocation && isValidLocation(userLocation)
            ? "Wysoko oceniane miejsca w Rybio. Przy remisie bliżej Ciebie pojawiają się wyżej."
            : "Miejsca wyróżniające się ocenami użytkowników Rybio."
        }
        action={
          <ButtonLink href="/lowiska" variant="outline" size="sm" className="hidden sm:inline-flex">
            Zobacz wszystkie
          </ButtonLink>
        }
      />

      <div className="mt-5 grid gap-4 md:grid-cols-3">
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
              className="group relative min-h-[320px] overflow-hidden rounded-card bg-navy-950 shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              {lake.images[0] ? (
                <img
                  src={lake.images[0]}
                  alt={lake.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(145deg,var(--rybio-navy-950),var(--rybio-navy-900))]" />
              )}

              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,30,51,0.96)_0%,rgba(13,30,51,0.68)_38%,rgba(13,30,51,0.08)_78%)]" />

              <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
                <span
                  className={
                    lake.type === "commercial"
                      ? "rounded-full border border-white/20 bg-success/90 px-3 py-1 text-[10px] font-bold text-white backdrop-blur"
                      : "rounded-full border border-white/20 bg-primary/90 px-3 py-1 text-[10px] font-bold text-white backdrop-blur"
                  }
                >
                  {getLakeTypeLabel(lake.type)}
                </span>

                <span className="rounded-full border border-white/20 bg-white/90 px-3 py-1 text-[10px] font-bold text-navy-950 backdrop-blur">
                  {getFishingTypeLabel(lake.fishingType)}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <div className="flex items-center gap-3 text-xs font-semibold text-white/80">
                  <span>
                    {Number(lake.rating || 0) > 0
                      ? `Ocena ${Number(lake.rating)
                          .toFixed(1)
                          .replace(".", ",")}`
                      : "Brak ocen"}
                  </span>

                  {lake.calculatedDistance !== null &&
                    Number.isFinite(lake.calculatedDistance) && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-white/40" />
                        <span>{lake.calculatedDistance.toFixed(1)} km</span>
                      </>
                    )}
                </div>

                <h3 className="mt-2 font-display text-xl font-extrabold tracking-[-0.025em] text-white">
                  {lake.name}
                </h3>

                <p className="mt-1 truncate text-sm text-white/75">
                  {lake.address.city}
                  {lake.address.voivodeship
                    ? `, woj. ${lake.address.voivodeship}`
                    : ""}
                </p>

                {fish && (
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/70">
                    {fish}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
                  <span className="text-sm font-semibold">Zobacz łowisko</span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors group-hover:bg-white group-hover:text-navy-950">
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <ButtonLink
        href="/lowiska"
        variant="outline"
        fullWidth
        className="mt-4 sm:hidden"
      >
        Zobacz wszystkie łowiska
      </ButtonLink>
    </section>
  );
}
