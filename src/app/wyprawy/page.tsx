import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TripsPage } from "@/components/dashboard/TripsPage";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type TripsRoutePageProps = {
  searchParams?: Promise<{
    lakeId?: string;
    lakeName?: string;
  }>;
};

function calculatePercent(completed: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

export default async function TripsRoutePage({
  searchParams,
}: TripsRoutePageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialLakeId = resolvedSearchParams.lakeId?.trim() || null;
  const initialLakeName = resolvedSearchParams.lakeName?.trim() || null;

  const [trips, lakes, pendingInvitations] = await Promise.all([
    prisma.fishingTrip.findMany({
      where: {
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
      },
      orderBy: [
        {
          startsAt: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      include: {
        lake: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            voivodeship: true,
            lat: true,
            lng: true,
            images: {
              orderBy: {
                sortOrder: "asc",
              },
              take: 1,
              select: {
                url: true,
              },
            },
          },
        },
        checklist: {
          select: {
            id: true,
            title: true,
            status: true,
            items: {
              orderBy: {
                createdAt: "asc",
              },
              select: {
                id: true,
                name: true,
                category: true,
                quantity: true,
                unit: true,
                isPacked: true,
                isImportant: true,
                source: true,
                gearId: true,
                note: true,
              },
            },
          },
        },
        members: {
          where: {
            status: {
              in: ["pending", "accepted"],
            },
          },
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            userId: true,
            userName: true,
            userEmail: true,
            role: true,
            status: true,
            invitedByUserId: true,
            acceptedAt: true,
            createdAt: true,
          },
        },
        gearItems: {
          select: {
            id: true,
            isRequired: true,
            isPacked: true,
          },
        },
        _count: {
          select: {
            notes: true,
            costs: true,
            media: true,
            catches: true,
            reminders: true,
          },
        },
      },
    }),

    prisma.lake.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        city: true,
        voivodeship: true,
      },
    }),

    prisma.tripMember.findMany({
      where: {
        userId: user.id,
        status: "pending",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        role: true,
        trip: {
          select: {
            id: true,
            title: true,
            lakeName: true,
            startsAt: true,
          },
        },
      },
    }),
  ]);

  const preparedTrips = trips.map((trip) => {
    const currentMember = trip.members.find(
      (member) => member.userId === user.id && member.status === "accepted"
    );

    const checklistItems = trip.checklist?.items ?? [];
    const packedChecklistItems = checklistItems.filter(
      (item) => item.isPacked
    ).length;

    const requiredChecklistItems = checklistItems.filter(
      (item) => item.isImportant
    );
    const packedRequiredChecklistItems = requiredChecklistItems.filter(
      (item) => item.isPacked
    ).length;

    const requiredGearItems = trip.gearItems.filter(
      (item) => item.isRequired
    );
    const packedRequiredGearItems = requiredGearItems.filter(
      (item) => item.isPacked
    ).length;

    const acceptedMembersCount = trip.members.filter(
      (member) => member.status === "accepted"
    ).length;

    const pendingMembersCount = trip.members.filter(
      (member) => member.status === "pending"
    ).length;

    const checklistProgress = calculatePercent(
      packedChecklistItems,
      checklistItems.length
    );

    const requiredChecklistProgress = calculatePercent(
      packedRequiredChecklistItems,
      requiredChecklistItems.length
    );

    const requiredGearProgress = calculatePercent(
      packedRequiredGearItems,
      requiredGearItems.length
    );

    const detailsChecks = [
      Boolean(trip.title.trim()),
      Boolean(trip.startsAt),
      Boolean(trip.endsAt),
      Boolean(trip.lakeId || trip.lakeName?.trim()),
    ];

    const detailsProgress = calculatePercent(
      detailsChecks.filter(Boolean).length,
      detailsChecks.length
    );

    const progressParts = [detailsProgress];

    if (checklistItems.length > 0) {
      progressParts.push(checklistProgress);
    }

    if (requiredGearItems.length > 0) {
      progressParts.push(requiredGearProgress);
    }

    const preparationProgress = Math.round(
      progressParts.reduce((sum, value) => sum + value, 0) / progressParts.length
    );

    const preparationWarnings = [
      checklistItems.length === 0 ? "Nie utworzono checklisty" : null,
      requiredGearItems.length === 0 ? "Nie przypisano wymaganego sprzętu" : null,
      requiredChecklistItems.length - packedRequiredChecklistItems > 0
        ? `${requiredChecklistItems.length - packedRequiredChecklistItems} ważnych rzeczy do spakowania`
        : null,
      requiredGearItems.length - packedRequiredGearItems > 0
        ? `${requiredGearItems.length - packedRequiredGearItems} elementów sprzętu do spakowania`
        : null,
    ].filter((value): value is string => Boolean(value));

    return {
      ...trip,
      lakeImage: trip.lake?.images[0]?.url ?? null,
      isOwner: trip.userId === user.id,
      accessRole:
        trip.userId === user.id ? "owner" : currentMember?.role ?? "viewer",
      canEdit:
        trip.userId === user.id ||
        currentMember?.role === "editor" ||
        currentMember?.role === "co_owner",
      canManageMembers: trip.userId === user.id,
      canDelete: trip.userId === user.id,
      acceptedMembersCount,
      pendingMembersCount,
      participantsCount: Math.max(
        trip.peopleCount,
        acceptedMembersCount + 1
      ),
      checklistItemsCount: checklistItems.length,
      packedChecklistItemsCount: packedChecklistItems,
      requiredChecklistItemsCount: requiredChecklistItems.length,
      packedRequiredChecklistItemsCount: packedRequiredChecklistItems,
      requiredGearItemsCount: requiredGearItems.length,
      packedRequiredGearItemsCount: packedRequiredGearItems,
      checklistProgress,
      requiredChecklistProgress,
      requiredGearProgress,
      detailsProgress,
      preparationProgress,
      preparationWarnings,
    };
  });

  return (
    <DashboardLayout>
      <TripsPage
        initialTrips={JSON.parse(JSON.stringify(preparedTrips))}
        lakes={JSON.parse(JSON.stringify(lakes))}
        initialLakeId={initialLakeId}
        initialLakeName={initialLakeName}
        pendingInvitations={JSON.parse(JSON.stringify(pendingInvitations))}
      />
    </DashboardLayout>
  );
}
