import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GearPage } from "@/components/dashboard/GearPage";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function EquipmentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const gear = await prisma.fishingGear.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <DashboardLayout>
      <GearPage initialGear={JSON.parse(JSON.stringify(gear))} />
    </DashboardLayout>
  );
}