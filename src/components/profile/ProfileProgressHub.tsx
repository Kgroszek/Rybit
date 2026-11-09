"use client";

import { useMemo, useState } from "react";

import { ProfileAchievementsPanel } from "@/components/profile/ProfileAchievementsPanel";
import { ProfileRankingBadgesPanel } from "@/components/profile/ProfileRankingBadgesPanel";
import { ProfileRecordsPanel } from "@/components/profile/ProfileRecordsPanel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type { ProfileProgressData } from "@/lib/profile/profile-types";
import { cn } from "@/lib/cn";

type ProgressTab = "records" | "achievements" | "badges";

export function ProfileProgressHub({
  data,
}: {
  data: ProfileProgressData;
}) {
  const [activeTab, setActiveTab] = useState<ProgressTab>("records");

  const unlockedAchievements = useMemo(
    () => data.achievements.filter((achievement) => achievement.isUnlocked).length,
    [data.achievements]
  );

  return (
    <section>
      <Card>
        <CardHeader className="border-b border-border pb-5">
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
            Twój wędkarski dorobek
          </p>

          <CardTitle className="text-xl sm:text-2xl">
            Rekordy, osiągnięcia i rankingi
          </CardTitle>

          <CardDescription className="max-w-3xl">
            Najważniejsze efekty Twojej aktywności w Rybio zebrane w jednym,
            uporządkowanym miejscu.
          </CardDescription>

          <div
            className="mt-5 grid grid-cols-3 gap-1 rounded-control bg-surface-muted p-1"
            role="group"
            aria-label="Wędkarski dorobek"
          >
            <ProgressTabButton
              active={activeTab === "records"}
              label="Rekordy"
              value={String(data.fishRecords.length)}
              onClick={() => setActiveTab("records")}
            />

            <ProgressTabButton
              active={activeTab === "achievements"}
              label="Osiągnięcia"
              value={`${unlockedAchievements}/${data.achievements.length}`}
              onClick={() => setActiveTab("achievements")}
            />

            <ProgressTabButton
              active={activeTab === "badges"}
              label="Odznaki TOP"
              value={String(data.rankingBadges.length)}
              onClick={() => setActiveTab("badges")}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-5 sm:pt-6">
          <div>
            {activeTab === "records" && (
              <ProfileRecordsPanel records={data.fishRecords} />
            )}

            {activeTab === "achievements" && (
              <ProfileAchievementsPanel achievements={data.achievements} />
            )}

            {activeTab === "badges" && (
              <ProfileRankingBadgesPanel badges={data.rankingBadges} />
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function ProgressTabButton({
  active,
  label,
  value,
  onClick,
}: {
  active: boolean;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-w-0 rounded-xl px-2 py-2.5 text-center transition sm:px-3",
        active
          ? "bg-surface text-primary-700 shadow-sm"
          : "text-text-muted hover:text-text"
      )}
    >
      <span className="block truncate text-[9px] font-black uppercase tracking-[0.1em] sm:text-[10px]">
        {label}
      </span>

      <span
        className={cn(
          "mt-1 block font-display text-base font-extrabold tracking-[-0.025em] sm:text-lg",
          active ? "text-text" : "text-text-secondary"
        )}
      >
        {value}
      </span>
    </button>
  );
}
