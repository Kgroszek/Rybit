import type { Metadata } from "next";
import Link from "next/link";

import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

export const metadata: Metadata = {
  title:
    "Dla właścicieli łowisk — darmowy profil i system rezerwacji | Rybio",
  description:
    "Prowadzisz łowisko? Dodaj je do Rybio za darmo, przejmij profil, dodawaj zdjęcia, zarządzaj stanowiskami i prowadź rezerwacje w prostym panelu właściciela.",
};

const benefits = [
  {
    title: "Darmowy profil łowiska",
    description:
      "Pokaż opis, lokalizację, dane kontaktowe, gatunki ryb, udogodnienia, cennik i regulamin.",
  },
  {
    title: "Darmowa galeria zdjęć",
    description:
      "Dodawaj zdjęcia łowiska, stanowisk, pomostów, złowionych ryb i zaplecza dla wędkarzy.",
  },
  {
    title: "Panel właściciela",
    description:
      "Samodzielnie aktualizuj dane łowiska bez czekania na poprawki po stronie administracji.",
  },
  {
    title: "Stanowiska i rezerwacje",
    description:
      "Twórz stanowiska, sprawdzaj dostępność i dopisuj rezerwacje klientów z poziomu prostego panelu.",
  },
  {
    title: "Doba, dzień i noc",
    description:
      "Ustaw własne godziny rezerwacji, np. doba 06:00–07:00, dzień 08:00–16:00, noc 16:00–06:00.",
  },
  {
    title: "Zawody i blokady",
    description:
      "Zablokuj całe łowisko na zawody, zarybianie, prace techniczne albo wydarzenie specjalne.",
  },
];

const reservationFeatures = [
  "Kafelki stanowisk z informacją, które miejsca są wolne lub zajęte.",
  "Dodawanie rezerwacji dla konkretnego stanowiska.",
  "Blokowanie całego łowiska na zawody lub wydarzenia.",
  "Edycja terminu, danych klienta, ceny, zaliczki i statusu płatności.",
  "Notatki wewnętrzne widoczne tylko dla właściciela.",
  "Ochrona przed nakładaniem się rezerwacji w tym samym terminie.",
];

const steps = [
  {
    title: "Znajdź swoje łowisko",
    description:
      "Sprawdź, czy Twoje łowisko jest już w katalogu Rybio. Jeśli go nie ma, możesz je dodać.",
  },
  {
    title: "Przejmij profil",
    description:
      "Kliknij opcję przejęcia profilu i wyślij krótkie zgłoszenie właściciela.",
  },
  {
    title: "Poczekaj na akceptację",
    description:
      "Po zatwierdzeniu zgłoszenia otrzymasz dostęp do panelu właściciela.",
  },
  {
    title: "Zarządzaj łowiskiem",
    description:
      "Edytuj dane, dodawaj zdjęcia, twórz stanowiska i prowadź rezerwacje.",
  },
];

const audience = [
  "łowisk komercyjnych",
  "łowisk specjalnych",
  "stowarzyszeń wędkarskich",
  "gospodarstw agroturystycznych z łowiskiem",
  "właścicieli stawów z rezerwacją stanowisk",
  "organizatorów zawodów wędkarskich",
];

const plannedFeatures = [
  "publiczne rezerwacje online dla wędkarzy",
  "płatności i zaliczki online",
  "automatyczne powiadomienia",
  "statystyki obłożenia stanowisk",
  "mapa stanowisk",
  "własne strony łowisk w domenie Rybio",
];

export default function ForLakeOwnersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-8 lg:py-16">
            <div className="flex flex-col justify-center">
              <div className="w-fit rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
                Darmowe narzędzia dla właścicieli łowisk
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Darmowy profil i system rezerwacji dla Twojego łowiska
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                Dodaj łowisko do Rybio, przejmij profil właściciela i zarządzaj
                zdjęciami, stanowiskami oraz rezerwacjami bez opłat. Pokaż swoje
                miejsce wędkarzom i ułatw im kontakt z Twoim łowiskiem.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/lowiska-w-polsce"
                  className="rounded-2xl bg-blue-600 px-6 py-4 text-center text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Znajdź swoje łowisko
                </Link>

                <Link
                  href="/zglos-lowisko"
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-center text-sm font-black text-slate-800 transition hover:bg-slate-50"
                >
                  Dodaj łowisko za darmo
                </Link>
              </div>

              <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-500">
                Podstawowy profil łowiska, zdjęcia, stanowiska i panel
                rezerwacji są dostępne bez opłat. W przyszłości mogą pojawić się
                dodatkowe funkcje premium, ale podstawowa obecność w katalogu
                pozostanie bezpłatna.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  Panel właściciela
                </p>

                <h2 className="mt-3 text-2xl font-black text-slate-950">
                  Rezerwacje łowiska
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Wybierz termin i sprawdź dostępność stanowisk.
                </p>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                      Wolne
                    </p>

                    <p className="mt-1 text-lg font-black text-emerald-950">
                      Stanowisko 1
                    </p>

                    <p className="mt-1 text-sm text-emerald-800">
                      Kliknij, żeby dodać rezerwację.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-red-700">
                      Zajęte
                    </p>

                    <p className="mt-1 text-lg font-black text-red-950">
                      Stanowisko 2
                    </p>

                    <p className="mt-1 text-sm text-red-800">
                      Jan Kowalski · 08:00–16:00
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">
                      Całe łowisko
                    </p>

                    <p className="mt-1 text-lg font-black text-amber-950">
                      Zawody / blokada
                    </p>

                    <p className="mt-1 text-sm text-amber-800">
                      Zablokuj cały obiekt jednym kliknięciem.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-blue-50 p-3 text-center">
                    <p className="text-2xl font-black text-blue-700">0 zł</p>
                    <p className="text-xs font-bold text-blue-900">na start</p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                    <p className="text-2xl font-black text-emerald-700">24/7</p>
                    <p className="text-xs font-bold text-emerald-900">panel</p>
                  </div>

                  <div className="rounded-2xl bg-slate-100 p-3 text-center">
                    <p className="text-2xl font-black text-slate-900">
                      prosto
                    </p>

                    <p className="text-xs font-bold text-slate-600">
                      bez chaosu
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
              Co otrzymujesz za darmo?
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Profil, zdjęcia, stanowiska i rezerwacje w jednym miejscu
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-500">
              Rybio pomaga właścicielom łowisk pokazać swoją ofertę wędkarzom i
              uporządkować najważniejsze informacje bez skomplikowanych narzędzi.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-blue-700">
                  ✓
                </div>

                <h3 className="mt-5 text-xl font-black text-slate-950">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[420px_minmax(0,1fr)] lg:px-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
                System rezerwacji
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Prosty panel zamiast notesu, Excela i wiadomości na Messengerze
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-500">
                Rezerwacje w Rybio są zaprojektowane tak, żeby właściciel szybko
                widział, które stanowiska są dostępne w wybranym terminie.
              </p>

              <Link
                href="/lowiska-w-polsce"
                className="mt-6 inline-flex rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Sprawdź katalog łowisk
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {reservationFeatures.map((feature) => (
                <div
                  key={feature}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <p className="text-sm font-bold leading-6 text-slate-700">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-600">
              Jak to działa?
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Od zgłoszenia do panelu właściciela
            </h2>

            <div className="mt-8 grid gap-5">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                    {index + 1}
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-950">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6 shadow-sm sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">
              Bez opłat na start
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-blue-950">
              Podstawowe funkcje są darmowe
            </h2>

            <p className="mt-4 text-sm leading-7 text-blue-800">
              Dodanie łowiska, przejęcie profilu, edycja danych, dodawanie
              zdjęć, tworzenie stanowisk i prowadzenie rezerwacji w panelu
              właściciela są dostępne bez opłat.
            </p>

            <div className="mt-6 rounded-3xl bg-white p-5">
              <p className="text-sm font-black text-slate-950">
                Dlaczego za darmo?
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Chcemy, żeby właściciele łowisk mogli łatwo pokazać swoje
                miejsce wędkarzom i sprawdzić, czy Rybio realnie pomaga w
                promocji oraz organizacji rezerwacji.
              </p>
            </div>
          </aside>
        </section>

        <section className="border-y border-slate-200 bg-slate-950">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-300">
                Dla kogo?
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Rybio sprawdzi się dla różnych typów łowisk
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-400">
                Niezależnie od tego, czy prowadzisz duży obiekt komercyjny,
                kameralne łowisko z kilkoma stanowiskami czy organizujesz zawody
                — możesz zacząć od darmowego profilu.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {audience.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-black text-slate-100"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[420px_minmax(0,1fr)] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
              Co dalej?
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Rybio będzie rozwijane o kolejne funkcje dla łowisk
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-500">
              Podstawowy profil łowiska pozostanie bezpłatny, a dodatkowe
              funkcje mogą w przyszłości rozszerzać możliwości promocji i
              obsługi rezerwacji.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {plannedFeatures.map((feature) => (
              <div
                key={feature}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-bold leading-6 text-slate-700">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-800 p-8 shadow-xl sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-100">
                  Zacznij za darmo
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Chcesz lepiej promować swoje łowisko?
                </h2>

                <p className="mt-4 max-w-3xl text-base leading-7 text-blue-100">
                  Dodaj łowisko do Rybio albo przejmij istniejący profil i
                  zacznij zarządzać nim samodzielnie.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
                <Link
                  href="/lowiska-w-polsce"
                  className="rounded-2xl bg-white px-6 py-4 text-center text-sm font-black text-blue-700 transition hover:bg-blue-50"
                >
                  Przejmij profil
                </Link>

                <Link
                  href="/zglos-lowisko"
                  className="rounded-2xl border border-white/30 bg-white/10 px-6 py-4 text-center text-sm font-black text-white transition hover:bg-white/15"
                >
                  Dodaj łowisko
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}