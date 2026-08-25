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
  title: "Łowiska No Kill w Polsce – złów i wypuść | Rybio",
  description:
    "Sprawdź łowiska No Kill w Polsce. Przeglądaj miejsca działające w formule złów i wypuść, filtruj łowiska według lokalizacji, ryb, udogodnień i typu łowienia.",
  keywords: [
    "łowiska no kill",
    "łowiska no kill w Polsce",
    "złów i wypuść",
    "łowisko złów i wypuść",
    "no kill Polska",
    "łowiska karpiowe no kill",
    "łowiska komercyjne no kill",
    "etyczne wędkowanie",
    "baza łowisk no kill",
    "Rybio",
  ],
  alternates: {
    canonical: "/lowiska-no-kill",
  },
  openGraph: {
    title: "Łowiska No Kill w Polsce – złów i wypuść | Rybio",
    description:
      "Znajdź łowiska No Kill w Polsce. Sprawdzaj gatunki ryb, udogodnienia, lokalizację, zdjęcia i informacje przydatne przed wyprawą.",
    url: "/lowiska-no-kill",
    siteName: "Rybio",
    locale: "pl_PL",
    type: "website",
    images: [
      {
        url: "/og-lakes.jpg",
        width: 1200,
        height: 630,
        alt: "Łowiska No Kill w Polsce – Rybio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Łowiska No Kill w Polsce | Rybio",
    description:
      "Sprawdź bazę łowisk No Kill w Polsce i znajdź miejsce na wyprawę w formule złów i wypuść.",
    images: ["/og-lakes.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function NoKillLakesPage() {
  const lakes = await getLakes();

  const noKillLakes = lakes.filter((lake) => lake.amenities.noKill);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Łowiska No Kill w Polsce",
    description:
      "Publiczna baza łowisk No Kill w Polsce. Miejsca działające w formule złów i wypuść, łowiska komercyjne, karpiowe i rekreacyjne dla wędkarzy.",
    url: `${siteUrl}/lowiska-no-kill`,
    isPartOf: {
      "@type": "WebSite",
      name: "Rybio",
      url: siteUrl,
    },
    about: [
      "łowiska no kill",
      "złów i wypuść",
      "wędkarstwo no kill",
      "etyczne wędkowanie",
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
              Publiczna baza łowisk No Kill
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Łowiska No Kill – znajdź miejsce w formule złów i wypuść
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Szukasz łowiska No Kill, gdzie obowiązuje zasada złów i wypuść?
              Sprawdź publiczną bazę łowisk w Rybio i porównuj miejsca według
              lokalizacji, gatunków ryb, typu łowienia oraz udogodnień
              dostępnych dla wędkarzy.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lista-lowisk"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Przeglądaj łowiska No Kill
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
                value={String(noKillLakes.length)}
                label="łowisk No Kill"
              />
              <HeroStat value="Złów i wypuść" label="zasada łowienia" />
              <HeroStat value="Filtry" label="ryby i udogodnienia" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Łowiska No Kill w Polsce
            </h2>

            <div className="mt-4 space-y-4 leading-8 text-slate-600">
              <p>
                Łowiska No Kill to miejsca, w których ryby po złowieniu wracają
                do wody. Taka forma wędkowania jest wybierana przez osoby, które
                cenią sportowe podejście, ochronę rybostanu oraz możliwość
                regularnego łowienia dorodnych okazów w dobrych warunkach.
              </p>

              <p>
                Na tej stronie znajdziesz łowiska No Kill dostępne w bazie
                Rybio. Możesz dodatkowo filtrować je według rodzaju łowiska,
                typu łowienia, gatunków ryb oraz udogodnień, takich jak parking,
                pomost, wędkowanie nocne, domki, toaleta, sklep, altana czy
                możliwość płatności kartą.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-xl font-black text-blue-950">
              Chcesz zapisywać swoje wyniki?
            </h2>

            <p className="mt-3 text-sm leading-6 text-blue-800">
              Załóż konto w Rybio, dodawaj połowy ze zdjęciami, zapisuj
              ulubione łowiska No Kill, oceniaj miejsca i korzystaj z rankingów
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

      <PublicLakesPage lakes={noKillLakes} initialAmenities={["noKill"]} />

      <section className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">
            Jak wybrać dobre łowisko No Kill?
          </h2>

          <div className="mt-4 space-y-4 leading-8 text-slate-600">
            <p>
              Wybierając łowisko No Kill, warto sprawdzić regulamin, zasady
              obchodzenia się z rybami, wymagania dotyczące maty, podbieraka,
              odkażacza, haków bezzadziorowych oraz sposobu fotografowania ryb.
              Ważne są także gatunki ryb, wielkość zbiornika, stanowiska,
              cennik, możliwość rezerwacji i warunki dojazdu.
            </p>

            <p>
              Rybio pomaga zebrać te informacje w jednym miejscu. Dzięki temu
              możesz szybciej porównać łowiska No Kill, sprawdzić opis, zdjęcia,
              udogodnienia i zdecydować, gdzie warto zaplanować kolejną wyprawę
              w duchu złów i wypuść.
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