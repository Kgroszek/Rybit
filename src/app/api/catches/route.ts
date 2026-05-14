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

  const catches = await prisma.fishingCatch.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      caughtAt: "desc",
    },
  });

  return NextResponse.json(catches);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany, aby dodać połów." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const fishName = String(body.fishName || "").trim();
  const method = String(body.method || "").trim();
  const caughtAt = String(body.caughtAt || "").trim();

  if (!fishName || !method || !caughtAt) {
    return NextResponse.json(
      { message: "Gatunek ryby, metoda i data połowu są wymagane." },
      { status: 400 }
    );
  }

  const weight =
    body.weight !== undefined && body.weight !== "" ? Number(body.weight) : null;

  const length =
    body.length !== undefined && body.length !== "" ? Number(body.length) : null;

  if (weight !== null && Number.isNaN(weight)) {
    return NextResponse.json(
      { message: "Waga musi być liczbą." },
      { status: 400 }
    );
  }

  if (length !== null && Number.isNaN(length)) {
    return NextResponse.json(
      { message: "Długość musi być liczbą." },
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

  let tripTitle: string | null = null;
  let tripId: string | null = null;

  if (body.tripId) {
    const trip = await prisma.fishingTrip.findUnique({
      where: {
        id: body.tripId,
      },
      select: {
        id: true,
        title: true,
        userId: true,
      },
    });

    if (trip && trip.userId === user.id) {
      tripId = trip.id;
      tripTitle = trip.title;
    }
  }

  const fishingCatch = await prisma.fishingCatch.create({
    data: {
      userId: user.id,

      fishName,
      weight,
      length,

      method,
      bait: body.bait || null,
      caughtAt: new Date(caughtAt),

      lakeId: body.lakeId || null,
      lakeName,

      tripId,
      tripTitle,

      note: body.note || null,
    },
  });

  return NextResponse.json(fishingCatch, { status: 201 });
}