import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

  const trips = await prisma.fishingTrip.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      startsAt: "asc",
    },
  });

  return NextResponse.json(trips);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany, aby dodać wyprawę." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const title = String(body.title || "").trim();
  const startsAt = String(body.startsAt || "").trim();

  if (!title || !startsAt) {
    return NextResponse.json(
      { message: "Nazwa wyprawy oraz data są wymagane." },
      { status: 400 }
    );
  }

  let lakeName: string | null = null;

  if (body.lakeId) {
    const lake = await prisma.lake.findUnique({
      where: {
        id: body.lakeId,
      },
      select: {
        name: true,
      },
    });

    lakeName = lake?.name ?? null;
  }

  let checklistId: string | null = null;

  if (body.createChecklist) {
    const checklist = await prisma.tripChecklist.create({
      data: {
        userId: user.id,
        title: `Checklista — ${title}`,
        tripType: body.tripType || "custom",
        note: lakeName ? `Wyprawa na łowisko: ${lakeName}` : null,
      },
    });

    checklistId = checklist.id;
  }

  const trip = await prisma.fishingTrip.create({
    data: {
      userId: user.id,
      title,
      lakeId: body.lakeId || null,
      lakeName,
      tripType: body.tripType || "custom",
      status: body.status || "planned",
      startsAt: new Date(startsAt),
      note: body.note || null,
      checklistId,
    },
  });

  return NextResponse.json(trip, { status: 201 });
}