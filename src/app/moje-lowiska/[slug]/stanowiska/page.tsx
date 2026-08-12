import { notFound, redirect } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OwnerLakeNav } from "@/components/owner/OwnerLakeNav";
import { OwnerSpotsManager } from "@/components/owner/OwnerSpotsManager";
import { ACTIVE_RESERVATION_STATUSES } from "@/lib/owner-access";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OwnerLakeSpotsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function OwnerLakeSpotsPage({
  params,
}: OwnerLakeSpotsPageProps) {
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
            orderBy: [
              { sortOrder: "asc" },
              { createdAt: "asc" },
            ],
            include: {
              _count: {
                select: {
                  reservations: true,
                },
              },
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

  const upcomingReservations = await prisma.lakeReservation.findMany({
    where: {
      lakeId: lake.id,
      scope: "spot",
      spotId: {
        not: null,
      },
      status: {
        in: [...ACTIVE_RESERVATION_STATUSES],
      },
      endsAt: {
        gt: now,
      },
    },
    orderBy: {
      startsAt: "asc",
    },
    select: {
      id: true,
      spotId: true,
      startsAt: true,
      endsAt: true,
      customerName: true,
      title: true,
    },
  });

  const nextReservationBySpot = new Map<string, (typeof upcomingReservations)[number]>();
  const occupiedSpotIds = new Set<string>();

  for (const reservation of upcomingReservations) {
    if (!reservation.spotId) continue;

    if (!nextReservationBySpot.has(reservation.spotId)) {
      nextReservationBySpot.set(reservation.spotId, reservation);
    }

    if (reservation.startsAt <= now && reservation.endsAt > now) {
      occupiedSpotIds.add(reservation.spotId);
    }
  }

  const spots = lake.spots.map((spot) => {
    const nextReservation = nextReservationBySpot.get(spot.id);

    return {
      id: spot.id,
      name: spot.name,
      description: spot.description,
      maxPeople: spot.maxPeople,
      isActive: spot.isActive,
      sortOrder: spot.sortOrder,
      reservationsCount: spot._count.reservations,
      isOccupiedNow: occupiedSpotIds.has(spot.id),
      nextReservation: nextReservation
        ? {
            id: nextReservation.id,
            startsAt: nextReservation.startsAt.toISOString(),
            endsAt: nextReservation.endsAt.toISOString(),
            customerName: nextReservation.customerName,
            title: nextReservation.title,
          }
        : null,
    };
  });

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

        <OwnerSpotsManager
          lakeSlug={lake.slug}
          lakeName={lake.name}
          spots={spots}
          canManage={ownerLake.canManageSpots}
        />
      </div>
    </DashboardLayout>
  );
}
