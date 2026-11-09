"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type PublicHeaderProps = {
  subtitle?: string;
};

const navLinks = [
  {
    label: "Łowiska",
    href: "/lowiska-w-polsce",
  },
  {
    label: "Funkcje",
    href: "/#funkcje",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Dla właścicieli",
    href: "/dla-wlascicieli-lowisk",
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

export function PublicHeader({
  subtitle = "Aplikacja dla wędkarzy",
}: PublicHeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    function updateHash() {
      setCurrentHash(window.location.hash);
    }

    updateHash();

    window.addEventListener("hashchange", updateHash);
    window.addEventListener("popstate", updateHash);

    return () => {
      window.removeEventListener("hashchange", updateHash);
      window.removeEventListener("popstate", updateHash);
    };
  }, []);

  function isHashLink(href: string) {
    return href.startsWith("/#");
  }

  function getHashFromHref(href: string) {
    if (!isHashLink(href)) {
      return "";
    }

    return href.replace("/", "");
  }

  function isActive(href: string) {
    if (isHashLink(href)) {
      return pathname === "/" && currentHash === getHashFromHref(href);
    }

    if (href === "/") {
      return pathname === "/" && !currentHash;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleNavClick(href: string) {
    setIsMenuOpen(false);

    if (isHashLink(href)) {
      setCurrentHash(getHashFromHref(href));
      return;
    }

    setCurrentHash("");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center"
          onClick={() => {
            setIsMenuOpen(false);
            setCurrentHash("");
          }}
        >
          <div className="flex h-11 w-auto shrink-0 items-center">
            <img
              src="/logos/logo-rybioo.svg"
              alt="Rybio"
              className="h-9 w-auto object-contain"
            />
          </div>

          <span className="sr-only">{subtitle}</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-600 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => handleNavClick(link.href)}
              className={`rounded-xl px-3.5 py-2.5 transition ${
                isActive(link.href)
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/login"
            onClick={() => setCurrentHash("")}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
          >
            Zaloguj się
          </Link>

          <Link
            href="/register"
            onClick={() => setCurrentHash("")}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Załóż konto
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-700 shadow-sm transition hover:bg-slate-50 xl:hidden"
          aria-label={isMenuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? "×" : "☰"}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-xl xl:hidden">
          <nav className="mx-auto grid max-w-[1500px] gap-1 sm:px-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
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
                onClick={() => {
                  setIsMenuOpen(false);
                  setCurrentHash("");
                }}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Zaloguj się
              </Link>

              <Link
                href="/register"
                onClick={() => {
                  setIsMenuOpen(false);
                  setCurrentHash("");
                }}
                className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
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
