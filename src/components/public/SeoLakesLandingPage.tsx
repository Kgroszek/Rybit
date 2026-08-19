import Link from "next/link";

import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicLakesPage } from "@/components/public/PublicLakesPage";
import { getSeoVoivodeshipLandingData } from "@/lib/seo-lakes";
import {
  SEO_LAKES_SITE_URL,
  type SeoLakesLandingConfig,
} from "@/lib/seo-lakes-landings";

type SeoLakesLandingPageProps = {
  config: SeoLakesLandingConfig;
};

export async function SeoLakesLandingPage({
  config,
}: SeoLakesLandingPageProps) {
  const {
    resolvedVoivodeship,
    result,
    filterOptions,
  } = await getSeoVoivodeshipLandingData({
    canonicalVoivodeship: config.canonicalVoivodeship,
    aliases: config.voivodeshipAliases,
    pageSize: 15,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: config.jsonLd.name,
    description: config.jsonLd.description,
    url: `${SEO_LAKES_SITE_URL}/${config.slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Rybio",
      url: SEO_LAKES_SITE_URL,
    },
    about: config.jsonLd.about,
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <PublicHeader subtitle={config.headerSubtitle} />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),radial-gradient(circle_at_top_right,#ccfbf1,transparent_30%)]" />

        <div className="relative mx-auto max-w-[1500px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl">
            <p className="mb-5 inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
              {config.badge}
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {config.heroTitle}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              {config.heroDescription}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lista-lowisk"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                {config.heroCta}
              </a>

              <Link
                href="/lowiska-w-polsce"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Zobacz wszystkie łowiska
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
              <HeroStat
                value={String(result.totalCount)}
                label={config.stats.countLabel}
              />
              <HeroStat
                value={config.stats.second.value}
                label={config.stats.second.label}
              />
              <HeroStat
                value={config.stats.third.value}
                label={config.stats.third.label}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              {config.introTitle}
            </h2>

            <div className="mt-4 space-y-4 leading-8 text-slate-600">
              {config.introParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-xl font-black text-blue-950">
              {config.sideCard.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-blue-800">
              {config.sideCard.description}
            </p>

            <div className="mt-5 grid gap-3">
              <Link
                href={config.sideCard.primary.href}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
              >
                {config.sideCard.primary.label}
              </Link>

              <Link
                href={config.sideCard.secondary.href}
                className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-blue-700 transition hover:bg-blue-100"
              >
                {config.sideCard.secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicLakesPage
        lakes={result.lakes}
        initialPagination={{
          page: result.page,
          pageSize: result.pageSize,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        }}
        filterOptions={filterOptions}
        initialVoivodeship={resolvedVoivodeship}
      />

      <section className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">
            {config.bottomTitle}
          </h2>

          <div className="mt-4 space-y-4 leading-8 text-slate-600">
            {config.bottomParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function HeroStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}
