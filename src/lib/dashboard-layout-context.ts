import type { User } from "@supabase/supabase-js";

import type { DashboardLayoutContext } from "@/components/dashboard/dashboard-layout-types";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AdminNotificationCounts = Pick<
  DashboardLayoutContext,
  | "pendingSubmissionsCount"
  | "pendingCorrectionsCount"
  | "pendingCatchReportsCount"
  | "pendingOwnerClaimsCount"
>;

const emptyAdminNotificationCounts: AdminNotificationCounts = {
  pendingSubmissionsCount: 0,
  pendingCorrectionsCount: 0,
  pendingCatchReportsCount: 0,
  pendingOwnerClaimsCount: 0,
};

async function getAdminNotificationCounts(): Promise<AdminNotificationCounts> {
  const [
    pendingSubmissionsCount,
    pendingCorrectionsCount,
    pendingCatchReportsCount,
    pendingRankingCatchesCount,
    pendingOwnerClaimsCount,
  ] = await Promise.all([
    prisma.lakeSubmission.count({
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
        rankingStatus: "pending",
      },
    }),
    prisma.lakeOwnerClaim.count({
      where: {
        status: "pending",
      },
    }),
  ]);

  return {
    pendingSubmissionsCount,
    pendingCorrectionsCount,
    pendingCatchReportsCount:
      pendingCatchReportsCount + pendingRankingCatchesCount,
    pendingOwnerClaimsCount,
  };
}

function getUserDisplayName(user: User) {
  const metadata = user.user_metadata;

  if (typeof metadata?.name === "string" && metadata.name.trim()) {
    return metadata.name.trim();
  }

  if (
    typeof metadata?.full_name === "string" &&
    metadata.full_name.trim()
  ) {
    return metadata.full_name.trim();
  }

  if (
    typeof metadata?.display_name === "string" &&
    metadata.display_name.trim()
  ) {
    return metadata.display_name.trim();
  }

  return null;
}

export async function getDashboardLayoutContext(
  user: User
): Promise<DashboardLayoutContext> {
  const isAdmin = isAdminUser(user);

  const [adminNotificationCounts, ownedLakesCount] = await Promise.all([
    isAdmin
      ? getAdminNotificationCounts()
      : Promise.resolve(emptyAdminNotificationCounts),

    prisma.lakeOwner.count({
      where: {
        userId: user.id,
        isActive: true,
      },
    }),
  ]);

  return {
    userName: getUserDisplayName(user),
    userEmail: user.email ?? null,
    isAdmin,
    isOwner: ownedLakesCount > 0,
    ...adminNotificationCounts,
  };
}
