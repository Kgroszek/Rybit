import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LakesPage } from "@/components/dashboard/LakesPage";
import { getLakesList } from "@/lib/lakes";

type LowiskaPageProps = {
  searchParams?: Promise<{
    view?: string;
  }>;
};

export default async function LowiskaPage({ searchParams }: LowiskaPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialView = resolvedSearchParams?.view === "map" ? "map" : "grid";

  const lakes = await getLakesList();

  return (
    <DashboardLayout>
      <LakesPage lakes={lakes} initialView={initialView} />
    </DashboardLayout>
  );
}