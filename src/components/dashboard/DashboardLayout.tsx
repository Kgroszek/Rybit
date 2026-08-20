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

const getAdminNotificationCounts =
  unstable_cache(
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
    [
      "dashboard-admin-notification-counts",
    ],
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
  if (
    typeof user.user_metadata
      ?.name === "string"
  ) {
    return user.user_metadata.name;
  }

  if (
    typeof user.user_metadata
      ?.full_name === "string"
  ) {
    return user.user_metadata.full_name;
  }

  if (
    typeof user.user_metadata
      ?.display_name === "string"
  ) {
    return user.user_metadata.display_name;
  }

  return null;
}

export async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin =
    isAdminUser(user);

  const [
    adminNotificationCounts,
    ownedLakesCount,
  ] = await Promise.all([
    isAdmin
      ? getAdminNotificationCounts()
      : emptyAdminNotificationCounts,

    prisma.lakeOwner.count({
      where: {
        userId: user.id,
        isActive: true,
      },
    }),
  ]);

  const isOwner =
    ownedLakesCount > 0;

  return (
    <main className="min-h-screen bg-background text-text">
      <div className="flex min-h-screen">
        <Sidebar
          isAdmin={isAdmin}
          isOwner={isOwner}
          {...adminNotificationCounts}
        />

        <section className="min-w-0 flex-1 px-4 pb-32 pt-4 sm:px-5 lg:px-7 lg:py-7 2xl:px-8">
          <div className="mx-auto w-full max-w-[1720px]">
            <DashboardTopbar
              userName={getUserDisplayName(
                user
              )}
              userEmail={user.email}
            />

            {children}

            <footer className="mt-12 border-t border-border pt-6">
              <div className="flex flex-col gap-3 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
                <p>
                  ©{" "}
                  {new Date().getFullYear()}{" "}
                  Rybio. Wszystkie prawa
                  zastrzeżone.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/regulamin"
                    className="font-semibold transition-colors hover:text-primary"
                  >
                    Regulamin
                  </Link>

                  <Link
                    href="/polityka-prywatnosci"
                    className="font-semibold transition-colors hover:text-primary"
                  >
                    Polityka prywatności
                  </Link>

                  <a
                    href="mailto:kontakt@rybio.pl"
                    className="font-semibold transition-colors hover:text-primary"
                  >
                    Kontakt
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </section>
      </div>

      <MobileBottomNav
        isAdmin={isAdmin}
        isOwner={isOwner}
        {...adminNotificationCounts}
      />
    </main>
  );
}
