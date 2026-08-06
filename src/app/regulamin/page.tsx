import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Regulamin | Rybio",
  description:
    "Regulamin serwisu Rybio. Sprawdź zasady korzystania z aplikacji, kont użytkowników, dodawania łowisk, opinii, zdjęć i treści w serwisie.",
};

const sections = [
  {
    title: "1. Postanowienia ogólne",
    content: [
      "Niniejszy Regulamin określa zasady korzystania z serwisu internetowego Rybio, dostępnego pod adresem Rybio.pl.",
      "Serwis Rybio jest aplikacją internetową przeznaczoną dla osób zainteresowanych wędkarstwem, łowiskami, wyprawami wędkarskimi, opiniami o miejscach połowu oraz wymianą informacji związanych z tematyką wędkarską.",
      "Administratorem i właścicielem serwisu jest Jakub Groszkowski.",
      "E-mail kontaktowy: kontakt@rybio.pl.",
      "Kontakt z Administratorem możliwy jest poprzez adres e-mail: kontakt@rybio.pl.",
      "Korzystanie z serwisu oznacza akceptację niniejszego Regulaminu.",
      "Przed założeniem konta użytkownik powinien zapoznać się z Regulaminem oraz Polityką prywatności.",
      "Regulamin jest udostępniany użytkownikom nieodpłatnie w sposób umożliwiający jego pozyskanie, odtwarzanie i utrwalanie.",
    ],
  },
  {
    title: "2. Definicje",
    content: ["Na potrzeby niniejszego Regulaminu poniższe pojęcia oznaczają:"],
    list: [
      "Serwis — aplikacja internetowa Rybio dostępna pod adresem Rybio.pl.",
      "Administrator — Jakub Groszkowski, odpowiedzialny za prowadzenie serwisu.",
      "Użytkownik — osoba korzystająca z serwisu Rybio.",
      "Konto — indywidualny panel użytkownika utworzony po rejestracji w serwisie.",
      "Treści użytkownika — wszystkie materiały dodane przez użytkownika do serwisu, w szczególności opinie, komentarze, oceny, zdjęcia, opisy, informacje o łowiskach i inne publikowane dane.",
      "Łowisko — miejsce dodane lub opisane w serwisie, związane z możliwością uprawiania wędkarstwa.",
      "Regulamin — niniejszy dokument określający zasady korzystania z serwisu.",
      "Polityka prywatności — dokument określający zasady przetwarzania danych osobowych i korzystania z plików cookies.",
    ],
  },
  {
    title: "3. Charakter serwisu",
    content: [
      "Rybio umożliwia użytkownikom korzystanie z funkcji związanych z wyszukiwaniem, dodawaniem, ocenianiem i komentowaniem łowisk oraz publikowaniem zdjęć i informacji związanych z wędkarstwem.",
      "Serwis może zawierać między innymi:",
    ],
    list: [
      "listę łowisk,",
      "profile łowisk,",
      "opinie i komentarze użytkowników,",
      "oceny łowisk,",
      "zdjęcia dodawane przez użytkowników,",
      "informacje o udogodnieniach na łowiskach,",
      "informacje o zasadach obowiązujących na łowiskach,",
      "funkcje społecznościowe,",
      "funkcje zapisywania lub obserwowania wybranych miejsc, jeżeli zostaną wdrożone.",
    ],
    afterList:
      "Informacje publikowane w serwisie mają charakter informacyjny i społecznościowy. Administrator dokłada starań, aby serwis działał prawidłowo, jednak nie gwarantuje, że wszystkie informacje dodane przez użytkowników są kompletne, aktualne i zgodne ze stanem faktycznym. Użytkownik powinien samodzielnie weryfikować aktualne zasady korzystania z danego łowiska, w szczególności opłaty, zezwolenia, regulaminy lokalne, okresy ochronne, limity połowowe oraz inne wymogi obowiązujące na danym terenie.",
  },
  {
    title: "4. Warunki techniczne korzystania z serwisu",
    content: ["Do korzystania z serwisu potrzebne są:"],
    list: [
      "urządzenie z dostępem do internetu,",
      "aktualna przeglądarka internetowa,",
      "aktywne połączenie internetowe,",
      "aktywny adres e-mail w przypadku rejestracji konta.",
    ],
    afterList:
      "Użytkownik powinien korzystać z aktualnej wersji przeglądarki internetowej oraz dbać o bezpieczeństwo swojego urządzenia. Administrator nie ponosi odpowiedzialności za problemy techniczne wynikające z nieprawidłowego działania urządzenia użytkownika, przeglądarki, połączenia internetowego lub zewnętrznych usług.",
  },
  {
    title: "5. Rejestracja i konto użytkownika",
    content: [
      "Część funkcji serwisu może być dostępna wyłącznie dla zarejestrowanych i zalogowanych użytkowników.",
      "Rejestracja konta może wymagać podania danych, takich jak adres e-mail, login, hasło lub inne informacje niezbędne do utworzenia konta.",
      "Użytkownik zobowiązuje się do podawania prawdziwych i aktualnych danych.",
      "Użytkownik nie może korzystać z danych innych osób ani podszywać się pod inne osoby.",
      "Użytkownik jest odpowiedzialny za zachowanie poufności danych logowania do konta.",
      "Użytkownik nie powinien udostępniać swojego hasła ani konta osobom trzecim.",
      "W przypadku podejrzenia nieuprawnionego dostępu do konta użytkownik powinien niezwłocznie skontaktować się z Administratorem.",
      "Administrator może odmówić utworzenia konta, zablokować konto lub usunąć konto, jeżeli użytkownik narusza Regulamin, przepisy prawa, dobre obyczaje, prawa innych osób lub bezpieczeństwo serwisu.",
    ],
  },
  {
    title: "6. Zasady korzystania z serwisu",
    content: [
      "Użytkownik zobowiązuje się korzystać z serwisu zgodnie z prawem, Regulaminem, dobrymi obyczajami oraz przeznaczeniem serwisu.",
      "Zabronione jest w szczególności:",
    ],
    list: [
      "publikowanie treści bezprawnych,",
      "publikowanie treści obraźliwych, wulgarnych, agresywnych lub dyskryminujących,",
      "naruszanie dóbr osobistych innych osób,",
      "publikowanie danych osobowych innych osób bez podstawy prawnej lub zgody,",
      "publikowanie zdjęć osób bez ich zgody, jeżeli taka zgoda jest wymagana,",
      "podszywanie się pod inne osoby,",
      "dodawanie fałszywych opinii lub ocen,",
      "spamowanie,",
      "podejmowanie działań zakłócających działanie serwisu,",
      "próby uzyskania nieuprawnionego dostępu do kont, danych, panelu administracyjnego lub infrastruktury serwisu,",
      "wykorzystywanie serwisu do działań sprzecznych z prawem lub dobrymi obyczajami.",
    ],
    afterList:
      "Użytkownik ponosi odpowiedzialność za treści, które publikuje w serwisie. Administrator może moderować, ukrywać lub usuwać treści naruszające Regulamin, prawo, prawa osób trzecich, zasady społeczności lub bezpieczeństwo serwisu.",
  },
  {
    title: "7. Dodawanie łowisk i informacji o łowiskach",
    content: [
      "Użytkownik może dodawać do serwisu informacje o łowiskach, jeżeli dana funkcja jest dostępna.",
      "Dodając łowisko lub informacje o łowisku, użytkownik powinien zadbać o to, aby publikowane dane były możliwie rzetelne, aktualne i zgodne z prawdą.",
      "Zabronione jest celowe dodawanie nieprawdziwych, wprowadzających w błąd lub szkodliwych informacji.",
      "Administrator może edytować, uzupełniać, ukrywać lub usuwać informacje o łowiskach, jeżeli są nieprawdziwe, niepełne, naruszają Regulamin lub mogą wprowadzać użytkowników w błąd.",
      "Administrator nie gwarantuje, że dane dotyczące łowisk, takie jak ceny, godziny otwarcia, dostępność, regulaminy lokalne, zakazy, zezwolenia lub warunki połowu, są zawsze aktualne.",
      "Przed wyjazdem na łowisko użytkownik powinien samodzielnie sprawdzić aktualne zasady obowiązujące w danym miejscu.",
    ],
  },
  {
    title: "8. Opinie, komentarze i oceny",
    content: [
      "Użytkownik może dodawać opinie, komentarze i oceny dotyczące łowisk, jeżeli dana funkcja jest dostępna.",
      "Opinie powinny być zgodne z rzeczywistymi doświadczeniami użytkownika.",
      "Zabronione jest publikowanie opinii:",
    ],
    list: [
      "fałszywych,",
      "obraźliwych,",
      "naruszających dobra osobiste,",
      "zawierających pomówienia,",
      "zawierających dane osobowe innych osób,",
      "publikowanych w celu zaszkodzenia innemu użytkownikowi, właścicielowi łowiska lub innemu podmiotowi,",
      "mających charakter spamu lub reklamy.",
    ],
    afterList:
      "Administrator może usunąć lub ukryć opinię, komentarz albo ocenę, jeżeli narusza Regulamin, przepisy prawa, zasady społeczności lub prawa innych osób. Administrator może umożliwić zgłaszanie opinii i komentarzy przez użytkowników.",
  },
  {
    title: "9. Zdjęcia dodawane przez użytkowników",
    content: [
      "Użytkownik może dodawać zdjęcia związane z tematyką serwisu, w szczególności zdjęcia ryb, łowisk, wypraw wędkarskich, sprzętu lub otoczenia łowiska.",
      "Dodając zdjęcie do serwisu, użytkownik oświadcza, że:",
    ],
    list: [
      "posiada prawa do zdjęcia,",
      "zdjęcie nie narusza praw autorskich osób trzecich,",
      "zdjęcie nie narusza prywatności ani dóbr osobistych innych osób,",
      "jeżeli na zdjęciu widoczne są inne osoby, użytkownik posiada zgodę na publikację ich wizerunku, o ile taka zgoda jest wymagana,",
      "zdjęcie nie zawiera treści bezprawnych, obraźliwych, drastycznych, wulgarnych lub naruszających dobre obyczaje.",
    ],
    afterList:
      "Wizerunek osoby widocznej na zdjęciu może być daną osobową i dobrem osobistym, dlatego przy publikowaniu zdjęć należy zachować szczególną ostrożność. Administrator może usunąć zdjęcie, jeżeli uzna, że narusza Regulamin, przepisy prawa, prawa osób trzecich, prywatność, wizerunek lub dobre obyczaje. Osoba, której prawa zostały naruszone przez zdjęcie opublikowane w serwisie, może zgłosić naruszenie na adres: kontakt@rybio.pl.",
  },
  {
    title: "10. Prawa autorskie i licencja na treści użytkownika",
    content: [
      "Użytkownik zachowuje prawa autorskie do treści, które samodzielnie tworzy i publikuje w serwisie.",
      "Dodając treści do serwisu, w tym zdjęcia, opisy, opinie, komentarze i informacje o łowiskach, użytkownik udziela Administratorowi niewyłącznej, nieodpłatnej licencji na korzystanie z tych treści w zakresie niezbędnym do prowadzenia, wyświetlania, promowania i rozwijania serwisu Rybio.",
      "Licencja obejmuje w szczególności:",
    ],
    list: [
      "publikację treści w serwisie,",
      "wyświetlanie treści innym użytkownikom,",
      "przechowywanie treści na serwerze,",
      "techniczne dostosowanie treści do działania serwisu,",
      "tworzenie miniatur zdjęć,",
      "wykorzystywanie treści w obrębie serwisu Rybio.",
    ],
    afterList:
      "Administrator nie nabywa własności treści użytkownika. Użytkownik może zażądać usunięcia swoich treści, kontaktując się z Administratorem, z zastrzeżeniem sytuacji, w których dalsze przechowywanie określonych treści jest uzasadnione przepisami prawa, bezpieczeństwem serwisu, ochroną przed roszczeniami lub koniecznością zachowania integralności dyskusji. Użytkownik nie może publikować treści, do których nie posiada praw lub wymaganych zgód.",
  },
  {
    title: "11. Zgłaszanie naruszeń",
    content: [
      "Użytkownik lub osoba trzecia może zgłosić Administratorowi treść, która narusza prawo, Regulamin, prywatność, wizerunek, prawa autorskie lub dobra osobiste.",
      "Zgłoszenia należy kierować na adres: kontakt@rybio.pl.",
      "Zgłoszenie powinno zawierać:",
    ],
    list: [
      "link do zgłaszanej treści,",
      "opis naruszenia,",
      "dane kontaktowe osoby zgłaszającej,",
      "w miarę możliwości uzasadnienie lub dokumenty potwierdzające naruszenie.",
    ],
    afterList:
      "Administrator może tymczasowo ukryć zgłoszoną treść na czas wyjaśnienia sprawy. Administrator może usunąć treść, jeżeli uzna zgłoszenie za zasadne.",
  },
  {
    title: "12. Usunięcie konta",
    content: [
      "Użytkownik może w dowolnym momencie zgłosić chęć usunięcia konta.",
      "W celu usunięcia konta należy skontaktować się z Administratorem pod adresem: kontakt@rybio.pl.",
      "Po otrzymaniu zgłoszenia Administrator podejmie działania zmierzające do usunięcia lub anonimizacji konta oraz danych użytkownika, zgodnie z zasadami opisanymi w Polityce prywatności.",
      "Usunięcie konta nie zawsze oznacza automatyczne usunięcie wszystkich treści publicznych, jeżeli ich dalsze przechowywanie jest uzasadnione technicznie, prawnie lub wynika z potrzeby zachowania spójności serwisu. W takim przypadku treści mogą zostać zanonimizowane.",
    ],
  },
  {
    title: "13. Blokada konta i ograniczenie dostępu",
    content: ["Administrator może czasowo lub trwale zablokować konto użytkownika, jeżeli użytkownik:"],
    list: [
      "narusza Regulamin,",
      "narusza przepisy prawa,",
      "publikuje treści zabronione,",
      "działa na szkodę serwisu lub innych użytkowników,",
      "podejmuje próby obejścia zabezpieczeń,",
      "zakłada wiele kont w celu nadużywania funkcji serwisu,",
      "publikuje spam, reklamy lub fałszywe opinie.",
    ],
    afterList:
      "Administrator może usunąć treści użytkownika, ograniczyć widoczność treści lub zablokować możliwość dodawania nowych treści. Użytkownik może skontaktować się z Administratorem w celu wyjaśnienia przyczyny blokady.",
  },
  {
    title: "14. Odpowiedzialność Administratora",
    content: [
      "Administrator dokłada starań, aby serwis działał prawidłowo i był dostępny dla użytkowników.",
      "Administrator nie gwarantuje nieprzerwanego i bezbłędnego działania serwisu.",
      "Administrator nie ponosi odpowiedzialności za:",
    ],
    list: [
      "przerwy techniczne,",
      "awarie serwera,",
      "błędy wynikające z działania zewnętrznych usług,",
      "treści publikowane przez użytkowników,",
      "nieaktualne lub nieprawdziwe informacje dodane przez użytkowników,",
      "decyzje podjęte przez użytkownika na podstawie informacji znalezionych w serwisie,",
      "szkody wynikające z nieprawidłowego korzystania z serwisu.",
    ],
    afterList:
      "Administrator nie jest organizatorem połowów, właścicielem łowisk ani podmiotem wydającym zezwolenia wędkarskie, chyba że wyraźnie wskazano inaczej. Użytkownik powinien każdorazowo sprawdzić lokalne przepisy, regulaminy łowisk, wymagane zezwolenia oraz aktualne warunki przed rozpoczęciem połowu.",
  },
  {
    title: "15. Odpowiedzialność użytkownika",
    content: [
      "Użytkownik ponosi odpowiedzialność za swoje działania w serwisie oraz za treści, które publikuje.",
      "Użytkownik odpowiada za naruszenie praw osób trzecich, w tym praw autorskich, prawa do prywatności, prawa do wizerunku i dóbr osobistych.",
      "Użytkownik zobowiązuje się nie podejmować działań, które mogłyby zakłócić działanie serwisu lub narazić Administratora albo innych użytkowników na szkodę.",
    ],
  },
  {
    title: "16. Treści reklamowe i komercyjne",
    content: [
      "Na dzień wejścia w życie Regulaminu serwis Rybio nie oferuje płatnych kont, płatnych pakietów ani płatnych funkcji dla użytkowników.",
      "W przyszłości serwis może zostać rozszerzony o funkcje płatne, reklamy, współprace komercyjne, promowane łowiska lub inne formy monetyzacji.",
      "W przypadku wprowadzenia płatnych funkcji lub usług Regulamin zostanie zaktualizowany.",
      "Użytkownicy zostaną poinformowani o zasadach korzystania z płatnych funkcji przed ich uruchomieniem.",
    ],
  },
  {
    title: "17. Newsletter",
    content: [
      "Na dzień wejścia w życie Regulaminu serwis Rybio nie prowadzi newslettera.",
      "Jeżeli newsletter zostanie uruchomiony w przyszłości, zasady zapisu, wypisu oraz przetwarzania danych zostaną opisane w Polityce prywatności lub osobnym regulaminie newslettera.",
    ],
  },
  {
    title: "18. Prywatność i dane osobowe",
    content: [
      "Zasady przetwarzania danych osobowych użytkowników określa Polityka prywatności serwisu Rybio.",
      "Polityka prywatności jest dostępna na stronie Rybio.pl.",
      "Użytkownik powinien zapoznać się z Polityką prywatności przed założeniem konta.",
      "W sprawach związanych z ochroną danych osobowych użytkownik może kontaktować się z Administratorem pod adresem: kontakt@rybio.pl.",
    ],
  },
  {
    title: "19. Pliki cookies",
    content: [
      "Serwis może korzystać z plików cookies oraz podobnych technologii.",
      "Cookies mogą być wykorzystywane w szczególności do:",
    ],
    list: [
      "prawidłowego działania serwisu,",
      "obsługi logowania,",
      "zapamiętywania ustawień,",
      "zapewnienia bezpieczeństwa,",
      "prowadzenia statystyk,",
      "analizy sposobu korzystania z serwisu.",
    ],
    afterList:
      "Szczegółowe informacje o cookies znajdują się w Polityce prywatności.",
  },
  {
    title: "20. Zmiany w serwisie",
    content: [
      "Administrator może rozwijać, zmieniać, aktualizować lub usuwać wybrane funkcje serwisu.",
      "Administrator może czasowo wyłączyć serwis lub jego część w celu przeprowadzenia prac technicznych, aktualizacji lub napraw.",
      "Administrator może wprowadzać nowe funkcje, zmieniać wygląd serwisu oraz sposób działania poszczególnych elementów.",
    ],
  },
  {
    title: "21. Reklamacje i kontakt",
    content: [
      "Użytkownik może zgłaszać reklamacje, błędy techniczne, naruszenia lub inne sprawy związane z działaniem serwisu na adres: kontakt@rybio.pl.",
      "Zgłoszenie powinno zawierać opis sprawy oraz dane umożliwiające kontakt z użytkownikiem.",
      "Administrator postara się odpowiedzieć na zgłoszenie w rozsądnym terminie.",
      "W przypadku spraw wymagających dodatkowej analizy czas odpowiedzi może być dłuższy.",
    ],
  },
  {
    title: "22. Zmiany Regulaminu",
    content: [
      "Administrator może zmienić Regulamin w szczególności w przypadku:",
    ],
    list: [
      "zmiany przepisów prawa,",
      "zmiany funkcji serwisu,",
      "wdrożenia nowych usług,",
      "wprowadzenia płatnych funkcji,",
      "zmian technicznych,",
      "potrzeby doprecyzowania zasad korzystania z serwisu.",
    ],
    afterList:
      "Aktualna wersja Regulaminu będzie zawsze dostępna na stronie Rybio.pl. Użytkownicy posiadający konto mogą zostać poinformowani o istotnych zmianach Regulaminu poprzez komunikat w serwisie lub wiadomość e-mail. Dalsze korzystanie z serwisu po wejściu w życie zmian oznacza akceptację nowego Regulaminu.",
  },
  {
    title: "23. Postanowienia końcowe",
    content: [
      "Regulamin obowiązuje od dnia: [wpisz datę].",
      "W sprawach nieuregulowanych Regulaminem zastosowanie mają przepisy prawa polskiego.",
      "Jeżeli którekolwiek postanowienie Regulaminu okaże się nieważne lub nieskuteczne, nie wpływa to na ważność pozostałych postanowień.",
      "Wszelkie pytania dotyczące Regulaminu można kierować na adres: kontakt@rybio.pl.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <PublicHeader subtitle="Regulamin" />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),radial-gradient(circle_at_top_right,#ccfbf1,transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl">
            <p className="mb-5 inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
              Dokument informacyjny Rybio
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Regulamin serwisu Rybio
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Regulamin określa zasady korzystania z serwisu internetowego
              Rybio, w tym zasady rejestracji, dodawania treści, korzystania z
              funkcji społecznościowych oraz odpowiedzialności użytkowników.
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
              Zasady korzystania z Rybio
            </h2>

            <p className="mt-3 leading-7 text-blue-800">
              Przed założeniem konta i korzystaniem z funkcji serwisu zapoznaj
              się z Regulaminem oraz Polityką prywatności. Korzystanie z serwisu
              oznacza akceptację zasad opisanych w tym dokumencie.
            </p>

            <Link
              href="/polityka-prywatnosci"
              className="mt-4 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
            >
              Przejdź do Polityki prywatności
            </Link>
          </div>

          {sections.map((section) => (
            <TermsSection key={section.title} section={section} />
          ))}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Masz pytania dotyczące Regulaminu?
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

function TermsSection({
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