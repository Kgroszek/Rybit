import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  canExposeCatchPublicly,
  formatCatchDate,
  getAppBaseUrl,
  getCatchImageForSharing,
  getMethodLabel,
} from "@/lib/catch-sharing";
import { prisma } from "@/lib/prisma";

type PublicCatchPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getPublicCatch(id: string) {
  const fishingCatch = await prisma.fishingCatch.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
      userName: true,
      fishName: true,
      weight: true,
      length: true,
      method: true,
      bait: true,
      caughtAt: true,
      lakeId: true,
      lakeName: true,
      tripId: true,
      tripTitle: true,
      imageUrl: true,
      imagePath: true,
      note: true,
      isPublic: true,
      rankingStatus: true,
      lake: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!fishingCatch || !canExposeCatchPublicly(fishingCatch)) {
    return null;
  }

  return fishingCatch;
}

export async function generateMetadata({
  params,
}: PublicCatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const fishingCatch = await getPublicCatch(id);

  if (!fishingCatch) {
    return {
      title: "Połów | Rybio",
    };
  }

  const baseUrl = getAppBaseUrl();
  const weightLabel =
    fishingCatch.weight !== null
      ? `${fishingCatch.weight.toFixed(2)} kg`
      : null;
  const lengthLabel =
    fishingCatch.length !== null
      ? `${fishingCatch.length.toFixed(0)} cm`
      : null;

  const result = [weightLabel, lengthLabel].filter(Boolean).join(" • ");

  const title = `${fishingCatch.fishName}${
    result ? ` — ${result}` : ""
  } | Rybio`;

  const description = fishingCatch.lakeName
    ? `Połów użytkownika Rybio na łowisku ${fishingCatch.lakeName}.`
    : "Połów zapisany w dzienniku Rybio.";

  const pageUrl = `${baseUrl}/polowy/publiczne/${fishingCatch.id}`;
  const cardUrl = `${baseUrl}/api/catches/${fishingCatch.id}/card?format=post`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "Rybio",
      type: "website",
      images: [
        {
          url: cardUrl,
          width: 1080,
          height: 1350,
          alt: `Karta połowu: ${fishingCatch.fishName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cardUrl],
    },
  };
}

export default async function PublicCatchPage({
  params,
}: PublicCatchPageProps) {
  const { id } = await params;
  const fishingCatch = await getPublicCatch(id);

  if (!fishingCatch) {
    notFound();
  }

  const imageUrl = await getCatchImageForSharing(fishingCatch);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-xl font-black tracking-tight text-blue-600"
          >
            RYBIO
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-white"
            >
              Zaloguj się
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white transition hover:bg-blue-700"
            >
              Załóż konto
            </Link>
          </div>
        </div>

        <article className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)]">
            <div className="min-h-[420px] bg-gradient-to-br from-blue-100 via-cyan-50 to-emerald-100 lg:min-h-[680px]">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`Połów: ${fishingCatch.fishName}`}
                  className="h-full min-h-[420px] w-full object-cover lg:min-h-[680px]"
                />
              ) : (
                <div className="flex h-full min-h-[420px] items-center justify-center px-8 text-center lg:min-h-[680px]">
                  <div>
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-3xl font-black text-blue-600 shadow-sm">
                      R
                    </div>
                    <p className="mt-5 text-xl font-black text-slate-800">
                      Połów zapisany w Rybio
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Publiczny połów
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                {fishingCatch.fishName}
              </h1>

              <p className="mt-3 text-sm font-semibold text-slate-500">
                {formatCatchDate(fishingCatch.caughtAt)}
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <Metric
                  label="Waga"
                  value={
                    fishingCatch.weight !== null
                      ? `${fishingCatch.weight.toFixed(2)} kg`
                      : "Brak danych"
                  }
                  emphasized
                />

                <Metric
                  label="Długość"
                  value={
                    fishingCatch.length !== null
                      ? `${fishingCatch.length.toFixed(0)} cm`
                      : "Brak danych"
                  }
                />
              </div>

              <div className="mt-7 space-y-4">
                <InfoRow
                  label="Metoda"
                  value={getMethodLabel(fishingCatch.method)}
                />

                {fishingCatch.bait && (
                  <InfoRow label="Przynęta" value={fishingCatch.bait} />
                )}

                {fishingCatch.lakeName && (
                  <InfoRow label="Łowisko" value={fishingCatch.lakeName} />
                )}

                {fishingCatch.tripTitle && (
                  <InfoRow label="Wyprawa" value={fishingCatch.tripTitle} />
                )}

                {fishingCatch.userName && (
                  <InfoRow label="Wędkarz" value={fishingCatch.userName} />
                )}
              </div>

              {fishingCatch.note && (
                <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-500">
                    Notatka
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
                    {fishingCatch.note}
                  </p>
                </div>
              )}

              <div className="mt-auto pt-8">
                {fishingCatch.lake?.slug ? (
                  <Link
                    href={`/lowiska-w-polsce/${fishingCatch.lake.slug}`}
                    className="flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                  >
                    Zobacz łowisko w Rybio
                  </Link>
                ) : (
                  <Link
                    href="/lowiska-w-polsce"
                    className="flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                  >
                    Znajdź łowisko w Rybio
                  </Link>
                )}

                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  Zapisuj własne połowy, wyprawy i łowiska w Rybio.
                </p>
              </div>
            </div>
          </div>
        </article>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
          <Link
            href="/register"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            Załóż darmowe konto
          </Link>

          <Link
            href="/lowiska-w-polsce"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Przeglądaj łowiska
          </Link>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        emphasized
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-950"
      }`}
    >
      <p
        className={`text-xs font-black uppercase tracking-[0.14em] ${
          emphasized ? "text-blue-100" : "text-slate-400"
        }`}
      >
        {label}
      </p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-none last:pb-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="max-w-[62%] break-words text-right text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}
