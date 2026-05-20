import type { Metadata } from "next";
import Link from "next/link";
import { getLakes } from "@/lib/lakes";
import { PublicLakesPage } from "@/components/public/PublicLakesPage";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Łowiska z noclegiem – baza łowisk na dłuższe wyprawy | Rybio",
  description:
    "Sprawdź łowiska z noclegiem w Polsce. Przeglądaj łowiska z domkami, miejscem na namiot, nocnym wędkowaniem, udogodnieniami i informacjami przed wyprawą.",
};

export default async function LakesWithAccommodationPage() {
  const lakes = await getLakes();

  const lakesWithAccommodation = lakes.filter((lake) => {
    const searchableText = [
      lake.description,
      lake.rules.join(" "),
      lake.priceList.join(" "),
      lake.contact.website,
    ]
      .join(" ")
      .toLowerCase();

    return (
      lake.amenities.cottages ||
      lake.amenities.tent ||
      lake.amenities.nightFishing ||
      searchableText.includes("nocleg") ||
      searchableText.includes("noclegi") ||
      searchableText.includes("domek") ||
      searchableText.includes("domki") ||
      searchableText.includes("namiot") ||
      searchableText.includes("namioty") ||
      searchableText.includes("zasiadka") ||
      searchableText.includes("zasiadki")
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
              Publiczna baza łowisk z noclegiem
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Łowiska z noclegiem – znajdź miejsce na weekendową wyprawę
              wędkarską
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Szukasz łowiska z noclegiem, domkami, miejscem na namiot albo
              możliwością dłuższej zasiadki? Sprawdź publiczną bazę łowisk w
              Rybio i porównuj miejsca według lokalizacji, gatunków ryb, typu
              łowienia oraz udogodnień dostępnych dla wędkarzy.
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
              <HeroStat value="Weekend" label="i dłuższe zasiadki" />
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
                Łowiska z noclegiem to dobry wybór dla osób, które planują
                dłuższą wyprawę, weekendową zasiadkę albo rodzinny wyjazd nad
                wodę. Możliwość noclegu, domek, miejsce na namiot lub opcja
                wędkowania nocnego pozwalają spędzić nad łowiskiem więcej czasu
                i lepiej przygotować się do połowu.
              </p>

              <p>
                Na tej stronie znajdziesz łowiska z noclegiem dostępne w bazie
                Rybio. Możesz dodatkowo filtrować je według rodzaju łowiska,
                typu łowienia, gatunku ryb oraz innych udogodnień, takich jak
                parking, pomost, domki, namiot, toaleta, sklep, altana czy
                możliwość płatności kartą.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-xl font-black text-blue-950">
              Planujesz wyjazd na kilka dni?
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

      <PublicLakesPage lakes={lakesWithAccommodation} />

      <section className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">
            Jak wybrać dobre łowisko z noclegiem?
          </h2>

          <div className="mt-4 space-y-4 leading-8 text-slate-600">
            <p>
              Wybierając łowisko z noclegiem, warto sprawdzić nie tylko samą
              możliwość spania na miejscu, ale także regulamin, cennik, zasady
              rezerwacji, godziny łowienia, możliwość wędkowania nocnego oraz
              dostęp do zaplecza sanitarnego. Dla wielu wędkarzy ważne są także
              domki, miejsce na namiot, parking blisko stanowiska, pomosty,
              sklep z przynętami i spokojne warunki na dłuższą zasiadkę.
            </p>

            <p>
              Rybio pomaga zebrać te informacje w jednym miejscu. Dzięki temu
              możesz szybciej porównać łowiska z noclegiem, sprawdzić opis,
              zdjęcia, udogodnienia i zdecydować, gdzie warto zaplanować
              weekendową wyprawę wędkarską albo kilkudniowy wyjazd nad wodę.
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