import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MapSection } from "@/components/dashboard/MapSection";
import { NearestLakes } from "@/components/dashboard/NearestLakes";
import { RecentCatches } from "@/components/dashboard/RecentCatches";
import { RecommendedLakes } from "@/components/dashboard/RecommendedLakes";
import { StatsSection } from "@/components/dashboard/StatsSection";
import { Topbar } from "@/components/dashboard/Topbar";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { getLakes } from "@/lib/lakes";

export default async function Home() {
  const lakes = await getLakes();

  return (
    <DashboardLayout>
      <Topbar />

      <div className="grid gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5 lg:space-y-6">
          <MapSection lakes={lakes} />
          <RecommendedLakes lakes={lakes} />
          <StatsSection />
        </div>

        <aside className="space-y-6">
          <WeatherCard />
          <NearestLakes lakes={lakes} />
          <RecentCatches />
        </aside>
      </div>
    </DashboardLayout>
  );
}