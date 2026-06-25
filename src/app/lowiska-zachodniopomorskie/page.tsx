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
  title:
    "Łowiska zachodniopomorskie – łowiska w województwie zachodniopomorskim | Rybio",
  description:
    "Sprawdź łowiska w województwie zachodniopomorskim. Przeglądaj łowiska zachodniopomorskie, filtruj miejsca według typu łowiska, gatunków ryb, udogodnień i lokalizacji.",
  keywords: [
    "łowiska zachodniopomorskie",
    "łowiska w województwie zachodniopomorskim",
    "gdzie na ryby zachodniopomorskie",
    "łowiska komercyjne zachodniopomorskie",
    "łowiska karpiowe zachodniopomorskie",
    "łowiska PZW zachodniopomorskie",
    "wędkarstwo zachodniopomorskie",
    "łowiska Pomorze Zachodnie",
    "łowiska Szczecin",
    "łowiska Koszalin",
    "łowiska Kołobrzeg",
    "łowiska Stargard",
    "łowiska Świnoujście",
    "baza łowisk zachodniopomorskie",
    "Rybio",
  ],
  alternates: {
    canonical: "/lowiska-zachodniopomorskie",
  },
  openGraph: {
    title:
      "Łowiska zachodniopomorskie – baza łowisk w województwie zachodniopomorskim | Rybio",
    description:
      "Znajdź łowiska w województwie zachodniopomorskim. Sprawdzaj gatunki ryb, typ łowiska, udogodnienia, lokalizację i informacje przydatne przed wyprawą.",
    url: "/lowiska-zachodniopomorskie",
    siteName: "Rybio",
    locale: "pl_PL",
    type: "website",
    images: [
      {
        url: "/og-lakes.jpg",
        width: 1200,
        height: 630,
        alt: "Łowiska zachodniopomorskie – Rybio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Łowiska zachodniopomorskie | Rybio",
    description:
      "Przeglądaj łowiska w województwie zachodniopomorskim i znajdź miejsce na kolejną wyprawę nad wodę.",
    images: ["/og-lakes.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function ZachodniopomorskieLakesPage() {
  const lakes = await getLakes();

  const zachodniopomorskieLakes = lakes.filter((lake) => {
    const voivodeship = lake.address.voivodeship.toLowerCase();

    return (
      voivodeship.includes("zachodniopomorskie") ||
      voivodeship.includes("zachodniopomorski") ||
      voivodeship.includes("pomorze zachodnie")
    );
  });

  const initialVoivodeship =
    zachodniopomorskieLakes[0]?.address.voivodeship || "zachodniopomorskie";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Łowiska zachodniopomorskie",
    description:
      "Publiczna baza łowisk w województwie zachodniopomorskim. Miejsca na ryby, łowiska komercyjne, łowiska PZW, łowiska karpiowe i miejsca na wyprawy wędkarskie.",
    url: `${siteUrl}/lowiska-zachodniopomorskie`,
    isPartOf: {
      "@type": "WebSite",
      name: "Rybio",
      url: siteUrl,
    },
    about: [
      "łowiska zachodniopomorskie",
      "łowiska w województwie zachodniopomorskim",
      "wędkarstwo zachodniopomorskie",
      "gdzie na ryby zachodniopomorskie",
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
              Łowiska w województwie zachodniopomorskim
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Łowiska zachodniopomorskie – znajdź miejsce na ryby w regionie
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Szukasz łowiska w województwie zachodniopomorskim? Sprawdź bazę
              łowisk w Rybio i porównuj miejsca według lokalizacji, gatunków
              ryb, typu łowiska oraz dostępnych udogodnień. Znajdziesz tu
              łowiska komercyjne, PZW, karpiowe i miejsca dobre na weekendową
              wyprawę nad wodę.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lista-lowisk"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Przeglądaj łowiska zachodniopomorskie
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
                value={String(zachodniopomorskieLakes.length)}
                label="łowisk w regionie"
              />

              <HeroStat value="Filtry" label="ryby i udogodnienia" />

              <HeroStat value="Mapa" label="lokalizacja łowisk" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Łowiska w województwie zachodniopomorskim
            </h2>

            <div className="mt-4 space-y-4 leading-8 text-slate-600">
              <p>
                Województwo zachodniopomorskie kojarzy się przede wszystkim z
                wodą, jeziorami, rzekami i dostępem do morza, dlatego jest
                ciekawym kierunkiem dla wędkarzy szukających nowych miejsc na
                wyprawę. W bazie Rybio możesz sprawdzić łowiska z tego regionu
                i szybciej porównać, które miejsce będzie najlepsze pod Twój
                sposób łowienia.
              </p>

              <p>
                Na tej stronie znajdziesz łowiska zachodniopomorskie dostępne
                w bazie Rybio. Możesz filtrować je po gatunkach ryb, typie
                łowiska, udogodnieniach oraz miejscowości. Dzięki temu łatwiej
                wybierzesz miejsce na krótkie łowienie, weekendowy wyjazd albo
                dłuższą zasiadkę.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-xl font-black text-blue-950">
              Znasz łowisko z tego regionu?
            </h2>

            <p className="mt-3 text-sm leading-6 text-blue-800">
              Pomóż rozbudować bazę Rybio. Możesz dodać łowisko, uzupełnić
              informacje, dodać zdjęcia albo zgłosić poprawkę do istniejącego
              profilu.
            </p>

            <div className="mt-5 grid gap-3">
              <Link
                href="/dashboard/lakes/new"
                className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
              >
                Dodaj łowisko
              </Link>

              <Link
                href="/kontakt"
                className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-blue-700 transition hover:bg-blue-100"
              >
                Skontaktuj się
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicLakesPage
        lakes={zachodniopomorskieLakes}
        initialVoivodeship={initialVoivodeship}
      />

      <section className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">
            Gdzie na ryby w zachodniopomorskim?
          </h2>

          <div className="mt-4 space-y-4 leading-8 text-slate-600">
            <p>
              Przed wyjazdem nad wodę warto sprawdzić kilka podstawowych
              informacji: regulamin łowiska, cennik, wymagane zezwolenia,
              możliwość rezerwacji stanowiska, godziny otwarcia, łowienie nocne
              oraz dostępne gatunki ryb. W przypadku dalszej wyprawy przydatne
              mogą być też udogodnienia, takie jak parking, toaleta, domek,
              pole namiotowe, gastronomia albo możliwość rozbicia namiotu.
            </p>

            <p>
              Rybio pomaga zebrać te informacje w jednym miejscu. Dzięki temu
              możesz szybciej porównać łowiska w województwie
              zachodniopomorskim i wybrać miejsce dopasowane do planowanej
              wyprawy.
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