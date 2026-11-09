import { Suspense } from "react";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SettingsIcon } from "@/components/icons/SettingsIcon";
import { ProfileActivityGrid } from "@/components/profile/ProfileActivityGrid";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileProgressHub } from "@/components/profile/ProfileProgressHub";
import { ProfileProgressSkeleton } from "@/components/profile/ProfileProgressSkeleton";
import { ProfileSubmissions } from "@/components/profile/ProfileSubmissions";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  getProfileOverviewData,
  getProfileProgressData,
} from "@/lib/profile/profile-query";
import type {
  ProfileIdentity,
  ProfileProgressData,
} from "@/lib/profile/profile-types";
import { getProfileDisplayName } from "@/lib/profile/profile-utils";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const overviewPromise = getProfileOverviewData(user.id);
  const progressPromise = getProfileProgressData(user.id);

  const overview = await overviewPromise;

  const identity: ProfileIdentity = {
    displayName: getProfileDisplayName(user.user_metadata),
    email: user.email || "Brak adresu e-mail",
    createdAt: new Date(user.created_at),
  };

  const hasPublicProfile = overview.counts.publicCatches > 0;

  return (
    <DashboardLayout>
      <div className="space-y-9 pb-8 lg:space-y-11">
        <PageHeader
          eyebrow="Konto i aktywność"
          title="Profil"
          description="Twój wędkarski dorobek, aktywność w Rybio i najważniejsze informacje o koncie w jednym miejscu."
          actions={
            <>
              {hasPublicProfile && (
                <ButtonLink
                  href={`/wedkarze/${user.id}`}
                  variant="outline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Profil publiczny ↗
                </ButtonLink>
              )}

              <ButtonLink href="/ustawienia">
                <SettingsIcon className="h-4 w-4" />
                Edytuj profil
              </ButtonLink>
            </>
          }
        />

        <ProfileHero identity={identity} counts={overview.counts} />

        <Suspense fallback={<ProfileProgressSkeleton />}>
          <ProfileProgressLoader promise={progressPromise} />
        </Suspense>

        <ProfileActivityGrid
          favourites={overview.favourites}
          ratings={overview.ratings}
        />

        <ProfileSubmissions
          submissions={overview.submissions}
          totalCount={overview.counts.submissions}
        />
      </div>
    </DashboardLayout>
  );
}

async function ProfileProgressLoader({
  promise,
}: {
  promise: Promise<ProfileProgressData>;
}) {
  const data = await promise;

  return <ProfileProgressHub data={data} />;
}
