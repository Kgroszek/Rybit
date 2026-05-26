import type { Metadata } from "next";
import Link from "next/link";
import { getLakes } from "@/lib/lakes";
import { PublicLakesPage } from "@/components/public/PublicLakesPage";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

const siteUrl = "https://rybio.pl";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Łowiska z noclegiem w Polsce – wyprawy wędkarskie | Rybio",
  description:
    "Sprawdź łowiska z noclegiem w Polsce. Znajdź miejsca na weekendową wyprawę, dłuższą zasiadkę lub rodzinny wyjazd nad wodę.",
  keywords: [
    "łowiska z noclegiem",
    "łowiska z domkami",
    "łowiska z noclegiem w Polsce",
    "łowisko z noclegiem",
    "łowisko z domkiem",
    "łowiska na weekend",
    "łowiska na zasiadkę",
    "łowiska karpiowe z noclegiem",
    "łowiska komercyjne z noclegiem",
    "baza łowisk z noclegiem",
    "Rybio",
  ],
  alternates: {
    canonical: "/lowiska-z-noclegiem",
  },
  openGraph: {
    title: "Łowiska z noclegiem w Polsce – wyprawy wędkarskie | Rybio",
    description:
      "Znajdź łowiska z noclegiem i zapleczem na dłuższy wyjazd. Sprawdzaj gatunki ryb, udogodnienia, lokalizację i informacje przed wyprawą.",
    url: "/lowiska-z-noclegiem",
    siteName: "Rybio",
    locale: "pl_PL",
    type: "website",
    images: [
      {
        url: "/og-lakes.jpg",
        width: 1200,
        height: 630,
        alt: "Łowiska z noclegiem w Polsce – Rybio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Łowiska z noclegiem w Polsce | Rybio",
    description:
      "Sprawdź bazę łowisk z noclegiem i znajdź miejsce na weekendową wyprawę wędkarską.",
    images: ["/og-lakes.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function LakesWithAccommodationPage() {
  const lakes = await getLakes();

  const lakesWithAccommodation = lakes.filter((lake) => {
    const searchableText = [
      lake.description,
      lake.fish,
      ...lake.fishSpecies,
    ]
      .join(" ")
      .toLowerCase();

    return (
      lake.amenities.cottages ||
      searchableText.includes("nocleg") ||
      searchableText.includes("noclegi") ||
      searchableText.includes("domek") ||
      searchableText.includes("domki") ||
      searchableText.includes("apartament") ||
      searchableText.includes("pokoje")
    );
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Łowiska z noclegiem w Polsce",
    description:
      "Publiczna baza łowisk z noclegiem w Polsce. Miejsca na weekendowe wyprawy, dłuższe zasiadki i rodzinne wyjazdy wędkarskie.",
    url: `${siteUrl}/lowiska-z-noclegiem`,
    isPartOf: {
      "@type": "WebSite",
      name: "Rybio",
      url: siteUrl,
    },
    about: [
      "łowiska z noclegiem",
      "łowiska z domkami",
      "wyprawy wędkarskie",
      "zasiadka wędkarska",
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

      <PublicHeader />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),radial-gradient(circle_at_top_right,#ccfbf1,transparent_30%)]" />

        <div className="relative mx-auto max-w-[1500px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl">
            <p className="mb-5 inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
              Publiczna baza łowisk z noclegiem
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Łowiska z noclegiem – znajdź miejsce na dłuższą wyprawę nad wodę
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Szukasz łowiska z noclegiem na weekend, dłuższą zasiadkę albo
              rodzinny wyjazd nad wodę? Sprawdź publiczną bazę łowisk w Rybio i
              porównuj miejsca według lokalizacji, gatunków ryb, typu łowienia
              oraz dostępnych udogodnień.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lista-lowisk"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Przeglądaj łowiska z noclegiem
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
                value={String(lakesWithAccommodation.length)}
                label="łowisk z noclegiem"
              />
              <HeroStat value="Nocleg" label="na weekend i zasiadkę" />
              <HeroStat value="Filtry" label="ryby i udogodnienia" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Łowiska z noclegiem w Polsce
            </h2>

            <div className="mt-4 space-y-4 leading-8 text-slate-600">
              <p>
                Łowiska z noclegiem to dobre rozwiązanie dla wędkarzy, którzy
                planują dłuższy pobyt nad wodą. Sprawdzają się przy weekendowej
                zasiadce, wyprawie karpiowej, rodzinnych wyjazdach oraz
                sytuacjach, gdy chcesz spokojnie przygotować sprzęt i spędzić
                więcej czasu przy wybranym zbiorniku.
              </p>

              <p>
                Na tej stronie znajdziesz łowiska z noclegiem dostępne w bazie
                Rybio. Możesz dodatkowo filtrować je według rodzaju łowiska,
                typu łowienia, gatunków ryb oraz udogodnień, takich jak domki,
                parking, pomost, wędkowanie nocne, toaleta, sklep, altana czy
                możliwość płatności kartą.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-xl font-black text-blue-950">
              Planujesz dłuższy wyjazd?
            </h2>

            <p className="mt-3 text-sm leading-6 text-blue-800">
              Załóż konto w Rybio, zapisuj ulubione łowiska z noclegiem,
              dodawaj połowy ze zdjęciami, oceniaj miejsca i korzystaj z
              rankingów największych oraz najdłuższych ryb.
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
        lakes={lakesWithAccommodation}
        initialAmenities={["cottages"]}
      />

      <section className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">
            Jak wybrać dobre łowisko z noclegiem?
          </h2>

          <div className="mt-4 space-y-4 leading-8 text-slate-600">
            <p>
              Wybierając łowisko z noclegiem, warto sprawdzić rodzaj dostępnego
              zakwaterowania, zasady rezerwacji, cennik, godziny łowienia oraz
              możliwość wędkowania nocnego. Ważne są także gatunki ryb, warunki
              na stanowiskach, dostęp do parkingu, toalety, pomostów, sklepu z
              przynętami oraz spokojne otoczenie.
            </p>

            <p>
              Rybio pomaga zebrać te informacje w jednym miejscu. Dzięki temu
              możesz szybciej porównać łowiska z noclegiem, sprawdzić opis,
              zdjęcia, udogodnienia i zdecydować, gdzie warto zaplanować
              weekendową wyprawę wędkarską albo dłuższą zasiadkę.
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