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