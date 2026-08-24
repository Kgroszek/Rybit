import Link from "next/link";

import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { ProfileEmptyState } from "@/components/profile/ProfileEmptyState";
import { Badge } from "@/components/ui/Badge";
import type { UserRankingBadge } from "@/lib/ranking-badges";

export function ProfileRankingBadgesPanel({
  badges,
}: {
  badges: UserRankingBadge[];
}) {
  if (badges.length === 0) {
    return (
      <ProfileEmptyState
        title="Brak odznak rankingowych"
        description="Odznaki pojawią się tutaj, gdy trafisz do TOP 3 rankingu najcięższych lub najdłuższych ryb na łowisku."
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {badges.map((badge) => (
        <RankingBadgeCard key={badge.id} badge={badge} />
      ))}
    </div>
  );
}

function RankingBadgeCard({
  badge,
}: {
  badge: UserRankingBadge;
}) {
  const medal = badge.place === 1 ? "🥇" : badge.place === 2 ? "🥈" : "🥉";

  return (
    <article className="rounded-card border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control border border-border bg-surface-muted text-xl"
            aria-hidden="true"
          >
            {medal}
          </div>

          <div>
            <Badge
              variant={
                badge.place === 1
                  ? "warning"
                  : badge.place === 2
                    ? "neutral"
                    : "primary"
              }
              size="sm"
            >
              TOP {badge.place}
            </Badge>

            <p className="mt-1.5 text-[10px] font-black uppercase tracking-[0.11em] text-text-muted">
              {badge.type === "weight" ? "Waga" : "Długość"}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-text-muted">
          {badge.unit === "kg"
            ? `${badge.value.toFixed(2)} kg`
            : `${badge.value.toFixed(0)} cm`}
        </span>
      </div>

      <h3 className="mt-4 font-display text-lg font-extrabold tracking-[-0.025em] text-text">
        {badge.fishName}
      </h3>

      <p className="mt-1 text-xs leading-5 text-text-secondary">
        {badge.type === "weight" ? "Najcięższa ryba" : "Najdłuższa ryba"} na
        tym łowisku w rankingu Rybio.
      </p>

      <Link
        href={`/lowiska/${badge.lakeSlug}`}
        className="group mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm font-bold text-primary-700 transition hover:text-primary-900"
      >
        <span className="truncate">{badge.lakeName}</span>

        <ArrowSmallRightIcon className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}
