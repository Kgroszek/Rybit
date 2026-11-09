import { NextResponse } from "next/server";

import { calculateCatchScore } from "@/lib/catch-score";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const CATCH_IMAGES_BUCKET = "catch-images";
const FUTURE_DATE_TOLERANCE_MS = 2 * 60 * 1000;

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getNullablePositiveNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return Number.NaN;
  }

  return number;
}

function parseCaughtAt(value: unknown) {
  const raw = getString(value);
  const caughtAt = new Date(raw);

  if (!raw || Number.isNaN(caughtAt.getTime())) {
    return {
      date: null,
      error: "Podaj prawidłową datę połowu.",
    };
  }

  if (caughtAt.getTime() > Date.now() + FUTURE_DATE_TOLERANCE_MS) {
    return {
      date: null,
      error: "Nie możesz zapisać połowu z przyszłości.",
    };
  }

  return {
    date: caughtAt,
    error: null,
  };
}

async function getTripData(tripIdValue: unknown, userId: string) {
  const tripId = getString(tripIdValue);

  if (!tripId) {
    return {
      tripId: null,
      tripTitle: null,
    };
  }

  const trip = await prisma.fishingTrip.findFirst({
    where: {
      id: tripId,
      OR: [
        {
          userId,
        },
        {
          members: {
            some: {
              userId,
              status: "accepted",
              role: {
                in: ["editor", "co_owner"],
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
    },
  });

  return trip
    ? {
        tripId: trip.id,
        tripTitle: trip.title,
      }
    : {
        tripId: null,
        tripTitle: null,
      };
}

export async function PUT(request: Request, { params }: RouteProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        message: "Musisz być zalogowany.",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await params;

  const existingCatch = await prisma.fishingCatch.findUnique({
    where: {
      id,
    },
  });

  if (!existingCatch) {
    return NextResponse.json(
      {
        message: "Nie znaleziono połowu.",
      },
      {
        status: 404,
      }
    );
  }

  if (existingCatch.userId !== user.id) {
    return NextResponse.json(
      {
        message: "Nie masz dostępu do tego połowu.",
      },
      {
        status: 403,
      }
    );
  }

  const body = await request.json();

  const fishName = getString(body.fishName);
  const method = getString(body.method);

  if (!fishName || !method) {
    return NextResponse.json(
      {
        message: "Gatunek ryby i metoda są wymagane.",
      },
      {
        status: 400,
      }
    );
  }

  const caughtAtResult = parseCaughtAt(body.caughtAt);

  if (caughtAtResult.error || !caughtAtResult.date) {
    return NextResponse.json(
      {
        message: caughtAtResult.error,
      },
      {
        status: 400,
      }
    );
  }

  const weight = getNullablePositiveNumber(body.weight);
  const length = getNullablePositiveNumber(body.length);

  if (Number.isNaN(weight)) {
    return NextResponse.json(
      {
        message: "Waga musi być dodatnią liczbą.",
      },
      {
        status: 400,
      }
    );
  }

  if (Number.isNaN(length)) {
    return NextResponse.json(
      {
        message: "Długość musi być dodatnią liczbą.",
      },
      {
        status: 400,
      }
    );
  }

  const isPublic = Boolean(body.isPublic);
  const lakeId = getString(body.lakeId);

  if (isPublic && !lakeId) {
    return NextResponse.json(
      {
        message:
          "Aby publiczny połów trafił do rankingu łowiska, wybierz łowisko z bazy.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    isPublic &&
    !existingCatch.imagePath &&
    !existingCatch.imageUrl
  ) {
    return NextResponse.json(
      {
        message:
          "Aby publiczny połów trafił do rankingu łowiska, musi mieć zdjęcie.",
      },
      {
        status: 400,
      }
    );
  }

  if (isPublic && weight === null && length === null) {
    return NextResponse.json(
      {
        message:
          "Aby publiczny połów trafił do rankingu łowiska, podaj wagę lub długość.",
      },
      {
        status: 400,
      }
    );
  }

  let finalLakeId: string | null = null;
  let lakeName: string | null = null;

  if (lakeId) {
    const lake = await prisma.lake.findUnique({
      where: {
        id: lakeId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!lake) {
      return NextResponse.json(
        {
          message: "Wybrane łowisko nie istnieje.",
        },
        {
          status: 400,
        }
      );
    }

    finalLakeId = lake.id;
    lakeName = lake.name;
  }

  const trip = await getTripData(body.tripId, user.id);

  const score = calculateCatchScore({
    fishName,
    weight,
    length,
  });

  const updatedCatch = await prisma.fishingCatch.update({
    where: {
      id,
    },
    data: {
      fishName,
      weight,
      length,
      method,
      bait: getString(body.bait) || null,
      caughtAt: caughtAtResult.date,
      lakeId: finalLakeId,
      lakeName,
      tripId: trip.tripId,
      tripTitle: trip.tripTitle,
      note: getString(body.note) || null,
      isPublic,
      rankingStatus: isPublic ? "pending" : existingCatch.rankingStatus,
      catchScore: score.score,
      catchScoreTier: score.tier,
      catchScoreSource: score.source,
      catchScoreVersion: score.version,
    },
  });

  return NextResponse.json(updatedCatch);
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        message: "Musisz być zalogowany.",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await params;

  const fishingCatch = await prisma.fishingCatch.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
      imagePath: true,
    },
  });

  if (!fishingCatch) {
    return NextResponse.json(
      {
        message: "Nie znaleziono połowu.",
      },
      {
        status: 404,
      }
    );
  }

  if (fishingCatch.userId !== user.id) {
    return NextResponse.json(
      {
        message: "Nie masz dostępu do tego połowu.",
      },
      {
        status: 403,
      }
    );
  }

  await prisma.fishingCatch.delete({
    where: {
      id,
    },
  });

  if (fishingCatch.imagePath) {
    const { error } = await supabase.storage
      .from(CATCH_IMAGES_BUCKET)
      .remove([fishingCatch.imagePath]);

    if (error) {
      console.error(
        "[catches/:id] Połów usunięto, ale nie udało się usunąć zdjęcia:",
        error
      );
    }
  }

  return NextResponse.json({
    message: "Połów został usunięty.",
  });
}
