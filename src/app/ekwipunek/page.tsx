import {
  redirect,
} from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GearManager } from "@/components/gear/GearManager";
import { FISHING_GEAR_SELECT } from "@/lib/gear/gear-select";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

export default async function EquipmentPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const gear =
    await prisma.fishingGear.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: FISHING_GEAR_SELECT,
    });

  return (
    <DashboardLayout>
      <GearManager
        initialGear={gear.map(
          (item) => ({
            ...item,
            purchaseDate:
              item.purchaseDate?.toISOString() ??
              null,
            createdAt:
              item.createdAt.toISOString(),
            updatedAt:
              item.updatedAt.toISOString(),
          })
        )}
      />
    </DashboardLayout>
  );
}
