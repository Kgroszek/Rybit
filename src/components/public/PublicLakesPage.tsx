"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LakeDto } from "@/lib/lakes";

type PublicLakesPageProps = {
  lakes: LakeDto[];
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

export function PublicLakesPage({ lakes }: PublicLakesPageProps) {
  const [search, setSearch] = useState("");
  const [ownerType, setOwnerType] = useState("all");
  const [fishingType, setFishingType] = useState("all");
  const [voivodeship, setVoivodeship] = useState("all");
  const [fish, setFish] = useState("all");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
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
    return Array.from(
      new Set(lakes.flatMap((lake) => lake.fishSpecies).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, "pl"));
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

      const matchesFish =
        fish === "all" || lake.fishSpecies.some((item) => item === fish);

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
    setOwnerType("all");
    setFishingType("all");
    setVoivodeship("all");
    setFish("all");
    setSelectedAmenities([]);
    setSort("rating-desc");
  }

  const hasActiveFilters =
    search ||
    ownerType !== "all" ||
    fishingType !== "all" ||
    voivodeship !== "all" ||
    fish !== "all" ||
    selectedAmenities.length > 0 ||
    sort !== "rating-desc";

  return (
    <>
      <section
        id="lista-lowisk"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
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

          <div className="mt-5 overflow-hidden rounded-2xl bg-slate-50">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen((current) => !current)}
              className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-black text-slate-700"
            >
              <span>Udogodnienia i filtry zaawansowane</span>
              <span>{isAdvancedOpen ? "Zwiń" : "Rozwiń"}</span>
            </button>

            {isAdvancedOpen && (
              <div className="border-t border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  {amenityOptions.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleAmenity(item.key)}
                      className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                        selectedAmenities.includes(item.key)
                          ? "bg-blue-600 text-white"
                          : "bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-slate-500">
            Wyniki:{" "}
            <span className="text-slate-950">{filteredLakes.length}</span> /{" "}
            {lakes.length}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Resetuj filtry
            </button>

            <div className="flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-xl px-4 py-2 text-sm font-black transition ${
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
                className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
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
                  onRatingClick={() => setAuthModalType("rating")}
                  onFavouriteClick={() => setAuthModalType("favourite")}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLakes.map((lake) => (
                <LakeListItem
                  key={lake.id}
                  lake={lake}
                  onRatingClick={() => setAuthModalType("rating")}
                  onFavouriteClick={() => setAuthModalType("favourite")}
                />
              ))}
            </div>
          )
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-black text-slate-950">
              Nie znaleziono łowisk
            </p>

            <p className="mt-2 text-slate-500">
              Zmień filtry lub wpisz inną frazę wyszukiwania.
            </p>
          </div>
        )}
      </section>

      {authModalType && (
        <AuthEncouragementModal
          type={authModalType}
          onClose={() => setAuthModalType(null)}
        />
      )}
    </>
  );
}

function LakeCard({
  lake,
  onRatingClick,
  onFavouriteClick,
}: {
  lake: LakeDto;
  onRatingClick: () => void;
  onFavouriteClick: () => void;
}) {
  const image = lake.images[0];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
  <div className="relative h-46 overflow-hidden bg-slate-100">
    <LakeImagePreview image={image} lakeName={lake.name} />

    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
      <span
        className={`rounded-full px-3 py-1 text-xs font-black ${
          lake.type === "commercial"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-blue-50 text-blue-700"
        }`}
      >
        {getOwnerTypeLabel(lake.type)}
      </span>

      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-700 shadow-sm">
        {getFishingTypeLabel(lake.fishingType)}
      </span>
    </div>
  </div>

  <div className="flex flex-1 flex-col p-5">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="line-clamp-2 break-words text-xl font-black text-slate-950">
          {lake.name}
        </h2>

        <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-500">
          {lake.address.city}, woj. {lake.address.voivodeship}
        </p>
      </div>

      <button
        type="button"
        onClick={onRatingClick}
        className="shrink-0 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-black text-blue-600 transition hover:bg-blue-100"
      >
        ★ {lake.rating}
      </button>
    </div>

    <div className="mt-3 min-h-[48px]">
      <p className="line-clamp-2 text-sm leading-6 text-slate-500">
        {lake.fishSpecies.slice(0, 6).join(", ") || lake.fish || "Brak informacji"}
      </p>
    </div>

    <div className="mt-4 flex min-h-[32px] flex-wrap gap-2">
      {getVisibleAmenities(lake)
        .slice(0, 4)
        .map((item) => (
          <span
            key={item}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
          >
            {item}
          </span>
        ))}
    </div>

    <div className="mt-auto border-t border-slate-100 pt-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-500">{lake.distance}</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onFavouriteClick}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 transition hover:bg-slate-50"
            aria-label="Dodaj do ulubionych"
          >
            ♡
          </button>

          <Link
            href={`/lowiska-w-polsce/${lake.slug}`}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700"
          >
            Zobacz szczegóły
          </Link>
        </div>
      </div>
    </div>
  </div>
</article>
  );
}

function LakeListItem({
  lake,
  onRatingClick,
  onFavouriteClick,
}: {
  lake: LakeDto;
  onRatingClick: () => void;
  onFavouriteClick: () => void;
}) {
  const image = lake.images[0];

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
  <div className="grid min-h-[300px] gap-0 lg:grid-cols-[280px_1fr]">
    <div className="relative h-56 overflow-hidden bg-slate-100 lg:h-full lg:min-h-[300px]">
  <LakeImagePreview image={image} lakeName={lake.name} />
</div>

    <div className="flex min-w-0 flex-col p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                lake.type === "commercial"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {getOwnerTypeLabel(lake.type)}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              {getFishingTypeLabel(lake.fishingType)}
            </span>
          </div>

          <h2 className="break-words text-2xl font-black text-slate-950">
            {lake.name}
          </h2>

          <p className="mt-1 break-words text-sm font-semibold text-slate-500">
            {lake.address.street}, {lake.address.postalCode}{" "}
            {lake.address.city}, woj. {lake.address.voivodeship}
          </p>
        </div>

        <button
          type="button"
          onClick={onRatingClick}
          className="w-fit shrink-0 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-600 transition hover:bg-blue-100"
        >
          ★ {lake.rating}
        </button>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
        {lake.description || "Brak opisu łowiska."}
      </p>

      <div className="mt-4 flex min-h-[32px] flex-wrap gap-2">
        {lake.fishSpecies.slice(0, 8).map((fish) => (
          <span
            key={fish}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
          >
            {fish}
          </span>
        ))}
      </div>

      <div className="mt-5 flex min-h-[32px] flex-wrap gap-2">
        {getVisibleAmenities(lake)
          .slice(0, 6)
          .map((item) => (
            <span
              key={item}
              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
            >
              {item}
            </span>
          ))}
      </div>

      <div className="mt-auto pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onFavouriteClick}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            ♡ Dodaj do ulubionych
          </button>

          <Link
            href={`/lowiska-w-polsce/${lake.slug}`}
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
          >
            Zobacz szczegóły
          </Link>
        </div>
      </div>
    </div>
  </div>
</article>
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
      className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
        isActive
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function AuthEncouragementModal({
  type,
  onClose,
}: {
  type: "rating" | "favourite";
  onClose: () => void;
}) {
  const title =
    type === "rating"
      ? "Chcesz ocenić to łowisko?"
      : "Chcesz dodać łowisko do ulubionych?";

  const description =
    type === "rating"
      ? "Oceny łowisk są dostępne dla zalogowanych użytkowników. Załóż konto, oceniaj miejsca i pomagaj innym wędkarzom wybierać najlepsze łowiska."
      : "Lista ulubionych jest dostępna po zalogowaniu. Załóż konto, zapisuj ciekawe łowiska i szybciej planuj kolejne wyprawy.";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
              Konto Rybio
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              {title}
            </h2>

            <p className="mt-3 leading-7 text-slate-600">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 transition hover:bg-slate-200"
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/register"
            className="flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Załóż konto
          </Link>

          <Link
            href="/login"
            className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Zaloguj się
          </Link>
        </div>
      </div>
    </div>
  );
}

function getOwnerTypeLabel(type: string) {
  if (type === "pzw") return "PZW";
  if (type === "commercial") return "Komercyjne";
  return "Inne";
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
      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-50 px-6 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-sm">
          <svg
            className="h-7 w-7 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 20c4-1 7-4 9-8 2.5-4.8 5.5-6.8 9-8-1 4-3 8-6 11-3 3-7 5-12 5Z" />
            <path d="M14 7c.5 0 1 .2 1.4.6" />
          </svg>
        </div>

        <p className="text-sm font-black text-slate-700">
          Brak zdjęcia łowiska
        </p>

        <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-500">
          Szczegóły łowiska znajdziesz po kliknięciu w kartę.
        </p>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={`Łowisko ${lakeName}`}
      onError={() => setHasImageError(true)}
      className="h-full w-full object-cover"
    />
  );
}

function getFishingTypeLabel(type: string) {
  if (type === "general") return "Ogólne";
  if (type === "spinning") return "Spinningowe";
  if (type === "carp") return "Karpiowe";
  return "Inne";
}

function getVisibleAmenities(lake: LakeDto) {
  const labels: string[] = [];

  if (lake.amenities.parking) labels.push("Parking");
  if (lake.amenities.nightFishing) labels.push("Nocka");
  if (lake.amenities.noKill) labels.push("No Kill");
  if (lake.amenities.cottages) labels.push("Domki");
  if (lake.amenities.toilet) labels.push("Toaleta");
  if (lake.amenities.pier) labels.push("Pomost");
  if (lake.amenities.shop) labels.push("Sklep");
  if (lake.amenities.cardPayment) labels.push("Płatność kartą");

  return labels;
}