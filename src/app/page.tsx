import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Rybio – mapa łowisk w Polsce i aplikacja dla wędkarzy",
  description:
    "Rybio to publiczna baza łowisk w Polsce, mapa łowisk, dziennik połowów i aplikacja dla wędkarzy. Znajduj łowiska, zapisuj połowy, sprawdzaj opinie i planuj wyprawy.",
  keywords: [
    "łowiska w Polsce",
    "mapa łowisk",
    "aplikacja dla wędkarzy",
    "dziennik połowów",
    "łowiska karpiowe",
    "łowiska komercyjne",
    "łowiska PZW",
    "gdzie na ryby",
  ],
  openGraph: {
    title: "Rybio – mapa łowisk w Polsce i aplikacja dla wędkarzy",
    description:
      "Znajduj łowiska, zapisuj połowy, sprawdzaj opinie i planuj wyprawy wędkarskie z Rybio.",
    type: "website",
  },
};

const mainBenefits = [
  {
    title: "Znajduj łowiska w Polsce",
    description:
      "Przeglądaj publiczną bazę łowisk, sprawdzaj lokalizację, typ łowienia, gatunki ryb, udogodnienia, zdjęcia i podstawowe informacje przed wyjazdem.",
  },
  {
    title: "Zapisuj swoje połowy",
    description:
      "Prowadź własny dziennik połowów. Dodawaj gatunek ryby, wagę, długość, metodę, przynętę, zdjęcie, datę oraz przypisane łowisko.",
  },
  {
    title: "Buduj społeczność wędkarzy",
    description:
      "Dodawaj publiczne połowy, zdobywaj osiągnięcia, zgłaszaj łowiska, poprawiaj dane i pomagaj innym wędkarzom wybierać lepsze miejsca.",
  },
];

const appFeatures = [
  {
    title: "Mapa łowisk",
    description:
      "Szukaj łowisk po lokalizacji, województwie, typie łowienia, gatunkach ryb i dostępnych udogodnieniach.",
  },
  {
    title: "Dziennik połowów",
    description:
      "Zapisuj wszystkie swoje połowy w jednym miejscu i wracaj do najlepszych wyników z poprzednich wypraw.",
  },
  {
    title: "Rankingi łowisk",
    description:
      "Dodawaj publiczne połowy do rankingów łowisk i sprawdzaj największe oraz najdłuższe ryby złowione przez innych.",
  },
  {
    title: "Wyprawy i checklisty",
    description:
      "Planuj wyprawy, twórz checklisty i pilnuj, aby nie zapomnieć najważniejszego sprzętu nad wodę.",
  },
  {
    title: "Ekwipunek wędkarza",
    description:
      "Dodawaj swój sprzęt, przynęty i akcesoria, żeby mieć lepszą kontrolę nad wyposażeniem.",
  },
  {
    title: "Osiągnięcia i profil",
    description:
      "Zdobywaj odznaki, pokazuj publiczne połowy i buduj swój profil wędkarski w społeczności Rybio.",
  },
];

const seoLinks = [
  { label: "Łowiska mazowieckie", href: "/lowiska-mazowieckie" },
  { label: "Łowiska śląskie", href: "/lowiska-slaskie" },
  { label: "Łowiska małopolskie", href: "/lowiska-malopolskie" },
  { label: "Łowiska lubelskie", href: "/lowiska-lubelskie" },
  { label: "Łowiska wielkopolskie", href: "/lowiska-wielkopolskie" },
  { label: "Łowiska podkarpackie", href: "/lowiska-podkarpackie" },
  { label: "Łowiska z domkami", href: "/lowiska-z-domkami" },
  { label: "Łowiska z noclegiem", href: "/lowiska-z-noclegiem" },
  { label: "Łowiska karpiowe", href: "/lowiska-karpiowe" },
  { label: "Łowiska No Kill", href: "/lowiska-no-kill" },
];

const steps = [
  {
    number: "01",
    title: "Znajdź łowisko",
    description:
      "Przejrzyj listę łowisk, skorzystaj z filtrów i wybierz miejsce dopasowane do Twojej metody łowienia.",
  },
  {
    number: "02",
    title: "Sprawdź szczegóły",
    description:
      "Zobacz opis, zdjęcia, gatunki ryb, udogodnienia, cennik, regulamin i informacje kontaktowe.",
  },
  {
    number: "03",
    title: "Dodaj połów",
    description:
      "Po wyprawie zapisz wynik, dodaj zdjęcie, wagę, długość, przynętę i notatkę.",
  },
  {
    number: "04",
    title: "Buduj historię",
    description:
      "Twórz swój profil, zdobywaj osiągnięcia i wracaj do najlepszych łowisk oraz rekordowych ryb.",
  },
];

const faq = [
  {
    question: "Czy z Rybio można korzystać bez logowania?",
    answer:
      "Tak. Bez logowania możesz przeglądać publiczną bazę łowisk i wybrane podstrony informacyjne. Konto jest potrzebne do dodawania połowów, oceniania łowisk, zapisywania ulubionych miejsc i korzystania z panelu wędkarza.",
  },
  {
    question: "Czy mogę dodać własne łowisko?",
    answer:
      "Tak. Użytkownicy mogą zgłaszać łowiska do bazy. Zgłoszenie trafia do weryfikacji, a po akceptacji może pojawić się na stronie.",
  },
  {
    question: "Czy Rybio nadaje się do prowadzenia dziennika połowów?",
    answer:
      "Tak. Możesz zapisywać swoje połowy, zdjęcia, wagę, długość, metodę, przynętę, datę, łowisko oraz własne notatki.",
  },
  {
    question: "Czy właściciel łowiska może poprawić dane?",
    answer:
      "Tak. Właściciele i użytkownicy mogą zgłaszać poprawki danych, np. dotyczące regulaminu, cennika, kontaktu, zdjęć lub udogodnień.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <PublicHeader />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white ">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_34%),radial-gradient(circle_at_80%_20%,#ccfbf1,transparent_28%)]" />

        <div className="relative mx-auto grid max-w-[1500px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="mb-5 inline-flex w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
              Publiczna baza łowisk i aplikacja dla wędkarzy
            </p>

            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Znajdź łowisko, zaplanuj wyprawę i zapisuj swoje połowy w jednym
              miejscu
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              Rybio pomaga wędkarzom odkrywać łowiska w Polsce, sprawdzać
              podstawowe informacje o miejscach, prowadzić dziennik połowów,
              zapisywać sprzęt, planować wyprawy i budować własną historię nad
              wodą.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/lowiska"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
              >
                Przeglądaj łowiska
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                Załóż darmowe konto
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <HeroStat value="Baza" label="łowisk w Polsce" />
              <HeroStat value="Dziennik" label="Twoich połowów" />
              <HeroStat value="Mapa" label="miejsc na ryby" />
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden ">
              <img
                src="/photos/Rybio-1.webp"
                alt="Wędkarz nad łowiskiem"
                className="w-full object-cover"
              />

              
            </div>
          </div>
        </div>
      </section>

      <section id="o-aplikacji" className="mx-auto max-w-[1500px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
            O aplikacji
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Rybio to aplikacja dla wędkarzy, którzy chcą lepiej planować wyprawy
            i porządkować swoje połowy
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-600">
            Zamiast zapisywać informacje w notatniku, galerii telefonu,
            wiadomościach i arkuszach, możesz trzymać wszystko w jednym miejscu.
            Rybio łączy publiczną bazę łowisk z prywatnym panelem użytkownika.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {mainBenefits.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-black text-slate-950">
                {item.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-[1500px] gap-30 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="overflow-hidden">
            <img
              src="/photos/Rybio-2.webp"
              alt="Mapa łowisk i jezior w Polsce"
              className="h-full min-h-[360px] w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
              Publiczna baza łowisk
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Łowiska w Polsce dostępne bez logowania
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600">
              Publiczna część Rybio pozwala przeglądać łowiska bez konieczności
              zakładania konta. Dzięki temu użytkownik może szybko sprawdzić,
              jakie miejsca są dostępne w danym województwie, które łowiska mają
              nocleg, domki, opcję No Kill albo są nastawione na karpia.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {seoLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="funkcje" className="mx-auto max-w-[1500px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
            Funkcje
          </p>

          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Wszystko, czego potrzebujesz przed, w trakcie i po wyprawie
            wędkarskiej
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {appFeatures.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-blue-700">
                ✓
              </div>

              <h3 className="text-xl font-black text-slate-950">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto grid max-w-[1500px] gap-30 px-4 sm:px-6 lg:grid-cols-[1fr_480px] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-300">
              Dziennik połowów
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Zapisuj ryby, zdjęcia, wyniki i najlepsze miejscówki
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-300">
              Po każdej wyprawie możesz dodać połów do swojego dziennika. Rybio
              pozwala zapisywać gatunek, wagę, długość, metodę, przynętę, datę,
              łowisko oraz zdjęcie. Wybrane połowy możesz pokazać publicznie w
              profilu lub rankingu łowiska.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <DarkFeature title="Zdjęcia połowów" />
              <DarkFeature title="Statystyki i rekordy" />
              <DarkFeature title="Publiczny profil" />
              <DarkFeature title="Rankingi łowisk" />
            </div>
          </div>

          <div className="overflow-hidden ">
            <img
              src="/photos/Rybio-3.webp"
              alt="Zapisany połów ryby w dzienniku wędkarskim"
              className="h-[600px] object-cover opacity-90"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-30 lg:grid-cols-[460px_1fr]">
          <div className="overflow-hidden">
            <img
              src="/photos/Rybio-4.webp"
              alt="Społeczność wędkarzy nad wodą"
              className="h-full min-h-[420px] w-full object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
              Jak to działa?
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Od znalezienia łowiska do zapisania rekordu
            </h2>

            <div className="mt-8 space-y-4">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
                      {step.number}
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-950">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-[1500px] gap-30 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
              Dla właścicieli łowisk
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Prowadzisz łowisko? Pokaż je w miejscu, którego szukają wędkarze
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600">
              Właściciele łowisk mogą zgłaszać swoje miejsca, dodać opis,
              zdjęcia, cennik, regulamin, gatunki ryb, udogodnienia i dane
              kontaktowe. Dzięki temu użytkownicy szybciej podejmują decyzję,
              gdzie pojechać na ryby.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/lowiska/zglos"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Zgłoś łowisko
              </Link>

              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-800 transition hover:bg-slate-50"
              >
                Skontaktuj się
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-sm">
            <img
              src="/photos/Rybio-5.webp"
              alt="Łowisko komercyjne z pomostem i wodą"
              className="h-full min-h-[380px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[1500px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-30 lg:grid-cols-[380px_1fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
              FAQ
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Najczęstsze pytania o Rybio
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600">
              Krótkie odpowiedzi dla osób, które chcą korzystać z publicznej
              bazy łowisk albo założyć konto i prowadzić swój dziennik połowów.
            </p>
          </div>

          <div className="space-y-4">
            {faq.map((item) => (
              <article
                key={item.question}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-black text-slate-950">
                  {item.question}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-blue-600 p-8 text-white shadow-xl sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Dołącz do Rybio i zacznij porządkować swoje wędkarskie wyprawy
              </h2>

              <p className="mt-4 max-w-3xl text-base leading-8 text-blue-50">
                Załóż konto, zapisuj połowy, planuj wyprawy, dodawaj sprzęt i
                odkrywaj nowe łowiska w Polsce.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-black text-blue-700 transition hover:bg-blue-50"
              >
                Załóż konto
              </Link>

              <Link
                href="/lowiska"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-6 py-4 text-sm font-black text-white transition hover:bg-blue-800"
              >
                Zobacz łowiska
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
      <p className="text-xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function DarkFeature({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-black text-white">
      {title}
    </div>
  );
}