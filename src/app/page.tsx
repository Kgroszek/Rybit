import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MapSection } from "@/components/dashboard/MapSection";
import { NearestLakes } from "@/components/dashboard/NearestLakes";
import { RecentCatches } from "@/components/dashboard/RecentCatches";
import { RecommendedLakes } from "@/components/dashboard/RecommendedLakes";
import { StatsSection } from "@/components/dashboard/StatsSection";
import { Topbar } from "@/components/dashboard/Topbar";
import { WeatherCard } from "@/components/dashboard/WeatherCard";

export default function Home() {
  return (
    <DashboardLayout>
      <Topbar />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <MapSection />
          <RecommendedLakes />
          <StatsSection />
        </div>

        <aside className="space-y-6">
          <WeatherCard />
          <NearestLakes />
          <RecentCatches />
        </aside>
      </div>
    </DashboardLayout>
  );
}