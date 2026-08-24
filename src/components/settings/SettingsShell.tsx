"use client";

import {
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import { AccountSettingsSection } from "@/components/settings/AccountSettingsSection";
import { SecuritySettingsSection } from "@/components/settings/SecuritySettingsSection";
import { SettingsNavigation } from "@/components/settings/SettingsNavigation";
import type {
  SettingsSection,
} from "@/lib/account/account-types";

type SettingsShellProps = {
  initialSection: SettingsSection;
  initialName: string;
  initialEmail: string;
  publicProfileAvailable: boolean;
  publicProfileHref: string;
};

export function SettingsShell({
  initialSection,
  initialName,
  initialEmail,
  publicProfileAvailable,
  publicProfileHref,
}: SettingsShellProps) {
  const router = useRouter();

  const [
    activeSection,
    setActiveSection,
  ] =
    useState<SettingsSection>(
      initialSection
    );

  function changeSection(
    section: SettingsSection
  ) {
    setActiveSection(section);

    const query =
      section === "account"
        ? ""
        : `?sekcja=${section}`;

    router.replace(
      `/ustawienia${query}`,
      {
        scroll: false,
      }
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-6">
        <SettingsNavigation
          activeSection={
            activeSection
          }
          onSectionChange={
            changeSection
          }
        />
      </div>

      <div className="min-w-0">
        {activeSection ===
        "account" ? (
          <AccountSettingsSection
            initialName={
              initialName
            }
            initialEmail={
              initialEmail
            }
            publicProfileAvailable={
              publicProfileAvailable
            }
            publicProfileHref={
              publicProfileHref
            }
          />
        ) : (
          <SecuritySettingsSection />
        )}
      </div>
    </div>
  );
}
