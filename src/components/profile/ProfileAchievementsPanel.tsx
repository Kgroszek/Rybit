"use client";

import { useMemo, useState, type ReactNode } from "react";

import { ProfileEmptyState } from "@/components/profile/ProfileEmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { UserAchievementView } from "@/lib/achievements";
import { cn } from "@/lib/cn";
import { formatProfileShortDate } from "@/lib/profile/profile-utils";

type AchievementFilter = "all" | "unlocked" | "locked";

const INITIAL_VISIBLE_ACHIEVEMENTS = 8;

export function ProfileAchievementsPanel({
  achievements,
}: {
  achievements: UserAchievementView[];
}) {
  const [filter, setFilter] = useState<AchievementFilter>("all");
  const [showAll, setShowAll] = useState(false);

  const unlockedCount = achievements.filter(
    (achievement) => achievement.isUnlocked
  ).length;

  const filtered = useMemo(() => {
    if (filter === "unlocked") {
      return achievements.filter((achievement) => achievement.isUnlocked);
    }

    if (filter === "locked") {
      return achievements.filter((achievement) => !achievement.isUnlocked);
    }

    return achievements;
  }, [achievements, filter]);

  const visible = showAll
    ? filtered
    : filtered.slice(0, INITIAL_VISIBLE_ACHIEVEMENTS);

  const grouped = useMemo(() => {
    const groups = new Map<string, UserAchievementView[]>();

    for (const achievement of visible) {
      const current = groups.get(achievement.category) ?? [];
      current.push(achievement);
      groups.set(achievement.category, current);
    }

    return Array.from(groups.entries());
  }, [visible]);

  function changeFilter(next: AchievementFilter) {
    setFilter(next);
    setShowAll(false);
  }

  if (achievements.length === 0) {
    return (
      <ProfileEmptyState
        title="Brak osiągnięć"
        description="Osiągnięcia będą pojawiały się wraz z aktywnością w Rybio."
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-control bg-surface-muted p-1">
        <FilterButton
          active={filter === "all"}
          onClick={() => changeFilter("all")}
        >
          Wszystkie ({achievements.length})
        </FilterButton>

        <FilterButton
          active={filter === "unlocked"}
          onClick={() => changeFilter("unlocked")}
        >
          Zdobyte ({unlockedCount})
        </FilterButton>

        <FilterButton
          active={filter === "locked"}
          onClick={() => changeFilter("locked")}
        >
          Do zdobycia ({achievements.length - unlockedCount})
        </FilterButton>
      </div>

      {filtered.length > 0 ? (
        <>
          <div className="mt-6 space-y-7">
            {grouped.map(([category, items]) => (
              <section key={category}>
                <div className="mb-3 flex items-center gap-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-text-muted">
                    {category}
                  </h3>

                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {items.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {filtered.length > INITIAL_VISIBLE_ACHIEVEMENTS && (
            <div className="mt-5 flex flex-col gap-3 rounded-control bg-surface-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-text-muted">
                {showAll
                  ? `Wyświetlasz wszystkie osiągnięcia w tej zakładce.`
                  : `Ukryto jeszcze ${
                      filtered.length - visible.length
                    } osiągnięć.`}
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAll((current) => !current)}
              >
                {showAll ? "Pokaż mniej" : "Pokaż wszystkie"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <ProfileEmptyState
          className="mt-5"
          title="Brak osiągnięć w tej zakładce"
          description="Zmień filtr albo wykonuj kolejne aktywności w Rybio."
        />
      )}
    </div>
  );
}

function AchievementCard({
  achievement,
}: {
  achievement: UserAchievementView;
}) {
  return (
    <article
      className={cn(
        "rounded-card border p-4 transition",
        achievement.isUnlocked
          ? "border-primary-200 bg-primary-50/60"
          : "border-border bg-surface-muted"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-control border bg-surface text-xl",
            achievement.isUnlocked
              ? "border-primary-200"
              : "border-border grayscale opacity-60"
          )}
          aria-hidden="true"
        >
          {achievement.icon || "🏆"}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="font-display text-sm font-extrabold leading-5 text-text">
              {achievement.title}
            </h4>

            <Badge
              variant={achievement.isUnlocked ? "success" : "neutral"}
              size="sm"
              className="text-[9px]"
            >
              {achievement.isUnlocked ? "Zdobyte" : "Do zdobycia"}
            </Badge>
          </div>

          <p className="mt-1.5 text-xs leading-5 text-text-secondary">
            {achievement.description}
          </p>

          {achievement.isUnlocked && achievement.unlockedAt && (
            <p className="mt-3 text-[10px] font-bold text-success-foreground">
              Zdobyto {formatProfileShortDate(achievement.unlockedAt)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-9 rounded-xl px-3.5 py-2 text-xs font-bold transition",
        active
          ? "bg-surface text-primary-700 shadow-sm"
          : "text-text-muted hover:text-text"
      )}
    >
      {children}
    </button>
  );
}
