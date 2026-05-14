import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getUserTrip(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { message: "Musisz być zalogowany." },
        { status: 401 }
      ),
      trip: null,
      user: null,
    };
  }

  const trip = await prisma.fishingTrip.findUnique({
    where: {
      id,
    },
  });

  if (!trip) {
    return {
      error: NextResponse.json(
        { message: "Nie znaleziono wyprawy." },
        { status: 404 }
      ),
      trip: null,
      user,
    };
  }

  if (trip.userId !== user.id) {
    return {
      error: NextResponse.json(
        { message: "Nie masz dostępu do tej wyprawy." },
        { status: 403 }
      ),
      trip: null,
      user,
    };
  }

  return {
    error: null,
    trip,
    user,
  };
}

export async function PUT(request: Request, { params }: RouteProps) {
  const { id } = await params;

  const result = await getUserTrip(id);

  if (result.error) {
    return result.error;
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
  let lakeId: string | null = null;

  if (body.lakeId) {
    const lake = await prisma.lake.findUnique({
      where: {
        id: body.lakeId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (lake) {
      lakeId = lake.id;
      lakeName = lake.name;
    }
  }

  const updatedTrip = await prisma.fishingTrip.update({
    where: {
      id,
    },
    data: {
      title,
      lakeId,
      lakeName,
      tripType: body.tripType || "custom",
      status: body.status || "planned",
      startsAt: new Date(startsAt),
      note: body.note || null,
    },
  });

  return NextResponse.json(updatedTrip);
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const { id } = await params;

  const result = await getUserTrip(id);

  if (result.error) {
    return result.error;
  }

  await prisma.fishingTrip.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    message: "Wyprawa została usunięta.",
  });
}