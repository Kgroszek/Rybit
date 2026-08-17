import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TripActionPopup } from "@/components/dashboard/TripActionPopup";
import { TripMembersManager } from "@/components/dashboard/TripMembersManager";
import { TripNoteActions } from "@/components/dashboard/TripNoteActions";
import { TripStatusActions } from "@/components/dashboard/TripStatusActions";
import {
  TripChecklistPackedToggle,
  TripDeleteButton,
  TripGearPackedToggle,
} from "@/components/dashboard/TripInlineActions";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { CheckListIcon } from "@/components/icons/CheckListIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { HookIcon } from "@/components/icons/HookIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";




type TripDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string; activityPage?: string }>;
};

const ACTIVITY_PAGE_SIZE = 12;

type TripTab =
  | "podsumowanie"
  | "checklista"
  | "sprzet"
  | "notatki"
  | "koszty"
  | "zdjecia"
  | "polowy"
  | "uczestnicy";

const tabs: { value: TripTab; label: string }[] = [
  { value: "podsumowanie", label: "Podsumowanie" },
  { value: "checklista", label: "Checklista" },
  { value: "sprzet", label: "Sprzęt" },
  { value: "notatki", label: "Notatki" },
  { value: "koszty", label: "Koszty" },
  { value: "zdjecia", label: "Zdjęcia" },
  { value: "polowy", label: "Połowy" },
  { value: "uczestnicy", label: "Uczestnicy" },
];

function isTripTab(value: string | undefined): value is TripTab {
  return tabs.some((tab) => tab.value === value);
}

function percent(done: number, total: number) {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export default async function TripDetailsPage({
  params,
  searchParams,
}: TripDetailsPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeTab: TripTab = isTripTab(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab
    : "podsumowanie";

  const requestedActivityPage = Number.parseInt(
    resolvedSearchParams.activityPage || "1",
    10
  );
  const activityPage =
    Number.isFinite(requestedActivityPage) && requestedActivityPage > 0
      ? requestedActivityPage
      : 1;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const trip = await prisma.fishingTrip.findUnique({
    where: { id },
    include: {
      lake: {
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          voivodeship: true,
          street: true,
          postalCode: true,
          rating: true,
          fish: true,
          lat: true,
          lng: true,
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: { url: true },
          },
          gearRequirements: {
            orderBy: { createdAt: "asc" },
            select: { text: true },
          },
        },
      },
      checklist: {
        include: {
          items: { orderBy: { createdAt: "asc" } },
        },
      },
      members: { orderBy: { createdAt: "asc" } },
      notes: {
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      },
      costs: { orderBy: { createdAt: "asc" } },
      gearItems: {
        orderBy: [{ isRequired: "desc" }, { createdAt: "asc" }],
        include: {
          gear: {
            select: {
              id: true,
              name: true,
              brand: true,
              model: true,
              category: true,
            },
          },
        },
      },
      reminders: { orderBy: { remindAt: "asc" } },
      media: { orderBy: { createdAt: "desc" } },
      catches: { orderBy: { caughtAt: "desc" } },
    },
  });

  if (!trip) {
    notFound();
  }

  const currentMember = trip.members.find(
    (member) => member.userId === user.id && member.status === "accepted"
  );

  const isOwner = trip.userId === user.id;
  const hasAccess = isOwner || Boolean(currentMember);

  if (!hasAccess) {
    notFound();
  }

  const canEdit =
    isOwner ||
    currentMember?.role === "editor" ||
    currentMember?.role === "co_owner";

  let activityCount = 0;
  let activities: Array<{
    id: string;
    actorUserId: string;
    actorName: string | null;
    action: string;
    createdAt: Date;
  }> = [];

  if (activeTab === "podsumowanie") {
    activityCount = await prisma.tripActivity.count({
      where: { tripId: trip.id },
    });

    const requestedTotalPages = Math.max(
      1,
      Math.ceil(activityCount / ACTIVITY_PAGE_SIZE)
    );

    if (activityPage > requestedTotalPages && activityCount > 0) {
      redirect(
        `/wyprawy/${trip.id}?tab=podsumowanie&activityPage=${requestedTotalPages}`
      );
    }

    activities = await prisma.tripActivity.findMany({
      where: { tripId: trip.id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (activityPage - 1) * ACTIVITY_PAGE_SIZE,
      take: ACTIVITY_PAGE_SIZE,
      select: {
        id: true,
        actorUserId: true,
        actorName: true,
        action: true,
        createdAt: true,
      },
    });
  }

  const activityTotalPages = Math.max(
    1,
    Math.ceil(activityCount / ACTIVITY_PAGE_SIZE)
  );

  const checklistItems = trip.checklist?.items ?? [];
  const packedItemsCount = checklistItems.filter((item) => item.isPacked).length;
  const checklistProgress = percent(packedItemsCount, checklistItems.length);

  const importantItems = checklistItems.filter((item) => item.isImportant);
  const packedImportantItems = importantItems.filter(
    (item) => item.isPacked
  ).length;

  const requiredGear = trip.gearItems.filter((item) => item.isRequired);
  const packedRequiredGear = requiredGear.filter((item) => item.isPacked).length;
  const gearProgress = percent(packedRequiredGear, requiredGear.length);

  const detailsChecks = [
    Boolean(trip.title.trim()),
    Boolean(trip.startsAt),
    Boolean(trip.endsAt),
    Boolean(trip.lakeId || trip.lakeName?.trim()),
  ];
  const detailsProgress = percent(
    detailsChecks.filter(Boolean).length,
    detailsChecks.length
  );

  const preparationParts = [detailsProgress];

  if (checklistItems.length > 0) preparationParts.push(checklistProgress);
  if (requiredGear.length > 0) preparationParts.push(gearProgress);

  const preparationProgress = Math.round(
    preparationParts.reduce((sum, value) => sum + value, 0) / preparationParts.length
  );

  const preparationWarnings = [
    checklistItems.length === 0 ? "Nie utworzono checklisty" : null,
    requiredGear.length === 0 ? "Nie przypisano wymaganego sprzętu" : null,
    importantItems.length - packedImportantItems > 0
      ? `${importantItems.length - packedImportantItems} ważnych rzeczy nie jest spakowanych`
      : null,
    requiredGear.length - packedRequiredGear > 0
      ? `${requiredGear.length - packedRequiredGear} elementów wymaganego sprzętu nie jest spakowanych`
      : null,
  ].filter((value): value is string => Boolean(value));

  const acceptedMembers = trip.members.filter(
    (member) => member.status === "accepted"
  );
  const pendingMembers = trip.members.filter(
    (member) => member.status === "pending"
  );

  let ownerName = isOwner
    ? getLocalUserDisplayName(user)
    : "Właściciel wyprawy";

  if (!isOwner) {
    try {
      const admin = createAdminClient();
      const { data } = await admin.auth.admin.getUserById(trip.userId);
      if (data.user) ownerName = getLocalUserDisplayName(data.user);
    } catch {
      // Fallback do neutralnej nazwy, gdy dane profilu nie są dostępne.
    }
  }

  const registeredParticipants = [
    { id: trip.userId, name: ownerName },
    ...acceptedMembers.map((member) => ({ id: member.userId, name: member.userName })),
  ];

  const totalCosts = trip.costs.reduce((sum, item) => sum + item.amount, 0);
  const totalWeight = trip.catches.reduce(
    (sum, item) => sum + (item.weight ?? 0),
    0
  );
  const biggestCatch = trip.catches.reduce<
    null | (typeof trip.catches)[number]
  >((biggest, item) => {
    if (item.weight === null) return biggest;
    if (!biggest || item.weight > (biggest.weight ?? 0)) return item;
    return biggest;
  }, null);

  const costSettlement = calculateCostSettlement(trip.costs, registeredParticipants);
  const groupedActivities = groupActivities(activities);
  const checklistGroups = groupChecklistItems(checklistItems);
  const pinnedNotes = trip.notes.filter((note) => note.isPinned);
  const regularNotes = trip.notes.filter((note) => !note.isPinned);

  const phase = getTripPhase(trip.status, trip.startsAt, trip.endsAt);

  return (
    <DashboardLayout>
      <div className="w-full max-w-full overflow-x-hidden pb-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/wyprawy"
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            ← Wróć do Centrum wypraw
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <AccessBadge
              isOwner={isOwner}
              role={currentMember?.role ?? "owner"}
            />
            <TripStatusActions
              tripId={trip.id}
              status={trip.status}
              canEdit={canEdit}
            />
          </div>
        </div>

        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid min-h-[320px] lg:grid-cols-[320px_1fr]">
            <div className="relative min-h-[240px] bg-gradient-to-br from-cyan-100 via-blue-100 to-emerald-100 lg:min-h-full">
              {trip.lake?.images[0]?.url ? (
                <img
                  src={trip.lake.images[0].url}
                  alt={trip.lakeName || trip.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[240px] items-center justify-center text-6xl">
                  🎣
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />

              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                <PhaseBadge phase={phase} />
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                  {getTripTypeLabel(trip.tripType)}
                </span>
              </div>

              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-sm font-bold text-white/80">
                  {trip.lakeName || trip.lake?.name || "Bez łowiska"}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 flex-col p-5 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                    Centrum wyprawy
                  </p>

                  <h1 className="mt-2 break-words text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                    {trip.title}
                  </h1>

                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-600 sm:text-base">
                    {formatTripDateRange(trip.startsAt, trip.endsAt)}
                  </p>

                  {trip.note && (
                    <p className="mt-4 max-w-3xl whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                      {trip.note}
                    </p>
                  )}
                </div>

                <div className="grid shrink-0 grid-cols-2 gap-3">
                  <MiniMetric
                    label="Uczestnicy"
                    value={String(
                      Math.max(trip.peopleCount, acceptedMembers.length + 1)
                    )}
                  />
                  <MiniMetric
                    label="Przygotowanie"
                    value={`${preparationProgress}%`}
                  />
                </div>
              </div>

              <div className="mt-6">
                <ProgressHeader value={preparationProgress} />
                <ProgressBar value={preparationProgress} />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <TripActionPopup
                  tripId={trip.id}
                  action="checklist"
                  canEdit={canEdit}
                  icon={<CheckListIcon className="h-4 w-4 shrink-0" />}
                  label={trip.checklistId ? "Otwórz checklistę" : "Utwórz checklistę"}
                  tripStartsAt={trip.startsAt}
                  tripEndsAt={trip.endsAt}
                  tripType={trip.tripType}
                  lakeGearRequirements={trip.lake?.gearRequirements.map((item) => item.text) ?? []}
                />

                <TripActionPopup
                  tripId={trip.id}
                  action="catch"
                  canEdit={canEdit}
                  icon={<FishIcon className="h-4 w-4 shrink-0" />}
                  label="Dodaj połów"
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                />

                {trip.lake && (
                  <a
                    href={getNavigationUrl(trip.lake.lat, trip.lake.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Nawigacja
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:pb-0 xl:grid-cols-5">
          <StatCard label="Przygotowanie" value={`${preparationProgress}%`} />
          <StatCard
            label="Checklista"
            value={`${packedItemsCount}/${checklistItems.length}`}
          />
          <StatCard
            label="Sprzęt"
            value={`${packedRequiredGear}/${requiredGear.length}`}
          />
          <StatCard
            label="Koszty"
            value={`${totalCosts.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} PLN`}
          />
          <StatCard label="Połowy" value={String(trip.catches.length)} />
        </section>

        <nav className="sticky top-20 z-30 mb-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">
          <div className="flex min-w-max gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;

              return (
                <Link
                  key={tab.value}
                  href={`/wyprawy/${trip.id}?tab=${tab.value}`}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                  {tab.value === "uczestnicy" && pendingMembers.length > 0 && (
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {pendingMembers.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {activeTab === "podsumowanie" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <main className="space-y-6">
              <Section title="Przygotowanie wyprawy">
                <div className="space-y-5">
                  <ProgressItem
                    label="Dane wyprawy"
                    value={detailsProgress}
                    description="Termin, łowisko i podstawowe informacje"
                  />
                  <ProgressItem
                    label="Checklista"
                    value={checklistProgress}
                    description="Spakowane elementy checklisty"
                  />
                  <ProgressItem
                    label="Wymagany sprzęt"
                    value={gearProgress}
                    description="Sprzęt oznaczony jako wymagany"
                  />

                  {preparationWarnings.length > 0 && (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Wymaga uwagi</p>
                      <div className="mt-2 space-y-1.5">
                        {preparationWarnings.map((warning) => (
                          <p key={warning} className="text-sm font-bold text-amber-900">⚠ {warning}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>

              <Section
                title="Ostatnia aktywność"
                action={
                  activityCount > 0 ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      {activityCount} wpisów
                    </span>
                  ) : undefined
                }
              >
                {groupedActivities.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {groupedActivities.map((activity) => (
                        <div
                          key={activity.key}
                          className="flex gap-3 rounded-2xl bg-slate-50 p-4"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm">
                            {getActivityIcon(activity.action)}
                          </div>
                          <div className="min-w-0">
                            <p className="break-words text-sm font-bold text-slate-800">
                              {activity.actorName || "Użytkownik"}{" "}
                              <span className="font-medium text-slate-500">
                                {getActivityLabel(activity.action)}
                              </span>
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-400">
                              {activity.count > 1 ? `${activity.count} zmian • ` : ""}{formatDateTime(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {activityTotalPages > 1 && (
                      <ActivityPagination
                        tripId={trip.id}
                        page={activityPage}
                        totalPages={activityTotalPages}
                      />
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="Brak aktywności"
                    description="Historia zmian pojawi się, gdy uczestnicy zaczną pracować nad wyprawą."
                  />
                )}
              </Section>
            </main>

            <aside className="space-y-6">
              <Section title="Informacje o wyprawie">
                <div className="space-y-4">
                  <DetailRow
                    label="Termin"
                    value={formatTripDateRange(trip.startsAt, trip.endsAt)}
                  />
                  <DetailRow label="Typ" value={getTripTypeLabel(trip.tripType)} />
                  <DetailRow label="Status" value={getStatusLabel(trip.status)} />
                  <DetailRow
                    label="Planowana liczba osób"
                    value={String(trip.peopleCount)}
                  />
                  <DetailRow
                    label="Zaakceptowani"
                    value={String(acceptedMembers.length + 1)}
                  />
                  <DetailRow
                    label="Oczekujące zaproszenia"
                    value={String(pendingMembers.length)}
                  />
                </div>
              </Section>

              <Section title="Łowisko">
                {trip.lake ? (
                  <div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-bold text-slate-950">
                        {trip.lake.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {trip.lake.street}, {trip.lake.postalCode}{" "}
                        {trip.lake.city}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        woj. {trip.lake.voivodeship}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          ★ {Number(trip.lake.rating).toFixed(1)}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          {trip.lake.fish}
                        </span>
                      </div>

                      {trip.lake.gearRequirements.length > 0 && (
                        <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">Wymagania łowiska</p>
                          <p className="mt-1 text-xs leading-5 text-amber-900">
                            {trip.lake.gearRequirements.length} {trip.lake.gearRequirements.length === 1 ? "wymaganie zostanie" : "wymagania zostaną"} uwzględnione w rekomendowanej checkliście Rybio.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grid gap-3">
                      <Link
                        href={`/lowiska/${trip.lake.slug}`}
                        className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-700"
                      >
                        Zobacz łowisko
                      </Link>
                      <a
                        href={getNavigationUrl(trip.lake.lat, trip.lake.lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Prowadź w Google Maps
                      </a>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="Brak łowiska"
                    description="Do tej wyprawy nie przypisano łowiska."
                  />
                )}
              </Section>

              <Section title="Połowy">
                <div className="grid grid-cols-2 gap-3">
                  <MiniMetric label="Liczba" value={String(trip.catches.length)} />
                  <MiniMetric
                    label="Łączna waga"
                    value={totalWeight > 0 ? `${totalWeight.toFixed(2)} kg` : "Brak"}
                  />
                </div>
                {biggestCatch?.weight && (
                  <div className="mt-4 rounded-2xl bg-amber-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">
                      Największa ryba
                    </p>
                    <p className="mt-2 font-bold text-slate-950">
                      {biggestCatch.fishName} — {biggestCatch.weight.toFixed(2)} kg
                    </p>
                  </div>
                )}
              </Section>
            </aside>
          </div>
        )}

        {activeTab === "checklista" && (
          <Section
            title="Checklista wyprawy"
            action={
              <TripActionPopup
                tripId={trip.id}
                action="checklist"
                canEdit={canEdit}
                icon={<CheckListIcon className="h-4 w-4 shrink-0" />}
                label={trip.checklist ? "Edytuj checklistę" : "Utwórz checklistę"}
                tripStartsAt={trip.startsAt}
                tripEndsAt={trip.endsAt}
                tripType={trip.tripType}
                lakeGearRequirements={trip.lake?.gearRequirements.map((item) => item.text) ?? []}
              />
            }
          >
            {trip.checklist ? (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard label="Postęp" value={`${checklistProgress}%`} />
                  <StatCard
                    label="Spakowane"
                    value={`${packedItemsCount}/${checklistItems.length}`}
                  />
                  <StatCard
                    label="Ważne"
                    value={`${packedImportantItems}/${importantItems.length}`}
                  />
                </div>

                <div className="mt-6">
                  <ProgressBar value={checklistProgress} />
                </div>

                {checklistGroups.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    {checklistGroups.map((group) => (
                    <details
                      key={group.category}
                      open={group.unpackedCount > 0}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-slate-50 px-4 py-3 [&::-webkit-details-marker]:hidden">
                        <div>
                          <p className="font-bold text-slate-900">{getChecklistCategoryLabel(group.category)}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {group.packedCount}/{group.items.length} spakowane
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                          {group.unpackedCount > 0 ? `${group.unpackedCount} do spakowania` : "Gotowe"}
                        </span>
                      </summary>

                      <div className="grid gap-3 p-3 lg:grid-cols-2">
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${
                              item.isPacked
                                ? "border-emerald-100 bg-emerald-50"
                                : item.isImportant
                                  ? "border-amber-100 bg-amber-50"
                                  : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className={`break-words font-bold ${item.isPacked ? "text-emerald-700 line-through" : "text-slate-800"}`}>
                                  {item.name}
                                </p>
                                {item.isImportant && (
                                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Ważne</span>
                                )}
                                {item.source === "template" && (
                                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Podpowiedź Rybio</span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-slate-500">Ilość: {item.quantity} {item.unit || ""}</p>
                              {item.note && <p className="mt-2 text-xs leading-5 text-slate-500">{item.note}</p>}
                            </div>
                            <TripChecklistPackedToggle
                              tripId={trip.id}
                              itemId={item.id}
                              isPacked={item.isPacked}
                              canEdit={canEdit}
                            />
                          </div>
                        ))}
                      </div>
                    </details>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Checklista jest pusta"
                    description="Dodaj rekomendowany szablon albo własne elementy przez przycisk Edytuj checklistę."
                  />
                )}

              </>
            ) : (
              <div>
                <EmptyState
                  title="Brak checklisty"
                  description="Ta wyprawa nie ma jeszcze przypisanej checklisty."
                />

              </div>
            )}
          </Section>
        )}

        {activeTab === "sprzet" && (
          <Section
            title="Sprzęt na wyprawę"
            action={
              <div className="flex flex-wrap gap-2">
                <TripActionPopup
                  tripId={trip.id}
                  action="gear"
                  canEdit={canEdit}
                  icon={<PencilIcon className="h-4 w-4 shrink-0" />}
                  label="Edytuj sprzęt"
                />
                <Link
                  href="/ekwipunek"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                >
                  <HookIcon className="h-4 w-4 shrink-0" />
                  <span>Mój ekwipunek</span>
                </Link>
              </div>
            }
          >
            <div className="max-w-xl">
              <ProgressHeader value={gearProgress} label="Wymagany sprzęt spakowany" />
              <ProgressBar value={gearProgress} />
            </div>

            {trip.gearItems.length > 0 ? (
              <div className="mt-6 grid gap-3 lg:grid-cols-2">
                {trip.gearItems.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 ${
                      item.isPacked
                        ? "border-emerald-100 bg-emerald-50"
                        : item.isRequired
                          ? "border-amber-100 bg-amber-50"
                          : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          {item.isRequired && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                              Wymagany
                            </span>
                          )}
                          {item.isPacked && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                              Spakowany
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 break-words font-bold text-slate-950">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.category} • {item.quantity} {item.unit || "szt."}
                        </p>
                        {item.gear && (
                          <p className="mt-2 text-xs font-semibold text-blue-700">
                            Z ekwipunku: {item.gear.brand || ""}{" "}
                            {item.gear.model || item.gear.name}
                          </p>
                        )}
                        {item.note && (
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {item.note}
                          </p>
                        )}
                      </div>
                      <TripGearPackedToggle
                        tripId={trip.id}
                        itemId={item.id}
                        isPacked={item.isPacked}
                        canEdit={canEdit}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Brak przypisanego sprzętu"
                description="Sprzęt dodany do tej wyprawy pojawi się tutaj."
              />
            )}

          </Section>
        )}

        {activeTab === "notatki" && (
          <Section
            title="Notatki"
            action={
              <TripActionPopup
                tripId={trip.id}
                action="note"
                canEdit={canEdit}
              />
            }
          >
            {trip.notes.length > 0 ? (
              <div className="space-y-6">
                {pinnedNotes.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">📌 Przypięte</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {pinnedNotes.map((note) => (
                        <article key={note.id} className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-700">Przypięta</span>
                              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">{getNoteTypeLabel(note.type)}</span>
                            </div>
                            {(isOwner || note.authorUserId === user.id) && (
                              <TripNoteActions tripId={trip.id} note={note} />
                            )}
                          </div>
                          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{note.content}</p>
                          <p className="mt-4 border-t border-blue-100 pt-3 text-xs font-bold text-slate-500">
                            {note.authorName || "Użytkownik"} • {formatDateTime(note.createdAt)}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {regularNotes.length > 0 && (
                  <div>
                    {pinnedNotes.length > 0 && (
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Pozostałe</p>
                    )}
                    <div className="grid gap-4 md:grid-cols-2">
                      {regularNotes.map((note) => (
                        <article key={note.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">{getNoteTypeLabel(note.type)}</span>
                            {(isOwner || note.authorUserId === user.id) && (
                              <TripNoteActions tripId={trip.id} note={note} />
                            )}
                          </div>
                          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{note.content}</p>
                          <p className="mt-4 border-t border-slate-200/70 pt-3 text-xs font-bold text-slate-500">
                            {note.authorName || "Użytkownik"} • {formatDateTime(note.createdAt)}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="Brak notatek"
                description="Wspólne notatki uczestników pojawią się tutaj."
              />
            )}

            {canEdit && (
              <p className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                Masz uprawnienia do dodawania i edycji notatek tej wyprawy.
              </p>
            )}
          </Section>
        )}

        {activeTab === "koszty" && (
          <Section
            title="Budżet i koszty"
            action={
              <TripActionPopup
                tripId={trip.id}
                action="cost"
                canEdit={canEdit}
                participants={registeredParticipants}
              />
            }
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">Łącznie</p>
                <p className="mt-1 text-2xl font-extrabold text-blue-950">
                  {formatMoney(totalCosts)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Zarejestrowani uczestnicy</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">{registeredParticipants.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Równy udział na osobę</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">{formatMoney(costSettlement.sharePerPerson)}</p>
              </div>
            </div>

            {trip.costs.length > 0 ? (
              <>
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                  {trip.costs.map((cost) => (
                    <div
                      key={cost.id}
                      className="grid gap-3 border-b border-slate-100 p-4 last:border-none sm:grid-cols-[1fr_auto]"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900">{cost.label}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {getCostCategoryLabel(cost.category)} • zapłacił(a): {cost.paidByName || "Użytkownik"}
                        </p>
                        {cost.note && <p className="mt-2 text-xs leading-5 text-slate-500">{cost.note}</p>}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <p className="text-lg font-bold text-slate-950">{formatMoney(cost.amount, cost.currency)}</p>
                        {(isOwner || cost.paidByUserId === user.id) && (
                          <TripDeleteButton
                            tripId={trip.id}
                            resource="costs"
                            entityId={cost.id}
                            confirmText={`Czy na pewno chcesz usunąć koszt „${cost.label}”?`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="font-bold text-slate-950">Kto ile zapłacił</h3>
                    <div className="mt-4 space-y-3">
                      {costSettlement.balances.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white p-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800">{participant.name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">Zapłacono: {formatMoney(participant.paid)}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                            participant.balance > 0.009
                              ? "bg-emerald-100 text-emerald-700"
                              : participant.balance < -0.009
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                          }`}>
                            {participant.balance > 0.009
                              ? `+${formatMoney(participant.balance)}`
                              : participant.balance < -0.009
                                ? `-${formatMoney(Math.abs(participant.balance))}`
                                : "Rozliczone"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                    <h3 className="font-bold text-blue-950">Proponowane rozliczenie</h3>
                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      Liczymy równy udział wyłącznie między zarejestrowanymi uczestnikami wyprawy.
                    </p>
                    {costSettlement.transfers.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {costSettlement.transfers.map((transfer, index) => (
                          <div key={`${transfer.from}-${transfer.to}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
                            <p className="min-w-0 text-sm font-bold text-slate-700">
                              <span className="font-bold text-slate-950">{transfer.from}</span> → {transfer.to}
                            </p>
                            <span className="shrink-0 font-bold text-blue-700">{formatMoney(transfer.amount)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-emerald-700">
                        Wszyscy są rozliczeni.
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="Brak kosztów"
                  description="Dodaj pierwszy wydatek, a Rybio automatycznie policzy udział na osobę i rozliczenie między uczestnikami."
                />
              </div>
            )}
          </Section>
        )}

        {activeTab === "zdjecia" && (
          <Section
            title="Zdjęcia z wyprawy"
            action={
              <TripActionPopup
                tripId={trip.id}
                action="media"
                canEdit={canEdit}
              />
            }
          >
            {trip.media.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {trip.media.map((media) => (
                  <article
                    key={media.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
                  >
                    <img
                      src={media.url}
                      alt={media.caption || "Zdjęcie z wyprawy"}
                      className="h-52 w-full object-cover"
                    />
                    <div className="p-4">
                      {media.caption && (
                        <p className="break-words text-sm font-bold text-slate-800">
                          {media.caption}
                        </p>
                      )}
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <p className="text-xs text-slate-400">
                          {media.userName || "Użytkownik"} • {formatDateTime(media.createdAt)}
                        </p>

                        {(isOwner || media.userId === user.id) && (
                          <TripDeleteButton
                            tripId={trip.id}
                            resource="media"
                            entityId={media.id}
                            confirmText="Czy na pewno chcesz usunąć to zdjęcie z wyprawy?"
                          />
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Galeria jest pusta"
                description="Zdjęcia dodane przez uczestników wyprawy pojawią się tutaj."
              />
            )}
          </Section>
        )}

        {activeTab === "polowy" && (
          <Section
            title="Połowy z wyprawy"
            action={
              <TripActionPopup
                tripId={trip.id}
                action="catch"
                canEdit={canEdit}
                
              />
            }
          >

            {trip.catches.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {trip.catches.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50"
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={`Połów: ${item.fishName}`}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {getMethodLabel(item.method)}
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-slate-950">
                        {item.fishName}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {item.userName || "Użytkownik"} • {formatDateTime(item.caughtAt)}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <MiniMetric
                          label="Waga"
                          value={item.weight !== null ? `${item.weight.toFixed(2)} kg` : "Brak"}
                        />
                        <MiniMetric
                          label="Długość"
                          value={item.length !== null ? `${item.length.toFixed(0)} cm` : "Brak"}
                        />
                      </div>
                      {item.bait && (
                        <p className="mt-4 text-sm text-slate-600">
                          <span className="font-semibold">Przynęta:</span> {item.bait}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Brak połowów"
                description="Dodaj złowione ryby i przypisz je do tej wyprawy."
              />
            )}
          </Section>
        )}

        {activeTab === "uczestnicy" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <main className="space-y-6">
              <Section title="Uczestnicy wyprawy">
                <div className="mb-5 flex items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm">👑</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-950">{ownerName}{isOwner ? " — Ty" : ""}</p>
                    <p className="mt-1 text-xs font-bold text-blue-700">Właściciel • pełne uprawnienia</p>
                  </div>
                </div>

                <TripMembersManager
                  tripId={trip.id}
                  isOwner={isOwner}
                  members={trip.members.map((member) => ({
                    id: member.id,
                    userId: member.userId,
                    userName: member.userName,
                    userEmail: isOwner ? member.userEmail : null,
                    role: member.role,
                    status: member.status,
                  }))}
                />

                {trip.members.length === 0 && !isOwner && (
                  <EmptyState
                    title="Brak dodatkowych uczestników"
                    description="Na razie tylko Ty i właściciel macie dostęp do tej wyprawy."
                  />
                )}
              </Section>
            </main>

            <aside className="space-y-6">
              <Section title="Twoje uprawnienia">
                <div className="space-y-3">
                  <PermissionRow label="Edytowanie wyprawy" enabled={canEdit} />
                  <PermissionRow label="Zarządzanie uczestnikami" enabled={isOwner} />
                  <PermissionRow label="Usunięcie wyprawy" enabled={isOwner} />
                </div>
              </Section>

              <Section title="Role">
                <div className="space-y-3 text-sm leading-6 text-slate-600">
                  <p><span className="font-semibold text-slate-900">Edytor:</span> może pracować na checkliście, sprzęcie, notatkach, kosztach, zdjęciach i połowach.</p>
                  <p><span className="font-semibold text-slate-900">Tylko podgląd:</span> widzi dane wyprawy, ale nie może ich zmieniać.</p>
                </div>
              </Section>
            </aside>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ActivityPagination({
  tripId,
  page,
  totalPages,
}: {
  tripId: string;
  page: number;
  totalPages: number;
}) {
  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-bold text-slate-500">
        Strona {page} z {totalPages} • maks. {ACTIVITY_PAGE_SIZE} zmian na stronę
      </p>

      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={`/wyprawy/${tripId}?tab=podsumowanie&activityPage=${page - 1}`}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Poprzednia
          </Link>
        ) : (
          <span className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-300">
            ← Poprzednia
          </span>
        )}

        {page < totalPages ? (
          <Link
            href={`/wyprawy/${tripId}?tab=podsumowanie&activityPage=${page + 1}`}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            Następna →
          </Link>
        ) : (
          <span className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-300">
            Następna →
          </span>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-extrabold text-slate-950">{title}</h2>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[180px] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:min-w-0 md:p-5">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-3 break-words text-2xl font-extrabold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function ProgressHeader({ value, label = "Ogólne przygotowanie" }: { value: number; label?: string }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <span className="text-sm font-bold text-blue-700">{value}%</span>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.min(Math.max(value, 0), 100);
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-blue-600 transition-all"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function ProgressItem({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-800">{label}</p>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
        <span className="shrink-0 text-sm font-bold text-blue-700">
          {value}%
        </span>
      </div>
      <ProgressBar value={value} />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-none last:pb-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="max-w-[60%] break-words text-right text-sm font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function AccessBadge({ isOwner, role }: { isOwner: boolean; role: string }) {
  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
        isOwner
          ? "bg-blue-50 text-blue-700"
          : "bg-violet-50 text-violet-700"
      }`}
    >
      {isOwner
        ? "Właściciel wyprawy"
        : role === "editor" || role === "co_owner"
          ? "Współdzielona • edycja"
          : "Współdzielona • podgląd"}
    </span>
  );
}

function PhaseBadge({ phase }: { phase: "upcoming" | "active" | "finished" | "cancelled" }) {
  const styles = {
    upcoming: "bg-blue-50 text-blue-700",
    active: "bg-amber-50 text-amber-700",
    finished: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-600",
  };
  const labels = {
    upcoming: "Nadchodząca",
    active: "W trakcie",
    finished: "Zakończona",
    cancelled: "Anulowana",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[phase]}`}>
      {labels[phase]}
    </span>
  );
}

function PermissionRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
        {enabled ? "Tak" : "Nie"}
      </span>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 text-center">
      <p className="font-bold text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function getTripPhase(status: string, startsAt: Date, endsAt: Date | null): "upcoming" | "active" | "finished" | "cancelled" {
  if (status === "cancelled") return "cancelled";
  if (status === "finished") return "finished";
  const now = new Date();
  if (startsAt > now) return "upcoming";
  if (!endsAt || endsAt >= now) return "active";
  return "finished";
}

function getTripTypeLabel(value: string) {
  const labels: Record<string, string> = {
    custom: "Własna",
    spinning: "Spinning",
    feeder: "Feeder",
    method_feeder: "Method feeder",
    carp: "Karpiówka",
    float: "Spławik",
    night: "Nocka",
    competition: "Zawody",
  };
  return labels[value] || value;
}

function getStatusLabel(value: string) {
  const labels: Record<string, string> = {
    planned: "Planowana",
    finished: "Zakończona",
    cancelled: "Anulowana",
  };
  return labels[value] || value;
}

function getMethodLabel(value: string) {
  const labels: Record<string, string> = {
    spinning: "Spinning",
    feeder: "Feeder",
    method_feeder: "Method feeder",
    carp: "Karpiówka",
    float: "Spławik",
    fly: "Muchówka",
    other: "Inna metoda",
  };
  return labels[value] || value;
}

function getNoteTypeLabel(value: string) {
  const labels: Record<string, string> = {
    general: "Ogólna",
    plan: "Plan",
    water: "Woda",
    bait: "Przynęty",
    result: "Wyniki",
  };
  return labels[value] || value;
}

function getCostCategoryLabel(value: string) {
  const labels: Record<string, string> = {
    fuel: "Paliwo",
    fishing: "Wędkowanie",
    food: "Jedzenie",
    accommodation: "Nocleg",
    bait: "Przynęty i zanęty",
    equipment: "Sprzęt",
    other: "Pozostałe",
  };
  return labels[value] || value;
}

function getLocalUserDisplayName(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const metadata = user.user_metadata ?? {};
  const values = [
    metadata.display_name,
    metadata.full_name,
    metadata.name,
    metadata.username,
    metadata.user_name,
  ];
  const name = values.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  );
  return name?.trim() || user.email?.split("@")[0] || "Użytkownik Rybio";
}

function groupActivities<T extends {
  id: string;
  actorUserId: string;
  actorName: string | null;
  action: string;
  createdAt: Date;
}>(activities: T[]) {
  const groups: Array<{
    key: string;
    actorUserId: string;
    actorName: string | null;
    action: string;
    createdAt: Date;
    count: number;
  }> = [];

  const WINDOW_MS = 5 * 60 * 1000;

  for (const activity of activities) {
    const previous = groups[groups.length - 1];
    const canMerge =
      previous &&
      previous.actorUserId === activity.actorUserId &&
      previous.action === activity.action &&
      Math.abs(previous.createdAt.getTime() - activity.createdAt.getTime()) <= WINDOW_MS;

    if (canMerge) {
      previous.count += 1;
      continue;
    }

    groups.push({
      key: activity.id,
      actorUserId: activity.actorUserId,
      actorName: activity.actorName,
      action: activity.action,
      createdAt: activity.createdAt,
      count: 1,
    });
  }

  return groups;
}

function groupChecklistItems<T extends {
  id: string;
  category: string;
  isPacked: boolean;
}>(items: T[]) {
  const map = new Map<string, T[]>();

  for (const item of items) {
    const category = item.category?.trim() || "Inne";
    const current = map.get(category) ?? [];
    current.push(item);
    map.set(category, current);
  }

  const priority = [
    "Wymagania łowiska",
    "Dokumenty",
    "Bezpieczeństwo",
    "Sprzęt",
    "Przynęty",
    "Jedzenie",
    "Odzież",
    "Inne",
  ];

  return Array.from(map.entries())
    .map(([category, categoryItems]) => ({
      category,
      items: categoryItems,
      packedCount: categoryItems.filter((item) => item.isPacked).length,
      unpackedCount: categoryItems.filter((item) => !item.isPacked).length,
    }))
    .sort((first, second) => {
      const firstIndex = priority.indexOf(first.category);
      const secondIndex = priority.indexOf(second.category);
      const normalizedFirst = firstIndex === -1 ? 999 : firstIndex;
      const normalizedSecond = secondIndex === -1 ? 999 : secondIndex;
      return normalizedFirst - normalizedSecond || first.category.localeCompare(second.category, "pl");
    });
}

function getChecklistCategoryLabel(value: string) {
  const labels: Record<string, string> = {
    "Wymagania łowiska": "Wymagania łowiska",
    Dokumenty: "Dokumenty",
    Bezpieczeństwo: "Bezpieczeństwo",
    Sprzęt: "Sprzęt wędkarski",
    Przynęty: "Przynęty i zanęty",
    Jedzenie: "Jedzenie i picie",
    Odzież: "Odzież i nocleg",
    Inne: "Pozostałe",
  };
  return labels[value] || value;
}

function calculateCostSettlement(
  costs: Array<{ paidByUserId: string; amount: number }>,
  participants: Array<{ id: string; name: string }>
) {
  if (participants.length === 0) {
    return { sharePerPerson: 0, balances: [], transfers: [] };
  }

  const total = costs.reduce((sum, cost) => sum + cost.amount, 0);
  const sharePerPerson = total / participants.length;
  const paid = new Map<string, number>();

  costs.forEach((cost) => {
    paid.set(cost.paidByUserId, (paid.get(cost.paidByUserId) ?? 0) + cost.amount);
  });

  const balances = participants.map((participant) => ({
    ...participant,
    paid: paid.get(participant.id) ?? 0,
    balance: (paid.get(participant.id) ?? 0) - sharePerPerson,
  }));

  const creditors = balances
    .filter((item) => item.balance > 0.009)
    .map((item) => ({ ...item, remaining: item.balance }));
  const debtors = balances
    .filter((item) => item.balance < -0.009)
    .map((item) => ({ ...item, remaining: Math.abs(item.balance) }));

  const transfers: Array<{ from: string; to: string; amount: number }> = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amount = Math.min(creditor.remaining, debtor.remaining);

    if (amount > 0.009) {
      transfers.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(amount * 100) / 100,
      });
    }

    creditor.remaining -= amount;
    debtor.remaining -= amount;

    if (creditor.remaining <= 0.009) creditorIndex += 1;
    if (debtor.remaining <= 0.009) debtorIndex += 1;
  }

  return { sharePerPerson, balances, transfers };
}

function formatMoney(value: number, currency = "PLN") {
  return `${value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function getActivityLabel(value: string) {
  const labels: Record<string, string> = {
    trip_created: "utworzył(a) wyprawę",
    trip_updated: "zaktualizował(a) wyprawę",
    trip_finished: "zakończył(a) wyprawę",
    trip_cancelled: "anulował(a) wyprawę",
    trip_restored: "przywrócił(a) wyprawę",
    member_invited: "zaprosił(a) uczestnika",
    member_joined: "dołączył(a) do wyprawy",
    member_declined: "odrzucił(a) zaproszenie",
    member_removed: "usunął/usunęła uczestnika",
    member_role_changed: "zmienił(a) rolę uczestnika",
    checklist_updated: "zaktualizował(a) checklistę",
    gear_updated: "zaktualizował(a) sprzęt",
    note_added: "dodał(a) notatkę",
    note_updated: "zaktualizował(a) notatkę",
    note_deleted: "usunął/usunęła notatkę",
    cost_added: "dodał(a) koszt",
    cost_deleted: "usunął/usunęła koszt",
    media_added: "dodał(a) zdjęcie",
    media_added_bulk: "dodał(a) zdjęcia",
    media_deleted: "usunął/usunęła zdjęcie",
    catch_added: "dodał(a) połów",
  };
  return labels[value] || "wykonał(a) zmianę";
}

function getActivityIcon(value: string) {
  if (value.includes("member")) return "👥";
  if (value.includes("checklist")) return "✅";
  if (value.includes("gear")) return "🎒";
  if (value.includes("note")) return "📝";
  if (value.includes("cost")) return "💰";
  if (value.includes("media")) return "📷";
  if (value.includes("catch")) return "🐟";
  return "🎣";
}

function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatTripDateRange(startsAt: Date | string, endsAt: Date | string | null) {
  const startText = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startsAt));

  if (!endsAt) return startText;

  const endText = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(endsAt));

  return `${startText} – ${endText}`;
}

function getNavigationUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}