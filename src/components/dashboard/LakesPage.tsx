"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LakeListDto } from "@/lib/lakes";

type OwnerTypeFilter = "all" | "pzw" | "commercial";
type FishingTypeFilter = "all" | "general" | "spinning" | "carp";
type SortType = "rating" | "name" | "distance";
type ViewMode = "grid" | "list";

type AmenityKey =
  | "cottages"
  | "campfire"
  | "noKill"
  | "tent"
  | "parking"
  | "pier"
  | "toilet"
  | "shop"
  | "nightFishing"
  | "boatRental"
  | "gearRental"
  | "shelter"
  | "coveredSpots"
  | "playground"
  | "cardPayment";

type LakesPageProps = {
  lakes: LakeListDto[];
};

const amenityFilters: {
  key: AmenityKey;
  label: string;
}[] = [
  { key: "noKill", label: "No Kill" },
  { key: "parking", label: "Parking" },
  { key: "cottages", label: "Domki" },
  { key: "tent", label: "Namiot" },
  { key: "pier", label: "Pomost" },
  { key: "toilet", label: "Toaleta" },
  { key: "shop", label: "Sklep" },
  { key: "nightFishing", label: "Wędkowanie nocne" },
  { key: "boatRental", label: "Wypożyczalnia łodzi" },
  { key: "gearRental", label: "Wypożyczalnia sprzętu" },
  { key: "shelter", label: "Altana" },
  { key: "coveredSpots", label: "Zadaszone stanowiska" },
  { key: "playground", label: "Plac zabaw" },
  { key: "cardPayment", label: "Płatność kartą" },
];

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

export function LakesPage({ lakes }: LakesPageProps) {
  const [search, setSearch] = useState("");
  const [ownerType, setOwnerType] = useState<OwnerTypeFilter>("all");
  const [fishingType, setFishingType] = useState<FishingTypeFilter>("all");
  const [sortType, setSortType] = useState<SortType>("rating");
  const [voivodeship, setVoivodeship] = useState("all");
  const [fish, setFish] = useState("all");
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityKey[]>([]);
  const [areAdvancedFiltersOpen, setAreAdvancedFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const voivodeships = useMemo(() => {
    return Array.from(
      new Set(
        lakes
          .map((lake) => lake.address.voivodeship)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b, "pl"))
      )
    );
  }, [lakes]);

  const fishOptions = useMemo(() => {
    return Array.from(
      new Set(
        lakes
          .flatMap((lake) => {
            if (lake.fishSpecies.length > 0) {
              return lake.fishSpecies;
            }

            return lake.fish
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
          })
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b, "pl"))
      )
    );
  }, [lakes]);

  const activeFiltersCount =
    Number(Boolean(search.trim())) +
    Number(ownerType !== "all") +
    Number(fishingType !== "all") +
    Number(voivodeship !== "all") +
    Number(fish !== "all") +
    selectedAmenities.length;

  const filteredLakes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return lakes
      .filter((lake) => {
        const searchableText = [
          lake.name,
          lake.fish,
          lake.description,
          lake.address.city,
          lake.address.voivodeship,
          lake.address.street,
          ...lake.fishSpecies,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !normalizedSearch || searchableText.includes(normalizedSearch);

        const matchesOwnerType =
          ownerType === "all" || lake.type === ownerType;

        const matchesFishingType =
          fishingType === "all" || lake.fishingType === fishingType;

        const matchesVoivodeship =
          voivodeship === "all" ||
          lake.address.voivodeship === voivodeship;

        const matchesFish =
          fish === "all" ||
          lake.fishSpecies.some(
            (fishName) => fishName.toLowerCase() === fish.toLowerCase()
          ) ||
          lake.fish.toLowerCase().includes(fish.toLowerCase());

        const matchesAmenities = selectedAmenities.every(
          (amenity) => lake.amenities[amenity]
        );

        return (
          matchesSearch &&
          matchesOwnerType &&
          matchesFishingType &&
          matchesVoivodeship &&
          matchesFish &&
          matchesAmenities
        );
      })
      .sort((firstLake, secondLake) => {
        if (sortType === "name") {
          return firstLake.name.localeCompare(secondLake.name, "pl");
        }

        if (sortType === "distance") {
          return (
            parseFloat(firstLake.distance) - parseFloat(secondLake.distance)
          );
        }

        return Number(secondLake.rating) - Number(firstLake.rating);
      });
  }, [
    lakes,
    search,
    ownerType,
    fishingType,
    voivodeship,
    fish,
    selectedAmenities,
    sortType,
  ]);

  function toggleAmenity(amenity: AmenityKey) {
    setSelectedAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity]
    );
  }

  function clearFilters() {
    setSearch("");
    setOwnerType("all");
    setFishingType("all");
    setVoivodeship("all");
    setFish("all");
    setSelectedAmenities([]);
    setSortType("rating");
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Łowiska
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Przeglądaj bazę łowisk, filtruj miejsca według rodzaju, typu
            łowienia, ryb, lokalizacji i dostępnych udogodnień.
          </p>
        </div>

        <Link
          href="/lowiska/zglos"
          className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Dodaj łowisko
        </Link>
      </div>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1.3fr_260px]">
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Szukaj łowiska
            </span>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Wpisz nazwę, miasto, województwo, opis albo gatunek ryby..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Sortowanie
            </span>

            <select
              value={sortType}
              onChange={(event) => setSortType(event.target.value as SortType)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500"
            >
              <option value="rating">Najwyższa ocena</option>
              <option value="name">Nazwa A-Z</option>
              <option value="distance">Najbliżej</option>
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">
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
            <p className="mb-3 text-sm font-semibold text-slate-700">
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

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Województwo
            </span>

            <select
              value={voivodeship}
              onChange={(event) => setVoivodeship(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500"
            >
              <option value="all">Wszystkie województwa</option>

              {voivodeships.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Gatunek ryby
            </span>

            <select
              value={fish}
              onChange={(event) => setFish(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500"
            >
              <option value="all">Wszystkie ryby</option>

              {fishOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={() =>
              setAreAdvancedFiltersOpen((current) => !current)
            }
            className="flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            <span>Udogodnienia i filtry zaawansowane</span>
            <span>{areAdvancedFiltersOpen ? "Zwiń" : "Rozwiń"}</span>
          </button>

          {areAdvancedFiltersOpen && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {amenityFilters.map((amenity) => (
                <CheckboxFilter
                  key={amenity.key}
                  label={amenity.label}
                  checked={selectedAmenities.includes(amenity.key)}
                  onChange={() => toggleAmenity(amenity.key)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>
              Wyniki:{" "}
              <strong className="font-bold text-slate-950">
                {filteredLakes.length}
              </strong>{" "}
              / {lakes.length}
            </span>

            {activeFiltersCount > 0 && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                Aktywne filtry: {activeFiltersCount}
              </span>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
              Resetuj filtry
            </button>
          </div>

          <div className="inline-flex w-fit rounded-2xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Kafelki
            </button>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </section>

      <div>
        {filteredLakes.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid items-stretch gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {filteredLakes.map((lake) => (
                <LakeGridCard key={lake.id} lake={lake} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLakes.map((lake) => (
                <LakeListItem key={lake.id} lake={lake} />
              ))}
            </div>
          )
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-bold text-slate-950">
              Brak łowisk dla wybranych filtrów
            </p>

            <p className="mt-2 text-slate-500">
              Zmień kryteria wyszukiwania albo wyczyść filtry.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Wyczyść filtry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LakeGridCard({ lake }: { lake: LakeListDto }) {
  const image = lake.images[0];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-44 shrink-0 overflow-hidden bg-slate-100">
        <LakeImagePreview image={image} lakeName={lake.name} />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />

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

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="line-clamp-2 break-words text-xl font-bold text-slate-950">
              {lake.name}
            </h2>

            <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-500">
              {lake.address.city}, woj. {lake.address.voivodeship}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
            ★ {lake.rating}
          </div>
        </div>

        <div className="min-h-[44px]">
          <p className="line-clamp-2 text-sm leading-6 text-slate-500">
            {lake.fish || "Brak informacji"}
          </p>
        </div>

        <div className="mt-4 flex min-h-[26px] flex-wrap gap-2">
          {lake.amenities.noKill && <SmallBadge label="No Kill" />}
          {lake.amenities.parking && <SmallBadge label="Parking" />}
          {lake.amenities.nightFishing && <SmallBadge label="Nocka" />}
          {lake.amenities.cottages && <SmallBadge label="Domki" />}
          {lake.amenities.cardPayment && <SmallBadge label="Karta" />}

          {!lake.amenities.noKill &&
            !lake.amenities.parking &&
            !lake.amenities.nightFishing &&
            !lake.amenities.cottages &&
            !lake.amenities.cardPayment && (
              <SmallBadge label="Brak informacji" />
            )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
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
  );
}

function LakeListItem({ lake }: { lake: LakeListDto }) {
  const image = lake.images[0];

  return (
    <article className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md lg:grid-cols-[280px_1fr]">
      <div className="relative h-56 bg-slate-100 lg:h-full">
        <LakeImagePreview image={image} lakeName={lake.name} />
      </div>

      <div className="flex flex-col p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  lake.type === "commercial"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {getOwnerTypeLabel(lake.type)}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {getFishingTypeLabel(lake.fishingType)}
              </span>
            </div>

            <h2 className="break-words text-2xl font-bold text-slate-950">
              {lake.name}
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {lake.address.street}, {lake.address.city}, woj.{" "}
              {lake.address.voivodeship}
            </p>
          </div>

          <div className="w-fit shrink-0 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
            ★ {lake.rating}
          </div>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
          {lake.description || "Brak opisu łowiska."}
        </p>

        <p className="mt-4 text-sm text-slate-600">
          <span className="font-bold text-slate-950">Ryby:</span>{" "}
          {lake.fish || "Brak informacji"}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {lake.amenities.noKill && <SmallBadge label="No Kill" />}
          {lake.amenities.parking && <SmallBadge label="Parking" />}
          {lake.amenities.nightFishing && <SmallBadge label="Nocka" />}
          {lake.amenities.cottages && <SmallBadge label="Domki" />}
          {lake.amenities.cardPayment && <SmallBadge label="Karta" />}

          {!lake.amenities.noKill &&
            !lake.amenities.parking &&
            !lake.amenities.nightFishing &&
            !lake.amenities.cottages &&
            !lake.amenities.cardPayment && (
              <SmallBadge label="Brak informacji" />
            )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
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
  );
}

function LakeImagePreview({
  image,
  lakeName,
}: {
  image?: string | null;
  lakeName: string;
}) {
  const [hasImageError, setHasImageError] = useState(false);

  if (!image || hasImageError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 px-6 text-center">
        <p className="text-sm font-bold text-slate-500">
          Brak zdjęcia łowiska
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Do tego łowiska nie dodano jeszcze zdjęcia.
        </p>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={lakeName}
      loading="lazy"
      onError={() => setHasImageError(true)}
      className="h-full w-full object-cover"
    />
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
      className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}

function CheckboxFilter({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 accent-blue-600"
      />

      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </label>
  );
}

function SmallBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      {label}
    </span>
  );
}