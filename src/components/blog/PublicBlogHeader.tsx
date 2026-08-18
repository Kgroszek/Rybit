import Link from "next/link";
import type { ReactNode } from "react";

export function PublicBlogHeader() {
  return (
    <header className="sticky top-0 z-[900] border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] w-full max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Rybio — strona główna"
        >
          <img
            src="/logos/logo-rybioo.svg"
            alt="Rybio"
            className="h-9 w-auto object-contain"
          />
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Główna nawigacja"
        >
          <PublicNavLink href="/">Strona główna</PublicNavLink>
          <PublicNavLink href="/lowiska-w-polsce">Łowiska</PublicNavLink>
          <PublicNavLink href="/blog" active>
            Blog
          </PublicNavLink>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
          >
            Zaloguj się
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Załóż konto
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-100 lg:hidden">
        <nav
          className="mx-auto flex w-full max-w-[1500px] gap-1 overflow-x-auto px-4 py-2 sm:px-6"
          aria-label="Mobilna nawigacja"
        >
          <MobileNavLink href="/">Start</MobileNavLink>
          <MobileNavLink href="/lowiska-w-polsce">Łowiska</MobileNavLink>
          <MobileNavLink href="/blog" active>
            Blog
          </MobileNavLink>
          <MobileNavLink href="/login">Zaloguj się</MobileNavLink>
        </nav>
      </div>
    </header>
  );
}

function PublicNavLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </Link>
  );
}
