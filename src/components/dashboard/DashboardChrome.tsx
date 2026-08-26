"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { Sidebar } from "@/components/dashboard/Sidebar";
import type { DashboardLayoutContext } from "@/components/dashboard/dashboard-layout-types";

type DashboardChromeProps = DashboardLayoutContext & {
  children: ReactNode;
};

export function DashboardChrome({
  children,
  userName,
  userEmail,
  isAdmin,
  isOwner,
  pendingSubmissionsCount,
  pendingCorrectionsCount,
  pendingCatchReportsCount,
  pendingOwnerClaimsCount,
}: DashboardChromeProps) {
  const adminNotificationCounts = {
    pendingSubmissionsCount,
    pendingCorrectionsCount,
    pendingCatchReportsCount,
    pendingOwnerClaimsCount,
  };

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
              userName={userName}
              userEmail={userEmail}
            />

            {children}

            <footer className="mt-12 border-t border-border pt-6">
              <div className="flex flex-col gap-3 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
                <p>
                  © {new Date().getFullYear()} Rybio. Wszystkie prawa
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
