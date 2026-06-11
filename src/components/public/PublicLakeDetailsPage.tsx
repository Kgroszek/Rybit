"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import type { LakeDto } from "@/lib/lakes";

type RecommendedLake = LakeDto & {
  nearbyDistanceInKm?: number;
};

type PublicLakeDetailsPageProps = {
  lake: LakeDto;
  recommendedLakes?: RecommendedLake[];
};

const amenitiesLabels = [
  { key: "cottages", label: "Domki na terenie łowiska", icon: "🏠" },
  { key: "campfire", label: "Możliwość rozpalenia ogniska", icon: "🔥" },
  { key: "noKill", label: "No Kill", icon: "♻️" },
  { key: "tent", label: "Możliwość rozłożenia namiotu", icon: "⛺" },
  { key: "parking", label: "Parking", icon: "🅿️" },
  { key: "pier", label: "Pomost", icon: "🌉" },
  { key: "toilet", label: "Toaleta", icon: "🚻" },
  { key: "shop", label: "Sklep / punkt sprzedaży", icon: "🛒" },
  { key: "nightFishing", label: "Wędkowanie nocne", icon: "🌙" },
  { key: "boatRental", label: "Wypożyczalnia łodzi", icon: "🚤" },
  { key: "gearRental", label: "Wypożyczalnia sprzętu", icon: "🎒" },
  { key: "shelter", label: "Altana", icon: "🏕️" },
  { key: "coveredSpots", label: "Zadaszone stanowiska", icon: "☂️" },
  { key: "playground", label: "Plac zabaw", icon: "🛝" },
  { key: "cardPayment", label: "Płatność kartą", icon: "💳" },
] as const;

export function PublicLakeDetailsPage({
  lake,
  recommendedLakes = [],
}: PublicLakeDetailsPageProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [brokenGalleryImages, setBrokenGalleryImages] = useState<string[]>([]);
  const [authModalType, setAuthModalType] = useState<
    "rating" | "favourite" | "ranking" | null
  >(null);

  const visibleGalleryImages = lake.images.filter(
    (image) => !brokenGalleryImages.includes(image)
  );

  const cleanRules = lake.rules
    .map((rule) => cleanListItemText(rule))
    .filter(Boolean);

  const cleanPriceList = lake.priceList
    .map((item) => cleanListItemText(item))
    .filter(Boolean);

  return (
    <>
      <div className="mx-auto w-full max-w-[1500px] overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 min-w-0">
          <Link
            href="/lowiska-w-polsce"
            className="break-words text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            ← Wróć do publicznej listy łowisk
          </Link>
        </div>

        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="min-h-[420px] bg-gradient-to-br from-emerald-100 via-blue-100 to-sky-200 p-4 sm:min-h-[360px] sm:p-6">
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${
                  lake.type === "commercial"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {getOwnerTypeLabel(lake.type)}
              </span>

              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-600 shadow-sm">
                {getFishingTypeLabel(lake.fishingType)}
              </span>
            </div>

            <div className="mt-28 rounded-3xl bg-white/85 p-4 shadow-sm backdrop-blur sm:mt-32 sm:p-6 lg:mt-36">
              <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="min-w-0">
                  <h1 className="break-words text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                    {lake.name}
                  </h1>

                  <p className="mt-3 max-w-3xl break-words text-sm leading-6 text-slate-600 sm:text-base">
                    {lake.address.street}, {lake.address.postalCode}{" "}
                    {lake.address.city}, woj. {lake.address.voivodeship}
                  </p>
                </div>

                <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-2 xl:shrink-0">
                  <button
                    type="button"
                    onClick={() => setAuthModalType("favourite")}
                    className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    ♡ Dodaj do ulubionych
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthModalType("rating")}
                    className="w-full rounded-2xl bg-blue-50 px-5 py-3 text-lg font-black text-blue-700 transition hover:bg-blue-100"
                  >
                    ★ {Number(lake.rating || 0).toFixed(1)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {lake.images.length > 0 && (
          <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Galeria zdjęć łowiska
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Zdjęcia dodane do profilu łowiska. Kliknij zdjęcie, aby
                  powiększyć.
                </p>
              </div>

              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                {visibleGalleryImages.length} zdjęć
              </span>
            </div>

            {visibleGalleryImages.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {visibleGalleryImages.map((image, index) => (
                  <LakeGalleryImage
                    key={`${image}-${index}`}
                    image={image}
                    lakeName={lake.name}
                    onClick={() => setPreviewImage(image)}
                    onImageError={() => {
                      setBrokenGalleryImages((current) =>
                        current.includes(image) ? current : [...current, image]
                      );
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5 flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50 px-6 text-center">
                <p className="text-base font-black text-slate-800">
                  Brak zdjęć łowiska
                </p>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Do tego łowiska nie dodano jeszcze zdjęć albo przesłane
                  zdjęcia są chwilowo niedostępne.
                </p>
              </div>
            )}
          </section>
        )}

        <section className="mb-6 overflow-hidden rounded-3xl border border-blue-100 bg-blue-50 p-4 sm:p-6">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-black text-blue-950">
                Rankingi połowów są dostępne po zalogowaniu
              </h2>

              <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-blue-800">
                Na publicznej stronie pokazujemy podstawowe informacje o
                łowisku. Załóż konto, aby zobaczyć rankingi, dodawać połowy,
                oceniać łowiska i zapisywać ulubione miejsca.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:shrink-0">
              <Link
                href="/register"
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
              >
                Załóż konto
              </Link>

              <Link
                href="/login"
                className="w-full rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-blue-700 transition hover:bg-blue-100"
              >
                Zaloguj się
              </Link>
            </div>
          </div>
        </section>

        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            <Section title="Opis łowiska">
              <p className="break-words leading-7 text-slate-600">
                {lake.description}
              </p>
            </Section>

            <Section title="Ryby występujące na łowisku">
              {lake.fishSpecies.length > 0 ? (
                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {lake.fishSpecies.map((fish) => (
                    <div
                      key={fish}
                      className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                        🐟
                      </div>

                      <div className="min-w-0">
                        <p className="break-words font-black text-slate-950">
                          {fish}
                        </p>

                        <p className="text-sm text-slate-500">Występuje</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                  {lake.fish || "Brak informacji o gatunkach ryb."}
                </div>
              )}
            </Section>

            <Section title="Udogodnienia">
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                {amenitiesLabels.map((amenity) => {
                  const isAvailable = lake.amenities[amenity.key];

                  return (
                    <div
                      key={amenity.key}
                      className={`flex min-w-0 items-center gap-3 rounded-2xl border p-4 ${
                        isAvailable
                          ? "border-emerald-100 bg-emerald-50"
                          : "border-slate-200 bg-slate-50 opacity-60"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${
                          isAvailable ? "bg-white" : "bg-slate-100"
                        }`}
                      >
                        {amenity.icon}
                      </div>

                      <div className="min-w-0">
                        <p className="break-words font-bold text-slate-950">
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
            </Section>

            <Section title="Cennik">
              {cleanPriceList.length > 0 ? (
                <div className="rounded-2xl bg-slate-50 px-5 py-5">
                  <p className="whitespace-pre-line break-words text-sm font-medium leading-7 text-slate-700">
                    {cleanPriceList.join("\n")}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                  Brak dodanego cennika.
                </div>
              )}
            </Section>

            <Section title="Zasady na łowisku">
              {cleanRules.length > 0 ? (
                <div className="rounded-2xl bg-slate-50 px-5 py-5">
                  <p className="whitespace-pre-line break-words text-sm font-medium leading-7 text-slate-700">
                    {cleanRules.join("\n")}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                  Brak dodanych zasad łowiska.
                </div>
              )}
            </Section>
          </div>

          <aside className="min-w-0 space-y-6">
            <Section title="Informacje o łowisku">
              <div className="space-y-4">
                <InfoRow label="Powierzchnia" value={lake.details.area} />
                <InfoRow
                  label="Średnia głębokość"
                  value={lake.details.averageDepth}
                />
                <InfoRow label="Rodzaj dna" value={lake.details.bottomType} />
                <InfoRow label="Typ wody" value={lake.details.waterType} />
              </div>
            </Section>

            <Section title="Adres">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="break-words font-bold text-slate-950">
                  {lake.address.street}
                </p>

                <p className="mt-1 break-words text-sm text-slate-600">
                  {lake.address.postalCode} {lake.address.city}
                </p>

                <p className="mt-1 break-words text-sm text-slate-600">
                  woj. {lake.address.voivodeship}
                </p>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lake.lat},${lake.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center break-words rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Prowadź w Google Maps
              </a>
            </Section>

            <Section title="Kontakt">
              <div className="space-y-4">
                <InfoRow label="Nazwa" value={lake.contact.name} />
                <InfoRow label="Telefon" value={lake.contact.phone} />
                <InfoRow label="E-mail" value={lake.contact.email} />
                <InfoRow label="Strona" value={lake.contact.website} />
              </div>
            </Section>
          </aside>
        </div>

        {recommendedLakes.length > 0 && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
                  Łowiska w pobliżu
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Inne łowiska w okolicy {lake.address.city}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Zobacz 3 inne miejsca do wędkowania w pobliżu. Porównaj typ
                  łowiska, gatunki ryb, udogodnienia i lokalizację przed kolejną
                  wyprawą.
                </p>
              </div>

              <Link
                href="/lowiska-w-polsce"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Zobacz wszystkie łowiska
              </Link>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {recommendedLakes.map((recommendedLake) => (
                <RecommendedLakeCard
                  key={recommendedLake.id}
                  lake={recommendedLake}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-slate-950/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Zamknij podgląd zdjęcia"
            >
              ×
            </button>

            <img
              src={previewImage}
              alt={`Zdjęcie łowiska ${lake.name}`}
              className="max-h-[85vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}

      {authModalType && (
        <AuthModal type={authModalType} onClose={() => setAuthModalType(null)} />
      )}
    </>
  );
}

function RecommendedLakeCard({ lake }: { lake: RecommendedLake }) {
  const image = lake.images[0];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-44 bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={`${lake.name} – łowisko w ${lake.address.city}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-50 px-6 text-center">
            <div>
              <p className="text-sm font-black text-slate-700">Brak zdjęcia</p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Szczegóły znajdziesz po wejściu w łowisko.
              </p>
            </div>
          </div>
        )}

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
        <h3 className="line-clamp-2 break-words text-xl font-black text-slate-950">
          {lake.name}
        </h3>

        <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-500">
          {lake.address.city}, woj. {lake.address.voivodeship}
        </p>

        <p className="mt-4 line-clamp-2 min-h-[48px] text-sm leading-6 text-slate-500">
          {lake.fishSpecies.length > 0
            ? lake.fishSpecies.slice(0, 6).join(", ")
            : lake.fish || "Brak informacji o rybach"}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {lake.amenities.noKill && <SmallRecommendedBadge label="No Kill" />}
          {lake.amenities.parking && <SmallRecommendedBadge label="Parking" />}
          {lake.amenities.nightFishing && (
            <SmallRecommendedBadge label="Nocka" />
          )}
          {lake.amenities.cottages && <SmallRecommendedBadge label="Domki" />}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <p className="text-sm font-bold text-slate-500">
            {typeof lake.nearbyDistanceInKm === "number"
              ? `${lake.nearbyDistanceInKm.toFixed(1)} km`
              : "W pobliżu"}
          </p>

          <Link
            href={`/lowiska-w-polsce/${lake.slug}`}
            className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700"
          >
            Szczegóły
          </Link>
        </div>
      </div>
    </article>
  );
}

function SmallRecommendedBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      {label}
    </span>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="break-words text-xl font-black text-slate-950">{title}</h2>
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const cleanValue = String(value || "").trim();
  const isEmpty =
    !cleanValue ||
    cleanValue.toLowerCase() === "brak" ||
    cleanValue.toLowerCase() === "brak danych";

  const normalizedLabel = label.toLowerCase();

  let content: ReactNode = isEmpty ? (
    "Brak danych"
  ) : (
    cleanValue
  );

  if (!isEmpty && normalizedLabel === "strona") {
    const websiteUrl = getWebsiteUrl(cleanValue);

    content = (
      <a
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-blue-600 underline-offset-4 transition hover:text-blue-700 hover:underline"
      >
        {cleanValue}
      </a>
    );
  }

  if (!isEmpty && normalizedLabel === "e-mail") {
    content = (
      <a
        href={`mailto:${cleanValue}`}
        className="break-all text-blue-600 underline-offset-4 transition hover:text-blue-700 hover:underline"
      >
        {cleanValue}
      </a>
    );
  }

  if (!isEmpty && normalizedLabel === "telefon") {
    const phoneHref = cleanValue.replace(/\s+/g, "");

    content = (
      <a
        href={`tel:${phoneHref}`}
        className="break-all text-blue-600 underline-offset-4 transition hover:text-blue-700 hover:underline"
      >
        {cleanValue}
      </a>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-slate-100 pb-4 last:border-none last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="break-words text-sm font-bold text-slate-950 sm:max-w-[60%] sm:text-right">
        {content}
      </p>
    </div>
  );
}

function getWebsiteUrl(value: string) {
  const cleanValue = value.trim();

  if (/^https?:\/\//i.test(cleanValue)) {
    return cleanValue;
  }

  return `https://${cleanValue}`;
}

function AuthModal({
  type,
  onClose,
}: {
  type: "rating" | "favourite" | "ranking";
  onClose: () => void;
}) {
  const title =
    type === "rating"
      ? "Chcesz ocenić to łowisko?"
      : type === "favourite"
        ? "Chcesz dodać łowisko do ulubionych?"
        : "Chcesz zobaczyć rankingi połowów?";

  const description =
    type === "rating"
      ? "Oceny łowisk są dostępne dla zalogowanych użytkowników. Załóż konto, oceniaj miejsca i pomagaj innym wędkarzom."
      : type === "favourite"
        ? "Ulubione łowiska są dostępne po zalogowaniu. Załóż konto i zapisuj miejsca na kolejne wyprawy."
        : "Rankingi połowów są dostępne po zalogowaniu. Dołącz do Rybio, dodawaj połowy i rywalizuj z innymi wędkarzami.";

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center overflow-hidden bg-slate-950/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="break-words text-2xl font-black text-slate-950">
          {title}
        </h2>

        <p className="mt-3 break-words leading-7 text-slate-600">
          {description}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/register"
            className="flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Załóż konto
          </Link>

          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Zaloguj się
          </Link>
        </div>
      </div>
    </div>
  );
}

function getOwnerTypeLabel(type: string) {
  if (type === "pzw") return "Łowisko PZW";
  if (type === "commercial") return "Łowisko komercyjne";
  return "Inne łowisko";
}

function getFishingTypeLabel(type: string) {
  if (type === "carp") return "Karpiowe";
  if (type === "spinning") return "Spinningowe";
  return "Ogólne";
}

function LakeGalleryImage({
  image,
  lakeName,
  onClick,
  onImageError,
}: {
  image: string;
  lakeName: string;
  onClick: () => void;
  onImageError: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group block h-48 w-full overflow-hidden rounded-2xl bg-slate-100 text-left"
      aria-label={`Powiększ zdjęcie łowiska ${lakeName}`}
    >
      <img
        src={image}
        alt={`Zdjęcie łowiska ${lakeName}`}
        onError={onImageError}
        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
    </button>
  );
}

function cleanListItemText(value: string) {
  return value
    .trim()
    .replace(/^[-–—•●▪▫]\s*/g, "")
    .replace(/^\*\s*/g, "")
    .replace(/^\d+[.)]\s*/g, "")
    .replace(/^[a-zA-Z][.)]\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}