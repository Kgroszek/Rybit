import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type {
  ProfileIdentity,
  ProfileOverviewCounts,
} from "@/lib/profile/profile-types";
import {
  formatProfileDate,
  getProfileInitials,
} from "@/lib/profile/profile-utils";

export function ProfileHero({
  identity,
  counts,
}: {
  identity: ProfileIdentity;
  counts: ProfileOverviewCounts;
}) {
  const hasPublicProfile = counts.publicCatches > 0;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-6 px-5 py-6 sm:px-6 sm:py-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-panel bg-navy-950 font-display text-xl font-extrabold tracking-[-0.03em] text-white shadow-sm sm:h-20 sm:w-20 sm:text-2xl">
            {getProfileInitials(identity.displayName)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-display text-xl font-extrabold tracking-[-0.025em] text-text sm:text-2xl">
                {identity.displayName}
              </h2>

              <Badge
                variant={hasPublicProfile ? "success" : "neutral"}
                size="sm"
              >
                {hasPublicProfile ? "Profil publiczny aktywny" : "Profil publiczny nieaktywny"}
              </Badge>
            </div>

            <p className="mt-1 truncate text-sm font-medium text-text-secondary">
              {identity.email}
            </p>

            <p className="mt-2 text-xs font-semibold text-text-muted">
              W Rybio od {formatProfileDate(identity.createdAt)}
            </p>
          </div>
        </div>

        <div className="max-w-sm rounded-control border border-primary-200 bg-primary-50 px-4 py-3">
          <p className="text-xs font-extrabold text-primary-800">
            {hasPublicProfile
              ? "Twój profil publiczny jest aktywny"
              : "Profil publiczny jest jeszcze niewidoczny"}
          </p>

          <p className="mt-1 text-xs leading-5 text-text-secondary">
            {hasPublicProfile
              ? "Pokazuje zatwierdzone publiczne połowy, odznaki i osiągnięcia."
              : "Pojawi się po dodaniu zatwierdzonego publicznego połowu."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-border bg-border lg:grid-cols-4">
        <ProfileHeroStat label="Wszystkie połowy" value={counts.catches} />
        <ProfileHeroStat label="Publiczne połowy" value={counts.publicCatches} />
        <ProfileHeroStat label="Ulubione łowiska" value={counts.favourites} />
        <ProfileHeroStat label="Oceny łowisk" value={counts.ratings} />
      </div>
    </Card>
  );
}

function ProfileHeroStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-surface px-5 py-4 sm:px-6 sm:py-5">
      <p className="text-[10px] font-black uppercase tracking-[0.13em] text-text-muted">
        {label}
      </p>

      <p className="mt-2 font-display text-2xl font-extrabold tracking-[-0.035em] text-text sm:text-3xl">
        {value}
      </p>
    </div>
  );
}
