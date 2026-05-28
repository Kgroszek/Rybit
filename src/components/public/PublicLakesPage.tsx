"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LakeDto } from "@/lib/lakes";
import { getFishKey, normalizeFishList, normalizeFishName } from "@/lib/fish-names";

type PublicLakesPageProps = {
  lakes: LakeDto[];
  initialOwnerType?: string;
  initialFishingType?: string;
  initialVoivodeship?: string;
  initialFish?: string;
  initialAmenities?: string[];
};

type ViewMode = "grid" | "list";
type SortOption = "rating-desc" | "name-asc" | "name-desc";

const amenityOptions = [
  { key: "cottages", label: "Domki" },
  { key: "campfire", label: "Ognisko" },
  { key: "noKill", label: "No Kill" },
  { key: "tent", label: "Namiot" },
  { key: "parking", label: "Parking" },
  { key: "pier", label: "Pomost" },
  { key: "toilet", label: "Toaleta" },
  { key: "shop", label: "Sklep" },
  { key: "nightFishing", label: "Nocka" },
  { key: "boatRental", label: "Łodzie" },
  { key: "gearRental", label: "Sprzęt" },
  { key: "shelter", label: "Altana" },
  { key: "coveredSpots", label: "Zadaszenie" },
  { key: "playground", label: "Plac zabaw" },
  { key: "cardPayment", label: "Płatność kartą" },
] as const;

const ownerTypeFilters = [
  { label: "Wszystkie", value: "all" },
  { label: "PZW", value: "pzw" },
  { label: "Komercyjne", value: "commercial" },
];

const fishingTypeFilters = [
  { label: "Wszystkie", value: "all" },
  { label: "Ogólne", value: "general" },
  { label: "Spinningowe", value: "spinning" },
  { label: "Karpiowe", value: "carp" },
];

export function PublicLakesPage({
  lakes,
  initialOwnerType = "all",
  initialFishingType = "all",
  initialVoivodeship = "all",
  initialFish = "all",
  initialAmenities = [],
}: PublicLakesPageProps) {
  const [search, setSearch] = useState("");
  const [ownerType, setOwnerType] = useState(initialOwnerType);
  const [fishingType, setFishingType] = useState(initialFishingType);
  const [voivodeship, setVoivodeship] = useState(initialVoivodeship);
  const [fish, setFish] = useState(initialFish);
  const [selectedAmenities, setSelectedAmenities] =
    useState<string[]>(initialAmenities);
  const [sort, setSort] = useState<SortOption>("rating-desc");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [authModalType, setAuthModalType] = useState<
    "rating" | "favourite" | null
  >(null);

  const voivodeships = useMemo(() => {
    return Array.from(
      new Set(lakes.map((lake) => lake.address.voivodeship).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, "pl"));
  }, [lakes]);

const fishOptions = useMemo(() => {
  return normalizeFishList(lakes.flatMap((lake) => lake.fishSpecies));
}, [lakes]);

  const filteredLakes = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    const result = lakes.filter((lake) => {
      const searchableText = [
        lake.name,
        lake.description,
        lake.address.street,
        lake.address.city,
        lake.address.voivodeship,
        lake.fish,
        ...lake.fishSpecies,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchValue || searchableText.includes(searchValue);

      const matchesOwnerType = ownerType === "all" || lake.type === ownerType;

      const matchesFishingType =
        fishingType === "all" || lake.fishingType === fishingType;

      const matchesVoivodeship =
        voivodeship === "all" || lake.address.voivodeship === voivodeship;

      const selectedFishKey = getFishKey(fish);

      const matchesFish =
        fish === "all" ||
        lake.fishSpecies.some((item) => getFishKey(item) === selectedFishKey);

      const matchesAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((amenityKey) =>
          Boolean(lake.amenities[amenityKey as keyof LakeDto["amenities"]])
        );

      return (
        matchesSearch &&
        matchesOwnerType &&
        matchesFishingType &&
        matchesVoivodeship &&
        matchesFish &&
        matchesAmenities
      );
    });

    return result.sort((firstLake, secondLake) => {
      if (sort === "name-asc") {
        return firstLake.name.localeCompare(secondLake.name, "pl");
      }

      if (sort === "name-desc") {
        return secondLake.name.localeCompare(firstLake.name, "pl");
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
    sort,
  ]);

  function toggleAmenity(key: string) {
    setSelectedAmenities((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  }

  function clearFilters() {
    setSearch("");
    setOwnerType(initialOwnerType);
    setFishingType(initialFishingType);
    setVoivodeship(initialVoivodeship);
    setFish(initialFish);
    setSelectedAmenities(initialAmenities);
    setSort("rating-desc");
  }

  const hasActiveFilters =
    Boolean(search) ||
    ownerType !== initialOwnerType ||
    fishingType !== initialFishingType ||
    voivodeship !== initialVoivodeship ||
    fish !== initialFish ||
    selectedAmenities.join(",") !== initialAmenities.join(",") ||
    sort !== "rating-desc";

  return (
    <>
      <section
        id="lista-lowisk"
        className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              Łowiska
            </h2>

            <p className="mt-2 max-w-3xl text-slate-500">
              Przeglądaj bazę łowisk, filtruj miejsca według rodzaju, typu
              łowienia, ryb, lokalizacji i dostępnych udogodnień.
            </p>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Dodaj łowisko
          </Link>
        </div>

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 xl:grid-cols-[1fr_220px]">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Szukaj łowiska
              </label>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Wpisz nazwę, miasto, województwo, opis albo gatunek ryby..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Sortowanie
              </label>

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="rating-desc">Najwyższa ocena</option>
                <option value="name-asc">Nazwa A-Z</option>
                <option value="name-desc">Nazwa Z-A</option>
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Rodzaj łowiska
              </p>

              <div className="flex flex-wrap gap-2">
                {ownerTypeFilters.map((item) => (
                  <FilterButton
                    key={item.value}
                    isActive={ownerType === item.value}
                    onClick={() => setOwnerType(item.value)}
                  >
                    {item.label}
                  </FilterButton>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Typ łowienia
              </p>

              <div className="flex flex-wrap gap-2">
                {fishingTypeFilters.map((item) => (
                  <FilterButton
                    key={item.value}
                    isActive={fishingType === item.value}
                    onClick={() => setFishingType(item.value)}
                  >
                    {item.label}
                  </FilterButton>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Województwo
              </label>

              <select
                value={voivodeship}
                onChange={(event) => setVoivodeship(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="all">Wszystkie województwa</option>

                {voivodeships.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Gatunek ryby
              </label>

              <select
                value={fish}
                onChange={(event) => setFish(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="all">Wszystkie ryby</option>

                {fishOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-bold text-slate-600"
            >
              <span>Udogodnienia i filtry zaawansowane</span>
              <span>{isAdvancedOpen ? "Zwiń" : "Rozwiń"}</span>
            </button>

            {isAdvancedOpen && (
              <div className="grid gap-2 border-t border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {amenityOptions.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleAmenity(item.key)}
                    className={`rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                      selectedAmenities.includes(item.key)
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-slate-600">
            Wyniki: {filteredLakes.length} / {lakes.length}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Resetuj filtry
            </button>

            <div className="flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-50"
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
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>

        {filteredLakes.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredLakes.map((lake) => (
                <LakeCard
                  key={lake.id}
                  lake={lake}
                  onRequireAuth={setAuthModalType}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLakes.map((lake) => (
                <LakeListItem
                  key={lake.id}
                  lake={lake}
                  onRequireAuth={setAuthModalType}
                />
              ))}
            </div>
          )
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-black text-slate-950">
              Brak łowisk do wyświetlenia
            </p>

            <p className="mt-2 text-slate-500">
              Zmień filtry lub wyczyść wyszukiwanie, aby zobaczyć więcej miejsc.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Wyczyść filtry
            </button>
          </div>
        )}
      </section>

      {authModalType && (
        <AuthRequiredModal
          type={authModalType}
          onClose={() => setAuthModalType(null)}
        />
      )}
    </>
  );
}

function FilterButton({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
        isActive
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function LakeCard({
  lake,
  onRequireAuth,
}: {
  lake: LakeDto;
  onRequireAuth: (type: "rating" | "favourite") => void;
}) {
  const imageUrl = lake.images?.[0];

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-44 bg-cyan-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${lake.name} – łowisko w ${lake.address.city}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-cyan-50 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-blue-600 shadow-sm">
              ♒
            </div>
            <p className="text-sm font-black text-slate-700">
              Brak zdjęcia łowiska
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Szczegóły łowiska znajdziesz po kliknięciu w kartę.
            </p>
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge>{lake.type === "commercial" ? "Komercyjne" : "PZW"}</Badge>
          <Badge>{getFishingTypeLabel(lake.fishingType)}</Badge>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="break-words text-xl font-black text-slate-950">
              {lake.name}
            </h3>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              {lake.address.city}, woj. {lake.address.voivodeship}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onRequireAuth("rating")}
            className="shrink-0 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-black text-blue-700"
          >
            ★ {Number(lake.rating || 0).toFixed(1)}
          </button>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
          {lake.fishSpecies.length > 0 ? lake.fishSpecies.join(", ") : lake.fish}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {getVisibleAmenities(lake).map((item) => (
            <span
              key={item}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm font-black text-slate-500">
            {lake.distance || "0 km"}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRequireAuth("favourite")}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
              aria-label="Dodaj do ulubionych"
            >
              ♡
            </button>

            <Link
              href={`/lowiska-w-polsce/${lake.slug}`}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700"
            >
              Zobacz szczegóły
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function LakeListItem({
  lake,
  onRequireAuth,
}: {
  lake: LakeDto;
  onRequireAuth: (type: "rating" | "favourite") => void;
}) {
  const imageUrl = lake.images?.[0];

  return (
    <article className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[220px_1fr_auto]">
      <div className="h-44 overflow-hidden rounded-2xl bg-cyan-50 md:h-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${lake.name} – łowisko w ${lake.address.city}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center text-sm font-bold text-slate-500">
            Brak zdjęcia
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge>{lake.type === "commercial" ? "Komercyjne" : "PZW"}</Badge>
          <Badge>{getFishingTypeLabel(lake.fishingType)}</Badge>
        </div>

        <h3 className="break-words text-2xl font-black text-slate-950">
          {lake.name}
        </h3>

        <p className="mt-1 text-sm font-semibold text-slate-500">
          {lake.address.city}, woj. {lake.address.voivodeship}
        </p>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
          {lake.description}
        </p>

        <p className="mt-3 text-sm font-bold text-slate-600">
          {lake.fishSpecies.length > 0 ? lake.fishSpecies.join(", ") : lake.fish}
        </p>
      </div>

      <div className="flex flex-col gap-3 md:min-w-[190px] md:items-end md:justify-between">
        <button
          type="button"
          onClick={() => onRequireAuth("rating")}
          className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700"
        >
          ★ {Number(lake.rating || 0).toFixed(1)}
        </button>

        <div className="flex gap-2 md:flex-col">
          <button
            type="button"
            onClick={() => onRequireAuth("favourite")}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50"
          >
            Ulubione
          </button>

          <Link
            href={`/lowiska-w-polsce/${lake.slug}`}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
          >
            Zobacz szczegóły
          </Link>
        </div>
      </div>
    </article>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700 shadow-sm">
      {children}
    </span>
  );
}

function AuthRequiredModal({
  type,
  onClose,
}: {
  type: "rating" | "favourite";
  onClose: () => void;
}) {
  const title =
    type === "rating"
      ? "Ocenianie łowisk jest dostępne po zalogowaniu"
      : "Ulubione łowiska są dostępne po zalogowaniu";

  const description =
    type === "rating"
      ? "Załóż konto lub zaloguj się, aby oceniać łowiska i pomagać innym wędkarzom wybierać najlepsze miejsca."
      : "Załóż konto lub zaloguj się, aby zapisywać łowiska na swojej liście ulubionych.";

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
              Rybio
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">{title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-600 transition hover:bg-slate-200"
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-500">{description}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/login"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Zaloguj się
          </Link>

          <Link
            href="/register"
            className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
          >
            Załóż konto
          </Link>
        </div>
      </div>
    </div>
  );
}

function getFishingTypeLabel(value: string) {
  if (value === "carp") {
    return "Karpiowe";
  }

  if (value === "spinning") {
    return "Spinningowe";
  }

  return "Ogólne";
}

function getVisibleAmenities(lake: LakeDto) {
  const amenities = amenityOptions
    .filter((item) =>
      Boolean(lake.amenities[item.key as keyof LakeDto["amenities"]])
    )
    .map((item) => item.label);

  return amenities.slice(0, 3);
}