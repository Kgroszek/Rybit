import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChecklistsPage } from "@/components/dashboard/ChecklistsPage";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type ChecklistsRoutePageProps = {
  searchParams: Promise<{
    active?: string;
  }>;
};

export default async function ChecklistsRoutePage({
  searchParams,
}: ChecklistsRoutePageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { active } = await searchParams;

  const [checklists, gear] = await Promise.all([
    prisma.tripChecklist.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.fishingGear.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return (
    <DashboardLayout>
      <ChecklistsPage
        initialChecklists={JSON.parse(JSON.stringify(checklists))}
        gearItems={JSON.parse(JSON.stringify(gear))}
        initialSelectedChecklistId={active || null}
      />
    </DashboardLayout>
  );
}