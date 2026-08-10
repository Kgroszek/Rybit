import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const ALLOWED_TRIP_TYPES = new Set([
  "custom",
  "spinning",
  "feeder",
  "method_feeder",
  "carp",
  "float",
  "night",
  "competition",
]);

const ALLOWED_STATUSES = new Set([
  "planned",
  "finished",
  "cancelled",
]);

const EDITOR_ROLES = new Set(["editor", "co_owner"]);

function getUserDisplayName(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const metadata = user.user_metadata ?? {};

  const possibleNames = [
    metadata.display_name,
    metadata.full_name,
    metadata.name,
    metadata.username,
  ];

  const metadataName = possibleNames.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0
  );

  if (metadataName) {
    return metadataName.trim().slice(0, 80);
  }

  const emailName = user.email?.split("@")[0]?.trim();

  return emailName ? emailName.slice(0, 80) : "Użytkownik Rybio";
}

async function getTripAccess(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: NextResponse.json(
        {
          message: "Musisz być zalogowany.",
        },
        {
          status: 401,
        }
      ),
      trip: null,
      user: null,
      isOwner: false,
      canEdit: false,
    };
  }

  const trip = await prisma.fishingTrip.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
      title: true,
      lakeId: true,
      lakeName: true,
      tripType: true,
      status: true,
      startsAt: true,
      endsAt: true,
      peopleCount: true,
      note: true,
      checklistId: true,
      completedAt: true,
      checklist: {
        select: {
          id: true,
          title: true,
        },
      },
      members: {
        where: {
          userId: user.id,
          status: "accepted",
        },
        take: 1,
        select: {
          id: true,
          role: true,
          status: true,
        },
      },
    },
  });

  if (!trip) {
    return {
      error: NextResponse.json(
        {
          message: "Nie znaleziono wyprawy.",
        },
        {
          status: 404,
        }
      ),
      trip: null,
      user,
      isOwner: false,
      canEdit: false,
    };
  }

  const isOwner = trip.userId === user.id;
  const member = trip.members[0] ?? null;
  const hasAccess = isOwner || Boolean(member);

  if (!hasAccess) {
    return {
      error: NextResponse.json(
        {
          message: "Nie masz dostępu do tej wyprawy.",
        },
        {
          status: 403,
        }
      ),
      trip: null,
      user,
      isOwner: false,
      canEdit: false,
    };
  }

  const canEdit = isOwner || EDITOR_ROLES.has(member?.role ?? "");

  return {
    error: null,
    trip,
    user,
    isOwner,
    canEdit,
  };
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const access = await getTripAccess(id);

    if (access.error) {
      return access.error;
    }

    if (!access.trip || !access.user) {
      return NextResponse.json(
        {
          message: "Nie udało się sprawdzić dostępu do wyprawy.",
        },
        {
          status: 500,
        }
      );
    }

    if (!access.canEdit) {
      return NextResponse.json(
        {
          message:
            "Nie masz uprawnień do edycji tej wyprawy. Właściciel musi nadać Ci rolę edytora.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          message: "Nieprawidłowe dane wyprawy.",
        },
        {
          status: 400,
        }
      );
    }

    const payload = body as Record<string, unknown>;

    const title = String(payload.title ?? "").trim();
    const lakeId = String(payload.lakeId ?? "").trim() || null;
    const tripType = String(payload.tripType ?? "custom").trim();
    const status = String(payload.status ?? "planned").trim();
    const startsAtValue = String(payload.startsAt ?? "").trim();
    const endsAtValue = String(payload.endsAt ?? "").trim();
    const note = String(payload.note ?? "").trim();
    const peopleCount = Number(payload.peopleCount ?? 1);

    const shouldCreateChecklist =
      payload.createChecklist === true || payload.createChecklist === "true";

    if (title.length < 3 || title.length > 120) {
      return NextResponse.json(
        {
          message: "Tytuł wyprawy musi mieć od 3 do 120 znaków.",
        },
        {
          status: 400,
        }
      );
    }

    if (!ALLOWED_TRIP_TYPES.has(tripType)) {
      return NextResponse.json(
        {
          message: "Wybrano nieprawidłowy typ wyprawy.",
        },
        {
          status: 400,
        }
      );
    }

    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json(
        {
          message: "Wybrano nieprawidłowy status wyprawy.",
        },
        {
          status: 400,
        }
      );
    }

    if (!startsAtValue) {
      return NextResponse.json(
        {
          message: "Data rozpoczęcia wyprawy jest wymagana.",
        },
        {
          status: 400,
        }
      );
    }

    const startsAt = new Date(startsAtValue);

    if (Number.isNaN(startsAt.getTime())) {
      return NextResponse.json(
        {
          message: "Data rozpoczęcia wyprawy jest nieprawidłowa.",
        },
        {
          status: 400,
        }
      );
    }

    let endsAt: Date | null = null;

    if (endsAtValue) {
      endsAt = new Date(endsAtValue);

      if (Number.isNaN(endsAt.getTime())) {
        return NextResponse.json(
          {
            message: "Data zakończenia wyprawy jest nieprawidłowa.",
          },
          {
            status: 400,
          }
        );
      }

      if (endsAt <= startsAt) {
        return NextResponse.json(
          {
            message:
              "Data zakończenia musi przypadać po rozpoczęciu wyprawy.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (
      !Number.isInteger(peopleCount) ||
      peopleCount < 1 ||
      peopleCount > 100
    ) {
      return NextResponse.json(
        {
          message: "Liczba osób musi być liczbą całkowitą od 1 do 100.",
        },
        {
          status: 400,
        }
      );
    }

    if (note.length > 2000) {
      return NextResponse.json(
        {
          message: "Notatka może mieć maksymalnie 2000 znaków.",
        },
        {
          status: 400,
        }
      );
    }

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
            status: 404,
          }
        );
      }

      lakeName = lake.name;
    }

    const actorName = getUserDisplayName(access.user);

    const updatedTrip = await prisma.$transaction(async (transaction) => {
      let checklistId = access.trip?.checklistId ?? null;

      if (shouldCreateChecklist && !checklistId) {
        const checklist = await transaction.tripChecklist.create({
          data: {
            userId: access.trip!.userId,
            title: `Checklista — ${title}`,
            tripType,
            status: "preparing",
            note: lakeName
              ? `Wyprawa na łowisko: ${lakeName}`
              : "Checklista utworzona dla wyprawy.",
          },
          select: {
            id: true,
          },
        });

        checklistId = checklist.id;
      }

      if (
        checklistId &&
        access.trip?.checklist?.title.startsWith("Checklista —")
      ) {
        await transaction.tripChecklist.update({
          where: {
            id: checklistId,
          },
          data: {
            title: `Checklista — ${title}`,
            tripType,
          },
        });
      }

      const completedAt =
        status === "finished"
          ? access.trip?.completedAt ?? new Date()
          : null;

      const trip = await transaction.fishingTrip.update({
        where: {
          id,
        },
        data: {
          title,
          lakeId,
          lakeName,
          tripType,
          status,
          startsAt,
          endsAt,
          peopleCount,
          note: note || null,
          checklistId,
          completedAt,
        },
        select: {
          id: true,
          userId: true,
          title: true,
          lakeId: true,
          lakeName: true,
          tripType: true,
          status: true,
          startsAt: true,
          endsAt: true,
          peopleCount: true,
          note: true,
          checklistId: true,
          completedAt: true,
          updatedAt: true,
        },
      });

      await transaction.tripActivity.create({
        data: {
          tripId: id,
          actorUserId: access.user!.id,
          actorName,
          action: "trip_updated",
          metadata: {
            title,
            lakeId,
            lakeName,
            tripType,
            status,
            startsAt: startsAt.toISOString(),
            endsAt: endsAt?.toISOString() ?? null,
            peopleCount,
          },
        },
      });

      return trip;
    });

    return NextResponse.json({
      message: "Wyprawa została zaktualizowana.",
      trip: updatedTrip,
    });
  } catch (error) {
    console.error("[trips/[id]/PUT] Nie udało się zaktualizować wyprawy:", error);

    return NextResponse.json(
      {
        message: "Nie udało się zaktualizować wyprawy.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const access = await getTripAccess(id);

    if (access.error) {
      return access.error;
    }

    if (!access.trip || !access.user) {
      return NextResponse.json(
        {
          message: "Nie udało się sprawdzić dostępu do wyprawy.",
        },
        {
          status: 500,
        }
      );
    }

    if (!access.isOwner) {
      return NextResponse.json(
        {
          message: "Tylko właściciel może usunąć całą wyprawę.",
        },
        {
          status: 403,
        }
      );
    }

    const tripForDeletion = await prisma.fishingTrip.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        checklistId: true,
        members: {
          where: {
            status: "accepted",
          },
          select: {
            userId: true,
          },
        },
      },
    });

    if (!tripForDeletion) {
      return NextResponse.json(
        {
          message: "Nie znaleziono wyprawy.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.$transaction(async (transaction) => {
      const participantIds = Array.from(
        new Set(
          tripForDeletion.members
            .map((member) => member.userId)
            .filter((userId) => userId !== access.user!.id)
        )
      );

      if (participantIds.length > 0) {
        await transaction.userNotification.createMany({
          data: participantIds.map((userId) => ({
            userId,
            title: "Współdzielona wyprawa została usunięta",
            message: `Właściciel usunął wyprawę „${tripForDeletion.title}”.`,
            href: "/wyprawy",
            type: "trip_deleted",
          })),
        });
      }

      await transaction.fishingTrip.delete({
        where: {
          id,
        },
      });

      if (tripForDeletion.checklistId) {
        const remainingTrips = await transaction.fishingTrip.count({
          where: {
            checklistId: tripForDeletion.checklistId,
          },
        });

        if (remainingTrips === 0) {
          await transaction.tripChecklist.delete({
            where: {
              id: tripForDeletion.checklistId,
            },
          });
        }
      }
    });

    return NextResponse.json({
      message: "Wyprawa została usunięta.",
    });
  } catch (error) {
    console.error("[trips/[id]/DELETE] Nie udało się usunąć wyprawy:", error);

    return NextResponse.json(
      {
        message: "Nie udało się usunąć wyprawy.",
      },
      {
        status: 500,
      }
    );
  }
}