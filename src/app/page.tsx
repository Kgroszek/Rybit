import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { HomeHeroShowcase } from "@/components/public/HomeHeroShowcase";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { BackpackIcon } from "@/components/icons/BackpackIcon";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { CardsIcon } from "@/components/icons/CardsIcon";
import { CheckListIcon } from "@/components/icons/CheckListIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { MapIcon } from "@/components/icons/MapIcon";
import { MarkerIcon } from "@/components/icons/MarkerIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { UsersIcon } from "@/components/icons/UsersIcon";

export const metadata: Metadata = {
  title: "Rybio – łowiska w Polsce, mapa łowisk i aplikacja dla wędkarzy",
  description:
    "Znajdź łowiska w Polsce, sprawdzaj informacje i opinie, planuj wyprawy oraz zapisuj swoje połowy. Rybio to mapa łowisk i narzędzia dla wędkarzy oraz właścicieli łowisk.",
  keywords: [
    "łowiska w Polsce",
    "mapa łowisk",
    "aplikacja dla wędkarzy",
    "dziennik połowów",
    "planowanie wypraw wędkarskich",
    "łowiska karpiowe",
    "łowiska komercyjne",
    "łowiska PZW",
    "gdzie na ryby",
    "system rezerwacji łowiska",
    "strona internetowa dla łowiska",
  ],
  openGraph: {
    title: "Rybio – łowiska w Polsce i aplikacja dla wędkarzy",
    description:
      "Znajduj łowiska, planuj wyprawy, prowadź dziennik połowów i korzystaj z narzędzi stworzonych dla polskich wędkarzy.",
    type: "website",
  },
};

const seoLinks = [
  { label: "Łowiska mazowieckie", href: "/lowiska-mazowieckie" },
  { label: "Łowiska śląskie", href: "/lowiska-slaskie" },
  { label: "Łowiska małopolskie", href: "/lowiska-malopolskie" },
  { label: "Łowiska lubelskie", href: "/lowiska-lubelskie" },
  { label: "Łowiska wielkopolskie", href: "/lowiska-wielkopolskie" },
  { label: "Łowiska podkarpackie", href: "/lowiska-podkarpackie" },
  { label: "Łowiska zachodniopomorskie", href: "/lowiska-zachodniopomorskie" },
  { label: "Łowiska komercyjne", href: "/lowiska-komercyjne" },
  { label: "Łowiska z domkami", href: "/lowiska-z-domkami" },
  { label: "Łowiska z noclegiem", href: "/lowiska-z-noclegiem" },
  { label: "Łowiska karpiowe", href: "/lowiska-karpiowe" },
  { label: "Łowiska No Kill", href: "/lowiska-no-kill" },
];

const faq = [
  {
    question: "Czy z Rybio można korzystać bez logowania?",
    answer:
      "Tak. Bez logowania możesz przeglądać publiczną bazę łowisk i ich szczegóły. Konto jest potrzebne do korzystania z prywatnych narzędzi, takich jak dziennik połowów, wyprawy, checklisty, ulubione łowiska czy profil wędkarza.",
  },
  {
    question: "Czy Rybio pomaga znaleźć łowisko w Polsce?",
    answer:
      "Tak. Możesz korzystać z mapy i listy łowisk oraz filtrować miejsca m.in. według województwa, typu łowienia, gatunków ryb i dostępnych udogodnień.",
  },
  {
    question: "Czy mogę prowadzić dziennik połowów?",
    answer:
      "Tak. Możesz zapisywać gatunek ryby, wagę, długość, metodę, przynętę, datę, łowisko oraz zdjęcie. Wybrane połowy mogą być publikowane na profilu i uwzględniane w rankingach.",
  },
  {
    question: "Co zawiera Centrum Wypraw?",
    answer:
      "Centrum Wypraw pozwala planować wspólne wyjazdy, zapraszać uczestników, prowadzić checklisty i listę sprzętu, dodawać koszty, notatki, zdjęcia oraz połowy powiązane z konkretną wyprawą.",
  },
  {
    question: "Czy właściciel łowiska może przejąć jego profil?",
    answer:
      "Tak. Po weryfikacji właściciel może otrzymać dostęp do panelu swojego łowiska, aktualizować dane, zarządzać zdjęciami, stanowiskami i rezerwacjami.",
  },
  {
    question: "Czy Rybio ma system rezerwacji dla łowisk?",
    answer:
      "Tak. Panel właściciela umożliwia tworzenie stanowisk, sprawdzanie ich dostępności, dodawanie rezerwacji, blokowanie terminów oraz zapisywanie ceny, zaliczki i statusu płatności.",
  },
  {
    question: "Czy właściciel łowiska może stworzyć własną stronę?",
    answer:
      "Tak. Właściciel może wybrać gotowy szablon, zmienić kolory, zdjęcia i treści, zdecydować które dane mają być pobierane z profilu Rybio i opublikować stronę pod własną subdomeną w Rybio.",
  },
  {
    question: "Czy Rybio działa na telefonie?",
    answer:
      "Tak. Rybio jest responsywną aplikacją internetową i działa w przeglądarce na telefonach, tabletach i komputerach.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      <PublicHeader />

      <section className="relative border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_8%,rgba(219,234,254,.9),transparent_30%),radial-gradient(circle_at_82%_15%,rgba(204,251,241,.55),transparent_25%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50/70 to-transparent" />

        <div className="relative mx-auto grid max-w-[1500px] gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,.9fr)_minmax(560px,1.1fr)] lg:items-center lg:gap-16 lg:px-8 lg:py-20 xl:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-black text-blue-700 shadow-sm backdrop-blur sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Łowiska, wyprawy i połowy w jednym miejscu
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.04] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[64px]">
              Znajdź łowisko w Polsce. Zaplanuj wyprawę. Zapisz każdy połów.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Rybio łączy mapę i bazę łowisk w Polsce z narzędziami do planowania
              wypraw, prowadzenia dziennika połowów i organizowania wędkarskiego
              ekwipunku. Właściciele łowisk mogą dodatkowo zarządzać rezerwacjami
              i stworzyć własną stronę internetową.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/lowiska-w-polsce"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Znajdź łowisko
                <ArrowRightIcon size={17} />
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >
                Załóż darmowe konto
              </Link>
            </div>

            <Link
              href="/dla-wlascicieli-lowisk"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-700"
            >
              Prowadzisz łowisko? Poznaj Rybio dla właścicieli
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-200 pt-6 text-xs font-bold text-slate-500 sm:text-sm">
              <span className="flex items-center gap-2"><CheckDot /> Publiczna baza łowisk</span>
              <span className="flex items-center gap-2"><CheckDot /> Konto wędkarza</span>
              <span className="flex items-center gap-2"><CheckDot /> Panel właściciela</span>
            </div>
          </div>

          <HomeHeroShowcase />
        </div>
      </section>

      <section id="czym-jest" className="border-b border-slate-200 bg-slate-50/80">
        <div className="mx-auto grid max-w-[1500px] gap-px border-x border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          <ValueTile
            icon={<MapIcon size={22} />}
            title="Mapa łowisk"
            text="Znajduj miejsca dopasowane do tego, jak lubisz łowić."
          />
          <ValueTile
            icon={<CalendarIcon size={22} />}
            title="Centrum wypraw"
            text="Planuj wyjazdy, ekipę, sprzęt, koszty i zadania."
          />
          <ValueTile
            icon={<FishIcon size={24} />}
            title="Dziennik połowów"
            text="Zapisuj wyniki, rekordy i buduj swoją historię."
          />
          <ValueTile
            icon={<CardsIcon size={22} />}
            title="Dla właścicieli"
            text="Rezerwacje i profesjonalne strony łowisk."
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.03fr_.97fr] lg:gap-20">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-blue-50" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-[0_28px_70px_-35px_rgba(15,23,42,.35)]">
              <img
                src="/photos/Rybio-2.webp"
                alt="Mapa łowisk w Polsce w Rybio"
                className="min-h-[430px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/30 bg-white/90 p-4 shadow-xl backdrop-blur sm:left-auto sm:w-[310px]">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">Szukaj po swojemu</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-700">
                  <span className="rounded-full bg-blue-50 px-3 py-2">Karp</span>
                  <span className="rounded-full bg-slate-100 px-3 py-2">No Kill</span>
                  <span className="rounded-full bg-slate-100 px-3 py-2">Nocleg</span>
                  <span className="rounded-full bg-slate-100 px-3 py-2">Spinning</span>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <SectionEyebrow>Łowiska w Polsce</SectionEyebrow>
            <h2 className="mt-4 max-w-xl text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-5xl">
              Zamiast przeglądać dziesiątki stron, zacznij od jednej mapy.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
              Przeglądaj łowiska bez logowania i sprawdzaj najważniejsze informacje przed wyjazdem:
              lokalizację, zdjęcia, gatunki ryb, metody łowienia, udogodnienia, cennik,
              regulamin i dane kontaktowe.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <FeatureLine icon={<MarkerIcon size={19} />} title="Mapa i odległość" text="Szybciej znajdź łowiska w swojej okolicy." />
              <FeatureLine icon={<FishIcon size={20} />} title="Gatunki ryb" text="Sprawdź, czego możesz szukać w danej wodzie." />
              <FeatureLine icon={<CheckListIcon size={19} />} title="Filtry i udogodnienia" text="Wybieraj miejsca dopasowane do wyjazdu." />
              <FeatureLine icon={<UsersIcon size={19} />} title="Opinie i społeczność" text="Korzystaj z informacji innych wędkarzy." />
            </div>

            <Link
              href="/lowiska-w-polsce"
              className="mt-8 inline-flex items-center gap-2 text-sm font-black text-blue-700 transition hover:gap-3"
            >
              Przeglądaj wszystkie łowiska <ArrowRightIcon size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section id="funkcje" className="relative overflow-hidden bg-slate-950 py-20 text-white lg:py-28">
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="relative mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.76fr_1.24fr] lg:gap-20">
            <div>
              <SectionEyebrow dark>Centrum Wypraw</SectionEyebrow>
              <h2 className="mt-4 max-w-xl text-3xl font-black tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                Od pomysłu na wyprawę do pierwszego brania.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">
                Rybio porządkuje cały wyjazd w jednym miejscu. Nie musisz dzielić planu między
                Messenger, notatki, arkusze i galerię telefonu.
              </p>

              <div className="mt-10 space-y-3">
                <JourneyStep number="01" title="Wybierz łowisko" text="Podepnij miejsce do wyprawy i miej wszystkie informacje pod ręką." />
                <JourneyStep number="02" title="Zaproś ekipę" text="Dodaj uczestników i planujcie wspólnie." />
                <JourneyStep number="03" title="Przygotuj sprzęt" text="Checklisty i ekwipunek pomagają niczego nie zapomnieć." />
                <JourneyStep number="04" title="Podziel koszty" text="Zapisuj wydatki i kontroluj wspólny budżet." />
                <JourneyStep number="05" title="Zapisz połowy" text="Połącz wyniki, zdjęcia i wspomnienia z konkretnym wyjazdem." />
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.06] p-3 shadow-2xl backdrop-blur sm:p-5">
                <div className="rounded-[1.55rem] bg-white p-5 text-slate-950 sm:p-7">
                  <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Twoja wyprawa</p>
                      <h3 className="mt-2 text-2xl font-black tracking-tight">Weekend nad Jeziorem</h3>
                      <p className="mt-1 text-sm text-slate-500">21–23 sierpnia · Łowisko Zielona Zatoka</p>
                    </div>
                    <span className="w-fit rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">Plan gotowy w 78%</span>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <DashboardCard icon={<UsersIcon size={20} />} label="Uczestnicy" value="4 osoby" detail="Wszyscy potwierdzili" />
                    <DashboardCard icon={<CheckListIcon size={20} />} label="Checklisty" value="18 / 24" detail="6 rzeczy zostało" />
                    <DashboardCard icon={<BackpackIcon size={20} />} label="Sprzęt" value="12 pozycji" detail="3 zestawy" />
                    <DashboardCard icon={<CardsIcon size={20} />} label="Koszty" value="1 240 zł" detail="310 zł / osoba" />
                    <DashboardCard icon={<PencilIcon size={20} />} label="Notatki" value="8 wpisów" detail="Plan miejsc i zanęt" />
                    <DashboardCard icon={<FishIcon size={20} />} label="Połowy" value="0" detail="Dodasz je nad wodą" />
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Najbliższy krok</p>
                        <p className="mt-2 text-sm font-black">Spakuj sprzęt i przygotuj przynęty</p>
                      </div>
                      <span className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black">Otwórz checklistę</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="dziennik" className="mx-auto max-w-[1500px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[.92fr_1.08fr] lg:gap-20">
          <div>
            <SectionEyebrow>Twoje połowy</SectionEyebrow>
            <h2 className="mt-4 max-w-xl text-3xl font-black tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              Każdy połów staje się częścią Twojej historii.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
              Prowadź własny dziennik, zapisuj szczegóły połowu, porównuj rekordy i pokazuj
              najlepsze wyniki na publicznym profilu. Rybio Score pomaga zamienić sam rozmiar ryby
              w czytelny wynik do porównań i rankingów.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <FeatureLine icon={<FishIcon size={20} />} title="Dziennik połowów" text="Waga, długość, metoda, przynęta, zdjęcie i łowisko." />
              <FeatureLine icon={<CardsIcon size={20} />} title="Rybio Score" text="Punktacja połowu i atrakcyjne karty do udostępniania." />
              <FeatureLine icon={<UsersIcon size={20} />} title="Publiczny profil" text="Twoje rekordy, odznaki i najlepsze wyniki w jednym miejscu." />
              <FeatureLine icon={<MapIcon size={20} />} title="Rankingi łowisk" text="Sprawdzaj największe wyniki powiązane z konkretnymi wodami." />
            </div>

            <Link href="/polowy" className="mt-8 inline-flex items-center gap-2 text-sm font-black text-blue-700 transition hover:gap-3">
              Zobacz dziennik połowów <ArrowRightIcon size={17} />
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-12 h-64 w-64 rounded-full bg-blue-100 blur-3xl" />
            <div className="relative grid gap-4 sm:grid-cols-[.78fr_1.22fr]">
              <div className="overflow-hidden rounded-[2rem] bg-gradient-to-b from-blue-500 to-blue-800 p-6 text-white shadow-2xl">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-100">Rybio Score</p>
                <p className="mt-4 text-7xl font-black tracking-[-0.06em]">92</p>
                <div className="mt-10 border-t border-white/15 pt-5">
                  <p className="text-xl font-black">Karp</p>
                  <p className="mt-1 text-sm text-blue-100">18,4 kg · 96 cm</p>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-blue-200">Twój nowy rekord</p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">Ostatnie połowy</p>
                    <p className="mt-2 text-xl font-black">Sezon 2026</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">24 połowy</span>
                </div>
                <div className="mt-5 space-y-3">
                  <CatchListRow fish="Karp" meta="18,4 kg · 96 cm" score="92" />
                  <CatchListRow fish="Szczupak" meta="8,1 kg · 108 cm" score="88" />
                  <CatchListRow fish="Amur" meta="13,2 kg · 101 cm" score="81" />
                  <CatchListRow fish="Sandacz" meta="5,7 kg · 84 cm" score="76" />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 text-center">
                  <MiniStat value="6" label="rekordów" />
                  <MiniStat value="12" label="gatunków" />
                  <MiniStat value="4" label="odznaki" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-blue-50/70 py-20 lg:py-28">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.86fr_1.14fr] lg:items-center lg:gap-20">
            <div>
              <SectionEyebrow>Dla właścicieli łowisk</SectionEyebrow>
              <h2 className="mt-4 max-w-xl text-3xl font-black tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                Prowadź łowisko online w jednym panelu.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
                Rybio daje właścicielom narzędzia do zarządzania informacjami o łowisku,
                stanowiskami i rezerwacjami oraz do uruchomienia profesjonalnej strony internetowej
                bez budowania jej od zera.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <OwnerBenefit title="Rezerwacje stanowisk" text="Terminy, blokady, ceny, zaliczki i płatności." />
                <OwnerBenefit title="Własna strona" text="Profesjonalny szablon i adres w domenie Rybio." />
                <OwnerBenefit title="Dane z profilu Rybio" text="Ryby, cennik i regulamin mogą synchronizować się automatycznie." />
                <OwnerBenefit title="Pełna edycja treści" text="Zdjęcia, kolory, sekcje i własne teksty pod Twoją markę." />
              </div>

              <Link
                href="/dla-wlascicieli-lowisk"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Poznaj Rybio dla właścicieli
                <ArrowRightIcon size={17} />
              </Link>
            </div>

            <div className="relative min-h-[540px]">
              <div className="absolute left-0 top-12 z-10 w-[72%] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
                <div className="border-b border-slate-100 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">Panel właściciela</p>
                  <p className="mt-2 text-xl font-black">Rezerwacje · 21 sierpnia</p>
                </div>
                <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
                  <ReservationTile number="01" status="Wolne" type="free" />
                  <ReservationTile number="02" status="Zajęte" type="busy" />
                  <ReservationTile number="03" status="Wolne" type="free" />
                  <ReservationTile number="04" status="Blokada" type="blocked" />
                  <ReservationTile number="05" status="Wolne" type="free" />
                  <ReservationTile number="06" status="Zajęte" type="busy" />
                </div>
              </div>

              <div className="absolute bottom-0 right-0 z-20 w-[70%] rotate-[2deg] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <p className="text-xs font-black tracking-[0.12em]">WATERLINE</p>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">Online</span>
                </div>
                <div className="bg-[linear-gradient(135deg,#dbeafe,#bfdbfe_55%,#99f6e4)] p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">Łowisko Jezioro</p>
                  <p className="mt-3 max-w-[270px] text-3xl font-black leading-tight tracking-tight">Miejsce stworzone dla pasji do wody.</p>
                  <span className="mt-5 inline-flex rounded-full bg-blue-600 px-4 py-2 text-xs font-black text-white">Poznaj łowisko</span>
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">Twój adres</p>
                  <p className="mt-1 text-sm font-black text-blue-700">twojelowisko.rybio.pl</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow center>Społeczność Rybio</SectionEyebrow>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-4xl lg:text-5xl">
            Więcej wiedzy nad wodą. Mniej zgadywania.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            Profile wędkarzy, publiczne połowy, komentarze i rankingi pomagają budować bazę informacji,
            która rośnie razem ze społecznością.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <CommunityCard icon={<UsersIcon size={22} />} title="Profile wędkarzy" text="Pokazuj najlepsze połowy, rekordy i osiągnięcia na własnym profilu." />
          <CommunityCard icon={<FishIcon size={24} />} title="Rankingi i Rybio Score" text="Porównuj wyniki i zobacz, jakie ryby trafiają się na konkretnych łowiskach." />
          <CommunityCard icon={<PencilIcon size={22} />} title="Komentarze i aktualne dane" text="Dziel się doświadczeniem i pomagaj aktualizować informacje o łowiskach." />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20 lg:py-24">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionEyebrow>Wiedza Rybio</SectionEyebrow>
              <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.035em] sm:text-4xl">
                Poradniki, które pomagają łowić świadomiej.
              </h2>
            </div>
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-black text-blue-700 transition hover:gap-3">
              Zobacz wszystkie artykuły <ArrowRightIcon size={17} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <KnowledgeCard href="/blog?category=poradniki" eyebrow="Poradniki" title="Techniki, błędy i praktyczne wskazówki znad wody" text="Materiały, które pomagają lepiej przygotować się do kolejnej sesji." />
            <KnowledgeCard href="/blog?category=ryby" eyebrow="Ryby" title="Poznaj gatunki, ich zachowanie i sposób żerowania" text="Wiedza o rybach przydatna niezależnie od wybranej metody." />
            <KnowledgeCard href="/blog?category=wyprawy-i-lowiska" eyebrow="Wyprawy i łowiska" title="Inspiracje na kolejne wyjazdy i planowanie zasiadek" text="Przygotowanie wyprawy, wybór miejsca i organizacja czasu nad wodą." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
          <div>
            <SectionEyebrow>Odkrywaj łowiska</SectionEyebrow>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
              Znajdź wodę dopasowaną do Twojego wyjazdu.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-slate-600">
              Przeglądaj łowiska według regionu i najważniejszych cech. To szybki punkt startowy,
              gdy szukasz miejsca na ryby w konkretnej części Polski.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {seoLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-md"
              >
                {item.label}
                <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-y border-slate-200 bg-white py-20 lg:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-4 sm:px-6 lg:grid-cols-[.68fr_1.32fr] lg:gap-16 lg:px-8">
          <div>
            <SectionEyebrow>FAQ</SectionEyebrow>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
              Najczęstsze pytania o Rybio
            </h2>
            <p className="mt-5 max-w-md text-base leading-8 text-slate-600">
              Najważniejsze informacje dla wędkarzy i właścicieli łowisk w jednym miejscu.
            </p>
          </div>

          <div className="grid gap-3">
            {faq.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-5 open:bg-white open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-black text-slate-950 marker:content-none">
                  {item.question}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-lg text-slate-400 ring-1 ring-slate-200 transition group-open:rotate-45 group-open:text-blue-600">+</span>
                </summary>
                <p className="mt-4 max-w-3xl pr-10 text-sm leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-2xl sm:p-10 lg:p-14">
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">Twoje miejsce nad wodą zaczyna się tutaj</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                Odkrywaj łowiska i buduj własną historię z Rybio.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Załóż konto, planuj wyprawy, zapisuj połowy i korzystaj z narzędzi przygotowanych z myślą o wędkarzach.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link href="/register" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-blue-50">
                Załóż darmowe konto
              </Link>
              <Link href="/lowiska-w-polsce" className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-black text-white transition hover:bg-white/10">
                Przeglądaj łowiska
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function CheckDot() {
  return <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-black text-emerald-700">✓</span>;
}

function SectionEyebrow({ children, dark = false, center = false }: { children: ReactNode; dark?: boolean; center?: boolean }) {
  return (
    <p className={`text-xs font-black uppercase tracking-[0.18em] ${dark ? "text-blue-300" : "text-blue-600"} ${center ? "text-center" : ""}`}>
      {children}
    </p>
  );
}

function ValueTile({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="bg-white p-6 sm:p-7">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">{icon}</div>
      <h2 className="mt-5 text-lg font-black text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function FeatureLine({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">{icon}</div>
      <div>
        <h3 className="text-sm font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function JourneyStep({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="group flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-blue-400/30 hover:bg-white/[0.07]">
      <span className="mt-0.5 text-xs font-black text-blue-300">{number}</span>
      <div>
        <h3 className="text-sm font-black text-white">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function DashboardCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm ring-1 ring-slate-200">{icon}</div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">{label}</p>
      <p className="mt-1 text-base font-black text-slate-950">{value}</p>
      <p className="mt-1 text-[11px] text-slate-500">{detail}</p>
    </div>
  );
}

function CatchListRow({ fish, meta, score }: { fish: string; meta: string; score: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><FishIcon size={20} /></div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-slate-950">{fish}</p>
        <p className="mt-0.5 text-xs text-slate-500">{meta}</p>
      </div>
      <span className="rounded-xl bg-slate-950 px-2.5 py-1.5 text-xs font-black text-white">{score}</span>
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-lg font-black text-slate-950">{value}</p>
      <p className="mt-1 text-[10px] font-bold text-slate-400">{label}</p>
    </div>
  );
}

function OwnerBenefit({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">✓</div>
      <h3 className="mt-3 text-sm font-black text-slate-950">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function ReservationTile({ number, status, type }: { number: string; status: string; type: "free" | "busy" | "blocked" }) {
  return (
    <div className={`rounded-2xl border p-3 ${type === "free" ? "border-emerald-100 bg-emerald-50" : type === "busy" ? "border-red-100 bg-red-50" : "border-amber-100 bg-amber-50"}`}>
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Stanowisko</p>
      <p className="mt-1 text-xl font-black text-slate-950">{number}</p>
      <p className="mt-1 text-[10px] font-bold text-slate-500">{status}</p>
    </div>
  );
}

function CommunityCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">{icon}</div>
      <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-500">{text}</p>
    </article>
  );
}

function KnowledgeCard({ href, eyebrow, title, text }: { href: string; eyebrow: string; title: string; text: string }) {
  return (
    <Link href={href} className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">{eyebrow}</p>
      <h3 className="mt-4 text-xl font-black leading-snug text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-500">{text}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-blue-700 transition group-hover:gap-3">Czytaj więcej <ArrowRightIcon size={16} /></span>
    </Link>
  );
}
