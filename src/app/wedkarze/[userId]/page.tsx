import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type PublicAnglerPageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function PublicAnglerPage({
  params,
}: PublicAnglerPageProps) {
  const { userId } = await params;

  const [publicCatchesCount, publicLakeIds, userNameSource, catches] =
    await Promise.all([
      prisma.fishingCatch.count({
        where: {
          userId,
          isPublic: true,
          rankingStatus: "approved",
        },
      }),

      prisma.fishingCatch.findMany({
        where: {
          userId,
          isPublic: true,
          rankingStatus: "approved",
          lakeId: {
            not: null,
          },
        },
        select: {
          lakeId: true,
        },
      }),

      prisma.fishingCatch.findFirst({
        where: {
          userId,
          isPublic: true,
          rankingStatus: "approved",
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          userName: true,
        },
      }),

      prisma.fishingCatch.findMany({
        where: {
          userId,
          isPublic: true,
          rankingStatus: "approved",
          imageUrl: {
            not: null,
          },
        },
        orderBy: {
          caughtAt: "desc",
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
          lakeId: true,
          lakeName: true,
          caughtAt: true,
          imageUrl: true,
          note: true,
          lake: {
            select: {
              slug: true,
            },
          },
        },
      }),
    ]);

  if (publicCatchesCount === 0) {
    notFound();
  }

  const userName =
    userNameSource?.userName || catches[0]?.userName || "Użytkownik";

  const totalCatches = publicCatchesCount;
  const catchesWithPhotosCount = catches.length;

  const uniqueLakesCount = new Set(
    publicLakeIds
      .map((item) => item.lakeId)
      .filter((lakeId): lakeId is string => Boolean(lakeId))
  ).size;

  const heaviestCatch =
    [...catches]
      .filter((item) => item.weight !== null)
      .sort((a, b) => Number(b.weight) - Number(a.weight))[0] || null;

  const longestCatch =
    [...catches]
      .filter((item) => item.length !== null)
      .sort((a, b) => Number(b.length) - Number(a.length))[0] || null;

  const latestCatches = catches.slice(0, 12);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/lowiska"
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            ← Wróć do łowisk
          </Link>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-emerald-50 p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-blue-600 text-2xl font-black text-white shadow-sm">
                  {getInitials(userName)}
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-500">
                    Profil wędkarza
                  </p>

                  <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    {userName}
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Publiczne statystyki użytkownika na podstawie połowów
                    dodanych do rankingów łowisk.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-500">
                  Złowione ryby
                </p>

                <p className="mt-1 text-4xl font-black text-slate-950">
                  {totalCatches}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Publiczne połowy" value={String(totalCatches)} />

            <StatCard label="Złowione ryby" value={String(totalCatches)} />

            <StatCard
              label="Połowy ze zdjęciem"
              value={String(catchesWithPhotosCount)}
            />

            <StatCard label="Łowiska" value={String(uniqueLakesCount)} />
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <HighlightCard
            title="Najcięższa ryba"
            emptyText="Brak publicznego połowu ze zdjęciem i podaną wagą."
            catchItem={heaviestCatch}
            type="weight"
          />

          <HighlightCard
            title="Najdłuższa ryba"
            emptyText="Brak publicznego połowu ze zdjęciem i podaną długością."
            catchItem={longestCatch}
            type="length"
          />
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Publiczne połowy ze zdjęciem
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tutaj widoczne są tylko publiczne, zatwierdzone połowy, które
                posiadają zdjęcie.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {latestCatches.length} z {catchesWithPhotosCount}
            </span>
          </div>

          {latestCatches.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {latestCatches.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="h-48 overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl || ""}
                      alt={`Połów: ${item.fishName}`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                          {getMethodLabel(item.method)}
                        </p>

                        <h3 className="mt-2 text-xl font-black text-slate-950">
                          {item.fishName}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatDate(item.caughtAt)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-blue-50 px-3 py-2 text-sm font-black text-blue-700">
                        🎣
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.weight !== null && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          {item.weight.toFixed(2)} kg
                        </span>
                      )}

                      {item.length !== null && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          {item.length.toFixed(0)} cm
                        </span>
                      )}

                      {item.bait && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          {item.bait}
                        </span>
                      )}
                    </div>

                    {item.lakeName && (
                      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                          Łowisko
                        </p>

                        {item.lake?.slug ? (
                          <Link
                            href={`/lowiska/${item.lake.slug}`}
                            className="mt-1 block font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
                          >
                            {item.lakeName}
                          </Link>
                        ) : (
                          <p className="mt-1 font-bold text-slate-700">
                            {item.lakeName}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl bg-slate-50 p-8 text-center">
              <p className="text-lg font-bold text-slate-950">
                Brak publicznych połowów ze zdjęciem
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Użytkownik ma publiczne połowy, ale żaden z nich nie posiada
                jeszcze zdjęcia.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function HighlightCard({
  title,
  emptyText,
  catchItem,
  type,
}: {
  title: string;
  emptyText: string;
  catchItem:
    | {
        id: string;
        fishName: string;
        weight: number | null;
        length: number | null;
        method: string;
        bait: string | null;
        lakeName: string | null;
        caughtAt: Date;
        imageUrl: string | null;
      }
    | null;
  type: "weight" | "length";
}) {
  if (!catchItem) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>

        <p className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">
          {emptyText}
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid sm:grid-cols-[220px_1fr]">
        <div className="h-56 overflow-hidden bg-slate-100 sm:h-full">
          <img
            src={catchItem.imageUrl || ""}
            alt={`Połów: ${catchItem.fishName}`}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-500">
            {title}
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            {catchItem.fishName}
          </h2>

          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            {getMethodLabel(catchItem.method)}
          </p>

          <div className="mt-5 inline-flex rounded-2xl bg-amber-50 px-4 py-3 text-xl font-black text-amber-700">
            {type === "weight"
              ? catchItem.weight !== null
                ? `${catchItem.weight.toFixed(2)} kg`
                : "Brak"
              : catchItem.length !== null
                ? `${catchItem.length.toFixed(0)} cm`
                : "Brak"}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {catchItem.weight !== null && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                Waga: {catchItem.weight.toFixed(2)} kg
              </span>
            )}

            {catchItem.length !== null && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                Długość: {catchItem.length.toFixed(0)} cm
              </span>
            )}

            {catchItem.bait && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {catchItem.bait}
              </span>
            )}

            {catchItem.lakeName && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {catchItem.lakeName}
              </span>
            )}
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-400">
            {formatDate(catchItem.caughtAt)}
          </p>
        </div>
      </div>
    </section>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getMethodLabel(value: string) {
  if (value === "spinning") return "Spinning";
  if (value === "feeder") return "Feeder";
  if (value === "method_feeder") return "Method feeder";
  if (value === "carp") return "Karpiówka";
  if (value === "float") return "Spławik";
  if (value === "fly") return "Muchówka";
  if (value === "other") return "Inna metoda";
  return value;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}