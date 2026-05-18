import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { WeatherForecastPage } from "@/components/dashboard/WeatherForecastPage";
import { createClient } from "@/lib/supabase/server";

export default async function WeatherPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <WeatherForecastPage />
    </DashboardLayout>
  );
}