"use client";

import { useMemo, useState } from "react";
import type { LakeDto } from "@/lib/lakes";
import Link from "next/link";

type OwnerTypeFilter = "all" | "pzw" | "commercial";
type FishingTypeFilter = "all" | "general" | "spinning" | "carp";
type SortType = "rating" | "name" | "distance";

function getOwnerTypeLabel(type: string) {
  if (type === "pzw") return "PZW";
  if (type === "commercial") return "Komercyjne";
  return "Inne";
}

function getFishingTypeLabel(type: string) {
  if (type === "general") return "Ogólne";
  if (type === "spinning") return "Spinningowe";
  if (type === "carp") return "Karpiowe";
  return "Inne";
}

type LakesPageProps = {
  lakes: LakeDto[];
};

export function LakesPage({ lakes }: LakesPageProps) {
  const [search, setSearch] = useState("");
  const [ownerType, setOwnerType] = useState<OwnerTypeFilter>("all");
  const [fishingType, setFishingType] = useState<FishingTypeFilter>("all");
  const [sortType, setSortType] = useState<SortType>("rating");

  const filteredLakes = useMemo(() => {
    return lakes
      .filter((lake) => {
        const matchesSearch =
          lake.name.toLowerCase().includes(search.toLowerCase()) ||
          lake.fish.toLowerCase().includes(search.toLowerCase());

        const matchesOwnerType =
          ownerType === "all" || lake.type === ownerType;

        const matchesFishingType =
          fishingType === "all" || lake.fishingType === fishingType;

        return matchesSearch && matchesOwnerType && matchesFishingType;
      })
      .sort((firstLake, secondLake) => {
        if (sortType === "name") {
          return firstLake.name.localeCompare(secondLake.name);
        }

        if (sortType === "distance") {
          return parseFloat(firstLake.distance) - parseFloat(secondLake.distance);
        }

        return Number(secondLake.rating) - Number(firstLake.rating);
      });
  }, [search, ownerType, fishingType, sortType]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Łowiska
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Przeglądaj bazę łowisk, filtruj miejsca według rodzaju, typu
            łowienia i dostępnych ryb.
          </p>
        </div>

        <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
          + Dodaj łowisko
        </button>
      </div>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_220px]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Szukaj łowiska
            </label>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Wpisz nazwę łowiska lub gatunek ryby..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Sortowanie
            </label>

            <select
              value={sortType}
              onChange={(event) => setSortType(event.target.value as SortType)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500"
            >
              <option value="rating">Najwyższa ocena</option>
              <option value="name">Nazwa A-Z</option>
              <option value="distance">Najbliżej</option>
            </select>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Rodzaj łowiska
            </p>

            <div className="flex flex-wrap gap-2">
              <FilterButton
                label="Wszystkie"
                isActive={ownerType === "all"}
                onClick={() => setOwnerType("all")}
              />

              <FilterButton
                label="PZW"
                isActive={ownerType === "pzw"}
                onClick={() => setOwnerType("pzw")}
              />

              <FilterButton
                label="Komercyjne"
                isActive={ownerType === "commercial"}
                onClick={() => setOwnerType("commercial")}
              />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Typ łowienia
            </p>

            <div className="flex flex-wrap gap-2">
              <FilterButton
                label="Wszystkie"
                isActive={fishingType === "all"}
                onClick={() => setFishingType("all")}
              />

              <FilterButton
                label="Ogólne"
                isActive={fishingType === "general"}
                onClick={() => setFishingType("general")}
              />

              <FilterButton
                label="Spinningowe"
                isActive={fishingType === "spinning"}
                onClick={() => setFishingType("spinning")}
              />

              <FilterButton
                label="Karpiowe"
                isActive={fishingType === "carp"}
                onClick={() => setFishingType("carp")}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">
          Wyniki:{" "}
          <span className="text-slate-950">{filteredLakes.length}</span>
        </p>

        {(search || ownerType !== "all" || fishingType !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setOwnerType("all");
              setFishingType("all");
              setSortType("rating");
            }}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Wyczyść filtry
          </button>
        )}
      </div>

      {filteredLakes.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filteredLakes.map((lake) => (
            <article
              key={lake.name}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-44 bg-gradient-to-br from-emerald-100 via-blue-100 to-sky-200">
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      lake.type === "commercial"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {getOwnerTypeLabel(lake.type)}
                  </span>

                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                    {getFishingTypeLabel(lake.fishingType)}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">
                      {lake.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {lake.fish}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                    ★ {lake.rating}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-500">
                    {lake.distance}
                  </p>

                  <Link
  href={`/lowiska/${lake.slug}`}
  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
>
  Zobacz szczegóły
</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xl font-bold text-slate-950">
            Brak łowisk dla wybranych filtrów
          </p>

          <p className="mt-2 text-slate-500">
            Zmień kryteria wyszukiwania albo wyczyść filtry.
          </p>

          <button
            onClick={() => {
              setSearch("");
              setOwnerType("all");
              setFishingType("all");
              setSortType("rating");
            }}
            className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Wyczyść filtry
          </button>
        </div>
      )}
    </div>
  );
}

function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        isActive
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );
}