import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OwnerLakeNav } from "@/components/owner/OwnerLakeNav";
import { ACTIVE_RESERVATION_STATUSES } from "@/lib/owner-access";
import {
  addDaysToDateKey,
  getWarsawDateKey,
  getWarsawDayRange,
  warsawDateTimeToUtc,
} from "@/lib/owner-time";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OwnerLakeDashboardPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function OwnerLakeDashboardPage({
  params,
}: OwnerLakeDashboardPageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const ownerLake = await prisma.lakeOwner.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      lake: {
        slug,
      },
    },
    include: {
      lake: {
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          voivodeship: true,
          ownerType: true,
          fishingType: true,
          images: {
            take: 1,
            orderBy: [
              { sortOrder: "asc" },
              { createdAt: "asc" },
            ],
            select: {
              url: true,
            },
          },
          spots: {
            where: {
              isActive: true,
            },
            orderBy: [
              { sortOrder: "asc" },
              { createdAt: "asc" },
            ],
            select: {
              id: true,
              name: true,
              maxPeople: true,
            },
          },
        },
      },
    },
  });

  if (!ownerLake) {
    notFound();
  }

  const lake = ownerLake.lake;
  const now = new Date();
  const { dateKey: todayKey, start: todayStart, end: todayEnd } =
    getWarsawDayRange(now);
  const nextWeekKey = addDaysToDateKey(todayKey, 8);
  const nextWeekEnd =
    warsawDateTimeToUtc(nextWeekKey, "00:00") ??
    new Date(todayEnd.getTime() + 8 * 24 * 60 * 60 * 1000);

  const [todayReservations, upcomingReservations, pendingCount] =
    await Promise.all([
      prisma.lakeReservation.findMany({
        where: {
          lakeId: lake.id,
          status: {
            in: [...ACTIVE_RESERVATION_STATUSES],
          },
          startsAt: {
            lt: todayEnd,
          },
          endsAt: {
            gt: todayStart,
          },
        },
        include: {
          spot: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          startsAt: "asc",
        },
      }),
      prisma.lakeReservation.findMany({
        where: {
          lakeId: lake.id,
          status: {
            in: [...ACTIVE_RESERVATION_STATUSES],
          },
          startsAt: {
            gte: todayStart,
            lt: nextWeekEnd,
          },
        },
        include: {
          spot: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          startsAt: "asc",
        },
        take: 8,
      }),
      prisma.lakeReservation.count({
        where: {
          lakeId: lake.id,
          status: "pending",
          endsAt: {
            gt: now,
          },
        },
      }),
    ]);

  const lakeWideReservation = todayReservations.find(
    (reservation) => reservation.scope === "lake"
  );
  const occupiedSpotIds = new Set(
    todayReservations
      .filter((reservation) => reservation.scope === "spot" && reservation.spotId)
      .map((reservation) => reservation.spotId as string)
  );

  const occupiedSpots = lakeWideReservation
    ? lake.spots.length
    : occupiedSpotIds.size;

  const arrivalsToday = todayReservations.filter(
    (reservation) =>
      reservation.startsAt >= todayStart && reservation.startsAt < todayEnd
  ).length;
  const departuresToday = todayReservations.filter(
    (reservation) =>
      reservation.endsAt >= todayStart && reservation.endsAt < todayEnd
  ).length;

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <OwnerLakeNav
          slug={lake.slug}
          lakeName={lake.name}
          canEditLake={ownerLake.canEditLake}
          canManageReservations={ownerLake.canManageReservations}
          canManageSpots={ownerLake.canManageSpots}
        />

        <header className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              {formatLongDate(now)}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Dzień dobry — oto dzisiejszy obraz łowiska
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
              Najważniejsze rezerwacje, zajętość stanowisk i rzeczy wymagające uwagi w jednym miejscu.
            </p>
          </div>

          {ownerLake.canManageReservations && (
            <Link
              href={`/moje-lowiska/${lake.slug}/rezerwacje?new=1`}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              + Nowa rezerwacja
            </Link>
          )}
        </header>

        <section className="overflow-hidden rounded-[28px] bg-white shadow-sm">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4">
            <StatItem
              label="Zajęte stanowiska"
              value={`${occupiedSpots}/${lake.spots.length}`}
              description="w dzisiejszym terminie"
              tone="blue"
            />
            <StatItem
              label="Przyjazdy dzisiaj"
              value={arrivalsToday}
              description="rozpoczynające się rezerwacje"
              tone="emerald"
            />
            <StatItem
              label="Wyjazdy dzisiaj"
              value={departuresToday}
              description="kończące się rezerwacje"
              tone="slate"
            />
            <StatItem
              label="Wymagają działania"
              value={pendingCount}
              description="rezerwacje oczekujące"
              tone={pendingCount > 0 ? "amber" : "slate"}
            />
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[28px] bg-white shadow-sm">
          <div className="grid xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,.8fr)]">
            <div className="p-5 sm:p-6 xl:border-r xl:border-slate-100">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Najbliższe 7 dni
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                    Nadchodzące rezerwacje
                  </h2>
                </div>

                <Link
                  href={`/moje-lowiska/${lake.slug}/rezerwacje`}
                  className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Kalendarz →
                </Link>
              </div>

              {upcomingReservations.length > 0 ? (
                <div className="mt-5 divide-y divide-slate-100">
                  {upcomingReservations.map((reservation) => (
                    <Link
                      key={reservation.id}
                      href={`/moje-lowiska/${lake.slug}/rezerwacje?reservationId=${reservation.id}`}
                      className="group grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[94px_minmax(0,1fr)_auto] sm:items-center"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-950">
                          {formatShortDate(reservation.startsAt)}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          {formatTime(reservation.startsAt)}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusDot status={reservation.status} />
                          <p className="truncate text-sm font-bold text-slate-950">
                            {getReservationTitle(reservation)}
                          </p>
                        </div>
                        <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                          {reservation.scope === "lake"
                            ? "Całe łowisko"
                            : reservation.spot?.name || "Stanowisko"}
                          {reservation.peopleCount > 0
                            ? ` · ${reservation.peopleCount} os.`
                            : ""}
                        </p>
                      </div>

                      <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-blue-50 group-hover:text-blue-600 sm:flex">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyBlock
                  title="Brak nadchodzących rezerwacji"
                  description="Najbliższe dni są wolne. Możesz dodać rezerwację ręcznie z kalendarza."
                />
              )}
            </div>

            <div className="border-t border-slate-100 p-5 sm:p-6 xl:border-t-0">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Na teraz
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                    Stanowiska
                  </h2>
                </div>

                {ownerLake.canManageSpots && (
                  <Link
                    href={`/moje-lowiska/${lake.slug}/stanowiska`}
                    className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Zarządzaj →
                  </Link>
                )}
              </div>

              {lake.spots.length > 0 ? (
                <div className="mt-5 divide-y divide-slate-100">
                  {lake.spots.slice(0, 10).map((spot) => {
                    const isOccupied =
                      Boolean(lakeWideReservation) ||
                      occupiedSpotIds.has(spot.id);

                    const reservation = todayReservations.find(
                      (item) => item.scope === "spot" && item.spotId === spot.id
                    );

                    return (
                      <Link
                        key={spot.id}
                        href={`/moje-lowiska/${lake.slug}/rezerwacje`}
                        className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {spot.name}
                          </p>
                          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                            {isOccupied
                              ? reservation?.customerName ||
                                reservation?.title ||
                                "Zajęte"
                              : `do ${spot.maxPeople} os.`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                              isOccupied ? "bg-blue-500" : "bg-emerald-500"
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-400">
                            {isOccupied ? "Zajęte" : "Wolne"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <EmptyBlock
                  title="Brak stanowisk"
                  description="Dodaj stanowiska, aby kalendarz mógł rozdzielać rezerwacje na konkretne miejsca."
                />
              )}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:flex-wrap sm:items-center">
            <p className="mr-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Szybkie akcje
            </p>

            {ownerLake.canManageReservations && (
              <QuickAction
                href={`/moje-lowiska/${lake.slug}/rezerwacje?new=1`}
                label="Dodaj rezerwację"
              />
            )}
            {ownerLake.canManageReservations && (
              <QuickAction
                href={`/moje-lowiska/${lake.slug}/rezerwacje`}
                label="Otwórz kalendarz"
              />
            )}
            {ownerLake.canManageSpots && (
              <QuickAction
                href={`/moje-lowiska/${lake.slug}/stanowiska`}
                label="Stanowiska"
              />
            )}
            {ownerLake.canEditLake && (
              <QuickAction
                href={`/moje-lowiska/${lake.slug}/edytuj`}
                label="Profil łowiska"
              />
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function StatItem({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: number | string;
  description: string;
  tone: "blue" | "emerald" | "amber" | "slate";
}) {
  const tones = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-400",
    slate: "bg-slate-400",
  } as const;

  return (
    <div className="px-5 py-5 sm:px-6 xl:py-6 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-slate-100 sm:[&:not(:last-child)]:border-b-0 sm:[&:not(:last-child)]:border-r">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${tones[tone]}`} />
      </div>

      <p className="mt-1 text-xs font-semibold text-slate-500">
        {description}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-blue-600"
    >
      <span>{label}</span>
      <span className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600">
        →
      </span>
    </Link>
  );
}

function EmptyBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const className =
    status === "pending"
      ? "bg-amber-500"
      : status === "cancelled" || status === "no_show"
        ? "bg-red-500"
        : status === "completed"
          ? "bg-slate-400"
          : "bg-emerald-500";

  return <span className={`h-2 w-2 shrink-0 rounded-full ${className}`} />;
}

function getReservationTitle(reservation: {
  scope: string;
  type: string;
  title: string | null;
  customerName: string | null;
  organizerName: string | null;
}) {
  if (reservation.title) return reservation.title;
  if (reservation.scope === "lake") {
    if (reservation.type === "competition") return "Zawody wędkarskie";
    if (reservation.type === "maintenance") return "Blokada techniczna";
    return reservation.organizerName || "Blokada całego łowiska";
  }

  return reservation.customerName || "Rezerwacja";
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}