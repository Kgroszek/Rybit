import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Polityka prywatności | Rybio",
  description:
    "Polityka prywatności serwisu Rybio. Sprawdź zasady przetwarzania danych osobowych, cookies, kont użytkowników, zdjęć i treści dodawanych w serwisie.",
};

const sections = [
  {
    title: "1. Administrator danych osobowych",
    content: [
      "Administratorem danych osobowych użytkowników serwisu Rybio jest Jakub Groszkowski.",
      "E-mail kontaktowy: kontakt@rybio.pl",
      "W sprawach związanych z ochroną danych osobowych, prywatnością, usunięciem konta lub realizacją praw wynikających z RODO można kontaktować się pod adresem: kontakt@rybio.pl.",
    ],
  },
  {
    title: "2. Zakres zbieranych danych",
    content: [
      "W ramach korzystania z serwisu Rybio możemy przetwarzać dane przekazywane przez użytkownika podczas rejestracji, logowania oraz korzystania z funkcji serwisu.",
    ],
    list: [
      "adres e-mail,",
      "nazwa użytkownika lub login,",
      "hasło w formie zaszyfrowanej,",
      "dane podane w profilu użytkownika,",
      "zdjęcia dodawane przez użytkownika,",
      "opinie, komentarze i oceny łowisk,",
      "informacje o dodanych łowiskach,",
      "treści publikowane przez użytkownika w serwisie,",
      "dane techniczne, takie jak adres IP, typ urządzenia, przeglądarka, system operacyjny oraz dane związane z aktywnością w serwisie,",
      "informacje zapisywane w plikach cookies.",
    ],
    afterList:
      "Serwis nie wymaga podawania danych szczególnych kategorii, takich jak dane dotyczące zdrowia, poglądów politycznych, religii czy innych danych wrażliwych. Użytkownik nie powinien publikować takich informacji w komentarzach, opiniach, opisach ani zdjęciach.",
  },
  {
    title: "3. Cele przetwarzania danych",
    content: [
      "Dane osobowe użytkowników są przetwarzane w następujących celach:",
    ],
    list: [
      "założenie i obsługa konta użytkownika,",
      "umożliwienie logowania do serwisu,",
      "umożliwienie dodawania opinii, komentarzy, ocen i zdjęć,",
      "prezentowanie treści dodanych przez użytkowników w serwisie,",
      "obsługa zgłoszeń, pytań i kontaktu z administratorem,",
      "zapewnienie bezpieczeństwa serwisu,",
      "zapobieganie nadużyciom, spamowi i nieuprawnionemu korzystaniu z kont,",
      "prowadzenie statystyk i analizy działania serwisu,",
      "poprawa funkcjonalności oraz wygody korzystania z serwisu,",
      "realizacja obowiązków wynikających z przepisów prawa.",
    ],
  },
  {
    title: "4. Podstawy prawne przetwarzania danych",
    content: [
      "Dane osobowe użytkowników mogą być przetwarzane na podstawie:",
    ],
    list: [
      "art. 6 ust. 1 lit. b RODO — gdy przetwarzanie jest niezbędne do świadczenia usług drogą elektroniczną, w tym założenia i obsługi konta użytkownika,",
      "art. 6 ust. 1 lit. a RODO — gdy użytkownik wyraził zgodę, na przykład na określone pliki cookies lub działania analityczne,",
      "art. 6 ust. 1 lit. f RODO — gdy przetwarzanie jest niezbędne do realizacji prawnie uzasadnionego interesu administratora, takiego jak zapewnienie bezpieczeństwa serwisu, obsługa zgłoszeń, ochrona przed nadużyciami, rozwój serwisu i dochodzenie ewentualnych roszczeń,",
      "art. 6 ust. 1 lit. c RODO — gdy przetwarzanie jest niezbędne do wykonania obowiązku prawnego ciążącego na administratorze.",
    ],
  },
  {
    title: "5. Konto użytkownika",
    content: [
      "Założenie konta w serwisie Rybio wymaga podania danych niezbędnych do rejestracji i logowania, w szczególności adresu e-mail oraz hasła.",
      "Hasła użytkowników nie są przechowywane w jawnej formie. Administrator stosuje środki techniczne mające na celu ochronę kont użytkowników przed nieuprawnionym dostępem.",
      "Użytkownik powinien dbać o poufność swoich danych logowania i nie udostępniać ich innym osobom.",
    ],
  },
  {
    title: "6. Zdjęcia dodawane przez użytkowników",
    content: [
      "Serwis Rybio umożliwia dodawanie zdjęć, na przykład zdjęć ryb, łowisk, wypraw wędkarskich lub innych materiałów związanych z tematyką serwisu.",
      "Dodając zdjęcie, użytkownik oświadcza, że:",
    ],
    list: [
      "posiada prawa do dodanego zdjęcia,",
      "zdjęcie nie narusza praw osób trzecich,",
      "w przypadku gdy na zdjęciu widoczne są inne osoby, użytkownik posiada ich zgodę na publikację zdjęcia w serwisie,",
      "zdjęcie nie zawiera treści bezprawnych, obraźliwych, naruszających prywatność lub dobra osobiste innych osób.",
    ],
    afterList:
      "Administrator może usunąć zdjęcie, jeżeli narusza ono regulamin serwisu, przepisy prawa, prawa osób trzecich lub zasady społeczności. Jeżeli użytkownik zauważy zdjęcie naruszające jego prawa, prywatność lub wizerunek, może zgłosić to na adres: kontakt@rybio.pl.",
  },
  {
    title: "7. Opinie, komentarze i treści użytkowników",
    content: [
      "Użytkownicy mogą dodawać w serwisie opinie, komentarze, oceny łowisk oraz inne treści związane z funkcjonowaniem serwisu.",
      "Treści publikowane przez użytkowników mogą być widoczne dla innych odwiedzających serwis, w tym dla osób niezalogowanych, jeżeli dana część serwisu jest publiczna.",
      "Użytkownik powinien unikać publikowania danych osobowych swoich lub innych osób, takich jak adres zamieszkania, numer telefonu, adres e-mail, dane dzieci, dane lokalizacyjne prywatnych miejsc lub inne informacje, które mogłyby naruszać prywatność.",
      "Administrator zastrzega sobie prawo do moderowania lub usuwania treści, które naruszają prawo, regulamin, dobre obyczaje, prawa innych osób lub bezpieczeństwo serwisu.",
    ],
  },
  {
    title: "8. Dane dzieci i osób poniżej 16 lat",
    content: [
      "Serwis Rybio nie jest kierowany bezpośrednio do dzieci poniżej 16 roku życia.",
      "Osoby poniżej 16 lat powinny korzystać z serwisu wyłącznie za zgodą rodzica lub opiekuna prawnego. Jeżeli administrator otrzyma informację, że dane osoby poniżej 16 lat są przetwarzane bez wymaganej zgody, może podjąć działania w celu usunięcia konta lub danych.",
    ],
  },
  {
    title: "9. Pliki cookies",
    content: [
      "Serwis Rybio korzysta z plików cookies oraz podobnych technologii.",
      "Cookies to niewielkie pliki zapisywane na urządzeniu użytkownika, które mogą być wykorzystywane do prawidłowego działania strony, zapamiętywania ustawień, obsługi logowania, prowadzenia statystyk oraz analizy sposobu korzystania z serwisu.",
      "Serwis może wykorzystywać następujące rodzaje cookies:",
    ],
    list: [
      "cookies niezbędne — potrzebne do prawidłowego działania serwisu, logowania i bezpieczeństwa,",
      "cookies analityczne — służące do badania statystyk odwiedzin i sposobu korzystania z serwisu,",
      "cookies funkcjonalne — ułatwiające korzystanie z serwisu i zapamiętywanie preferencji użytkownika,",
      "cookies marketingowe — tylko jeśli w przyszłości zostaną wdrożone narzędzia reklamowe, takie jak Meta Pixel.",
    ],
    afterList:
      "Użytkownik może zarządzać plikami cookies z poziomu ustawień swojej przeglądarki lub poprzez baner zgód cookies, jeżeli jest dostępny w serwisie.",
  },
  {
    title: "10. Google Analytics",
    content: [
      "Serwis Rybio korzysta z narzędzia Google Analytics, które pomaga analizować ruch na stronie, sprawdzać popularność podstron oraz poprawiać działanie serwisu.",
      "Google Analytics może wykorzystywać pliki cookies i podobne technologie do zbierania informacji statystycznych dotyczących korzystania z serwisu, takich jak odwiedzone podstrony, czas wizyty, typ urządzenia, przeglądarka czy przybliżona lokalizacja.",
      "Dane zbierane przez Google Analytics są wykorzystywane w celach statystycznych i analitycznych. Użytkownik może ograniczyć lub zablokować działanie cookies analitycznych poprzez ustawienia przeglądarki lub mechanizm zarządzania zgodami cookies dostępny w serwisie.",
    ],
  },
  {
    title: "11. Meta Pixel",
    content: [
      "Na dzień wejścia w życie niniejszej Polityki prywatności administrator nie przesądza jeszcze, czy w serwisie będzie wykorzystywany Meta Pixel.",
      "Jeżeli Meta Pixel zostanie wdrożony, Polityka prywatności zostanie zaktualizowana. Użytkownicy zostaną poinformowani o stosowaniu tego narzędzia, a tam, gdzie będzie to wymagane, jego działanie będzie uzależnione od zgody użytkownika.",
      "Meta Pixel może służyć do analizy skuteczności reklam, tworzenia grup odbiorców, remarketingu oraz mierzenia zdarzeń wykonywanych w serwisie.",
    ],
  },
  {
    title: "12. Hosting i podmioty techniczne",
    content: [
      "Dane przetwarzane w ramach serwisu Rybio mogą być przechowywane na serwerach dostawcy usług hostingowych: hostido.pl.",
      "Dostawca hostingu może mieć dostęp do danych w zakresie niezbędnym do świadczenia usług technicznych, utrzymania serwera, zapewnienia bezpieczeństwa oraz prawidłowego działania serwisu.",
      "Administrator może korzystać również z innych narzędzi technicznych potrzebnych do działania serwisu, takich jak systemy poczty e-mail, systemy analityczne, narzędzia bezpieczeństwa lub systemy kopii zapasowych.",
    ],
  },
  {
    title: "13. Odbiorcy danych",
    content: [
      "Dane osobowe użytkowników mogą być przekazywane podmiotom, które wspierają administratora w prowadzeniu serwisu, wyłącznie w zakresie niezbędnym do realizacji określonych celów.",
      "Odbiorcami danych mogą być w szczególności:",
    ],
    list: [
      "dostawca hostingu,",
      "dostawcy poczty elektronicznej,",
      "dostawcy narzędzi analitycznych, w tym Google Analytics,",
      "dostawcy narzędzi bezpieczeństwa,",
      "podmioty świadczące usługi techniczne lub informatyczne,",
      "uprawnione organy publiczne, jeżeli wynika to z obowiązujących przepisów prawa.",
    ],
  },
  {
    title: "14. Przekazywanie danych poza Europejski Obszar Gospodarczy",
    content: [
      "W związku z korzystaniem z narzędzi takich jak Google Analytics dane mogą być przekazywane poza Europejski Obszar Gospodarczy, w szczególności do Stanów Zjednoczonych.",
      "W takim przypadku przekazywanie danych odbywa się na zasadach przewidzianych przez przepisy RODO, w szczególności z wykorzystaniem odpowiednich mechanizmów prawnych stosowanych przez dostawców tych usług.",
    ],
  },
  {
    title: "15. Okres przechowywania danych",
    content: [
      "Dane osobowe są przechowywane przez okres niezbędny do realizacji celów, dla których zostały zebrane.",
      "W szczególności:",
    ],
    list: [
      "dane konta użytkownika są przechowywane przez czas posiadania konta w serwisie,",
      "treści dodane przez użytkownika mogą być przechowywane przez czas funkcjonowania konta lub do momentu ich usunięcia,",
      "dane związane z obsługą zgłoszeń mogą być przechowywane przez czas potrzebny do obsługi sprawy,",
      "dane techniczne i analityczne mogą być przechowywane przez okres wynikający z ustawień narzędzi analitycznych,",
      "dane potrzebne do ochrony roszczeń lub obrony przed roszczeniami mogą być przechowywane przez okres przedawnienia roszczeń.",
    ],
    afterList:
      "Użytkownik może zgłosić żądanie usunięcia konta lub określonych danych, kontaktując się z administratorem pod adresem: kontakt@rybio.pl.",
  },
  {
    title: "16. Prawa użytkownika",
    content: ["Użytkownik ma prawo do:"],
    list: [
      "dostępu do swoich danych,",
      "sprostowania nieprawidłowych danych,",
      "usunięcia danych,",
      "ograniczenia przetwarzania danych,",
      "przeniesienia danych,",
      "wniesienia sprzeciwu wobec przetwarzania danych,",
      "cofnięcia zgody, jeżeli dane są przetwarzane na podstawie zgody,",
      "wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.",
    ],
    afterList:
      "W celu realizacji swoich praw użytkownik może skontaktować się z administratorem pod adresem: kontakt@rybio.pl. Cofnięcie zgody nie wpływa na zgodność z prawem przetwarzania, którego dokonano przed jej cofnięciem.",
  },
  {
    title: "17. Usunięcie konta",
    content: [
      "Użytkownik może zażądać usunięcia swojego konta w serwisie Rybio.",
      "W celu usunięcia konta należy skontaktować się z administratorem pod adresem: kontakt@rybio.pl.",
      "Po usunięciu konta administrator usunie lub zanonimizuje dane użytkownika, o ile dalsze przechowywanie określonych danych nie będzie wymagane przez przepisy prawa, bezpieczeństwo serwisu, obsługę zgłoszeń lub ochronę przed roszczeniami.",
      "Niektóre treści publiczne, takie jak opinie, komentarze lub zdjęcia, mogą zostać usunięte albo zanonimizowane, w zależności od charakteru treści i możliwości technicznych serwisu.",
    ],
  },
  {
    title: "18. Bezpieczeństwo danych",
    content: [
      "Administrator stosuje odpowiednie środki techniczne i organizacyjne mające na celu ochronę danych osobowych przed nieuprawnionym dostępem, utratą, zmianą, zniszczeniem lub ujawnieniem.",
      "W szczególności administrator dba o:",
    ],
    list: [
      "zabezpieczenie kont użytkowników,",
      "szyfrowanie haseł,",
      "ograniczenie dostępu do danych,",
      "stosowanie zabezpieczeń technicznych serwera,",
      "wykonywanie działań mających na celu ochronę serwisu przed nadużyciami.",
    ],
  },
  {
    title: "19. Linki zewnętrzne",
    content: [
      "Serwis Rybio może zawierać linki do zewnętrznych stron internetowych, na przykład stron łowisk, organizacji, sklepów lub innych serwisów.",
      "Administrator nie odpowiada za zasady prywatności obowiązujące na zewnętrznych stronach internetowych. Po przejściu na inną stronę użytkownik powinien zapoznać się z jej polityką prywatności.",
    ],
  },
  {
    title: "20. Newsletter",
    content: [
      "Na dzień wejścia w życie niniejszej Polityki prywatności serwis Rybio nie prowadzi newslettera.",
      "Jeżeli newsletter zostanie uruchomiony w przyszłości, użytkownicy zostaną poinformowani o zasadach zapisu, przetwarzania danych oraz możliwości rezygnacji z newslettera.",
    ],
  },
  {
    title: "21. Zmiany Polityki prywatności",
    content: [
      "Administrator może zmienić niniejszą Politykę prywatności, w szczególności w przypadku:",
    ],
    list: [
      "rozwoju serwisu,",
      "dodania nowych funkcji,",
      "wdrożenia nowych narzędzi analitycznych lub marketingowych,",
      "zmiany przepisów prawa,",
      "zmiany dostawców usług technicznych.",
    ],
    afterList:
      "Aktualna wersja Polityki prywatności będzie zawsze dostępna na stronie Rybio.pl.",
  },
  {
    title: "22. Kontakt",
    content: [
      "W sprawach związanych z prywatnością, ochroną danych osobowych, usunięciem konta, zgłoszeniem naruszenia lub realizacją praw użytkownika można kontaktować się pod adresem: kontakt@rybio.pl.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <PublicHeader subtitle="Polityka prywatności" />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),radial-gradient(circle_at_top_right,#ccfbf1,transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl">
            <p className="mb-5 inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
              Dokument informacyjny Rybio
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Polityka prywatności serwisu Rybio
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Niniejsza Polityka prywatności określa zasady przetwarzania danych
              osobowych użytkowników korzystających z serwisu internetowego
              Rybio, dostępnego pod adresem Rybio.pl.
            </p>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur">
              <p className="text-sm font-bold text-slate-500">
                Data obowiązywania
              </p>

              <p className="mt-1 text-xl font-black text-slate-950">
                25.06.2026
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
              Spis treści
            </p>

            <nav className="mt-4 space-y-1">
              {sections.map((section) => (
                <a
                  key={section.title}
                  href={`#${createSectionId(section.title)}`}
                  className="block rounded-2xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-xl font-black text-blue-950">
              Informacja o ochronie prywatności
            </h2>

            <p className="mt-3 leading-7 text-blue-800">
              Dbamy o prywatność użytkowników i dokładamy starań, aby dane
              osobowe były przetwarzane zgodnie z obowiązującymi przepisami
              prawa, w szczególności z Rozporządzeniem Parlamentu Europejskiego
              i Rady UE 2016/679, czyli RODO.
            </p>
          </div>

          {sections.map((section) => (
            <PolicySection key={section.title} section={section} />
          ))}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Masz pytania dotyczące prywatności?
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Skontaktuj się z administratorem serwisu Rybio pod adresem:
            </p>

            <a
              href="mailto:kontakt@rybio.pl"
              className="mt-4 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              kontakt@rybio.pl
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function PolicySection({
  section,
}: {
  section: {
    title: string;
    content: string[];
    list?: string[];
    afterList?: string;
  };
}) {
  return (
    <article
      id={createSectionId(section.title)}
      className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="break-words text-2xl font-black text-slate-950">
        {section.title}
      </h2>

      <div className="mt-4 space-y-4 leading-8 text-slate-600">
        {section.content.map((paragraph) => (
          <p key={paragraph} className="break-words">
            {paragraph}
          </p>
        ))}

        {section.list && (
          <ul className="space-y-3 pl-0">
            {section.list.map((item) => (
              <li key={item} className="flex gap-3 break-words">
                <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {section.afterList && (
          <p className="break-words">{section.afterList}</p>
        )}
      </div>
    </article>
  );
}

function createSectionId(title: string) {
  return title
    .toLowerCase()
    .replaceAll(".", "")
    .replaceAll(" ", "-")
    .replaceAll("ą", "a")
    .replaceAll("ć", "c")
    .replaceAll("ę", "e")
    .replaceAll("ł", "l")
    .replaceAll("ń", "n")
    .replaceAll("ó", "o")
    .replaceAll("ś", "s")
    .replaceAll("ż", "z")
    .replaceAll("ź", "z");
}