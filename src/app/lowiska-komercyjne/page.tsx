import type { Metadata } from "next";
import Link from "next/link";

import { getLakes } from "@/lib/lakes";
import { PublicLakesPage } from "@/components/public/PublicLakesPage";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

const siteUrl = "https://rybio.pl";

export const revalidate = 3600;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Łowiska komercyjne w Polsce – prywatne łowiska i stawy | Rybio",
  description:
    "Sprawdź łowiska komercyjne w Polsce. Znajdź prywatne łowiska, stawy wędkarskie i miejsca na karpia, amura, suma, szczupaka oraz weekendową wyprawę nad wodę.",
  keywords: [
    "łowiska komercyjne",
    "łowiska komercyjne w Polsce",
    "prywatne łowiska",
    "stawy komercyjne",
    "stawy wędkarskie",
    "łowisko komercyjne",
    "łowiska prywatne",
    "łowiska na karpia",
    "łowiska z noclegiem",
    "łowiska z rezerwacją",
    "baza łowisk komercyjnych",
    "Rybio",
  ],
  alternates: {
    canonical: "/lowiska-komercyjne",
  },
  openGraph: {
    title: "Łowiska komercyjne w Polsce – mapa i baza łowisk | Rybio",
    description:
      "Znajdź łowiska komercyjne w Polsce. Sprawdzaj lokalizację, gatunki ryb, udogodnienia, zdjęcia, regulamin i informacje przed wyprawą.",
    url: "/lowiska-komercyjne",
    siteName: "Rybio",
    locale: "pl_PL",
    type: "website",
    images: [
      {
        url: "/og-lakes.jpg",
        width: 1200,
        height: 630,
        alt: "Łowiska komercyjne w Polsce – Rybio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Łowiska komercyjne w Polsce | Rybio",
    description:
      "Sprawdź bazę łowisk komercyjnych w Polsce i znajdź miejsce na kolejną wyprawę wędkarską.",
    images: ["/og-lakes.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function CommercialLakesPage() {
  const lakes = await getLakes();

  const commercialLakes = lakes.filter((lake) => lake.type === "commercial");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Łowiska komercyjne w Polsce",
    description:
      "Publiczna baza łowisk komercyjnych w Polsce. Prywatne łowiska, stawy wędkarskie i miejsca na weekendowe wyprawy nad wodę.",
    url: `${siteUrl}/lowiska-komercyjne`,
    isPartOf: {
      "@type": "WebSite",
      name: "Rybio",
      url: siteUrl,
    },
    about: [
      "łowiska komercyjne",
      "prywatne łowiska",
      "stawy wędkarskie",
      "wyprawy wędkarskie",
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <PublicHeader subtitle="Łowiska w Polsce" />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),radial-gradient(circle_at_top_right,#ccfbf1,transparent_30%)]" />

        <div className="relative mx-auto max-w-[1500px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl">
            <p className="mb-5 inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
              Publiczna baza łowisk komercyjnych
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Łowiska komercyjne w Polsce – znajdź prywatne łowisko na wyprawę
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Szukasz łowiska komercyjnego na karpia, amura, suma, szczupaka
              albo spokojny weekend nad wodą? Sprawdź bazę prywatnych łowisk
              w Rybio i porównuj miejsca według lokalizacji, gatunków ryb,
              udogodnień oraz typu łowienia.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lista-lowisk"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Przeglądaj łowiska komercyjne
              </a>

              <Link
                href="/lowiska-w-polsce"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Zobacz wszystkie łowiska
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
              <HeroStat
                value={String(commercialLakes.length)}
                label="łowisk komercyjnych"
              />

              <HeroStat value="Prywatne" label="stawy i łowiska" />

              <HeroStat value="Filtry" label="ryby i udogodnienia" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Łowiska komercyjne w Polsce
            </h2>

            <div className="mt-4 space-y-4 leading-8 text-slate-600">
              <p>
                Łowiska komercyjne to prywatne lub zarządzane łowiska, na
                których wędkarze mogą łowić po wykupieniu wejściówki, doby,
                stanowiska albo zezwolenia zgodnego z regulaminem danego
                miejsca. Często są wybierane przez osoby, które szukają
                wygodnych stanowisk, czytelnych zasad, dobrego rybostanu i
                możliwości zaplanowania konkretnej wyprawy.
              </p>

              <p>
                Na tej stronie znajdziesz łowiska komercyjne dostępne w bazie
                Rybio. Możesz filtrować je według województwa, typu łowienia,
                gatunków ryb i udogodnień, takich jak domki, parking, toaleta,
                pomost, sklep, altana, łowienie nocne czy możliwość płatności
                kartą.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-xl font-black text-blue-950">
              Planujesz częste wyprawy?
            </h2>

            <p className="mt-3 text-sm leading-6 text-blue-800">
              Załóż konto w Rybio, zapisuj ulubione łowiska, dodawaj połowy ze
              zdjęciami, oceniaj miejsca i twórz własny dziennik wędkarski.
            </p>

            <div className="mt-5 grid gap-3">
              <Link
                href="/register"
                className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
              >
                Załóż konto
              </Link>

              <Link
                href="/login"
                className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-blue-700 transition hover:bg-blue-100"
              >
                Zaloguj się
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicLakesPage
        lakes={commercialLakes}
        initialOwnerType="commercial"
      />

      <section className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">
            Jak wybrać dobre łowisko komercyjne?
          </h2>

          <div className="mt-4 space-y-4 leading-8 text-slate-600">
            <p>
              Przed wyjazdem na łowisko komercyjne warto sprawdzić regulamin,
              cennik, godziny otwarcia, zasady rezerwacji stanowisk, możliwość
              łowienia nocą, dostępne gatunki ryb oraz wymagany sprzęt. Dla
              wielu wędkarzy ważne są także udogodnienia na miejscu, takie jak
              parking, toaleta, domki, pole namiotowe, gastronomia czy pomosty.
            </p>

            <p>
              Rybio pomaga zebrać te informacje w jednym miejscu. Dzięki temu
              możesz szybciej porównać łowiska komercyjne, sprawdzić opis,
              zdjęcia, udogodnienia i zdecydować, gdzie warto zaplanować
              kolejną wyprawę nad wodę.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}