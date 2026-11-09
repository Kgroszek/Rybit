import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AdminActivityItem,
  AdminOverviewMetric,
  AdminOverviewQueue,
} from "@/lib/admin/admin-types";

async function getRegisteredUsersCount() {
  const supabaseAdmin =
    createAdminClient();

  const perPage = 1000;
  let page = 1;
  let total = 0;

  while (true) {
    const { data, error } =
      await supabaseAdmin.auth.admin.listUsers(
        {
          page,
          perPage,
        }
      );

    if (error) {
      console.error(
        "Nie udało się pobrać liczby użytkowników:",
        error.message
      );

      return total;
    }

    const users =
      data.users ?? [];

    total += users.length;

    if (
      users.length <
      perPage
    ) {
      break;
    }

    page += 1;
  }

  return total;
}

export async function getAdminOverviewData() {
  const [
    registeredUsersCount,
    lakesCount,
    catchesCount,
    publicCatchesCount,
    tripsCount,
    gearCount,
    ratingsCount,
    favouritesCount,

    pendingLakeSubmissionsCount,
    pendingOwnerClaimsCount,
    pendingCorrectionsCount,
    pendingCatchReportsCount,
    pendingRankingCatchesCount,

    latestLakes,
    latestLakeSubmissions,
    latestCorrections,
    latestCatchReports,
    latestOwnerClaims,
  ] = await Promise.all([
    getRegisteredUsersCount(),
    prisma.lake.count(),
    prisma.fishingCatch.count(),
    prisma.fishingCatch.count({
      where: {
        isPublic: true,
      },
    }),
    prisma.fishingTrip.count(),
    prisma.fishingGear.count(),
    prisma.rating.count(),
    prisma.favourite.count(),

    prisma.lakeSubmission.count({
      where: {
        status: "pending",
      },
    }),
    prisma.lakeOwnerClaim.count({
      where: {
        status: "pending",
      },
    }),
    prisma.lakeCorrectionReport.count({
      where: {
        status: "pending",
      },
    }),
    prisma.fishingCatchReport.count({
      where: {
        status: "pending",
      },
    }),
    prisma.fishingCatch.count({
      where: {
        isPublic: true,
        rankingStatus:
          "pending",
      },
    }),

    prisma.lake.findMany({
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        voivodeship: true,
        createdAt: true,
      },
    }),

    prisma.lakeSubmission.findMany({
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        city: true,
        status: true,
        createdAt: true,
      },
    }),

    prisma.lakeCorrectionReport.findMany({
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        category: true,
        status: true,
        createdAt: true,
        lake: {
          select: {
            name: true,
          },
        },
      },
    }),

    prisma.fishingCatchReport.findMany({
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
        fishingCatch: {
          select: {
            fishName: true,
          },
        },
      },
    }),

    prisma.lakeOwnerClaim.findMany({
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        claimantName: true,
        status: true,
        createdAt: true,
        lake: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const moderationPendingCount =
    pendingCatchReportsCount +
    pendingRankingCatchesCount;

  const queues: AdminOverviewQueue[] =
    [
      {
        key:
          "lake-submissions",
        title:
          "Zgłoszenia łowisk",
        description:
          "Nowe łowiska oczekujące na decyzję.",
        href:
          "/admin/zgloszenia-lowisk",
        count:
          pendingLakeSubmissionsCount,
      },
      {
        key:
          "owner-claims",
        title:
          "Zgłoszenia właścicieli",
        description:
          "Prośby o przejęcie profilu łowiska.",
        href:
          "/admin/zgloszenia-wlascicieli",
        count:
          pendingOwnerClaimsCount,
      },
      {
        key: "corrections",
        title:
          "Poprawki łowisk",
        description:
          "Błędy i aktualizacje zgłoszone przez użytkowników.",
        href:
          "/admin/poprawki-lowisk",
        count:
          pendingCorrectionsCount,
      },
      {
        key:
          "catch-moderation",
        title:
          "Moderacja połowów",
        description:
          "Nowe połowy i zgłoszenia dotyczące rankingów.",
        href:
          "/admin/zgloszenia-polowow",
        count:
          moderationPendingCount,
      },
    ];

  const metrics: AdminOverviewMetric[] =
    [
      {
        label: "Użytkownicy",
        value:
          registeredUsersCount,
        description:
          "Zarejestrowane konta",
      },
      {
        label: "Łowiska",
        value: lakesCount,
        description:
          "Publiczna baza łowisk",
      },
      {
        label: "Połowy",
        value: catchesCount,
        description: `${publicCatchesCount} publicznych`,
      },
      {
        label: "Wyprawy",
        value: tripsCount,
        description:
          "Utworzone wyprawy",
      },
    ];

  const secondaryMetrics =
    [
      {
        label:
          "Elementy ekwipunku",
        value: gearCount,
      },
      {
        label:
          "Oceny łowisk",
        value: ratingsCount,
      },
      {
        label:
          "Ulubione łowiska",
        value: favouritesCount,
      },
    ];

  const activity: AdminActivityItem[] =
    [
      ...latestLakes.map(
        (lake) => ({
          id: `lake-${lake.id}`,
          kind:
            "lake" as const,
          title: lake.name,
          description: `${lake.city}, woj. ${lake.voivodeship}`,
          href: `/admin/lowiska/${lake.slug}/edytuj`,
          createdAt:
            lake.createdAt,
          status:
            "published",
        })
      ),
      ...latestLakeSubmissions.map(
        (submission) => ({
          id: `submission-${submission.id}`,
          kind:
            "lake-submission" as const,
          title:
            submission.name,
          description:
            submission.city,
          href:
            "/admin/zgloszenia-lowisk",
          createdAt:
            submission.createdAt,
          status:
            submission.status,
        })
      ),
      ...latestCorrections.map(
        (report) => ({
          id: `correction-${report.id}`,
          kind:
            "correction" as const,
          title:
            report.lake.name,
          description:
            `Poprawka: ${report.category}`,
          href:
            "/admin/poprawki-lowisk",
          createdAt:
            report.createdAt,
          status:
            report.status,
        })
      ),
      ...latestCatchReports.map(
        (report) => ({
          id: `catch-report-${report.id}`,
          kind:
            "catch-report" as const,
          title:
            report.fishingCatch
              .fishName,
          description:
            report.reason,
          href:
            "/admin/zgloszenia-polowow?widok=zgloszenia",
          createdAt:
            report.createdAt,
          status:
            report.status,
        })
      ),
      ...latestOwnerClaims.map(
        (claim) => ({
          id: `owner-claim-${claim.id}`,
          kind:
            "owner-claim" as const,
          title:
            claim.lake.name,
          description:
            claim.claimantName ||
            "Zgłoszenie właściciela",
          href:
            "/admin/zgloszenia-wlascicieli",
          createdAt:
            claim.createdAt,
          status:
            claim.status,
        })
      ),
    ]
      .sort(
        (a, b) =>
          b.createdAt.getTime() -
          a.createdAt.getTime()
      )
      .slice(0, 10);

  return {
    queues,
    metrics,
    secondaryMetrics,
    activity,
    pendingTotal:
      pendingLakeSubmissionsCount +
      pendingOwnerClaimsCount +
      pendingCorrectionsCount +
      moderationPendingCount,
  };
}
