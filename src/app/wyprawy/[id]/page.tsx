import { notFound, redirect } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TripCatchesTab } from "@/components/trips/details/TripCatchesTab";
import { TripCostsTab } from "@/components/trips/details/TripCostsTab";
import { TripDetailsHeader } from "@/components/trips/details/TripDetailsHeader";
import { TripDetailsNav } from "@/components/trips/details/TripDetailsNav";
import { TripMediaTab } from "@/components/trips/details/TripMediaTab";
import { TripMembersTab } from "@/components/trips/details/TripMembersTab";
import { TripNotesTab } from "@/components/trips/details/TripNotesTab";
import { TripOverview } from "@/components/trips/details/TripOverview";
import { TripPreparation } from "@/components/trips/details/TripPreparation";
import { TripSummaryStrip } from "@/components/trips/details/TripSummaryStrip";
import { prisma } from "@/lib/prisma";
import {
  tripDetailsInclude,
} from "@/lib/trips/details-query";
import {
  formatMoney,
  getLocalUserDisplayName,
  groupActivities,
  percent,
  resolveTripDetailsView,
} from "@/lib/trips/details-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type TripDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    tab?: string;
    prep?: string;
    activityPage?: string;
  }>;
};

const ACTIVITY_PAGE_SIZE = 12;

export default async function TripDetailsPage({
  params,
  searchParams,
}: TripDetailsPageProps) {
  const { id } = await params;
  const query = searchParams
    ? await searchParams
    : {};

  const view = resolveTripDetailsView(
    query.tab,
    query.prep
  );

  const requestedActivityPage =
    Number.parseInt(
      query.activityPage || "1",
      10
    );

  const activityPage =
    Number.isFinite(requestedActivityPage) &&
    requestedActivityPage > 0
      ? requestedActivityPage
      : 1;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const trip =
    await prisma.fishingTrip.findUnique({
      where: { id },
      include: tripDetailsInclude,
    });

  if (!trip) {
    notFound();
  }

  const currentMember = trip.members.find(
    (member) =>
      member.userId === user.id &&
      member.status === "accepted"
  );

  const isOwner =
    trip.userId === user.id;

  if (!isOwner && !currentMember) {
    notFound();
  }

  const accessRole =
    isOwner
      ? "owner"
      : currentMember?.role || "viewer";

  const canEdit =
    isOwner ||
    currentMember?.role === "editor" ||
    currentMember?.role === "co_owner";

  const acceptedMembers = trip.members.filter(
    (member) =>
      member.status === "accepted"
  );

  const pendingMembers = trip.members.filter(
    (member) =>
      member.status === "pending"
  );

  let ownerName = isOwner
    ? getLocalUserDisplayName(user)
    : "Właściciel wyprawy";

  if (!isOwner) {
    try {
      const admin = createAdminClient();
      const { data } =
        await admin.auth.admin.getUserById(
          trip.userId
        );

      if (data.user) {
        ownerName =
          getLocalUserDisplayName(
            data.user
          );
      }
    } catch {
      // Neutralny fallback pozostaje bezpieczny,
      // jeżeli dane profilu właściciela są niedostępne.
    }
  }

  const registeredParticipants = [
    {
      id: trip.userId,
      name: ownerName,
    },
    ...acceptedMembers.map((member) => ({
      id: member.userId,
      name: member.userName,
    })),
  ];

  const checklistItems =
    trip.checklist?.items ?? [];

  const packedItemsCount =
    checklistItems.filter(
      (item) => item.isPacked
    ).length;

  const checklistProgress = percent(
    packedItemsCount,
    checklistItems.length
  );

  const importantItems =
    checklistItems.filter(
      (item) => item.isImportant
    );

  const packedImportantItemsCount =
    importantItems.filter(
      (item) => item.isPacked
    ).length;

  const requiredGear =
    trip.gearItems.filter(
      (item) => item.isRequired
    );

  const packedRequiredGear =
    requiredGear.filter(
      (item) => item.isPacked
    );

  const gearProgress = percent(
    packedRequiredGear.length,
    requiredGear.length
  );

  const detailsChecks = [
    Boolean(trip.title.trim()),
    Boolean(trip.startsAt),
    Boolean(trip.endsAt),
    Boolean(
      trip.lakeId ||
        trip.lakeName?.trim()
    ),
  ];

  const detailsProgress = percent(
    detailsChecks.filter(Boolean).length,
    detailsChecks.length
  );

  const preparationParts = [
    detailsProgress,
  ];

  if (checklistItems.length > 0) {
    preparationParts.push(
      checklistProgress
    );
  }

  if (requiredGear.length > 0) {
    preparationParts.push(
      gearProgress
    );
  }

  const preparationProgress =
    Math.round(
      preparationParts.reduce(
        (sum, value) => sum + value,
        0
      ) / preparationParts.length
    );

  const preparationWarnings = [
    checklistItems.length === 0
      ? "Nie utworzono checklisty"
      : null,
    requiredGear.length === 0
      ? "Nie przypisano wymaganego sprzętu"
      : null,
    importantItems.length -
        packedImportantItemsCount >
      0
      ? `${
          importantItems.length -
          packedImportantItemsCount
        } ważnych rzeczy nie jest spakowanych`
      : null,
    requiredGear.length -
        packedRequiredGear.length >
      0
      ? `${
          requiredGear.length -
          packedRequiredGear.length
        } elementów wymaganego sprzętu nie jest spakowanych`
      : null,
  ].filter(
    (value): value is string =>
      Boolean(value)
  );

  let activityCount = 0;
  let rawActivities: Array<{
    id: string;
    actorUserId: string;
    actorName: string | null;
    action: string;
    createdAt: Date;
  }> = [];

  if (view.tab === "przeglad") {
    activityCount =
      await prisma.tripActivity.count({
        where: {
          tripId: trip.id,
        },
      });

    const maxPage = Math.max(
      1,
      Math.ceil(
        activityCount /
          ACTIVITY_PAGE_SIZE
      )
    );

    if (
      activityCount > 0 &&
      activityPage > maxPage
    ) {
      redirect(
        `/wyprawy/${trip.id}?tab=przeglad&activityPage=${maxPage}`
      );
    }

    rawActivities =
      await prisma.tripActivity.findMany(
        {
          where: {
            tripId: trip.id,
          },
          orderBy: [
            { createdAt: "desc" },
            { id: "desc" },
          ],
          skip:
            (activityPage - 1) *
            ACTIVITY_PAGE_SIZE,
          take: ACTIVITY_PAGE_SIZE,
          select: {
            id: true,
            actorUserId: true,
            actorName: true,
            action: true,
            createdAt: true,
          },
        }
      );
  }

  const activityTotalPages =
    Math.max(
      1,
      Math.ceil(
        activityCount /
          ACTIVITY_PAGE_SIZE
      )
    );

  const activities =
    groupActivities(rawActivities);

  const totalCosts =
    trip.costs.reduce(
      (sum, cost) =>
        sum + cost.amount,
      0
    );

  const totalWeight =
    trip.catches.reduce(
      (sum, item) =>
        sum + (item.weight ?? 0),
      0
    );

  const biggestCatch =
    trip.catches.reduce<
      (typeof trip.catches)[number] | null
    >((biggest, item) => {
      if (item.weight === null) {
        return biggest;
      }

      if (
        !biggest ||
        item.weight >
          (biggest.weight ?? 0)
      ) {
        return item;
      }

      return biggest;
    }, null);

  const participantCount =
    Math.max(
      trip.peopleCount,
      acceptedMembers.length + 1
    );

  return (
    <DashboardLayout>
      <div className="w-full max-w-full overflow-x-hidden pb-12">
        <div className="space-y-6 lg:space-y-7">
          <TripDetailsHeader
            trip={trip}
            isOwner={isOwner}
            accessRole={accessRole}
            canEdit={canEdit}
            participantCount={
              participantCount
            }
            preparationProgress={
              preparationProgress
            }
          />

          <TripSummaryStrip
            checklist={`${packedItemsCount}/${checklistItems.length}`}
            gear={`${packedRequiredGear.length}/${requiredGear.length}`}
            participants={
              participantCount
            }
            catches={
              trip.catches.length
            }
            costs={formatMoney(
              totalCosts
            )}
          />

          <TripDetailsNav
            tripId={trip.id}
            activeTab={view.tab}
            preparationTab={
              view.preparation
            }
            pendingMembers={
              pendingMembers.length
            }
          />

          {view.tab === "przeglad" && (
            <TripOverview
              trip={trip}
              detailsProgress={
                detailsProgress
              }
              checklistProgress={
                checklistProgress
              }
              gearProgress={
                gearProgress
              }
              preparationProgress={
                preparationProgress
              }
              preparationWarnings={
                preparationWarnings
              }
              activities={activities}
              activityCount={
                activityCount
              }
              activityPage={
                activityPage
              }
              activityTotalPages={
                activityTotalPages
              }
              acceptedMembersCount={
                acceptedMembers.length
              }
              pendingMembersCount={
                pendingMembers.length
              }
              totalWeight={totalWeight}
              biggestCatch={
                biggestCatch
              }
            />
          )}

          {view.tab ===
            "przygotowanie" && (
            <TripPreparation
              trip={trip}
              activeView={
                view.preparation
              }
              canEdit={canEdit}
              checklistProgress={
                checklistProgress
              }
              gearProgress={
                gearProgress
              }
              packedItemsCount={
                packedItemsCount
              }
              importantItemsCount={
                importantItems.length
              }
              packedImportantItemsCount={
                packedImportantItemsCount
              }
              packedRequiredGearCount={
                packedRequiredGear.length
              }
              requiredGearCount={
                requiredGear.length
              }
            />
          )}

          {view.tab === "notatki" && (
            <TripNotesTab
              trip={trip}
              currentUserId={user.id}
              isOwner={isOwner}
              canEdit={canEdit}
            />
          )}

          {view.tab === "koszty" && (
            <TripCostsTab
              trip={trip}
              currentUserId={user.id}
              isOwner={isOwner}
              canEdit={canEdit}
              participants={
                registeredParticipants
              }
            />
          )}

          {view.tab === "zdjecia" && (
            <TripMediaTab
              trip={trip}
              currentUserId={user.id}
              isOwner={isOwner}
              canEdit={canEdit}
            />
          )}

          {view.tab === "polowy" && (
            <TripCatchesTab
              trip={trip}
              canEdit={canEdit}
            />
          )}

          {view.tab ===
            "uczestnicy" && (
            <TripMembersTab
              trip={trip}
              ownerName={ownerName}
              currentUserId={
                user.id
              }
              isOwner={isOwner}
              canEdit={canEdit}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
