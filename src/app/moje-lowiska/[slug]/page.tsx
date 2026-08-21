import { notFound, redirect } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { OwnerLakeNav } from "@/components/owner/OwnerLakeNav";
import { OwnerLakeDashboardOverview } from "@/components/owner/dashboard/OwnerLakeDashboardOverview";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ACTIVE_RESERVATION_STATUSES } from "@/lib/owner-access";
import {
  addDaysToDateKey,
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
          spots: {
            where: {
              isActive: true,
            },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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

  const sevenDaysFromTodayKey = addDaysToDateKey(todayKey, 7);
  const upcomingRangeEnd =
    warsawDateTimeToUtc(sevenDaysFromTodayKey, "00:00") ??
    new Date(todayEnd.getTime() + 7 * 24 * 60 * 60 * 1000);

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
            gte: now,
            lt: upcomingRangeEnd,
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

  const activeReservationsNow = todayReservations.filter(
    (reservation) => reservation.startsAt <= now && reservation.endsAt > now
  );

  const lakeWideReservationNow = activeReservationsNow.find(
    (reservation) => reservation.scope === "lake"
  );

  const activeReservationBySpot = new Map(
    activeReservationsNow
      .filter((reservation) => reservation.scope === "spot" && reservation.spotId)
      .map((reservation) => [reservation.spotId as string, reservation])
  );

  const occupiedSpots = lakeWideReservationNow
    ? lake.spots.length
    : activeReservationBySpot.size;

  const arrivalsToday = todayReservations.filter(
    (reservation) =>
      reservation.startsAt >= todayStart && reservation.startsAt < todayEnd
  ).length;

  const departuresToday = todayReservations.filter(
    (reservation) =>
      reservation.endsAt >= todayStart && reservation.endsAt < todayEnd
  ).length;

  const spotSnapshots = lake.spots.map((spot) => {
    const currentReservation = activeReservationBySpot.get(spot.id);
    const isOccupied = Boolean(lakeWideReservationNow) || Boolean(currentReservation);

    return {
      id: spot.id,
      name: spot.name,
      maxPeople: spot.maxPeople,
      isOccupied,
      currentLabel: lakeWideReservationNow
        ? getLakeWideReservationLabel(lakeWideReservationNow)
        : currentReservation?.customerName || currentReservation?.title || null,
    };
  });

  return (
    <DashboardLayout>
      <div className="pb-20 pt-5 lg:pb-4 lg:pt-7">
        <OwnerLakeNav
          slug={lake.slug}
          lakeName={lake.name}
          canEditLake={ownerLake.canEditLake}
          canManageReservations={ownerLake.canManageReservations}
          canManageSpots={ownerLake.canManageSpots}
        />

        <PageHeader
          eyebrow={formatLongDate(now)}
          title="Pulpit łowiska"
          description="Rezerwacje, bieżąca zajętość stanowisk i sprawy wymagające uwagi — bez przekopywania się przez cały panel."
          actions={
            ownerLake.canManageReservations ? (
              <ButtonLink
                href={`/moje-lowiska/${lake.slug}/rezerwacje?new=1`}
                variant="primary"
              >
                <AddCircleIcon className="h-4 w-4" />
                Nowa rezerwacja
              </ButtonLink>
            ) : null
          }
        />

        <div className="mt-7">
          <OwnerLakeDashboardOverview
            lakeSlug={lake.slug}
            stats={{
              occupiedSpots,
              totalSpots: lake.spots.length,
              arrivalsToday,
              departuresToday,
              pendingCount,
            }}
            upcomingReservations={upcomingReservations}
            spots={spotSnapshots}
            canManageReservations={ownerLake.canManageReservations}
            canManageSpots={ownerLake.canManageSpots}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function getLakeWideReservationLabel(reservation: {
  title: string | null;
  organizerName: string | null;
  type: string;
}) {
  if (reservation.title) return reservation.title;
  if (reservation.organizerName) return reservation.organizerName;
  if (reservation.type === "competition") return "Zawody — całe łowisko";
  if (reservation.type === "maintenance") return "Blokada techniczna";
  return "Całe łowisko zarezerwowane";
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}
