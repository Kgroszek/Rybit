"use client";

import { useEffect } from "react";
import Link from "next/link";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error]", error);
  }, [error]);

  return (
    <html lang="pl">
      <body className="min-h-screen bg-background text-text">
        <main className="relative flex min-h-screen items-center overflow-hidden px-4 py-10 sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,var(--rybio-blue-100),transparent_36%),radial-gradient(circle_at_80%_15%,var(--rybio-aqua-100),transparent_30%)]" />

          <section className="relative mx-auto w-full max-w-3xl rounded-[2rem] border border-border bg-surface/90 p-6 text-center shadow-float backdrop-blur sm:p-10 lg:p-14">
            <Link href="/" aria-label="Rybio — strona główna">
              <img
                src="/logos/logo-rybioo.svg"
                alt="Rybio"
                className="mx-auto h-10 w-auto"
              />
            </Link>

            <p className="mt-10 text-[11px] font-extrabold uppercase tracking-[0.18em] text-danger">
              Krytyczny błąd aplikacji
            </p>

            <p
              aria-hidden="true"
              className="mt-5 font-display text-7xl font-extrabold tracking-[-0.06em] text-danger-subtle sm:text-8xl"
            >
              500
            </p>

            <h1 className="mt-6 text-balance font-display text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
              Rybio nie mogło się poprawnie uruchomić.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-text-secondary">
              Wystąpił nieoczekiwany błąd techniczny. Spróbuj ponownie. Jeśli problem nie zniknie, wróć na stronę główną.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-11 items-center justify-center rounded-control border border-primary bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover"
              >
                Spróbuj ponownie
              </button>

              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-control border border-border-strong bg-surface px-5 py-2.5 text-sm font-bold text-text-secondary transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              >
                Strona główna
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
