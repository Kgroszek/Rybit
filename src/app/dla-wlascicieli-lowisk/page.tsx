import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { CardsIcon } from "@/components/icons/CardsIcon";
import { CheckListIcon } from "@/components/icons/CheckListIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { MapIcon } from "@/components/icons/MapIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { LAKE_WEBSITE_TEMPLATES } from "@/lib/lake-websites";

export const metadata: Metadata = {
  title: "System rezerwacji i strona internetowa dla łowiska | Rybio",
  description:
    "Zarządzaj stanowiskami i rezerwacjami łowiska, aktualizuj profil i stwórz profesjonalną stronę internetową łowiska w panelu Rybio.",
  keywords: [
    "system rezerwacji dla łowiska",
    "system rezerwacji stanowisk wędkarskich",
    "kalendarz rezerwacji łowiska",
    "strona internetowa dla łowiska",
    "strona dla łowiska wędkarskiego",
    "panel właściciela łowiska",
    "zarządzanie łowiskiem",
    "oprogramowanie dla łowisk",
  ],
  alternates: {
    canonical: "/dla-wlascicieli-lowisk",
  },
  openGraph: {
    title: "Rybio dla właścicieli łowisk – rezerwacje i własna strona",
    description:
      "Zarządzaj stanowiskami, rezerwacjami, profilem i stroną internetową łowiska w jednym panelu.",
    type: "website",
    url: "https://rybio.pl/dla-wlascicieli-lowisk",
    images: [
      {
        url: "/photos/pulpit-lowiska.webp",
        width: 1600,
        height: 1000,
        alt: "Panel właściciela łowiska w Rybio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rybio dla właścicieli łowisk",
    description:
      "System rezerwacji stanowisk i strona internetowa łowiska w jednym panelu.",
    images: ["/photos/pulpit-lowiska.webp"],
  },
};

const faq = [
  {
    question: "Jak uzyskać dostęp do panelu właściciela?",
    answer:
      "Znajdź swoje łowisko w katalogu Rybio i wyślij zgłoszenie przejęcia profilu. Po weryfikacji możesz otrzymać dostęp do panelu przypisanego do Twojego łowiska.",
  },
  {
    question: "Co mogę zmieniać po przejęciu profilu łowiska?",
    answer:
      "Właściciel może zarządzać danymi swojego łowiska, zdjęciami oraz funkcjami dostępnymi w panelu, m.in. stanowiskami, rezerwacjami i stroną internetową łowiska.",
  },
  {
    question: "Jak działa system rezerwacji stanowisk?",
    answer:
      "Tworzysz stanowiska i zarządzasz rezerwacjami dla wybranych terminów. Panel pozwala zapisywać dane klienta, termin, cenę, zaliczkę, status płatności i notatki oraz blokować terminy, gdy całe łowisko jest niedostępne.",
  },
  {
    question: "Czy Rybio chroni przed nakładaniem się rezerwacji?",
    answer:
      "System uwzględnia zajętość stanowiska w danym terminie i jest zaprojektowany tak, aby nie tworzyć nakładających się rezerwacji dla tego samego miejsca.",
  },
  {
    question: "Czy mogę stworzyć stronę bez programowania?",
    answer:
      "Tak. Wybierasz jeden z przygotowanych szablonów, zmieniasz treści, zdjęcia i kolory, ustawiasz sekcje oraz publikujesz gotową stronę przypisaną do swojego łowiska.",
  },
  {
    question: "Czy dane strony mogą być pobierane z profilu Rybio?",
    answer:
      "Tak. Sekcje dotyczące gatunków ryb, cennika i regulaminu mogą korzystać z danych profilu Rybio albo działać niezależnie na własnych treściach zapisanych w kreatorze.",
  },
  {
    question: "Jaki adres ma strona łowiska?",
    answer:
      "Po ustawieniu subdomeny strona może działać pod adresem w formacie twojelowisko.rybio.pl, o ile wybrana nazwa jest dostępna i nie jest zarezerwowana przez Rybio.",
  },
];


const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const serviceStructuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Rybio dla właścicieli łowisk",
  url: "https://rybio.pl/dla-wlascicieli-lowisk",
  serviceType:
    "System rezerwacji stanowisk i narzędzia do prowadzenia strony internetowej łowiska",
  provider: {
    "@type": "Organization",
    name: "Rybio",
    url: "https://rybio.pl",
  },
  areaServed: {
    "@type": "Country",
    name: "Polska",
  },
};


export default function ForLakeOwnersPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      <PublicHeader subtitle="Narzędzia dla właścicieli łowisk" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData),
        }}
      />

      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 text-white">
        <div className="absolute left-0 top-0 h-[520px] w-[520px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-0 top-20 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1500px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[.86fr_1.14fr] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-blue-200 backdrop-blur sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Rybio dla właścicieli łowisk
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.04] tracking-[-0.04em] sm:text-5xl lg:text-[62px]">
              System rezerwacji i profesjonalna strona dla Twojego łowiska.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Zarządzaj stanowiskami, rezerwacjami i profilem łowiska w jednym
              panelu. Gdy chcesz zadbać również o obecność online, przygotuj własną
              stronę internetową łowiska bez budowania jej od zera.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/lowiska-w-polsce"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
              >
                Znajdź swoje łowisko
                <ArrowRightIcon size={17} />
              </Link>

              <Link
                href="/lowiska/zglos"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-black text-white transition hover:bg-white/10"
              >
                Dodaj łowisko
              </Link>
            </div>

            <Link href="/moje-lowiska" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white">
              Masz już dostęp właściciela? Przejdź do panelu →
            </Link>
          </div>

          <OwnerHeroPreview />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-[1500px] gap-px border-x border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          <BenefitTile icon={<CalendarIcon size={22} />} title="Rezerwacje" text="Terminy, stanowiska i dostępność w jednym miejscu." />
          <BenefitTile icon={<CardsIcon size={22} />} title="Własna strona" text="Profesjonalny szablon bez tworzenia strony od zera." />
          <BenefitTile icon={<PencilIcon size={22} />} title="Samodzielna edycja" text="Treści, zdjęcia, kolory i sekcje pod kontrolą właściciela." />
          <BenefitTile icon={<FishIcon size={24} />} title="Dane z Rybio" text="Opcjonalna synchronizacja ryb, cennika i regulaminu." />
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[.88fr_1.12fr] lg:gap-20">
          <div>
            <Eyebrow>System rezerwacji dla łowiska</Eyebrow>
            <h2 className="mt-4 max-w-xl text-3xl font-black tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              System rezerwacji stanowisk zamiast notesu, Excela i wiadomości.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
              Sprawdzasz termin i od razu widzisz, które stanowiska są wolne, zajęte lub zablokowane.
              Rezerwację przypisujesz do konkretnego stanowiska i zapisujesz najważniejsze informacje potrzebne do obsługi klienta.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <FeatureCard title="Stanowiska" text="Twórz i edytuj miejsca dostępne do rezerwacji." />
              <FeatureCard title="Terminy" text="Obsługuj różne zakresy czasu i sprawdzaj zajętość." />
              <FeatureCard title="Cena i zaliczka" text="Zapisuj koszt rezerwacji i kwotę wpłaconej zaliczki." />
              <FeatureCard title="Status płatności" text="Oznaczaj stan płatności i trzymaj porządek w rozliczeniach." />
              <FeatureCard title="Blokady łowiska" text="Wyłączaj cały obiekt na zawody, prace lub inne wydarzenie." />
              <FeatureCard title="Notatki wewnętrzne" text="Dodawaj informacje potrzebne tylko właścicielowi." />
            </div>
          </div>

          <ReservationsPanelPreview />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20 lg:py-28">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow center>Strona internetowa dla łowiska</Eyebrow>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              Wybierz projekt, który pasuje do charakteru Twojej wody.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Nie zaczynasz od pustej kartki. Rybio ma gotowe kierunki wizualne, które możesz
              dopasować do swojego łowiska przez treści, zdjęcia i kolorystykę.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {LAKE_WEBSITE_TEMPLATES.map((template) => (
              <TemplateCard
                key={template.key}
                template={template}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.06fr_.94fr] lg:gap-20">
          <WebsiteBuilderPreview />

          <div>
            <Eyebrow>Nie zaczynasz od pustej strony</Eyebrow>
            <h2 className="mt-4 max-w-xl text-3xl font-black tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              Dane łowiska mogą zasilić stronę automatycznie.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
              Informacje, które już masz w Rybio, mogą zostać wykorzystane podczas budowania strony.
              Nie musisz przepisywać wszystkiego ręcznie, a tam gdzie potrzebujesz innej treści możesz
              odłączyć sekcję od profilu i prowadzić ją niezależnie.
            </p>

            <div className="mt-8 space-y-4">
              <DataSourceRow title="Gatunki ryb" text="Synchronizuj z profilem Rybio albo wpisz własną listę." />
              <DataSourceRow title="Cennik" text="Pobierz aktualne dane z profilu lub prowadź cennik wyłącznie na stronie." />
              <DataSourceRow title="Regulamin" text="Korzystaj ze wspólnych zasad albo przygotuj niezależną wersję." />
            </div>

            <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-700">Własny adres</p>
              <p className="mt-2 text-xl font-black text-blue-950">twojelowisko.rybio.pl</p>
              <p className="mt-2 text-sm leading-6 text-blue-900/70">
                Ustaw nazwę subdomeny i publikuj stronę przypisaną do swojego łowiska.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 py-20 text-white lg:py-28">
        <div className="absolute left-1/2 top-0 h-[420px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="relative mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <div>
              <Eyebrow dark>Jak to działa?</Eyebrow>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                Od profilu łowiska do własnego panelu.
              </h2>
              <p className="mt-6 max-w-md text-base leading-8 text-slate-300">
                Dostęp właściciela jest powiązany z konkretnym łowiskiem i przyznawany po weryfikacji zgłoszenia.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ProcessStep number="01" title="Znajdź lub dodaj łowisko" text="Sprawdź katalog Rybio. Jeśli Twojego łowiska nie ma, dodaj je do bazy." />
              <ProcessStep number="02" title="Przejmij profil" text="Wyślij zgłoszenie właściciela przypisane do właściwego łowiska." />
              <ProcessStep number="03" title="Otrzymaj dostęp" text="Po akceptacji przechodzisz do panelu i możesz zarządzać swoim obiektem." />
              <ProcessStep number="04" title="Rozwijaj obecność online" text="Aktualizuj profil, rezerwacje, stanowiska i twórz stronę łowiska." />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
          <div>
            <Eyebrow>Dla różnych typów łowisk</Eyebrow>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
              Narzędzia dopasowane do realnej pracy nad wodą.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-slate-600">
              Rybio może być wykorzystane wszędzie tam, gdzie trzeba uporządkować informacje o wodzie,
              stanowiska i kontakt z wędkarzami.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Łowiska komercyjne",
              "Łowiska karpiowe",
              "Łowiska specjalistyczne",
              "Stowarzyszenia wędkarskie",
              "Agroturystyka z łowiskiem",
              "Obiekty organizujące zawody",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-black text-slate-800 shadow-sm">
                <span className="mr-2 text-blue-600">✓</span>{item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20 lg:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-4 sm:px-6 lg:grid-cols-[.68fr_1.32fr] lg:gap-16 lg:px-8">
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
              Najczęstsze pytania właścicieli łowisk
            </h2>
          </div>

          <div className="grid gap-3">
            {faq.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-black text-slate-950 marker:content-none">
                  {item.question}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-lg text-slate-400 ring-1 ring-slate-200 transition group-open:rotate-45 group-open:text-blue-600">+</span>
                </summary>
                <p className="mt-4 max-w-3xl pr-10 text-sm leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-blue-600 p-8 text-white shadow-2xl sm:p-10 lg:p-14">
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-100">Prowadzisz łowisko?</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                Zacznij od znalezienia swojego profilu w Rybio.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-blue-50">
                Przejmij istniejący profil albo zgłoś łowisko, jeśli nie ma go jeszcze w katalogu.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link href="/lowiska-w-polsce" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-black text-blue-700 transition hover:bg-blue-50">
                Znajdź swoje łowisko
              </Link>
              <Link href="/lowiska/zglos" className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-black text-white transition hover:bg-white/15">
                Dodaj łowisko
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function OwnerHeroPreview() {
  return (
    <div className="relative min-h-[520px]">
      <div className="absolute left-0 top-10 z-10 w-[72%] overflow-hidden rounded-[2rem] border border-white/10 bg-white text-slate-950 shadow-2xl">
        <div className="border-b border-slate-100 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">Panel właściciela</p>
          <p className="mt-2 text-xl font-black">Rezerwacje stanowisk</p>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
          <StatusTile number="01" status="Wolne" type="free" />
          <StatusTile number="02" status="Zajęte" type="busy" />
          <StatusTile number="03" status="Wolne" type="free" />
          <StatusTile number="04" status="Blokada" type="blocked" />
          <StatusTile number="05" status="Wolne" type="free" />
          <StatusTile number="06" status="Zajęte" type="busy" />
        </div>
      </div>

      <div className="absolute bottom-0 right-0 z-20 w-[70%] rotate-[2deg] overflow-hidden rounded-[2rem] border border-white/15 bg-white text-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-[10px] font-black tracking-[0.15em]">WATERLINE</p>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-black text-emerald-700">Opublikowana</span>
        </div>
        <div className="bg-[linear-gradient(135deg,#dbeafe,#bfdbfe_52%,#99f6e4)] p-6">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-700">Łowisko Jezioro</p>
          <p className="mt-3 max-w-[260px] text-3xl font-black leading-tight tracking-tight">Miejsce stworzone dla pasji do wody.</p>
          <span className="mt-5 inline-flex rounded-full bg-blue-600 px-4 py-2 text-[10px] font-black text-white">Poznaj łowisko</span>
        </div>
        <div className="p-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">Adres strony</p>
          <p className="mt-1 text-sm font-black text-blue-700">twojelowisko.rybio.pl</p>
        </div>
      </div>
    </div>
  );
}

function ReservationsPanelPreview() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-3 shadow-[0_32px_80px_-35px_rgba(15,23,42,.45)] sm:p-5">
      <div className="overflow-hidden rounded-[1.55rem] border border-white/10 bg-white">
        <img
          src="/photos/kalendarz-rezerwacji.webp"
          alt="Kalendarz rezerwacji stanowisk w panelu właściciela Rybio"
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}

function WebsiteBuilderPreview() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-3 shadow-[0_32px_80px_-35px_rgba(15,23,42,.45)] sm:p-5">
      <div className="overflow-hidden rounded-[1.55rem] border border-white/10 bg-white">
        <img
          src="/photos/strony-internetowe.webp"
          alt="Kreator strony internetowej łowiska w Rybio"
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}

function TemplateCard({ template }: { template: (typeof LAKE_WEBSITE_TEMPLATES)[number] }) {
  const isDark = template.key === "carp-lodge";
  const isEditorial = template.key === "fishery-club";

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div
        className="min-h-[260px] p-5"
        style={{ backgroundColor: template.swatches[2] }}
      >
        <div className="flex items-center justify-between">
          <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${isDark ? "text-stone-200" : "text-slate-800"}`}>
            {template.label}
          </p>
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: template.swatches[0] }} />
        </div>

        <div className="mt-10">
          <p className={`text-[9px] font-black uppercase tracking-[0.16em] ${isDark ? "text-stone-400" : "text-slate-500"}`}>
            {template.category}
          </p>
          <p className={`mt-3 max-w-[220px] text-2xl font-black leading-tight tracking-tight ${isDark ? "text-stone-100" : "text-slate-950"}`}>
            {isEditorial
              ? "Woda. Ryby. Wynik."
              : template.key === "wild-water"
                ? "Blisko natury."
                : template.key === "carp-lodge"
                  ? "Private fishery."
                  : "Miejsce nad wodą."}
          </p>
          <div className="mt-7 h-16 rounded-xl" style={{ background: `linear-gradient(135deg, ${template.swatches[0]}, ${template.swatches[1]})` }} />
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-black text-slate-950">{template.label}</h3>
        <p className="mt-1 text-xs font-bold text-blue-600">{template.bestFor}</p>
        <p className="mt-3 text-sm leading-6 text-slate-500">{template.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {template.features.map((feature) => (
            <span key={feature} className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600">{feature}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function Eyebrow({ children, center = false, dark = false }: { children: ReactNode; center?: boolean; dark?: boolean }) {
  return <p className={`text-xs font-black uppercase tracking-[0.18em] ${dark ? "text-blue-300" : "text-blue-600"} ${center ? "text-center" : ""}`}>{children}</p>;
}

function BenefitTile({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="bg-white p-6 sm:p-7">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">{icon}</div>
      <h2 className="mt-5 text-lg font-black text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-black text-blue-700">✓</div>
      <h3 className="mt-3 text-sm font-black text-slate-950">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function DataSourceRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><CheckListIcon size={19} /></div>
      <div>
        <h3 className="text-sm font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function ProcessStep({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-5">
      <span className="text-xs font-black text-blue-300">{number}</span>
      <h3 className="mt-4 text-lg font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-400">{text}</p>
    </div>
  );
}

function StatusTile({ number, status, type }: { number: string; status: string; type: "free" | "busy" | "blocked" }) {
  return (
    <div className={`rounded-xl border p-3 ${type === "free" ? "border-emerald-100 bg-emerald-50" : type === "busy" ? "border-red-100 bg-red-50" : "border-amber-100 bg-amber-50"}`}>
      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">Stanowisko</p>
      <p className="mt-1 text-lg font-black">{number}</p>
      <p className="mt-1 text-[9px] font-bold text-slate-500">{status}</p>
    </div>
  );
}

