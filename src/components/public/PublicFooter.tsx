import Link from "next/link";

const mainLinks = [
  {
    label: "Strona główna",
    href: "/",
  },
  {
    label: "Łowiska w Polsce",
    href: "/lowiska-w-polsce",
  },
  {
    label: "Dziennik połowów",
    href: "/#dziennik",
  },
  {
    label: "Funkcje",
    href: "/#funkcje",
  },
  {
    label: "FAQ",
    href: "/#faq",
  },
  {
    label: "Kontakt",
    href: "/kontakt",
  },
];

const seoLinks = [
  {
    label: "Łowiska mazowieckie",
    href: "/lowiska-mazowieckie",
  },
  {
    label: "Łowiska śląskie",
    href: "/lowiska-slaskie",
  },
  {
    label: "Łowiska małopolskie",
    href: "/lowiska-malopolskie",
  },
  {
    label: "Łowiska lubelskie",
    href: "/lowiska-lubelskie",
  },
  {
    label: "Łowiska wielkopolskie",
    href: "/lowiska-wielkopolskie",
  },
  {
    label: "Łowiska podkarpackie",
    href: "/lowiska-podkarpackie",
  },
  {
    label: "Łowiska zachodniopomorskie",
    href: "/lowiska-zachodniopomorskie",
  },
  {
    label: "Łowiska komercyjne",
    href: "/lowiska-komercyjne",
  },
  {
    label: "Łowiska z domkami",
    href: "/lowiska-z-domkami",
  },
  {
    label: "Łowiska z noclegiem",
    href: "/lowiska-z-noclegiem",
  },
  {
    label: "Łowiska karpiowe",
    href: "/lowiska-karpiowe",
  },
  {
    label: "Łowiska No Kill",
    href: "/lowiska-no-kill",
  },
];
const legalLinks = [
  {
    label: "Regulamin",
    href: "/regulamin",
  },
  {
    label: "Polityka prywatności",
    href: "/polityka-prywatnosci",
  },
  {
    label: "Kontakt",
    href: "/kontakt",
  },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61590096264443",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/ryb.io/",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@rybio.pl",
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.8fr]">
          <div>
            <Link href="/" className="inline-flex items-center">
              <img
                src="/logos/logo-rybioo.svg"
                alt="Rybio"
                className="h-12 w-auto object-contain"
              />
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-500">
              Rybio to aplikacja dla wędkarzy, która pomaga znajdować łowiska,
              zapisywać połowy, planować wyprawy i korzystać z wiedzy
              społeczności.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Dołącz do Rybio
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Zaloguj się
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
              Nawigacja
            </h2>

            <nav className="mt-5 grid gap-3">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-bold text-slate-600 transition hover:text-blue-600"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
              Popularne łowiska
            </h2>

            <nav className="mt-5 grid gap-3">
              {seoLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-bold text-slate-600 transition hover:text-blue-600"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
              Informacje
            </h2>

            <nav className="mt-5 grid gap-3">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-bold text-slate-600 transition hover:text-blue-600"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-6">
              <p className="text-sm font-black text-slate-950">
                Social media
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Otwórz profil Rybio na ${link.label}`}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-950">
                Kontakt
              </p>

              <a
                href="mailto:kontakt@rybio.pl"
                className="mt-2 inline-flex text-sm font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                kontakt@rybio.pl
              </a>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Masz pytanie, chcesz zgłosić łowisko albo zaproponować
                współpracę? Napisz do nas.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Rybio. Wszystkie prawa zastrzeżone.
          </p>

          <p>
            Publiczna baza łowisk i aplikacja dla wędkarzy.
          </p>
        </div>
      </div>
    </footer>
  );
}