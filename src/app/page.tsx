import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MapSection } from "@/components/dashboard/MapSection";
import { NearestLakes } from "@/components/dashboard/NearestLakes";
import { RecentCatches } from "@/components/dashboard/RecentCatches";
import { RecommendedLakes } from "@/components/dashboard/RecommendedLakes";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Topbar } from "@/components/dashboard/Topbar";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { getLakes } from "@/lib/lakes";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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
  ]);

  const uniqueSpeciesCount = new Set(
    catchesForSpecies.map((item) => item.fishName)
  ).size;

  const uniqueSpeciesThisWeekCount = new Set(
    catchesForSpeciesThisWeek.map((item) => item.fishName)
  ).size;

  return (
    <DashboardLayout>
      <Topbar />

      <div className="grid gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5 lg:space-y-6">
          <MapSection lakes={lakes} />

          <RecommendedLakes lakes={lakes} />
        </div>

        <aside className="space-y-6">
          <WeatherCard />

          <NearestLakes lakes={lakes} />

          <RecentCatches
            catches={JSON.parse(JSON.stringify(recentCatches))}
          />
        </aside>
      </div>

      <div className="mt-6">
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

function getWeekStartDate() {
  const date = new Date();
  const day = date.getDay();

  const differenceToMonday = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + differenceToMonday);
  date.setHours(0, 0, 0, 0);

  return date;
}