import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { checkAndUnlockAchievements } from "@/lib/achievements";

const CATCH_IMAGES_BUCKET = "catch-images";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getUserCatch(id: string) {
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
      fishingCatch: null,
      user: null,
    };
  }

  const fishingCatch = await prisma.fishingCatch.findUnique({
    where: {
      id,
    },
  });

  if (!fishingCatch) {
    return {
      error: NextResponse.json(
        { message: "Nie znaleziono połowu." },
        { status: 404 }
      ),
      fishingCatch: null,
      user,
    };
  }

  if (fishingCatch.userId !== user.id) {
    return {
      error: NextResponse.json(
        { message: "Nie masz dostępu do tego połowu." },
        { status: 403 }
      ),
      fishingCatch: null,
      user,
    };
  }

  return {
    error: null,
    fishingCatch,
    user,
  };
}

export async function PUT(request: Request, { params }: RouteProps) {
  const { id } = await params;

  const result = await getUserCatch(id);

  if (result.error) {
    return result.error;
  }

  if (!result.user || !result.fishingCatch) {
    return NextResponse.json(
      { message: "Nie udało się pobrać danych połowu." },
      { status: 400 }
    );
  }

  const body = await request.json();

  const fishName = String(body.fishName || "").trim();
  const method = String(body.method || "").trim();
  const caughtAt = String(body.caughtAt || "").trim();
  const selectedLakeId = String(body.lakeId || "").trim();
  const selectedTripId = String(body.tripId || "").trim();
  const isPublic = Boolean(body.isPublic);

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

  if (isPublic && !selectedLakeId) {
    return NextResponse.json(
      {
        message:
          "Aby połów trafił do rankingu łowiska, musisz wybrać łowisko z bazy.",
      },
      { status: 400 }
    );
  }

  if (isPublic && weight === null && length === null) {
    return NextResponse.json(
      {
        message:
          "Aby połów trafił do rankingu łowiska, wpisz wagę lub długość ryby.",
      },
      { status: 400 }
    );
  }

  let lakeName: string | null = null;
  let lakeId: string | null = null;

  if (selectedLakeId) {
    const lake = await prisma.lake.findUnique({
      where: {
        id: selectedLakeId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!lake) {
      return NextResponse.json(
        { message: "Wybrane łowisko nie istnieje." },
        { status: 400 }
      );
    }

    lakeId = lake.id;
    lakeName = lake.name;
  }

  let tripTitle: string | null = null;
  let tripId: string | null = null;

  if (selectedTripId) {
    const trip = await prisma.fishingTrip.findUnique({
      where: {
        id: selectedTripId,
      },
      select: {
        id: true,
        title: true,
        userId: true,
      },
    });

    if (trip && trip.userId === result.user.id) {
      tripId = trip.id;
      tripTitle = trip.title;
    }
  }

  const updatedCatch = await prisma.fishingCatch.update({
    where: {
      id,
    },
    data: {
      fishName,
      weight,
      length,

      method,
      bait: body.bait || null,
      caughtAt: new Date(caughtAt),

      lakeId,
      lakeName,

      tripId,
      tripTitle,

      note: body.note || null,

      isPublic,
      rankingStatus: isPublic ? "approved" : "pending",
    },
  });

  await checkAndUnlockAchievements(result.user.id);

  return NextResponse.json(updatedCatch);
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const { id } = await params;

  const result = await getUserCatch(id);

  if (result.error) {
    return result.error;
  }

  if (!result.fishingCatch) {
    return NextResponse.json(
      { message: "Nie udało się pobrać połowu." },
      { status: 400 }
    );
  }

  if (result.fishingCatch.imagePath) {
    const supabase = await createClient();

    await supabase.storage
      .from(CATCH_IMAGES_BUCKET)
      .remove([result.fishingCatch.imagePath]);
  }

  await prisma.fishingCatch.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    message: "Połów został usunięty.",
  });
}