import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardQuickOverview } from "@/components/dashboard/DashboardQuickOverview";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { MapSection } from "@/components/dashboard/MapSection";
import { NearestLakes } from "@/components/dashboard/NearestLakes";
import { RecentCatches } from "@/components/dashboard/RecentCatches";
import { RecommendedLakes } from "@/components/dashboard/RecommendedLakes";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { DashboardLocationInitializer } from "@/components/dashboard/DashboardLocationInitializer";

import { getLakes } from "@/lib/lakes";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const lakes = await getLakes();

  const weekStartDate = getWeekStartDate();
  const now = new Date();

  const [
    completedTripsCount,
    completedTripsThisWeekCount,
    savedLakesCount,
    savedLakesThisWeekCount,
    catchesCount,
    catchesThisWeekCount,
    catchesForSpecies,
    catchesForSpeciesThisWeek,
    recentCatches,
    upcomingTrip,
    gearCount,
    recentGear,
  ] = await Promise.all([
    prisma.fishingTrip.count({
      where: {
        userId: user.id,
        status: "finished",
      },
    }),

    prisma.fishingTrip.count({
      where: {
        userId: user.id,
        status: "finished",
        startsAt: {
          gte: weekStartDate,
        },
      },
    }),

    prisma.favourite.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.favourite.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: weekStartDate,
        },
      },
    }),

    prisma.fishingCatch.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.fishingCatch.count({
      where: {
        userId: user.id,
        caughtAt: {
          gte: weekStartDate,
        },
      },
    }),

    prisma.fishingCatch.findMany({
      where: {
        userId: user.id,
      },
      select: {
        fishName: true,
      },
    }),

    prisma.fishingCatch.findMany({
      where: {
        userId: user.id,
        caughtAt: {
          gte: weekStartDate,
        },
      },
      select: {
        fishName: true,
      },
    }),

    prisma.fishingCatch.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        caughtAt: "desc",
      },
      take: 3,
      select: {
        id: true,
        fishName: true,
        weight: true,
        length: true,
        method: true,
        bait: true,
        lakeName: true,
        tripTitle: true,
        caughtAt: true,
      },
    }),

    prisma.fishingTrip.findFirst({
      where: {
        userId: user.id,
        status: "planned",
        startsAt: {
          gte: now,
        },
      },
      orderBy: {
        startsAt: "asc",
      },
      select: {
        id: true,
        title: true,
        lakeName: true,
        startsAt: true,
        checklistId: true,
        status: true,
      },
    }),

    prisma.fishingGear.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.fishingGear.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      select: {
        id: true,
        name: true,
        category: true,
        fishingMethod: true,
        quantity: true,
      },
    }),
  ]);

  const uniqueSpeciesCount = new Set(
    catchesForSpecies.map((item) => item.fishName)
  ).size;

  const uniqueSpeciesThisWeekCount = new Set(
    catchesForSpeciesThisWeek.map((item) => item.fishName)
  ).size;

  const displayName = getUserDisplayName(user);
  const firstName = displayName.split(" ")[0];

  const serializedUpcomingTrip = JSON.parse(JSON.stringify(upcomingTrip));
  const serializedRecentGear = JSON.parse(JSON.stringify(recentGear));
  const serializedRecentCatches = JSON.parse(JSON.stringify(recentCatches));

  return (
    <DashboardLayout>
      <DashboardLocationInitializer />
      {/* DESKTOP — zostaje układ z mapą jako głównym widokiem */}
      <div className="hidden lg:block">
        <div className="grid gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5 lg:space-y-6">
            <MapSection lakes={lakes} />

            <RecommendedLakes lakes={lakes} />

            <DashboardQuickOverview
              upcomingTrip={serializedUpcomingTrip}
              gearCount={gearCount}
              recentGear={serializedRecentGear}
            />

            <DashboardStats
              completedTripsCount={completedTripsCount}
              completedTripsThisWeekCount={completedTripsThisWeekCount}
              uniqueSpeciesCount={uniqueSpeciesCount}
              uniqueSpeciesThisWeekCount={uniqueSpeciesThisWeekCount}
              savedLakesCount={savedLakesCount}
              savedLakesThisWeekCount={savedLakesThisWeekCount}
              catchesCount={catchesCount}
              catchesThisWeekCount={catchesThisWeekCount}
            />
          </div>

          <aside className="space-y-6">
            <WeatherCard />

            <NearestLakes lakes={lakes} />

            <RecentCatches catches={serializedRecentCatches} />
          </aside>
        </div>
      </div>

      {/* MOBILE — osobny, prostszy dashboard bez mapy jako pierwszego ekranu */}
      <div className="space-y-5 lg:hidden">
        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 to-blue-500 p-5 text-white shadow-sm">
          <p className="text-sm font-semibold text-blue-100">
            Witaj w Rybio
          </p>

          <h1 className="mt-2 text-2xl font-black tracking-tight">
            Cześć, {firstName}
          </h1>

          <p className="mt-2 max-w-sm text-sm leading-6 text-blue-50">
            Sprawdź łowiska, zapisz połów albo zaplanuj kolejną wyprawę nad
            wodę.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <MobileHeroStat label="Połowy" value={String(catchesCount)} />
            <MobileHeroStat label="Ulubione" value={String(savedLakesCount)} />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-950">
              Co chcesz dziś zrobić?
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Najważniejsze akcje masz teraz pod ręką.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              href="/lowiska?view=map"
              label="Znajdź łowisko"
              description="Przeglądaj bazę miejsc"
              icon={<MapIcon />}
            />

            <QuickActionCard
              href="/polowy"
              label="Dodaj połów"
              description="Zapisz rybę w dzienniku"
              icon={<FishIcon />}
            />

            <QuickActionCard
              href="/wyprawy"
              label="Zaplanuj wyprawę"
              description="Przygotuj wyjazd"
              icon={<TripIcon />}
            />

            <QuickActionCard
              href="/lowiska/zglos"
              label="Zgłoś łowisko"
              description="Dodaj miejsce do bazy"
              icon={<PlusIcon />}
            />
          </div>
        </section>

        <NearestLakes lakes={lakes} />

        <RecentCatches catches={serializedRecentCatches} />

        <RecommendedLakes lakes={lakes} />

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Mapa łowisk
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Na telefonie mapa działa najlepiej jako osobny widok. Przejdź
                do listy łowisk i wybierz interesujące miejsce.
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-600">
              MAP
            </div>
          </div>

          <Link
            href="/lowiska"
            className="mt-5 flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Otwórz łowiska
          </Link>
        </section>

        <WeatherCard />

        <DashboardQuickOverview
          upcomingTrip={serializedUpcomingTrip}
          gearCount={gearCount}
          recentGear={serializedRecentGear}
        />

        <DashboardStats
          completedTripsCount={completedTripsCount}
          completedTripsThisWeekCount={completedTripsThisWeekCount}
          uniqueSpeciesCount={uniqueSpeciesCount}
          uniqueSpeciesThisWeekCount={uniqueSpeciesThisWeekCount}
          savedLakesCount={savedLakesCount}
          savedLakesThisWeekCount={savedLakesThisWeekCount}
          catchesCount={catchesCount}
          catchesThisWeekCount={catchesThisWeekCount}
        />
      </div>
    </DashboardLayout>
  );
}

function MobileHeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
      <p className="text-xs font-bold uppercase tracking-wide text-blue-100">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function QuickActionCard({
  href,
  label,
  description,
  icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm transition group-hover:bg-blue-600 group-hover:text-white">
        {icon}
      </div>

      <p className="mt-4 text-sm font-black leading-5 text-slate-950">
        {label}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </Link>
  );
}

function MapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
      <path d="M9 3v15" />
      <path d="M15 6v15" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

function TripIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
     <path d="M8 7V6a4 4 0 0 1 8 0v1" />
      <rect x="5" y="7" width="14" height="14" rx="3" />
      <path d="M8 13h8" />
      <path d="M9 17h6" />
    </svg>
  );
}

function FishIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16.5 12c0 3-3.5 5.5-7.5 5.5S2 12 2 12s3-5.5 7-5.5 7.5 2.5 7.5 5.5Z" />
      <path d="M16.5 12 22 8v8l-5.5-4Z" />
      <circle cx="7.5" cy="11" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function getUserDisplayName(user: {
  email?: string | null;
  user_metadata?: {
    name?: unknown;
    full_name?: unknown;
    display_name?: unknown;
  };
}) {
  if (typeof user.user_metadata?.name === "string") {
    return user.user_metadata.name;
  }

  if (typeof user.user_metadata?.full_name === "string") {
    return user.user_metadata.full_name;
  }

  if (typeof user.user_metadata?.display_name === "string") {
    return user.user_metadata.display_name;
  }

  return "Wędkarzu";
}

function getWeekStartDate() {
  const date = new Date();
  const day = date.getDay();
  const differenceToMonday = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + differenceToMonday);
  date.setHours(0, 0, 0, 0);

  return date;
}