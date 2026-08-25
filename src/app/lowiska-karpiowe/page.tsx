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
  title: "Łowiska karpiowe w Polsce – mapa, baza i miejsca na karpia | Rybio",
  description:
    "Sprawdź łowiska karpiowe w Polsce. Znajdź miejsca na karpia, zasiadkę lub method feeder. Przeglądaj łowiska według lokalizacji, ryb, udogodnień i typu łowienia.",
  keywords: [
    "łowiska karpiowe",
    "łowiska karpiowe w Polsce",
    "łowisko na karpia",
    "gdzie na karpia",
    "karp łowisko",
    "łowiska na zasiadkę",
    "łowiska method feeder",
    "łowiska komercyjne karpiowe",
    "baza łowisk karpiowych",
    "Rybio",
  ],
  alternates: {
    canonical: "/lowiska-karpiowe",
  },
  openGraph: {
    title: "Łowiska karpiowe w Polsce – mapa i baza łowisk | Rybio",
    description:
      "Znajdź łowiska karpiowe w Polsce. Sprawdzaj gatunki ryb, udogodnienia, lokalizację, zdjęcia i informacje przydatne przed zasiadką na karpia.",
    url: "/lowiska-karpiowe",
    siteName: "Rybio",
    locale: "pl_PL",
    type: "website",
    images: [
      {
        url: "/og-lakes.jpg",
        width: 1200,
        height: 630,
        alt: "Łowiska karpiowe w Polsce – Rybio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Łowiska karpiowe w Polsce | Rybio",
    description:
      "Sprawdź bazę łowisk karpiowych w Polsce i znajdź miejsce na kolejną zasiadkę.",
    images: ["/og-lakes.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function CarpLakesPage() {
  const lakes = await getLakes();

  const carpLakes = lakes.filter((lake) => lake.fishingType === "carp");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Łowiska karpiowe w Polsce",
    description:
      "Publiczna baza łowisk karpiowych w Polsce. Miejsca na karpia, zasiadkę, method feeder i weekendowe wyprawy wędkarskie.",
    url: `${siteUrl}/lowiska-karpiowe`,
    isPartOf: {
      "@type": "WebSite",
      name: "Rybio",
      url: siteUrl,
    },
    about: [
      "łowiska karpiowe",
      "łowiska na karpia",
      "wędkarstwo karpiowe",
      "zasiadka karpiowa",
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
              Publiczna baza łowisk karpiowych
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Łowiska karpiowe – znajdź miejsce na karpia w Polsce
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Szukasz łowiska karpiowego na zasiadkę, method feeder albo
              weekendowy wyjazd nad wodę? Sprawdź publiczną bazę łowisk
              karpiowych w Rybio, porównuj miejsca według lokalizacji,
              gatunków ryb, udogodnień i typu łowienia.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lista-lowisk"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Przeglądaj łowiska karpiowe
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
                value={String(carpLakes.length)}
                label="łowisk karpiowych"
              />
              <HeroStat value="Karp" label="główny gatunek" />
              <HeroStat value="Filtry" label="ryby i udogodnienia" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Łowiska karpiowe w Polsce
            </h2>

            <div className="mt-4 space-y-4 leading-8 text-slate-600">
              <p>
                Łowiska karpiowe są popularnym wyborem wśród wędkarzy, którzy
                planują dłuższe zasiadki, weekendowe wyjazdy albo wyprawy
                nastawione na większe ryby. Dobre łowisko na karpia powinno
                mieć jasny regulamin, wygodne stanowiska, przejrzysty cennik
                oraz informacje o rybostanie i zasadach wędkowania.
              </p>

              <p>
                Na tej stronie znajdziesz łowiska karpiowe dostępne w bazie
                Rybio. Możesz dodatkowo filtrować miejsca według województwa,
                rodzaju łowiska, gatunków ryb i udogodnień, takich jak domki,
                parking, pomost, toaleta, sklep, altana, wędkowanie nocne czy
                płatność kartą.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-xl font-black text-blue-950">
              Chcesz zapisywać karpiowe wyniki?
            </h2>

            <p className="mt-3 text-sm leading-6 text-blue-800">
              Załóż konto w Rybio, dodawaj połowy ze zdjęciami, zapisuj
              ulubione łowiska karpiowe, oceniaj miejsca i korzystaj z
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

      <PublicLakesPage lakes={carpLakes} initialFishingType="carp" />

      <section className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">
            Jak wybrać dobre łowisko karpiowe?
          </h2>

          <div className="mt-4 space-y-4 leading-8 text-slate-600">
            <p>
              Wybierając łowisko karpiowe, warto sprawdzić przede wszystkim
              regulamin, cennik, wielkość zbiornika, dostępne stanowiska,
              możliwość rezerwacji, zasady nocnego wędkowania i informacje o
              rybostanie. Dla wielu karpiarzy ważne są także domki, możliwość
              rozbicia namiotu, parking blisko stanowiska, sanitariaty oraz
              spokojne warunki na dłuższą zasiadkę.
            </p>

            <p>
              Rybio pomaga zebrać te informacje w jednym miejscu. Dzięki temu
              możesz szybciej porównać łowiska karpiowe, sprawdzić opis,
              zdjęcia, udogodnienia i zdecydować, gdzie warto zaplanować
              kolejną zasiadkę na karpia.
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