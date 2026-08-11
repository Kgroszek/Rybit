import type { Metadata } from "next";
import Link from "next/link";

import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicLakesPage } from "@/components/public/PublicLakesPage";
import {
  getLakeFilterOptions,
  getPaginatedLakes,
} from "@/lib/lakes";

const siteUrl = "https://rybio.pl";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Łowiska w Polsce – mapa i baza łowisk dla wędkarzy | Rybio",
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
    title: "Łowiska w Polsce – mapa i baza łowisk dla wędkarzy | Rybio",
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
        alt: "Rybio – baza łowisk w Polsce",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Łowiska w Polsce – mapa i baza łowisk | Rybio",
    description:
      "Znajdź łowiska w Polsce, sprawdź gatunki ryb, udogodnienia i informacje przydatne przed wyprawą.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

type PublicLakesListPageProps = {
  searchParams?: Promise<{
    page?: string;
    q?: string;
    owner?: string;
    fishing?: string;
    voivodeship?: string;
    fish?: string;
    amenities?: string;
    sort?: string;
  }>;
};


function getStringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getPageParam(value: string | string[] | undefined) {
  const parsed = Number.parseInt(getStringParam(value), 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getAmenitiesParam(value: string | string[] | undefined) {
  const raw = getStringParam(value);

  if (!raw || raw === "none") {
    return [];
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}


export default async function PublicLakesListPage({
  searchParams,
}: PublicLakesListPageProps) {
  const params = (await searchParams) ?? {};

  const initialFilters = {
    search: getStringParam(params.q),
    ownerType: getStringParam(params.owner) || "all",
    fishingType: getStringParam(params.fishing) || "all",
    voivodeship: getStringParam(params.voivodeship) || "all",
    fish: getStringParam(params.fish) || "all",
    amenities: getAmenitiesParam(params.amenities),
    sort: getStringParam(params.sort) || "rating-desc",
  };

  const [result, filterOptions] = await Promise.all([
    getPaginatedLakes({
      page: getPageParam(params.page),
      search: initialFilters.search,
      ownerType: initialFilters.ownerType,
      fishingType: initialFilters.fishingType,
      voivodeship: initialFilters.voivodeship,
      fish: initialFilters.fish,
      amenities: initialFilters.amenities,
      sort: initialFilters.sort,
    }),
    getLakeFilterOptions(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <PublicHeader />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),radial-gradient(circle_at_top_right,#ccfbf1,transparent_30%)]" />

        <div className="relative mx-auto max-w-[1500px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl">
            <p className="mb-5 inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
              Publiczna baza łowisk dla wędkarzy
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Łowiska w Polsce – znajdź miejsce na kolejną wyprawę
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Przeglądaj łowiska w Polsce, sprawdzaj gatunki ryb, typ łowiska,
              udogodnienia, lokalizację i podstawowe informacje przed wyjazdem
              nad wodę. Rankingi, oceny i ulubione są dostępne po zalogowaniu.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lista-lowisk"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Przeglądaj łowiska
              </a>

              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Dołącz do Rybio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicLakesPage
        lakes={result.lakes}
        initialPagination={{
          page: result.page,
          pageSize: result.pageSize,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        }}
        filterOptions={filterOptions}
        initialOwnerType={initialFilters.ownerType}
        initialFishingType={initialFilters.fishingType}
        initialVoivodeship={initialFilters.voivodeship}
        initialFish={initialFilters.fish}
        initialAmenities={initialFilters.amenities}
        initialSearch={initialFilters.search}
        initialSort={initialFilters.sort}
      />

      <PublicFooter />
    </main>
  );
}
