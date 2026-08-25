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
  title: "Łowiska z domkami w Polsce – nocleg i wyprawy wędkarskie | Rybio",
  description:
    "Sprawdź łowiska z domkami w Polsce. Znajdź miejsca z noclegiem na weekendową zasiadkę, rodzinny wyjazd lub dłuższą wyprawę wędkarską.",
  keywords: [
    "łowiska z domkami",
    "łowiska z noclegiem",
    "łowiska z domkami w Polsce",
    "łowisko z domkiem",
    "łowisko z noclegiem",
    "łowiska na weekend",
    "łowiska na zasiadkę",
    "łowiska karpiowe z domkami",
    "łowiska komercyjne z domkami",
    "baza łowisk z noclegiem",
    "Rybio",
  ],
  alternates: {
    canonical: "/lowiska-z-domkami",
  },
  openGraph: {
    title: "Łowiska z domkami w Polsce – nocleg i wyprawy | Rybio",
    description:
      "Znajdź łowiska z domkami i noclegiem. Sprawdzaj gatunki ryb, udogodnienia, lokalizację, zdjęcia i informacje przydatne przed wyjazdem.",
    url: "/lowiska-z-domkami",
    siteName: "Rybio",
    locale: "pl_PL",
    type: "website",
    images: [
      {
        url: "/og-lakes.jpg",
        width: 1200,
        height: 630,
        alt: "Łowiska z domkami w Polsce – Rybio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Łowiska z domkami w Polsce | Rybio",
    description:
      "Sprawdź bazę łowisk z domkami i znajdź miejsce na weekendową wyprawę wędkarską.",
    images: ["/og-lakes.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function LakesWithCottagesPage() {
  const lakes = await getLakes();

  const lakesWithCottages = lakes.filter((lake) => lake.amenities.cottages);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Łowiska z domkami w Polsce",
    description:
      "Publiczna baza łowisk z domkami i noclegiem w Polsce. Miejsca na weekendowe wyprawy, dłuższe zasiadki i rodzinne wyjazdy wędkarskie.",
    url: `${siteUrl}/lowiska-z-domkami`,
    isPartOf: {
      "@type": "WebSite",
      name: "Rybio",
      url: siteUrl,
    },
    about: [
      "łowiska z domkami",
      "łowiska z noclegiem",
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
              Publiczna baza łowisk z domkami i noclegiem
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Łowiska z domkami – znajdź miejsce na dłuższą wyprawę wędkarską
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Szukasz łowiska z domkami, noclegiem lub wygodnym zapleczem na
              weekendową zasiadkę? Sprawdź publiczną bazę łowisk w Rybio i
              porównuj miejsca według gatunków ryb, typu łowienia, lokalizacji
              oraz udogodnień dostępnych dla wędkarzy.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lista-lowisk"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Przeglądaj łowiska z domkami
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
                value={String(lakesWithCottages.length)}
                label="łowisk z domkami"
              />
              <HeroStat value="Nocleg" label="na dłuższe wyprawy" />
              <HeroStat value="Filtry" label="ryby i udogodnienia" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Łowiska z domkami w Polsce
            </h2>

            <div className="mt-4 space-y-4 leading-8 text-slate-600">
              <p>
                Łowiska z domkami to dobry wybór dla osób, które planują dłuższą
                zasiadkę, weekendowy wyjazd nad wodę albo rodzinny pobyt
                połączony z wędkowaniem. Dzięki domkom i zapleczu noclegowemu
                można wygodniej przygotować sprzęt, odpocząć po łowieniu i
                spędzić więcej czasu nad wybranym zbiornikiem.
              </p>

              <p>
                Na tej stronie znajdziesz łowiska z domkami dostępne w bazie
                Rybio. Możesz dodatkowo filtrować je według rodzaju łowiska,
                typu łowienia, gatunku ryb oraz innych udogodnień, takich jak
                parking, pomost, wędkowanie nocne, toaleta, sklep, altana czy
                możliwość płatności kartą.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-xl font-black text-blue-950">
              Planujesz dłuższą zasiadkę?
            </h2>

            <p className="mt-3 text-sm leading-6 text-blue-800">
              Załóż konto w Rybio, zapisuj ulubione łowiska z domkami, dodawaj
              połowy ze zdjęciami, oceniaj miejsca i korzystaj z rankingów
              największych oraz najdłuższych ryb.
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
        lakes={lakesWithCottages}
        initialAmenities={["cottages"]}
      />

      <section className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">
            Jak wybrać dobre łowisko z domkami?
          </h2>

          <div className="mt-4 space-y-4 leading-8 text-slate-600">
            <p>
              Wybierając łowisko z domkami, warto sprawdzić nie tylko dostępność
              noclegu, ale też regulamin, cennik, zasady rezerwacji, godziny
              łowienia i możliwość wędkowania nocnego. Duże znaczenie mają także
              gatunki ryb, warunki na stanowiskach, dostęp do parkingu, toalety,
              pomostów oraz ewentualnego sklepu z przynętami.
            </p>

            <p>
              Rybio pomaga zebrać te informacje w jednym miejscu. Dzięki temu
              możesz szybciej porównać łowiska z domkami, sprawdzić opis,
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