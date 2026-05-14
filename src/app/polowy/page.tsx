import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CatchesPage } from "@/components/dashboard/CatchesPage";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type CatchesRoutePageProps = {
  searchParams: Promise<{
    tripId?: string;
  }>;
};

export default async function CatchesRoutePage({
  searchParams,
}: CatchesRoutePageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { tripId } = await searchParams;

  const [catches, lakes, trips] = await Promise.all([
    prisma.fishingCatch.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        caughtAt: "desc",
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

    prisma.fishingTrip.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        startsAt: "desc",
      },
      select: {
        id: true,
        title: true,
        startsAt: true,
      },
    }),
  ]);

  return (
    <DashboardLayout>
      <CatchesPage
        initialCatches={JSON.parse(JSON.stringify(catches))}
        lakes={JSON.parse(JSON.stringify(lakes))}
        trips={JSON.parse(JSON.stringify(trips))}
        initialTripId={tripId || null}
      />
    </DashboardLayout>
  );
}