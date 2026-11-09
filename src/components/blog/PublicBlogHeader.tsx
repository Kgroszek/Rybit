import Link from "next/link";
import type {
  ReactNode,
} from "react";

import { cn } from "@/lib/cn";

export function PublicBlogHeader() {
  return (
    <header className="sticky top-0 z-[900] border-b border-border bg-surface/95 backdrop-blur-xl">
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
          <PublicNavLink href="/">
            Strona główna
          </PublicNavLink>

          <PublicNavLink href="/lowiska-w-polsce">
            Łowiska
          </PublicNavLink>

          <PublicNavLink
            href="/blog"
            active
          >
            Wiedza
          </PublicNavLink>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-control px-4 py-2.5 text-sm font-bold text-text-secondary transition hover:bg-surface-muted hover:text-text sm:inline-flex"
          >
            Zaloguj się
          </Link>

          <Link
            href="/register"
            className="inline-flex min-h-10 items-center justify-center rounded-control bg-primary px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-primary-hover"
          >
            Załóż konto
          </Link>
        </div>
      </div>

      <div className="border-t border-border lg:hidden">
        <nav
          className="mx-auto flex w-full max-w-[1500px] gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6"
          aria-label="Mobilna nawigacja"
        >
          <MobileNavLink href="/">
            Start
          </MobileNavLink>

          <MobileNavLink href="/lowiska-w-polsce">
            Łowiska
          </MobileNavLink>

          <MobileNavLink
            href="/blog"
            active
          >
            Wiedza
          </MobileNavLink>

          <MobileNavLink href="/login">
            Zaloguj się
          </MobileNavLink>
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
      className={cn(
        "rounded-control px-4 py-2.5 text-sm font-bold transition",
        active
          ? "bg-primary-50 text-primary-700"
          : "text-text-secondary hover:bg-surface-muted hover:text-text"
      )}
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
      className={cn(
        "shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition",
        active
          ? "bg-primary-50 text-primary-700"
          : "text-text-secondary hover:bg-surface-muted"
      )}
    >
      {children}
    </Link>
  );
}
