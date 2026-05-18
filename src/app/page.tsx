import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rybio – aplikacja dla wędkarzy i mapa łowisk w Polsce",
  description:
    "Znajduj łowiska w Polsce, sprawdzaj opinie wędkarzy i zapisuj swoje połowy. Rybio to mapa łowisk, dziennik połowów i społeczność wędkarska.",
};

const mainBenefits = [
  {
    title: "Znajduj łowiska w Polsce",
    description:
      "Przeglądaj mapę łowisk, filtruj miejsca według lokalizacji, rodzaju wody, gatunków ryb i dostępnych udogodnień. Sprawdź, gdzie warto pojechać na karpia, szczupaka, lina, amura, suma czy leszcza.",
  },
  {
    title: "Zapisuj swoje połowy",
    description:
      "Dodawaj zdjęcia ryb, wagę, długość, datę, metodę połowu, przynętę i łowisko. Twórz własny dziennik połowów, dzięki któremu łatwiej przeanalizujesz swoje wyprawy i wrócisz do najlepszych miejsc.",
  },
  {
    title: "Korzystaj z opinii społeczności",
    description:
      "Czytaj opinie innych wędkarzy, oceniaj łowiska i dziel się doświadczeniem. Rybio pomaga podejmować lepsze decyzje przed wyjazdem na nowe miejsce.",
  },
];

const audience = [
  {
    title: "Dla początkujących wędkarzy",
    description:
      "Jeżeli dopiero zaczynasz przygodę z wędkarstwem, Rybio pomoże Ci znaleźć sprawdzone łowiska, poznać opinie innych osób i lepiej przygotować się do pierwszych wypraw.",
  },
  {
    title: "Dla aktywnych wędkarzy",
    description:
      "Jeżeli regularnie jeździsz na ryby, możesz prowadzić własny rejestr połowów, obserwować ulubione łowiska i dzielić się wynikami z innymi użytkownikami.",
  },
  {
    title: "Dla karpiarzy, feederowców i spinningistów",
    description:
      "Szukasz łowisk karpiowych, miejsc pod feeder, wód z drapieżnikiem albo spokojnych łowisk rekreacyjnych? Dzięki filtrom i opiniom łatwiej znajdziesz miejsce dopasowane do swojej metody łowienia.",
  },
  {
    title: "Dla właścicieli łowisk",
    description:
      "Prowadzisz łowisko komercyjne? Dodaj je do Rybio, pokaż ofertę, zdjęcia, cennik, gatunki ryb i udogodnienia dostępne dla wędkarzy.",
  },
];

const steps = [
  {
    number: "01",
    title: "Wybierz łowisko lub znajdź nowe miejsce",
    description:
      "Skorzystaj z listy łowisk, mapy lub filtrów, aby znaleźć miejsce na kolejną wyprawę wędkarską.",
  },
  {
    number: "02",
    title: "Sprawdź informacje i opinie",
    description:
      "Zobacz opis łowiska, zdjęcia, dostępne gatunki ryb, udogodnienia, oceny oraz doświadczenia innych użytkowników.",
  },
  {
    number: "03",
    title: "Dodaj swój połów",
    description:
      "Po powrocie z wyprawy zapisz swój wynik, dodaj zdjęcie, wagę, długość, metodę połowu i własne notatki.",
  },
  {
    number: "04",
    title: "Buduj swój profil wędkarski",
    description:
      "Twórz historię swoich połowów, obserwuj statystyki i dziel się wybranymi wynikami ze społecznością.",
  },
];

const seoLinks = [
  "Łowiska mazowieckie",
  "Łowiska lubelskie",
  "Łowiska śląskie",
  "Łowiska wielkopolskie",
  "Łowiska małopolskie",
  "Łowiska podkarpackie",
  "Łowiska z domkami",
  "Łowiska karpiowe",
  "Łowiska No Kill",
  "Łowiska z noclegiem",
];

const appFeatures = [
  {
    title: "Mapa łowisk",
    description:
      "Przeglądaj łowiska w Polsce na mapie i odkrywaj nowe miejsca w swojej okolicy.",
  },
  {
    title: "Profile łowisk",
    description:
      "Sprawdzaj opisy, zdjęcia, gatunki ryb, udogodnienia, cenniki i opinie użytkowników.",
  },
  {
    title: "Rejestr połowów",
    description:
      "Zapisuj swoje wyniki, zdjęcia, wagę, długość, metodę połowu i notatki z wypraw.",
  },
  {
    title: "Opinie i oceny",
    description:
      "Dodawaj recenzje łowisk i korzystaj z doświadczeń innych wędkarzy.",
  },
  {
    title: "Rankingi połowów",
    description:
      "Porównuj wyniki, sprawdzaj największe ryby i obserwuj aktywność społeczności.",
  },
  {
    title: "Filtry wyszukiwania",
    description:
      "Szukaj łowisk według województwa, miasta, gatunków ryb, metody połowu i udogodnień.",
  },
];

const categories = [
  {
    title: "Łowiska karpiowe",
    description:
      "Znajdź miejsca, w których możesz zaplanować zasiadkę na karpia, amura lub dużego leszcza.",
  },
  {
    title: "Łowiska feederowe",
    description:
      "Odkrywaj łowiska dobre pod klasycznego feedera, method feeder i spokojne wyprawy nad wodę.",
  },
  {
    title: "Łowiska spinningowe",
    description:
      "Szukaj miejsc z drapieżnikiem, gdzie możesz zaplanować wyprawę na szczupaka, sandacza, okonia lub suma.",
  },
  {
    title: "Łowiska No Kill",
    description:
      "Sprawdzaj łowiska, na których ryby po złowieniu wracają bezpiecznie do wody.",
  },
  {
    title: "Łowiska z dużym karpiem",
    description:
      "Znajdź miejsca, które przyciągają wędkarzy szukających większych okazów i rekordowych wyników.",
  },
  {
    title: "Łowiska z sumem",
    description:
      "Odkrywaj łowiska, na których możesz zaplanować wyprawę z nastawieniem na dużego suma.",
  },
  {
    title: "Łowiska z noclegiem",
    description:
      "Sprawdź miejsca z zapleczem noclegowym, idealne na dłuższą zasiadkę lub weekendowy wyjazd.",
  },
  {
    title: "Łowiska z domkami",
    description:
      "Wybieraj łowiska, które oferują domki, wygodne zaplecze i możliwość dłuższego pobytu.",
  },
  {
    title: "Łowiska rodzinne",
    description:
      "Szukaj miejsc przyjaznych rodzinom, z udogodnieniami, parkingiem, toaletą lub przestrzenią rekreacyjną.",
  },
  {
    title: "Łowiska komercyjne",
    description:
      "Przeglądaj komercyjne łowiska z opisem, cennikiem, gatunkami ryb i informacjami kontaktowymi.",
  },
];

const benefits = [
  "Oszczędzasz czas przy szukaniu łowiska.",
  "Łatwiej planujesz wyprawy wędkarskie.",
  "Masz własny dziennik połowów zawsze pod ręką.",
  "Korzystasz z opinii innych wędkarzy.",
  "Możesz pokazać swoje połowy społeczności.",
  "Pomagasz tworzyć największą bazę łowisk w Polsce.",
];

const faq = [
  {
    question: "Czy Rybio jest aplikacją dla wszystkich wędkarzy?",
    answer:
      "Tak. Rybio jest tworzone z myślą o początkujących i doświadczonych wędkarzach, którzy chcą znajdować łowiska, zapisywać połowy i korzystać z wiedzy społeczności.",
  },
  {
    question: "Czy mogę dodać własne łowisko?",
    answer:
      "Tak. Użytkownicy mogą dodawać łowiska i uzupełniać informacje, które pomogą innym osobom lepiej zaplanować wyjazd nad wodę.",
  },
  {
    question: "Czy mogę prowadzić prywatny dziennik połowów?",
    answer:
      "Tak. W Rybio możesz zapisywać swoje połowy, dodawać zdjęcia, notatki i szczegóły wypraw. Część informacji może być prywatna lub publiczna, zależnie od ustawień aplikacji.",
  },
  {
    question: "Czy Rybio pokazuje dokładne miejscówki?",
    answer:
      "Rybio może pomagać w odnajdywaniu łowisk i miejsc do wędkowania, ale użytkownik powinien mieć kontrolę nad tym, jakie informacje udostępnia publicznie.",
  },
  {
    question: "Czy właściciel łowiska może dodać swoje miejsce?",
    answer:
      "Tak. Właściciel łowiska może dodać profil, opis, zdjęcia, dane kontaktowe, dostępne gatunki ryb i udogodnienia.",
  },
  {
    question: "Czy Rybio działa na telefonie?",
    answer:
      "Tak. Aplikacja jest projektowana z myślą o wygodnym korzystaniu na telefonie, zarówno podczas planowania wyprawy, jak i nad wodą.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">
              R
            </div>

            <div>
              <p className="text-xl font-black tracking-tight">Rybio</p>
              <p className="text-xs font-semibold text-slate-500">
                Aplikacja dla wędkarzy
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
            <a href="#czym-jest" className="transition hover:text-blue-600">
              O aplikacji
            </a>
            <a href="#lowiska" className="transition hover:text-blue-600">
              Łowiska
            </a>
            <a href="#dziennik" className="transition hover:text-blue-600">
              Dziennik połowów
            </a>
            <a href="#funkcje" className="transition hover:text-blue-600">
              Funkcje
            </a>
            <a href="#faq" className="transition hover:text-blue-600">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
            >
              Zaloguj się
            </Link>

            <Link
              href="/register"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Dołącz do Rybio
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),radial-gradient(circle_at_top_right,#ccfbf1,transparent_30%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
              Mapa łowisk, dziennik połowów i społeczność wędkarska
            </div>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Rybio – aplikacja dla wędkarzy i mapa łowisk w Polsce
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Znajduj łowiska w Polsce, sprawdzaj opinie innych wędkarzy,
              zapisuj swoje połowy i odkrywaj nowe miejsca na wędkarskie
              wyprawy. Rybio łączy mapę łowisk, dziennik połowów i społeczność
              wędkarską w jednej aplikacji.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/lowiska"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Sprawdź łowiska
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Dołącz do Rybio
              </Link>
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-500">
              Dołącz do społeczności wędkarzy i pomóż tworzyć największą bazę
              łowisk w Polsce.
            </p>

            <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
              <HeroStat value="Mapa" label="łowisk w Polsce" />
              <HeroStat value="Dziennik" label="Twoich połowów" />
              <HeroStat value="Rankingi" label="największych ryb" />
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl">
              <div className="rounded-[1.5rem] bg-slate-950 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">
                      Ranking połowów
                    </p>
                    <p className="text-xs text-slate-400">
                      Najlepsze wyniki na łowisku
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-black text-white">
                    TOP 5
                  </span>
                </div>

                <div className="space-y-3">
                  <RankingPreviewItem
                    place="1"
                    fish="Karp"
                    result="25.00 kg"
                    user="Jakub Nowak"
                    variant="gold"
                  />

                  <RankingPreviewItem
                    place="2"
                    fish="Amur biały"
                    result="20.00 kg"
                    user="Jakub Groszkowski"
                    variant="silver"
                  />

                  <RankingPreviewItem
                    place="3"
                    fish="Lin"
                    result="5.00 kg"
                    user="Użytkownik"
                    variant="bronze"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-blue-50 p-5">
                  <p className="text-sm font-bold text-blue-700">
                    Rejestr połowów
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-950">
                    online
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    zdjęcia, waga, długość i notatki
                  </p>
                </div>

                <div className="rounded-3xl bg-emerald-50 p-5">
                  <p className="text-sm font-bold text-emerald-700">
                    Profile łowisk
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-950">
                    baza
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    opisy, opinie, gatunki i udogodnienia
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-xl lg:block">
              <p className="text-sm font-bold text-slate-500">
                Następna wyprawa
              </p>
              <p className="mt-1 font-black text-slate-950">
                Łowisko Specjalne Halinów
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Checklista gotowa
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="czym-jest" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
              Czym jest Rybio?
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Jedna aplikacja do planowania wypraw, szukania łowisk i zapisywania połowów.
            </h2>
          </div>

          <div className="space-y-5 text-base leading-8 text-slate-600">
            <p>
              Rybio to internetowa aplikacja dla wędkarzy, która pomaga planować
              wyprawy, znajdować nowe łowiska i zapisywać własne połowy.
              Zamiast szukać informacji po wielu grupach, forach i komentarzach,
              możesz korzystać z jednej bazy tworzonej przez społeczność
              wędkarzy z całej Polski.
            </p>

            <p>
              W aplikacji znajdziesz łowiska komercyjne, miejsca do wędkowania,
              opinie użytkowników, informacje o gatunkach ryb, udogodnieniach
              oraz zdjęciach dodawanych przez innych wędkarzy. Możesz też
              prowadzić własny rejestr połowów i wracać do swoich najlepszych
              wyników w dowolnym momencie.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Korzyści"
            title="Wszystko, czego potrzebuje wędkarz przed wyjazdem nad wodę"
            description="Rybio porządkuje najważniejsze informacje, które pomagają lepiej przygotować wyprawę i wracać do najlepszych wyników."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {mainBenefits.map((item) => (
              <InfoCard key={item.title} title={item.title} description={item.description} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Dla kogo?"
          title="Aplikacja dla każdego wędkarza"
          description="Rybio powstaje z myślą o wszystkich osobach, które lubią spędzać czas nad wodą – niezależnie od doświadczenia, metody połowu i ulubionego gatunku ryb."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {audience.map((item) => (
            <InfoCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Jak działa Rybio?"
            title="Od znalezienia łowiska do zapisania rekordu"
            description="Korzystanie z Rybio jest proste: znajdujesz łowisko, planujesz wyprawę, dodajesz połów i budujesz swój profil wędkarski."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="mb-6 text-5xl font-black text-blue-100">
                  {step.number}
                </div>

                <h3 className="text-xl font-black text-slate-950">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="lowiska" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
                Łowiska w Polsce
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Znajdź miejsce na kolejną wyprawę
              </h2>

              <div className="mt-5 space-y-5 leading-8 text-slate-600">
                <p>
                  Szukasz sprawdzonego łowiska w swojej okolicy? W Rybio możesz
                  odkrywać łowiska w Polsce według województwa, miasta, rodzaju
                  wody, gatunków ryb i dostępnych udogodnień. To wygodne
                  rozwiązanie dla osób, które chcą szybko sprawdzić, gdzie
                  pojechać na ryby, jakie warunki oferuje dane miejsce i co
                  sądzą o nim inni wędkarze.
                </p>

                <p>
                  Baza łowisk może obejmować zarówno łowiska komercyjne, jak i
                  inne miejsca popularne wśród wędkarzy. Dzięki temu użytkownicy
                  mogą łatwiej planować weekendowe wypady, rodzinne wyjazdy nad
                  wodę oraz dłuższe zasiadki.
                </p>
              </div>

              <Link
                href="/lowiska"
                className="mt-7 inline-flex rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Przeglądaj łowiska
              </Link>
            </div>

            <div>
              <p className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-slate-400">
                Popularne wyszukiwania
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {seoLinks.map((item) => (
                  <Link
                    key={item}
                    href="/lowiska"
                    className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="dziennik" className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-600">
              Dziennik połowów
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Dziennik połowów online dla wędkarzy
            </h2>

            <div className="mt-5 space-y-5 leading-8 text-slate-600">
              <p>
                Rybio może służyć jako prywatny lub społecznościowy dziennik
                połowów. Zapisuj swoje wyprawy, dodawaj zdjęcia ryb, oznaczaj
                łowiska, notuj użyte przynęty, metodę połowu, pogodę, datę oraz
                najważniejsze informacje z danego dnia.
              </p>

              <p>
                Dzięki temu z czasem zbudujesz własną bazę wiedzy o tym, gdzie,
                kiedy i na co łowiłeś najskuteczniej. Dziennik połowów pomaga
                lepiej analizować wyniki, planować kolejne wyprawy i wracać do
                najlepszych momentów z sezonu.
              </p>
            </div>

            <Link
              href="/register"
              className="mt-7 inline-flex rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Załóż konto i dodaj pierwszy połów
            </Link>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
                Przykładowy wpis
              </p>

              <h3 className="mt-3 text-2xl font-black text-slate-950">
                Karp
              </h3>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MiniStat label="Waga" value="12.40 kg" />
                <MiniStat label="Długość" value="86 cm" />
                <MiniStat label="Metoda" value="Method feeder" />
                <MiniStat label="Przynęta" value="Pellet" />
              </div>

              <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Branie przy trzcinach, spokojny poranek, temperatura około 12°C.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Społeczność"
          title="Społeczność wędkarzy z całej Polski"
          description="Rybio to nie tylko mapa łowisk, ale również społeczność osób, które dzielą tę samą pasję."
        />

        <div className="mt-8 rounded-[2rem] bg-slate-950 p-8 lg:p-10">
          <p className="max-w-4xl text-lg leading-8 text-slate-300">
            Użytkownicy mogą dodawać połowy, oceniać łowiska, publikować
            zdjęcia, dzielić się doświadczeniem i wspólnie tworzyć bazę wiedzy
            przydatną dla innych wędkarzy. Im więcej osób dołączy do Rybio, tym
            dokładniejsze i bardziej aktualne będą informacje o łowiskach,
            gatunkach ryb, warunkach nad wodą i możliwościach planowania wypraw.
          </p>
        </div>
      </section>

      <section id="funkcje" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Funkcje aplikacji"
            title="Najważniejsze funkcje aplikacji Rybio"
            description="W jednym panelu możesz przeglądać łowiska, zapisywać połowy, planować wyprawy i korzystać z wiedzy społeczności."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {appFeatures.map((item) => (
              <InfoCard key={item.title} title={item.title} description={item.description} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
              Dlaczego warto?
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Dlaczego warto korzystać z Rybio?
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              Wielu wędkarzy przed wyjazdem nad wodę szuka informacji w różnych
              miejscach: na grupach Facebookowych, forach, stronach łowisk, w
              komentarzach i prywatnych wiadomościach. Rybio porządkuje te
              informacje i pozwala korzystać z nich w jednym miejscu.
            </p>
          </div>

          <div className="grid gap-3">
            {benefits.map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                  ✓
                </span>

                <p className="font-semibold text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Kategorie łowisk"
            title="Odkrywaj łowiska dopasowane do Twojego stylu łowienia"
            description="Szukaj miejsc według metody połowu, gatunku ryb, udogodnień i charakteru wyprawy."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-blue-50"
              >
                <h3 className="font-black text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-slate-950">
          <div className="grid gap-8 p-8 lg:grid-cols-[1fr_360px] lg:p-12">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-300">
                Dla właścicieli łowisk
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Prowadzisz łowisko? Dodaj je do Rybio
              </h2>

              <p className="mt-5 max-w-3xl leading-8 text-slate-300">
                Jeżeli prowadzisz łowisko komercyjne, Rybio może pomóc Ci
                dotrzeć do nowych wędkarzy. Dodaj profil łowiska, uzupełnij
                opis, zdjęcia, gatunki ryb, cennik, udogodnienia i dane
                kontaktowe. Dzięki temu użytkownicy łatwiej znajdą Twoje miejsce
                podczas planowania kolejnej wyprawy.
              </p>

              <Link
                href="/lowiska/zglos"
                className="mt-8 inline-flex rounded-2xl bg-white px-6 py-4 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                Dodaj łowisko
              </Link>
            </div>

            <div className="rounded-3xl bg-white p-5">
              <p className="text-sm font-black text-slate-950">
                Profil łowiska może zawierać:
              </p>

              <div className="mt-5 space-y-3">
                {[
                  "opis i zdjęcia",
                  "gatunki ryb",
                  "cennik i regulamin",
                  "udogodnienia",
                  "dane kontaktowe",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="FAQ"
            title="Najczęściej zadawane pytania"
            description="Odpowiedzi na najważniejsze pytania dotyczące aplikacji Rybio."
          />

          <div className="mt-10 space-y-4">
            {faq.map((item) => (
              <article
                key={item.question}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <h3 className="text-lg font-black text-slate-950">
                  {item.question}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm lg:p-12">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Dołącz do Rybio i odkrywaj łowiska razem z innymi wędkarzami
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-600">
            Załóż konto, sprawdź łowiska w Polsce, dodaj swoje pierwsze połowy
            i pomóż tworzyć społecznościową bazę wiedzy dla wędkarzy.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Zarejestruj się za darmo
            </Link>

            <Link
              href="/lowiska"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Przeglądaj łowiska
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Rybio. Aplikacja dla wędkarzy.</p>

          <div className="flex flex-wrap gap-4">
            <Link href="/lowiska" className="font-semibold hover:text-blue-600">
              Łowiska
            </Link>
            <Link href="/login" className="font-semibold hover:text-blue-600">
              Logowanie
            </Link>
            <Link href="/register" className="font-semibold hover:text-blue-600">
              Rejestracja
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 leading-8 text-slate-600">{description}</p>
    </div>
  );
}

function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-blue-600">
        ✓
      </div>

      <h3 className="text-xl font-black text-slate-950">{title}</h3>

      <p className="mt-3 leading-7 text-slate-600">{description}</p>
    </article>
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

function RankingPreviewItem({
  place,
  fish,
  result,
  user,
  variant,
}: {
  place: string;
  fish: string;
  result: string;
  user: string;
  variant: "gold" | "silver" | "bronze";
}) {
  const variantClasses = {
    gold: "bg-amber-400 text-white",
    silver: "bg-slate-300 text-slate-950",
    bronze: "bg-orange-300 text-white",
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${variantClasses[variant]}`}
      >
        {place}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-black text-white">{fish}</p>
        <p className="text-sm text-slate-400">Dodał: {user}</p>
      </div>

      <div className="rounded-xl bg-white px-3 py-2 text-sm font-black text-slate-950">
        {result}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 font-black text-slate-950">{value}</p>
    </div>
  );
}