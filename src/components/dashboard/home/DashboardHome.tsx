import type {
  DashboardRecentCatch,
  DashboardStats,
  DashboardTask,
  DashboardTrip,
  PreparationSummary,
  PriorityCardData,
} from "@/components/dashboard/home/types";
import { DashboardActivityPanel } from "@/components/dashboard/home/DashboardActivityPanel";
import { DashboardMapSection } from "@/components/dashboard/home/DashboardMapSection";
import { DashboardPriorityCard } from "@/components/dashboard/home/DashboardPriorityCard";
import { DashboardQuickActions } from "@/components/dashboard/home/DashboardQuickActions";
import { DashboardTodayPanel } from "@/components/dashboard/home/DashboardTodayPanel";
import { DashboardUpcomingTrip } from "@/components/dashboard/home/DashboardUpcomingTrip";
import { RecentCatches } from "@/components/dashboard/RecentCatches";
import { RecommendedLakes } from "@/components/dashboard/RecommendedLakes";
import type { LakeListDto } from "@/lib/lakes";

type DashboardHomeProps = {
  lakes: LakeListDto[];
  priorityCard: PriorityCardData;
  todayTasks: DashboardTask[];
  stats: DashboardStats;
  recentCatches: DashboardRecentCatch[];
  quickCatchHref: string;
  hasActiveTrip: boolean;
  secondaryTrip:
    | {
        trip: DashboardTrip;
        preparation: PreparationSummary;
      }
    | null;
  now: Date;
};

export function DashboardHome({
  lakes,
  priorityCard,
  todayTasks,
  stats,
  recentCatches,
  quickCatchHref,
  hasActiveTrip,
  secondaryTrip,
  now,
}: DashboardHomeProps) {
  return (
    <div className="space-y-9 pb-8 lg:space-y-11">
      <DashboardMapSection lakes={lakes} />

      <DashboardPriorityCard card={priorityCard} />

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <DashboardTodayPanel tasks={todayTasks} />

        <DashboardQuickActions
          quickCatchHref={quickCatchHref}
          hasActiveTrip={hasActiveTrip}
        />
      </section>

      <DashboardActivityPanel stats={stats} />

      {secondaryTrip && (
        <DashboardUpcomingTrip
          trip={secondaryTrip.trip}
          preparation={secondaryTrip.preparation}
          now={now}
        />
      )}

      <RecentCatches catches={recentCatches} />

      <RecommendedLakes lakes={lakes} />
    </div>
  );
}
