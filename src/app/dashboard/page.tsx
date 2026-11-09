import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardLocationInitializer } from "@/components/dashboard/DashboardLocationInitializer";
import { DashboardHome } from "@/components/dashboard/home/DashboardHome";
import type {
  DashboardTrip,
  PendingInvitation,
  RecentFinishedTrip,
} from "@/components/dashboard/home/types";
import {
  addDays,
  buildTodayTasks,
  getPreparationSummary,
  getPriorityCard,
  isTripActive,
} from "@/components/dashboard/home/utils";
import { getLakesDashboard } from "@/lib/lakes";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const thirtyDaysAgo = addDays(now, -30);
  const fourteenDaysAgo = addDays(now, -14);

  const tripAccessWhere = {
    OR: [
      {
        userId: user.id,
      },
      {
        members: {
          some: {
            userId: user.id,
            status: "accepted",
          },
        },
      },
    ],
  };

  const [
    lakes,
    catchesCount,
    savedLakesCount,
    tripsCount,
    speciesRows,
    recentCatches,
    pendingInvitation,
    tripCandidates,
    recentFinishedTrip,
  ] = await Promise.all([
    getLakesDashboard(),

    prisma.fishingCatch.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.favourite.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.fishingTrip.count({
      where: {
        ...tripAccessWhere,
        status: {
          notIn: ["cancelled", "canceled"],
        },
      },
    }),

    prisma.fishingCatch.findMany({
      where: {
        userId: user.id,
      },
      distinct: ["fishName"],
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

    prisma.tripMember.findFirst({
      where: {
        userId: user.id,
        status: "pending",
        trip: {
          status: {
            not: "cancelled",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        userName: true,
        role: true,
        createdAt: true,
        trip: {
          select: {
            id: true,
            title: true,
            lakeName: true,
            startsAt: true,
            endsAt: true,
            tripType: true,
          },
        },
      },
    }),

    prisma.fishingTrip.findMany({
      where: {
        ...tripAccessWhere,
        status: {
          notIn: ["cancelled", "canceled"],
        },
        startsAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        startsAt: "asc",
      },
      take: 30,
      select: {
        id: true,
        userId: true,
        title: true,
        lakeName: true,
        startsAt: true,
        endsAt: true,
        tripType: true,
        status: true,
        checklist: {
          select: {
            items: {
              select: {
                isPacked: true,
                isImportant: true,
              },
            },
          },
        },
        gearItems: {
          select: {
            isPacked: true,
            isRequired: true,
          },
        },
        members: {
          where: {
            status: "accepted",
          },
          select: {
            id: true,
          },
        },
      },
    }),

    prisma.fishingTrip.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ["finished", "completed"],
        },
        summary: null,
        OR: [
          {
            completedAt: {
              gte: fourteenDaysAgo,
            },
          },
          {
            endsAt: {
              gte: fourteenDaysAgo,
              lt: now,
            },
          },
        ],
      },
      orderBy: [
        {
          completedAt: "desc",
        },
        {
          startsAt: "desc",
        },
      ],
      select: {
        id: true,
        title: true,
        lakeName: true,
        startsAt: true,
        endsAt: true,
        _count: {
          select: {
            catches: true,
            media: true,
            costs: true,
          },
        },
      },
    }),
  ]);

  const typedTrips = tripCandidates as DashboardTrip[];
  const typedInvitation = pendingInvitation as PendingInvitation | null;
  const typedFinishedTrip = recentFinishedTrip as RecentFinishedTrip | null;

  const activeTrip =
    typedTrips.find((trip) => isTripActive(trip, now)) ?? null;

  const upcomingTrip =
    typedTrips.find(
      (trip) =>
        !["finished", "completed"].includes(trip.status) &&
        new Date(trip.startsAt).getTime() > now.getTime()
    ) ?? null;

  const focusTrip = activeTrip ?? upcomingTrip;
  const preparation = focusTrip ? getPreparationSummary(focusTrip) : null;

  const priorityCard = getPriorityCard({
    pendingInvitation: typedInvitation,
    activeTrip,
    upcomingTrip,
    recentFinishedTrip: typedFinishedTrip,
    preparation,
    catchesCount,
    savedLakesCount,
    tripsCount,
    now,
  });

  const todayTasks = buildTodayTasks({
    pendingInvitation: typedInvitation,
    activeTrip,
    upcomingTrip,
    recentFinishedTrip: typedFinishedTrip,
    preparation,
    now,
  }).slice(0, 3);

  const shouldShowSecondaryTrip = Boolean(
    upcomingTrip &&
      priorityCard.trip?.id !== upcomingTrip.id &&
      priorityCard.eyebrow !== "NAJBLIŻSZA WYPRAWA"
  );

  const secondaryTrip =
    shouldShowSecondaryTrip && upcomingTrip
      ? {
          trip: upcomingTrip,
          preparation: getPreparationSummary(upcomingTrip),
        }
      : null;

  const quickCatchHref = activeTrip
    ? `/polowy?tripId=${activeTrip.id}`
    : "/polowy?new=1";

  const serializedRecentCatches = recentCatches.map((item) => ({
    ...item,
    caughtAt: item.caughtAt.toISOString(),
  }));

  return (
    <DashboardLayout>
      <DashboardLocationInitializer />

      <DashboardHome
        lakes={lakes}
        priorityCard={priorityCard}
        todayTasks={todayTasks}
        stats={{
          catches: catchesCount,
          species: speciesRows.length,
          trips: tripsCount,
          favourites: savedLakesCount,
        }}
        recentCatches={serializedRecentCatches}
        quickCatchHref={quickCatchHref}
        hasActiveTrip={Boolean(activeTrip)}
        secondaryTrip={secondaryTrip}
        now={now}
      />
    </DashboardLayout>
  );
}
