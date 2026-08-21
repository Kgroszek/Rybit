import {
  notFound,
  redirect,
} from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OwnerLakeNav } from "@/components/owner/OwnerLakeNav";
import { OwnerReservationsManager } from "@/components/owner/reservations/OwnerReservationsManager";
import {
  ACTIVE_RESERVATION_STATUSES,
} from "@/lib/owner-access";
import {
  addDaysToDateKey,
  getWarsawDateKey,
  warsawDateTimeToUtc,
} from "@/lib/owner-time";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OwnerReservationsPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    from?: string;
    days?: string;
    new?: string;
    spotId?: string;
    reservationId?: string;
  }>;
};

function normalizeDateKey(
  value: string | undefined
) {
  if (
    value &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return value;
  }

  return getWarsawDateKey();
}

function normalizeDays(
  value: string | undefined
) {
  const parsed = Number(value);

  return parsed === 7 ||
    parsed === 14 ||
    parsed === 30
    ? parsed
    : 14;
}

export default async function OwnerReservationsPage({
  params,
  searchParams,
}: OwnerReservationsPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const ownerLake =
    await prisma.lakeOwner.findFirst({
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
            slug: true,
            name: true,
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
            bookingSettings: true,
          },
        },
      },
    });

  if (!ownerLake) {
    notFound();
  }

  if (!ownerLake.canManageReservations) {
    redirect(`/moje-lowiska/${slug}`);
  }

  const lake = ownerLake.lake;
  const from = normalizeDateKey(query.from);
  const days = normalizeDays(query.days);
  const toDateKey = addDaysToDateKey(
    from,
    days
  );

  const rangeStart =
    warsawDateTimeToUtc(
      from,
      "00:00"
    );
  const rangeEnd =
    warsawDateTimeToUtc(
      toDateKey,
      "00:00"
    );

  if (!rangeStart || !rangeEnd) {
    redirect(
      `/moje-lowiska/${slug}/rezerwacje`
    );
  }

  const now = new Date();

  const [
    reservations,
    activeNow,
    pendingCount,
  ] = await Promise.all([
    prisma.lakeReservation.findMany({
      where: {
        lakeId: lake.id,
        startsAt: {
          lt: rangeEnd,
        },
        endsAt: {
          gt: rangeStart,
        },
      },
      orderBy: [
        { startsAt: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        spotId: true,
        scope: true,
        type: true,
        status: true,
        title: true,
        startsAt: true,
        endsAt: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        organizerName: true,
        organizerPhone: true,
        organizerEmail: true,
        peopleCount: true,
        note: true,
        internalNote: true,
        isPublicEvent: true,
        spot: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.lakeReservation.count({
      where: {
        lakeId: lake.id,
        status: {
          in: [
            ...ACTIVE_RESERVATION_STATUSES,
          ],
        },
        startsAt: {
          lte: now,
        },
        endsAt: {
          gt: now,
        },
      },
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

  const settings =
    lake.bookingSettings ?? {
      defaultStartTime: "12:00",
      defaultEndTime: "10:00",
      fullDayStartTime: "06:00",
      fullDayEndTime: "07:00",
      dayStartTime: "08:00",
      dayEndTime: "16:00",
      nightStartTime: "16:00",
      nightEndTime: "06:00",
    };

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <OwnerLakeNav
          slug={lake.slug}
          lakeName={lake.name}
          canEditLake={
            ownerLake.canEditLake
          }
          canManageReservations={
            ownerLake.canManageReservations
          }
          canManageSpots={
            ownerLake.canManageSpots
          }
        />

        <OwnerReservationsManager
          lakeSlug={lake.slug}
          lakeName={lake.name}
          from={from}
          days={days}
          activeNow={activeNow}
          pendingCount={pendingCount}
          spots={lake.spots}
          settings={settings}
          reservations={reservations.map(
            (reservation) => ({
              ...reservation,
              status:
                reservation.status ===
                "paid"
                  ? "confirmed"
                  : reservation.status,
              startsAt:
                reservation.startsAt.toISOString(),
              endsAt:
                reservation.endsAt.toISOString(),
            })
          )}
          initialNew={query.new === "1"}
          initialSpotId={
            query.spotId ?? null
          }
          initialReservationId={
            query.reservationId ?? null
          }
        />
      </div>
    </DashboardLayout>
  );
}
