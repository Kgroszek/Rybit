import type { Metadata } from "next";

import { LakesExplorer } from "@/components/lakes/LakesExplorer";
import {
  LAKE_EXPLORER_PAGE_SIZE,
} from "@/components/lakes/constants";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { ButtonLink } from "@/components/ui/Button";
import {
  getLakeExplorerMapResults,
  getLakeExplorerResults,
} from "@/lib/lake-explorer";
import {
  parseLakeExplorerSearchParams,
  type LakeExplorerSearchParams,
} from "@/lib/lake-explorer-params";
import {
  getLakeFilterOptions,
} from "@/lib/lakes";

const siteUrl = "https://rybio.pl";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title:
    "Łowiska w Polsce – mapa i baza łowisk dla wędkarzy | Rybio",
  description:
    "Znajdź łowiska w Polsce. Przeglądaj bazę łowisk, sprawdzaj gatunki ryb, typ łowiska, udogodnienia, lokalizację i informacje przydatne przed wyprawą.",
  keywords: [
    "łowiska w Polsce",
    "baza łowisk",
    "mapa łowisk",
    "łowiska wędkarskie",
    "gdzie na ryby",
    "łowiska komercyjne",
    "łowiska PZW",
    "łowiska no kill",
    "łowiska karpiowe",
    "Rybio",
  ],
  alternates: {
    canonical: "/lowiska-w-polsce",
  },
  openGraph: {
    title:
      "Łowiska w Polsce – mapa i baza łowisk dla wędkarzy | Rybio",
    description:
      "Przeglądaj publiczną bazę łowisk w Polsce. Sprawdzaj gatunki ryb, lokalizację, typ łowiska, udogodnienia i szczegóły przed wyjazdem nad wodę.",
    url: "/lowiska-w-polsce",
    siteName: "Rybio",
    locale: "pl_PL",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt:
          "Rybio – baza łowisk w Polsce",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Łowiska w Polsce – mapa i baza łowisk | Rybio",
    description:
      "Znajdź łowiska w Polsce, sprawdź gatunki ryb, udogodnienia i informacje przydatne przed wyprawą.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

type PublicLakesPageProps = {
  searchParams?: Promise<LakeExplorerSearchParams>;
};

export default async function PublicLakesPage({
  searchParams,
}: PublicLakesPageProps) {
  const params =
    (await searchParams) ?? {};

  const parsed =
    parseLakeExplorerSearchParams(
      params
    );

  const query = {
    ...parsed.filters,
    bounds: parsed.bounds,
    page: 1,
    pageSize:
      LAKE_EXPLORER_PAGE_SIZE,
  };

  const [
    result,
    mapResult,
    filterOptions,
  ] = await Promise.all([
    getLakeExplorerResults(query),
    getLakeExplorerMapResults(query),
    getLakeFilterOptions(),
  ]);

  return (
    <main className="min-h-screen bg-background text-text">
      <PublicHeader />

      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--rybio-blue-100),transparent_38%),radial-gradient(circle_at_top_right,var(--rybio-aqua-100),transparent_32%)] opacity-80" />

        <div className="relative mx-auto max-w-[1720px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="max-w-4xl">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
              Baza łowisk w Polsce
            </p>

            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.045em] text-text sm:text-5xl">
              Znajdź łowisko na
              kolejną wyprawę
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-text-secondary sm:text-lg">
              Przeglądaj łowiska w
              całej Polsce, filtruj
              miejsca według gatunków,
              rodzaju i udogodnień, a
              następnie odkrywaj je
              bezpośrednio na mapie.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="#lista-lowisk"
                variant="primary"
              >
                Przeglądaj łowiska
              </ButtonLink>

              <ButtonLink
                href="/register"
                variant="outline"
              >
                Załóż darmowe konto
              </ButtonLink>
            </div>

            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-border bg-surface/85 px-3 py-2 text-xs font-semibold text-text-secondary shadow-card backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-aqua-500" />
              {
                filterOptions.allLakesCount
              }{" "}
              łowisk w bazie Rybio
            </div>
          </div>
        </div>
      </section>

      <LakesExplorer
        mode="public"
        detailBasePath="/lowiska-w-polsce"
        initialData={{
          result,
          mapResult,
          filterOptions,
          filters:
            parsed.filters,
          bounds: parsed.bounds,
          mobileView:
            parsed.mobileView,
        }}
      />

      <PublicFooter />
    </main>
  );
}
