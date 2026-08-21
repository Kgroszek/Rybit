import {
  notFound,
  redirect,
} from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OwnerLakeNav } from "@/components/owner/OwnerLakeNav";
import { OwnerSpotsManager } from "@/components/owner/spots/OwnerSpotsManager";
import {
  ACTIVE_RESERVATION_STATUSES,
} from "@/lib/owner-access";
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

  const now = new Date();

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
                reservations: {
                  where: {
                    status: {
                      in: [
                        ...ACTIVE_RESERVATION_STATUSES,
                      ],
                    },
                    endsAt: {
                      gt: now,
                    },
                  },
                  orderBy: [
                    { startsAt: "asc" },
                    { createdAt: "asc" },
                  ],
                  take: 1,
                  select: {
                    id: true,
                    startsAt: true,
                    endsAt: true,
                    customerName: true,
                    title: true,
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

  const spots = lake.spots.map((spot) => {
    const nextReservation =
      spot.reservations[0] ?? null;

    const isOccupiedNow =
      Boolean(nextReservation) &&
      nextReservation!.startsAt <= now &&
      nextReservation!.endsAt > now;

    return {
      id: spot.id,
      name: spot.name,
      description: spot.description,
      maxPeople: spot.maxPeople,
      isActive: spot.isActive,
      sortOrder: spot.sortOrder,
      reservationsCount:
        spot._count.reservations,
      isOccupiedNow,
      nextReservation: nextReservation
        ? {
            id: nextReservation.id,
            startsAt:
              nextReservation.startsAt.toISOString(),
            endsAt:
              nextReservation.endsAt.toISOString(),
            customerName:
              nextReservation.customerName,
            title: nextReservation.title,
          }
        : null,
    };
  });

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

        <OwnerSpotsManager
          lakeSlug={lake.slug}
          lakeName={lake.name}
          spots={spots}
          canManage={
            ownerLake.canManageSpots
          }
        />
      </div>
    </DashboardLayout>
  );
}
