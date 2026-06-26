import Link from "next/link";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardTopbar } from "./DashboardTopbar";
import { MobileBottomNav } from "./MobileBottomNav";
import { Sidebar } from "./Sidebar";

import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type DashboardLayoutProps = {
  children: ReactNode;
};

type AdminNotificationCounts = {
  pendingSubmissionsCount: number;
  pendingCorrectionsCount: number;
  pendingCatchReportsCount: number;
  pendingOwnerClaimsCount: number;
};

const emptyAdminNotificationCounts: AdminNotificationCounts = {
  pendingSubmissionsCount: 0,
  pendingCorrectionsCount: 0,
  pendingCatchReportsCount: 0,
  pendingOwnerClaimsCount: 0,
};

const getAdminNotificationCounts = unstable_cache(
  async (): Promise<AdminNotificationCounts> => {
    const [
      pendingSubmissionsCount,
      pendingCorrectionsCount,
      pendingCatchReportsCount,
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

      prisma.lakeOwnerClaim.count({
        where: {
          status: "pending",
        },
      }),
    ]);

    return {
      pendingSubmissionsCount,
      pendingCorrectionsCount,
      pendingCatchReportsCount,
      pendingOwnerClaimsCount,
    };
  },
  ["dashboard-admin-notification-counts"],
  {
    revalidate: 30,
  }
);

function getUserDisplayName(user: {
  email?: string | null;
  user_metadata?: {
    name?: unknown;
    full_name?: unknown;
    display_name?: unknown;
  };
}) {
  if (typeof user.user_metadata?.name === "string") {
    return user.user_metadata.name;
  }

  if (typeof user.user_metadata?.full_name === "string") {
    return user.user_metadata.full_name;
  }

  if (typeof user.user_metadata?.display_name === "string") {
    return user.user_metadata.display_name;
  }

  return null;
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = isAdminUser(user);

  const [adminNotificationCounts, ownedLakesCount] = await Promise.all([
    isAdmin ? getAdminNotificationCounts() : emptyAdminNotificationCounts,

    prisma.lakeOwner.count({
      where: {
        userId: user.id,
        isActive: true,
      },
    }),
  ]);

  const isOwner = ownedLakesCount > 0;

  const {
    pendingSubmissionsCount,
    pendingCorrectionsCount,
    pendingCatchReportsCount,
    pendingOwnerClaimsCount,
  } = adminNotificationCounts;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar
          isAdmin={isAdmin}
          isOwner={isOwner}
          pendingSubmissionsCount={pendingSubmissionsCount}
          pendingCorrectionsCount={pendingCorrectionsCount}
          pendingCatchReportsCount={pendingCatchReportsCount}
          pendingOwnerClaimsCount={pendingOwnerClaimsCount}
        />

        <section className="min-w-0 flex-1 px-4 pb-32 pt-4 sm:px-5 lg:p-8">
          <DashboardTopbar
            userName={getUserDisplayName(user)}
            userEmail={user.email}
          />

          {children}

          <footer className="mt-12 border-t border-slate-200 pt-6">
            <div className="flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <p>
                © {new Date().getFullYear()} Rybio. Wszystkie prawa
                zastrzeżone.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/regulamin"
                  className="font-semibold transition hover:text-blue-600"
                >
                  Regulamin
                </Link>

                <Link
                  href="/polityka-prywatnosci"
                  className="font-semibold transition hover:text-blue-600"
                >
                  Polityka prywatności
                </Link>

                <a
                  href="mailto:kontakt@rybio.pl"
                  className="font-semibold transition hover:text-blue-600"
                >
                  Kontakt
                </a>
              </div>
            </div>
          </footer>
        </section>
      </div>

      <MobileBottomNav
        isAdmin={isAdmin}
        isOwner={isOwner}
        pendingSubmissionsCount={pendingSubmissionsCount}
        pendingCorrectionsCount={pendingCorrectionsCount}
        pendingCatchReportsCount={pendingCatchReportsCount}
        pendingOwnerClaimsCount={pendingOwnerClaimsCount}
      />
    </main>
  );
}