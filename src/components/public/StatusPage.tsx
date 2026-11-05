"use client";

import Link from "next/link";

type StatusPageProps = {
  code: string;
  eyebrow: string;
  title: string;
  description: string;
  onRetry?: () => void;
};

export function StatusPage({
  code,
  eyebrow,
  title,
  description,
  onRetry,
}: StatusPageProps) {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-background text-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,var(--rybio-blue-100),transparent_34%),radial-gradient(circle_at_82%_12%,var(--rybio-aqua-100),transparent_30%)] opacity-90" />

      <div className="relative mx-auto flex w-full max-w-[1180px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="Rybio — strona główna"
            className="inline-flex rounded-xl"
          >
            <img
              src="/logos/logo-rybioo.svg"
              alt="Rybio"
              className="h-9 w-auto sm:h-10"
            />
          </Link>

          <Link
            href="/kontakt"
            className="rounded-xl px-3 py-2 text-sm font-bold text-text-secondary transition hover:bg-white/70 hover:text-primary"
          >
            Kontakt
          </Link>
        </header>

        <section className="flex flex-1 items-center py-14 sm:py-20">
          <div className="w-full max-w-3xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>

            <p
              aria-hidden="true"
              className="mt-5 font-display text-[clamp(7rem,20vw,13rem)] font-extrabold leading-[0.8] tracking-[-0.08em] text-primary"
            >
              {code}
            </p>

            <h1 className="mt-8 max-w-3xl text-balance font-display text-3xl font-extrabold tracking-[-0.04em] text-text sm:text-4xl lg:text-5xl">
              {title}
            </h1>

            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-text-secondary sm:text-lg">
              {description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex min-h-11 items-center justify-center rounded-control border border-primary bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover"
                >
                  Spróbuj ponownie
                </button>
              )}

              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-control border border-primary bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover"
              >
                Strona główna
              </Link>

              <Link
                href="/lowiska-w-polsce"
                className="inline-flex min-h-11 items-center justify-center rounded-control border border-border-strong bg-surface px-5 py-2.5 text-sm font-bold text-text-secondary transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              >
                Przeglądaj łowiska
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-border/70 py-5 text-xs font-semibold text-text-muted">
          © {new Date().getFullYear()} Rybio
        </footer>
      </div>
    </main>
  );
}
