import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, { params }: RouteProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany." },
      { status: 401 }
    );
  }

  const checklist = await prisma.tripChecklist.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
    },
  });

  if (!checklist) {
    return NextResponse.json(
      { message: "Nie znaleziono checklisty." },
      { status: 404 }
    );
  }

  if (checklist.userId !== user.id) {
    return NextResponse.json(
      { message: "Nie masz dostępu do tej checklisty." },
      { status: 403 }
    );
  }

  const defaultGear = await prisma.fishingGear.findMany({
    where: {
      userId: user.id,
      isDefault: true,
    },
  });

  const existingGearIds = new Set(
    checklist.items
      .map((item) => item.gearId)
      .filter((gearId): gearId is string => Boolean(gearId))
  );

  const gearToAdd = defaultGear.filter((gear) => !existingGearIds.has(gear.id));

  await prisma.tripChecklistItem.createMany({
    data: gearToAdd.map((gear) => ({
      checklistId: id,
      name: gear.name,
      category: "gear",
      quantity: gear.quantity || 1,
      unit: "szt.",
      isImportant: false,
      source: "gear",
      gearId: gear.id,
      note: gear.note,
    })),
  });

  const updatedChecklist = await prisma.tripChecklist.findUnique({
    where: {
      id,
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return NextResponse.json(updatedChecklist);
}