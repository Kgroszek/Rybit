"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type PublicHeaderProps = {
  subtitle?: string;
};

const navLinks = [
  {
    label: "O aplikacji",
    href: "/#czym-jest",
  },
  {
    label: "Łowiska",
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
];

export function PublicHeader({ subtitle = "Aplikacja dla wędkarzy" }: PublicHeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-auto shrink-0 items-center">
            <img
              src="/logos/logo-rybioo.svg"
              alt="Rybio"
              className="h-10 w-auto object-contain"
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-600 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl px-4 py-2 transition ${
                isActive(link.href)
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Zaloguj się
          </Link>

          <Link
            href="/register"
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Załóż konto
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-black text-slate-700 shadow-sm transition hover:bg-slate-50 xl:hidden"
          aria-label="Otwórz menu"
        >
          {isMenuOpen ? "×" : "☰"}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-sm xl:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2 sm:px-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isActive(link.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Zaloguj się
              </Link>

              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Załóż konto
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}