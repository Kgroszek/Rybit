import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LakesPage } from "@/components/dashboard/LakesPage";
import { getLakes } from "@/lib/lakes";

export default async function LowiskaPage() {
  const lakes = await getLakes();

  return (
    <DashboardLayout>
      <LakesPage lakes={lakes} />
    </DashboardLayout>
  );
}