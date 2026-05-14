import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TripsPage } from "@/components/dashboard/TripsPage";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function TripsRoutePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [trips, lakes] = await Promise.all([
    prisma.fishingTrip.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        startsAt: "asc",
      },
    }),

    prisma.lake.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        city: true,
        voivodeship: true,
      },
    }),
  ]);

  return (
    <DashboardLayout>
      <TripsPage
        initialTrips={JSON.parse(JSON.stringify(trips))}
        lakes={JSON.parse(JSON.stringify(lakes))}
      />
    </DashboardLayout>
  );
}