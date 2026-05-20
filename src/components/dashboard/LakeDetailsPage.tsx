"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LakeDto } from "@/lib/lakes";
import { LakeCorrectionReportButton } from "@/components/dashboard/LakeCorrectionReportButton";
import { CatchReportButton } from "@/components/dashboard/CatchReportButton";

type LakeDetailsPageProps = {
  lake: LakeDto;
  isAdmin?: boolean;
};

const amenitiesLabels = [
  {
    key: "cottages",
    label: "Domki na terenie łowiska",
    icon: "🏠",
  },
  {
    key: "campfire",
    label: "Możliwość rozpalenia ogniska",
    icon: "🔥",
  },
  {
    key: "noKill",
    label: "No Kill",
    icon: "♻️",
  },
  {
    key: "tent",
    label: "Możliwość rozłożenia namiotu",
    icon: "⛺",
  },
  {
    key: "parking",
    label: "Parking",
    icon: "🅿️",
  },
  {
    key: "pier",
    label: "Pomost",
    icon: "🌉",
  },
  {
    key: "toilet",
    label: "Toaleta",
    icon: "🚻",
  },
  {
    key: "shop",
    label: "Sklep / punkt sprzedaży",
    icon: "🛒",
  },
  {
    key: "nightFishing",
    label: "Wędkowanie nocne",
    icon: "🌙",
  },
  {
    key: "boatRental",
    label: "Wypożyczalnia łodzi",
    icon: "🚤",
  },
  {
    key: "gearRental",
    label: "Wypożyczalnia sprzętu",
    icon: "🎒",
  },
  {
    key: "shelter",
    label: "Altana",
    icon: "🏕️",
  },
  {
    key: "coveredSpots",
    label: "Zadaszone stanowiska",
    icon: "☂️",
  },
  {
    key: "playground",
    label: "Plac zabaw",
    icon: "🛝",
  },
  {
    key: "cardPayment",
    label: "Płatność kartą",
    icon: "💳",
  },
] as const;

function getOwnerTypeLabel(type: string) {
  if (type === "pzw") return "Łowisko PZW";
  if (type === "commercial") return "Łowisko komercyjne";
  return "Inne łowisko";
}

function getFishingTypeLabel(type: string) {
  if (type === "general") return "Ogólne";
  if (type === "spinning") return "Spinningowe";
  if (type === "carp") return "Karpiowe";
  return "Inne";
}

function getNavigationUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function LakeDetailsPage({
  lake,
  isAdmin = false,
}: LakeDetailsPageProps) {
  const [displayRating, setDisplayRating] = useState(lake.rating);
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [isFavouriteLoading, setIsFavouriteLoading] = useState(false);
  const [isRatingLoading, setIsRatingLoading] = useState(false);

  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(
    null
  );

  const [catchPreviewImage, setCatchPreviewImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);

  const previewImage =
    previewImageIndex !== null ? lake.images[previewImageIndex] : null;

  function openPreview(index: number) {
    setPreviewImageIndex(index);
  }

  function closePreview() {
    setPreviewImageIndex(null);
  }

  function showPreviousImage() {
    if (previewImageIndex === null || lake.images.length === 0) {
      return;
    }

    setPreviewImageIndex((currentIndex) => {
      if (currentIndex === null) {
        return null;
      }

      return currentIndex === 0 ? lake.images.length - 1 : currentIndex - 1;
    });
  }

  function showNextImage() {
    if (previewImageIndex === null || lake.images.length === 0) {
      return;
    }

    setPreviewImageIndex((currentIndex) => {
      if (currentIndex === null) {
        return null;
      }

      return currentIndex === lake.images.length - 1 ? 0 : currentIndex + 1;
    });
  }

  useEffect(() => {
    async function loadUserData() {
      setIsLoadingUserData(true);

      const response = await fetch(`/api/lakes/${lake.slug}/user-data`);

      if (!response.ok) {
        setIsLoadingUserData(false);
        return;
      }

      const data = await response.json();

      setIsFavourite(Boolean(data.isFavourite));
      setUserRating(Number(data.userRating || 0));
      setIsLoadingUserData(false);
    }

    loadUserData();
  }, [lake.slug]);

  useEffect(() => {
    if (previewImageIndex === null) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closePreview();
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewImageIndex, lake.images.length]);

  async function handleRatingChange(rating: number) {
    setIsRatingLoading(true);

    const response = await fetch(`/api/lakes/${lake.slug}/rating`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value: rating,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Nie udało się zapisać oceny.");
      setIsRatingLoading(false);
      return;
    }

    setUserRating(Number(data.userRating));
    setDisplayRating(String(data.averageRating));
    setIsRatingLoading(false);
  }

  async function handleFavouriteToggle() {
    setIsFavouriteLoading(true);

    const response = await fetch(`/api/lakes/${lake.slug}/favourite`, {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Nie udało się zmienić ulubionych.");
      setIsFavouriteLoading(false);
      return;
    }

    setIsFavourite(Boolean(data.isFavourite));
    setIsFavouriteLoading(false);
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/lowiska"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Wróć do łowisk
        </Link>
      </div>

      <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-h-[360px] lg:grid-cols-[1.4fr_0.6fr]">
          <div className="relative min-h-[360px] bg-gradient-to-br from-emerald-100 via-blue-100 to-sky-200 p-6">
            <div className="absolute left-6 top-6 flex flex-wrap gap-2">
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

            <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/85 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-slate-950">
                    {lake.name}
                  </h1>

                  <p className="mt-2 text-slate-600">
                    {lake.address.street}, {lake.address.postalCode}{" "}
                    {lake.address.city}, woj. {lake.address.voivodeship}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={handleFavouriteToggle}
                    disabled={isFavouriteLoading || isLoadingUserData}
                    className={`rounded-2xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      isFavourite
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isFavouriteLoading
                      ? "Zapisywanie..."
                      : isFavourite
                        ? "♥ W ulubionych"
                        : "♡ Dodaj do ulubionych"}
                  </button>

                  {isAdmin && (
                    <Link
                      href={`/admin/lowiska/${lake.slug}/edytuj`}
                      className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      Edytuj łowisko
                    </Link>
                  )}

                  <div className="rounded-2xl bg-blue-50 px-4 py-3 text-lg font-bold text-blue-700">
                    ★ {displayRating}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4">
            {lake.images.length > 0 ? (
              lake.images.slice(0, 4).map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => openPreview(index)}
                  className="group overflow-hidden rounded-2xl bg-slate-100 text-left"
                >
                  <div
                    className="h-full min-h-[150px] bg-cover bg-center transition duration-300 group-hover:scale-105"
                    style={{
                      backgroundImage: `url(${image})`,
                    }}
                  />
                </button>
              ))
            ) : (
              <>
                <div className="rounded-2xl bg-slate-100" />
                <div className="rounded-2xl bg-slate-100" />
                <div className="rounded-2xl bg-slate-100" />
                <div className="rounded-2xl bg-slate-100" />
              </>
            )}
          </div>
        </div>
      </section>

      {lake.images.length > 0 && (
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Galeria zdjęć
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Zdjęcia dodane do łowiska.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
              {lake.images.length} zdjęć
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lake.images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => openPreview(index)}
                className="group overflow-hidden rounded-2xl bg-slate-100 text-left"
              >
                <img
                  src={image}
                  alt={`Zdjęcie łowiska ${lake.name}`}
                  className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </section>
      )}

        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Opis łowiska</h2>

            <p className="mt-4 leading-7 text-slate-600">
              {lake.description}
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Ryby występujące na łowisku
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lake.fishSpecies.map((fish) => (
                <div
                  key={fish}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                    🐟
                  </div>

                  <div>
                    <p className="font-bold text-slate-950">{fish}</p>
                    <p className="text-sm text-slate-500">Występuje</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <CatchRankingsSection
            lake={lake}
            onCatchImageClick={(item) =>
              setCatchPreviewImage({
                url: item.imageUrl,
                alt: `Połów: ${item.fishName}`,
              })
            }
          />

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Udogodnienia</h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {amenitiesLabels.map((amenity) => {
                const isAvailable = lake.amenities[amenity.key];

                return (
                  <div
                    key={amenity.key}
                    className={`flex items-center gap-3 rounded-2xl border p-4 ${
                      isAvailable
                        ? "border-emerald-100 bg-emerald-50"
                        : "border-slate-200 bg-slate-50 opacity-60"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                        isAvailable ? "bg-white" : "bg-slate-100"
                      }`}
                    >
                      {amenity.icon}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-slate-950">
                        {amenity.label}
                      </p>

                      <p
                        className={`text-sm ${
                          isAvailable ? "text-emerald-700" : "text-slate-500"
                        }`}
                      >
                        {isAvailable ? "Dostępne" : "Niedostępne"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="break-words text-xl font-bold text-slate-950">
                  Cennik
                </h2>

                {lake.priceListUrl && (
                  <a
                    href={lake.priceListUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-100 sm:w-auto"
                  >
                    Otwórz cennik
                  </a>
                )}
              </div>

              <div className="mt-5 space-y-3">
                {lake.priceList.filter((priceItem) => {
                  const normalizedItem = priceItem.toLowerCase().trim();

                  return (
                    !normalizedItem.startsWith("link do cennika") &&
                    !normalizedItem.includes("http://") &&
                    !normalizedItem.includes("https://")
                  );
                }).length > 0 ? (
                  lake.priceList
                    .filter((priceItem) => {
                      const normalizedItem = priceItem.toLowerCase().trim();

                      return (
                        !normalizedItem.startsWith("link do cennika") &&
                        !normalizedItem.includes("http://") &&
                        !normalizedItem.includes("https://")
                      );
                    })
                    .map((priceItem) => (
                      <div
                        key={priceItem}
                        className="min-w-0 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700"
                      >
                        <p className="break-words">{priceItem}</p>
                      </div>
                    ))
                ) : !lake.priceListUrl ? (
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                    Brak dodanego cennika.
                  </div>
                ) : null}

                {lake.priceListUrl && (
                  <div className="min-w-0 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                    <span className="text-slate-500">Link do cennika: </span>

                    <a
                      href={lake.priceListUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
                    >
                      Link
                    </a>
                  </div>
                )}
              </div>
            </section>

          <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="break-words text-xl font-bold text-slate-950">
                Zasady na łowisku
              </h2>

              {lake.rulesUrl && (
                <a
                  href={lake.rulesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-100 sm:w-auto"
                >
                  Otwórz regulamin
                </a>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {lake.rules.filter((rule) => {
                const normalizedRule = rule.toLowerCase().trim();

                return (
                  !normalizedRule.startsWith("link do regulaminu") &&
                  !normalizedRule.includes("http://") &&
                  !normalizedRule.includes("https://")
                );
              }).length > 0 ? (
                lake.rules
                  .filter((rule) => {
                    const normalizedRule = rule.toLowerCase().trim();

                    return (
                      !normalizedRule.startsWith("link do regulaminu") &&
                      !normalizedRule.includes("http://") &&
                      !normalizedRule.includes("https://")
                    );
                  })
                  .map((rule) => (
                    <div
                      key={rule}
                      className="flex min-w-0 gap-3 rounded-2xl bg-slate-50 p-4"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        ✓
                      </span>

                      <p className="min-w-0 break-words text-sm font-medium leading-6 text-slate-700">
                        {rule}
                      </p>
                    </div>
                  ))
              ) : !lake.rulesUrl ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                  Brak dodanych zasad łowiska.
                </div>
              ) : null}

              {lake.rulesUrl && (
                <div className="min-w-0 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                  <span className="text-slate-500">Link do regulaminu: </span>

                  <a
                    href={lake.rulesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
                  >
                    Link
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Oceń łowisko</h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Jak oceniasz to miejsce po swojej wizycie?
            </p>

            <div className="mt-5 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= (hoveredRating || userRating);

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    disabled={isRatingLoading || isLoadingUserData}
                    className={`text-4xl transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      isActive
                        ? "text-amber-400"
                        : "text-slate-200 hover:text-amber-300"
                    }`}
                    aria-label={`Oceń na ${star} gwiazdek`}
                  >
                    ★
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              {userRating > 0 ? (
                <p className="text-sm font-semibold text-slate-700">
                  Twoja ocena:{" "}
                  <span className="text-amber-500">{userRating}/5</span>
                </p>
              ) : (
                <p className="text-sm font-semibold text-slate-500">
                  Nie oceniono jeszcze tego łowiska.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Informacje o łowisku
            </h2>

            <div className="mt-5 space-y-4">
              <InfoRow label="Powierzchnia" value={lake.details.area} />
              <InfoRow
                label="Średnia głębokość"
                value={lake.details.averageDepth}
              />
              <InfoRow label="Rodzaj dna" value={lake.details.bottomType} />
              <InfoRow label="Typ wody" value={lake.details.waterType} />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Adres</h2>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">
                {lake.address.street}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {lake.address.postalCode} {lake.address.city}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                woj. {lake.address.voivodeship}
              </p>
            </div>

            <a
              href={getNavigationUrl(lake.lat, lake.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Prowadź w Google Maps
            </a>

            <Link
              href={`/wyprawy?lakeId=${lake.id}&lakeName=${encodeURIComponent(
                lake.name
              )}`}
              className="mt-3 flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Zaplanuj wyprawę na to łowisko
            </Link>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Kontakt</h2>

            <div className="mt-5 space-y-4">
              <InfoRow label="Nazwa" value={lake.contact.name} />
              <InfoRow label="Telefon" value={lake.contact.phone} />
              <InfoRow label="E-mail" value={lake.contact.email} />
              <InfoRow label="Strona" value={lake.contact.website} />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Zauważyłeś błąd?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Jeśli dane łowiska są nieaktualne, możesz zgłosić poprawkę
              administratorowi.
            </p>

            <LakeCorrectionReportButton lakeSlug={lake.slug} />
          </section>
        </aside>
      </div>

      {previewImage && previewImageIndex !== null && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 p-4"
          onClick={closePreview}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closePreview}
              className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Zamknij podgląd zdjęcia"
            >
              ×
            </button>

            {lake.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  className="absolute left-5 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-3xl font-bold text-slate-700 shadow-sm transition hover:bg-white"
                  aria-label="Poprzednie zdjęcie"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-5 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-3xl font-bold text-slate-700 shadow-sm transition hover:bg-white"
                  aria-label="Następne zdjęcie"
                >
                  ›
                </button>

                <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-slate-950/70 px-4 py-2 text-sm font-bold text-white">
                  {previewImageIndex + 1} / {lake.images.length}
                </div>
              </>
            )}

            <img
              src={previewImage}
              alt={`Zdjęcie łowiska ${lake.name}`}
              className="max-h-[85vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}

      {catchPreviewImage && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/80 p-4"
          onClick={() => setCatchPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setCatchPreviewImage(null)}
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Zamknij podgląd zdjęcia"
            >
              ×
            </button>

            <img
              src={catchPreviewImage.url}
              alt={catchPreviewImage.alt}
              className="max-h-[85vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-none last:pb-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-right text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function CatchRankingsSection({
  lake,
  onCatchImageClick,
}: {
  lake: LakeDto;
  onCatchImageClick: (
    item: LakeDto["catchRankings"]["byWeight"][number]
  ) => void;
}) {
  const hasWeightRanking = lake.catchRankings.byWeight.length > 0;
  const hasLengthRanking = lake.catchRankings.byLength.length > 0;

  if (!hasWeightRanking && !hasLengthRanking) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Ranking połowów na tym łowisku
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Na razie nie ma publicznych połowów ze zdjęciem dodanych do
              rankingu tego łowiska.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            Brak wyników
          </span>
        </div>

        <Link
          href="/polowy"
          className="mt-5 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Dodaj swój połów
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Ranking połowów na tym łowisku
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Do rankingu trafiają tylko publiczne połowy z wybranym łowiskiem,
            zdjęciem oraz podaną wagą lub długością.
          </p>
        </div>

        <Link
          href="/polowy"
          className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
        >
          Dodaj połów
        </Link>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <RankingCard
          title="Najcięższe ryby"
          description="TOP 5 według wagi"
          emptyText="Brak połowów z podaną wagą."
          type="weight"
          items={lake.catchRankings.byWeight}
          onCatchImageClick={onCatchImageClick}
        />

        <RankingCard
          title="Najdłuższe ryby"
          description="TOP 5 według długości"
          emptyText="Brak połowów z podaną długością."
          type="length"
          items={lake.catchRankings.byLength}
          onCatchImageClick={onCatchImageClick}
        />
      </div>
    </section>
  );
}

function RankingCard({
  title,
  description,
  emptyText,
  type,
  items,
  onCatchImageClick,
}: {
  title: string;
  description: string;
  emptyText: string;
  type: "weight" | "length";
  items: LakeDto["catchRankings"]["byWeight"];
  onCatchImageClick: (
    item: LakeDto["catchRankings"]["byWeight"][number]
  ) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <RankingItem
              key={`${type}-${item.id}`}
              item={item}
              place={index + 1}
              type={type}
              onImageClick={() => onCatchImageClick(item)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-5 text-sm font-semibold text-slate-500">
          {emptyText}
        </div>
      )}
    </div>
  );
}

function RankingItem({
  item,
  place,
  type,
  onImageClick,
}: {
  item: LakeDto["catchRankings"]["byWeight"][number];
  place: number;
  type: "weight" | "length";
  onImageClick: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 sm:grid-cols-[110px_1fr]">
        <button
          type="button"
          onClick={onImageClick}
          className="relative h-32 overflow-hidden bg-slate-100 text-left sm:h-full"
        >
          <img
            src={item.imageUrl}
            alt={`Połów: ${item.fishName}`}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
          />

          <div
            className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-sm font-black shadow-sm ${
              place === 1
                ? "bg-amber-400 text-white"
                : place === 2
                  ? "bg-slate-300 text-slate-950"
                  : place === 3
                    ? "bg-orange-300 text-white"
                    : "bg-white text-slate-950"
            }`}
          >
            {place}
          </div>
        </button>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-slate-950">{item.fishName}</h4>

                {place <= 3 && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      place === 1
                        ? "bg-amber-100 text-amber-700"
                        : place === 2
                          ? "bg-slate-200 text-slate-700"
                          : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {place === 1
                      ? "🥇 TOP 1"
                      : place === 2
                        ? "🥈 TOP 2"
                        : "🥉 TOP 3"}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                {getMethodLabel(item.method)}
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-600">
                Dodał:{" "}
                <Link
                  href={`/wedkarze/${item.userId}`}
                  className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                  {item.userName || "Użytkownik"}
                </Link>
              </p>
            </div>

            <div
              className={`rounded-2xl px-3 py-2 text-sm font-black ${
                place === 1
                  ? "bg-amber-50 text-amber-700"
                  : place === 2
                    ? "bg-slate-100 text-slate-700"
                    : place === 3
                      ? "bg-orange-50 text-orange-700"
                      : "bg-blue-50 text-blue-700"
              }`}
            >
              {type === "weight"
                ? item.weight !== null
                  ? `${item.weight.toFixed(2)} kg`
                  : "Brak"
                : item.length !== null
                  ? `${item.length.toFixed(0)} cm`
                  : "Brak"}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {item.weight !== null && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                Waga: {item.weight.toFixed(2)} kg
              </span>
            )}

            {item.length !== null && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                Długość: {item.length.toFixed(0)} cm
              </span>
            )}

            {item.bait && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {item.bait}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-400">
              {formatRankingDate(item.caughtAt)}
            </p>

            <CatchReportButton catchId={item.id} />
          </div>
        </div>
      </div>
    </article>
  );
}

function getMethodLabel(value: string) {
  if (value === "spinning") return "Spinning";
  if (value === "feeder") return "Feeder";
  if (value === "method_feeder") return "Method feeder";
  if (value === "carp") return "Karpiówka";
  if (value === "float") return "Spławik";
  if (value === "fly") return "Muchówka";
  if (value === "other") return "Inna metoda";
  return value;
}

function formatRankingDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}