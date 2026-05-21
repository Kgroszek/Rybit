import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LakesPage } from "@/components/dashboard/LakesPage";
import { getLakesList } from "@/lib/lakes";

export default async function LowiskaPage() {
  const lakes = await getLakesList();

  return (
    <DashboardLayout>
      <LakesPage lakes={lakes} />
    </DashboardLayout>
  );
}