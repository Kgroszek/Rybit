import type { Metadata } from "next";
import Link from "next/link";
import { getLakes } from "@/lib/lakes";
import { PublicLakesPage } from "@/components/public/PublicLakesPage";
import { PublicHeader } from "@/components/public/PublicHeader";

export const metadata: Metadata = {
  title: "Łowiska w Polsce – mapa i baza łowisk dla wędkarzy | Rybio",
  description:
    "Przeglądaj łowiska w Polsce, filtruj miejsca według województwa, gatunków ryb, typu łowienia i udogodnień. Odkrywaj łowiska z Rybio.",
};

export default async function PublicLakesListPage() {
  const lakes = await getLakes();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <PublicHeader />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),radial-gradient(circle_at_top_right,#ccfbf1,transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
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

      <PublicLakesPage lakes={lakes} />
    </main>
  );
}