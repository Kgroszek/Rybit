"use client";

import Link from "next/link";

type OwnerWebsiteCardProps = {
  slug: string;
  website: {
    status: string;
    subdomain: string;
  } | null;
  rootDomain: string;
};

export function OwnerWebsiteCard({
  slug,
  website,
  rootDomain,
}: OwnerWebsiteCardProps) {
  const published = website?.status === "published";
  const hasWebsite = Boolean(website);

  return (
    <section className="mt-8 overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-blue-300">
              Strona WWW
            </span>

            {hasWebsite && (
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-black ${
                  published
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-amber-500/15 text-amber-300"
                }`}
              >
                {published ? "Online" : "Szkic"}
              </span>
            )}
          </div>

          <h2 className="mt-4 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">
            {hasWebsite
              ? "Twoja strona łowiska jest gotowa do dalszej edycji"
              : "Stwórz profesjonalną stronę swojego łowiska"}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            {hasWebsite
              ? "Edytuj sekcje, zdjęcia, kolory i treści w builderze. Dane takie jak ryby, cennik czy regulamin możesz pobierać z Rybio lub prowadzić niezależnie."
              : "Wybierz gotowy projekt, wykorzystaj dane już zapisane w Rybio i opublikuj stronę pod własną subdomeną."}
          </p>

          {website?.subdomain && (
            <p className="mt-4 text-sm font-bold text-blue-300">
              {website.subdomain}.{rootDomain}
            </p>
          )}
        </div>

        <div className="border-t border-white/10 p-6 sm:p-8 lg:border-l lg:border-t-0">
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href={`/moje-lowiska/${slug}/strona`}
              className="inline-flex min-w-[190px] items-center justify-center rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white transition hover:bg-blue-700"
            >
              {hasWebsite ? "Edytuj stronę" : "Utwórz stronę"}
            </Link>

            {published && website?.subdomain && (
              <a
                href={`https://${website.subdomain}.${rootDomain}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-w-[190px] items-center justify-center rounded-2xl border border-white/15 px-5 py-3.5 text-sm font-black text-slate-200 transition hover:bg-white/5"
              >
                Otwórz stronę ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
