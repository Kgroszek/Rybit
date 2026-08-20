import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CatchesPage } from "@/components/dashboard/CatchesPage";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type CatchesRoutePageProps = {
  searchParams: Promise<{
    tripId?: string;
    new?: string;
    edit?: string;
  }>;
};

const BUCKET_NAME = "catch-images";

export default async function CatchesRoutePage({ searchParams }: CatchesRoutePageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { tripId, new: newCatch, edit } = await searchParams;

  const [catches, lakes, trips] = await Promise.all([
    prisma.fishingCatch.findMany({
      where: { userId: user.id },
      orderBy: { caughtAt: "desc" },
    }),
    prisma.lake.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, city: true, voivodeship: true },
    }),
    prisma.fishingTrip.findMany({
      where: {
        OR: [
          { userId: user.id },
          {
            members: {
              some: {
                userId: user.id,
                status: "accepted",
                role: { in: ["editor", "co_owner"] },
              },
            },
          },
        ],
        status: { notIn: ["cancelled", "canceled"] },
      },
      orderBy: { startsAt: "desc" },
      select: {
        id: true,
        title: true,
        startsAt: true,
        endsAt: true,
        lakeId: true,
        tripType: true,
        status: true,
      },
    }),
  ]);

  const catchesWithSignedUrls = await Promise.all(
    catches.map(async (item) => {
      if (!item.imagePath) return { ...item, imageUrl: item.imageUrl ?? null };

      const { data } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(item.imagePath, 60 * 60);

      return { ...item, imageUrl: data?.signedUrl ?? item.imageUrl ?? null };
    })
  );

  return (
    <DashboardLayout>
      <CatchesPage
        initialCatches={JSON.parse(JSON.stringify(catchesWithSignedUrls))}
        lakes={JSON.parse(JSON.stringify(lakes))}
        trips={JSON.parse(JSON.stringify(trips))}
        initialTripId={tripId || null}
        initialCreateOpen={newCatch === "1"}
        initialEditCatchId={edit || null}
      />
    </DashboardLayout>
  );
}
