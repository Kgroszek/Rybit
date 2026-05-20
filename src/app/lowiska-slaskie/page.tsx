import type { Metadata } from "next";
import Link from "next/link";
import { getLakes } from "@/lib/lakes";
import { PublicLakesPage } from "@/components/public/PublicLakesPage";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Łowiska śląskie – baza łowisk w województwie śląskim | Rybio",
  description:
    "Sprawdź łowiska śląskie. Przeglądaj łowiska w województwie śląskim, filtruj miejsca według gatunków ryb, typu łowienia i udogodnień.",
};

export default async function SlaskieLakesPage() {
  const lakes = await getLakes();

  const slaskieLakes = lakes.filter((lake) => {
    const voivodeship = lake.address.voivodeship.toLowerCase();

    return (
      voivodeship.includes("śląskie") ||
      voivodeship.includes("slaskie") ||
      voivodeship.includes("śląsk") ||
      voivodeship.includes("slask")
    );
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <PublicHeader />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),radial-gradient(circle_at_top_right,#ccfbf1,transparent_30%)]" />

        <div className="relative mx-auto max-w-[1500px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl">
            <p className="mb-5 inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
              Publiczna baza łowisk w województwie śląskim
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Łowiska śląskie – znajdź miejsce na ryby w województwie śląskim
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Szukasz łowiska na Śląsku? Sprawdź publiczną bazę łowisk w
              województwie śląskim, porównuj miejsca według gatunków ryb, typu
              łowienia, udogodnień i lokalizacji. Znajdź łowisko na karpia,
              amura, suma, szczupaka, sandacza, lina albo leszcza i lepiej
              zaplanuj kolejną wyprawę nad wodę.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lista-lowisk"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Przeglądaj łowiska śląskie
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
                value={String(slaskieLakes.length)}
                label="łowisk w bazie"
              />
              <HeroStat value="Śląskie" label="województwo" />
              <HeroStat value="Filtry" label="ryby i udogodnienia" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Łowiska w województwie śląskim
            </h2>

            <div className="mt-4 space-y-4 leading-8 text-slate-600">
              <p>
                Województwo śląskie to region, w którym wędkarze mogą znaleźć
                różne typy miejsc do łowienia: łowiska komercyjne, zbiorniki
                rekreacyjne, łowiska karpiowe, miejsca pod method feeder,
                spinning oraz spokojne wyprawy rodzinne. Dzięki Rybio możesz
                szybciej sprawdzić podstawowe informacje o łowisku przed
                wyjazdem.
              </p>

              <p>
                Na tej stronie znajdziesz łowiska śląskie dostępne w bazie
                Rybio. Możesz filtrować je według rodzaju łowiska, typu
                łowienia, gatunku ryb oraz udogodnień, takich jak parking,
                pomost, wędkowanie nocne, domki, toaleta, sklep, altana czy
                możliwość płatności kartą.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-xl font-black text-blue-950">
              Chcesz zapisywać swoje połowy?
            </h2>

            <p className="mt-3 text-sm leading-6 text-blue-800">
              Załóż konto w Rybio, dodawaj połowy ze zdjęciami, zapisuj
              ulubione łowiska, oceniaj miejsca i korzystaj z rankingów
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

      <PublicLakesPage lakes={slaskieLakes} />

      <section className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">
            Jak wybrać dobre łowisko na Śląsku?
          </h2>

          <div className="mt-4 space-y-4 leading-8 text-slate-600">
            <p>
              Wybierając łowisko w województwie śląskim, warto sprawdzić nie
              tylko odległość od miejsca zamieszkania, ale także gatunki ryb,
              regulamin, cennik, możliwość nocnego wędkowania, dostęp do
              parkingu, pomostów oraz podstawowego zaplecza. Dla wielu wędkarzy
              ważne są również domki, toaleta, sklep z przynętami, zadaszone
              stanowiska i wygodny dojazd.
            </p>

            <p>
              Rybio pomaga zebrać te informacje w jednym miejscu. Dzięki temu
              możesz szybciej porównać łowiska, sprawdzić opis, zdjęcia,
              udogodnienia i zdecydować, gdzie warto zaplanować kolejną wyprawę
              wędkarską na Śląsku.
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