import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TripsPage } from "@/components/dashboard/TripsPage";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type TripsRoutePageProps = {
  searchParams?: Promise<{
    lakeId?: string;
    lakeName?: string;
  }>;
};

export default async function TripsRoutePage({
  searchParams,
}: TripsRoutePageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialLakeId = resolvedSearchParams.lakeId || null;
  const initialLakeName = resolvedSearchParams.lakeName || null;

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
        initialLakeId={initialLakeId}
        initialLakeName={initialLakeName}
      />
    </DashboardLayout>
  );
}