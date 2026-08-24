import {
  redirect,
} from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SettingsShell } from "@/components/settings/SettingsShell";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  parseSettingsSection,
} from "@/lib/account/account-validation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

type SettingsPageProps = {
  searchParams: Promise<{
    sekcja?: string;
  }>;
};

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params =
    await searchParams;

  const initialSection =
    parseSettingsSection(
      params.sekcja
    );

  const publicCatchesCount =
    await prisma.fishingCatch.count({
      where: {
        userId: user.id,
        isPublic: true,
        rankingStatus:
          "approved",
      },
    });

  const userName =
    getUserDisplayName(
      user.user_metadata
    );

  return (
    <DashboardLayout>
      <div className="space-y-9 pb-8 lg:space-y-11">
        <PageHeader
          eyebrow="Konto"
          title="Ustawienia"
          description="Zarządzaj podstawowymi danymi konta, adresem e-mail i bezpieczeństwem logowania."
        />

        <SettingsShell
          initialSection={
            initialSection
          }
          initialName={
            userName
          }
          initialEmail={
            user.email || ""
          }
          publicProfileAvailable={
            publicCatchesCount > 0
          }
          publicProfileHref={`/wedkarze/${user.id}`}
        />
      </div>
    </DashboardLayout>
  );
}

function getUserDisplayName(
  metadata:
    | Record<
        string,
        unknown
      >
    | null
    | undefined
) {
  for (const key of [
    "full_name",
    "name",
    "display_name",
  ]) {
    const value =
      metadata?.[key];

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return "";
}
