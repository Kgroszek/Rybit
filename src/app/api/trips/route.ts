import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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

function calculatePercent(completed: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

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

async function getTripWithRelations(tripId: string) {
  return prisma.fishingTrip.findUnique({
    where: {
      id: tripId,
    },
    include: {
      lake: {
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          voivodeship: true,
          lat: true,
          lng: true,
          images: {
            orderBy: {
              sortOrder: "asc",
            },
            take: 1,
            select: {
              url: true,
            },
          },
        },
      },
      checklist: {
        select: {
          id: true,
          title: true,
          status: true,
          items: {
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
              name: true,
              category: true,
              quantity: true,
              unit: true,
              isPacked: true,
              isImportant: true,
              source: true,
              gearId: true,
              note: true,
            },
          },
        },
      },
      members: {
        where: {
          status: {
            in: ["pending", "accepted"],
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          userId: true,
          userName: true,
          userEmail: true,
          role: true,
          status: true,
          invitedByUserId: true,
          acceptedAt: true,
          createdAt: true,
        },
      },
      gearItems: {
        select: {
          id: true,
          isRequired: true,
          isPacked: true,
        },
      },
      _count: {
        select: {
          notes: true,
          costs: true,
          media: true,
          catches: true,
          reminders: true,
        },
      },
    },
  });
}

function prepareTrip<
  T extends NonNullable<Awaited<ReturnType<typeof getTripWithRelations>>>,
>(trip: T, currentUserId: string) {
  const currentMember = trip.members.find(
    (member) =>
      member.userId === currentUserId && member.status === "accepted"
  );

  const checklistItems = trip.checklist?.items ?? [];
  const packedChecklistItems = checklistItems.filter(
    (item) => item.isPacked
  ).length;

  const requiredChecklistItems = checklistItems.filter(
    (item) => item.isImportant
  );
  const packedRequiredChecklistItems = requiredChecklistItems.filter(
    (item) => item.isPacked
  ).length;

  const requiredGearItems = trip.gearItems.filter(
    (item) => item.isRequired
  );
  const packedRequiredGearItems = requiredGearItems.filter(
    (item) => item.isPacked
  ).length;

  const acceptedMembersCount = trip.members.filter(
    (member) => member.status === "accepted"
  ).length;

  const pendingMembersCount = trip.members.filter(
    (member) => member.status === "pending"
  ).length;

  const checklistProgress = calculatePercent(
    packedChecklistItems,
    checklistItems.length
  );

  const requiredChecklistProgress = calculatePercent(
    packedRequiredChecklistItems,
    requiredChecklistItems.length
  );

  const requiredGearProgress = calculatePercent(
    packedRequiredGearItems,
    requiredGearItems.length
  );

  const detailsChecks = [
    Boolean(trip.title.trim()),
    Boolean(trip.startsAt),
    Boolean(trip.endsAt),
    Boolean(trip.lakeId || trip.lakeName?.trim()),
  ];

  const detailsProgress = calculatePercent(
    detailsChecks.filter(Boolean).length,
    detailsChecks.length
  );

  const progressParts = [detailsProgress];
  if (checklistItems.length > 0) progressParts.push(checklistProgress);
  if (requiredGearItems.length > 0) progressParts.push(requiredGearProgress);

  const preparationProgress = Math.round(
    progressParts.reduce((sum, value) => sum + value, 0) / progressParts.length
  );

  return {
    ...trip,
    lakeImage: trip.lake?.images[0]?.url ?? null,
    isOwner: trip.userId === currentUserId,
    accessRole:
      trip.userId === currentUserId
        ? "owner"
        : currentMember?.role ?? "viewer",
    canEdit:
      trip.userId === currentUserId ||
      currentMember?.role === "editor" ||
      currentMember?.role === "co_owner",
    canManageMembers: trip.userId === currentUserId,
    canDelete: trip.userId === currentUserId,
    acceptedMembersCount,
    pendingMembersCount,
    participantsCount: Math.max(
      trip.peopleCount,
      acceptedMembersCount + 1
    ),
    checklistItemsCount: checklistItems.length,
    packedChecklistItemsCount: packedChecklistItems,
    requiredChecklistItemsCount: requiredChecklistItems.length,
    packedRequiredChecklistItemsCount: packedRequiredChecklistItems,
    requiredGearItemsCount: requiredGearItems.length,
    packedRequiredGearItemsCount: packedRequiredGearItems,
    checklistProgress,
    requiredChecklistProgress,
    requiredGearProgress,
    detailsProgress,
    preparationProgress,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          message: "Musisz być zalogowany.",
        },
        {
          status: 401,
        }
      );
    }

    const trips = await prisma.fishingTrip.findMany({
      where: {
        OR: [
          {
            userId: user.id,
          },
          {
            members: {
              some: {
                userId: user.id,
                status: "accepted",
              },
            },
          },
        ],
      },
      orderBy: [
        {
          startsAt: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      include: {
        lake: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            voivodeship: true,
            lat: true,
            lng: true,
            images: {
              orderBy: {
                sortOrder: "asc",
              },
              take: 1,
              select: {
                url: true,
              },
            },
          },
        },
        checklist: {
          select: {
            id: true,
            title: true,
            status: true,
            items: {
              orderBy: {
                createdAt: "asc",
              },
              select: {
                id: true,
                name: true,
                category: true,
                quantity: true,
                unit: true,
                isPacked: true,
                isImportant: true,
                source: true,
                gearId: true,
                note: true,
              },
            },
          },
        },
        members: {
          where: {
            status: {
              in: ["pending", "accepted"],
            },
          },
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            userId: true,
            userName: true,
            userEmail: true,
            role: true,
            status: true,
            invitedByUserId: true,
            acceptedAt: true,
            createdAt: true,
          },
        },
        gearItems: {
          select: {
            id: true,
            isRequired: true,
            isPacked: true,
          },
        },
        _count: {
          select: {
            notes: true,
            costs: true,
            media: true,
            catches: true,
            reminders: true,
          },
        },
      },
    });

    return NextResponse.json(
      trips.map((trip) => prepareTrip(trip, user.id))
    );
  } catch (error) {
    console.error("[trips/GET] Nie udało się pobrać wypraw:", error);

    return NextResponse.json(
      {
        message: "Nie udało się pobrać wypraw.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          message: "Musisz być zalogowany, aby dodać wyprawę.",
        },
        {
          status: 401,
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
    const createChecklist = Boolean(payload.createChecklist);

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

    const userName = getUserDisplayName(user);

    const createdTripId = await prisma.$transaction(
      async (transaction) => {
        let checklistId: string | null = null;

        if (createChecklist) {
          const checklist = await transaction.tripChecklist.create({
            data: {
              userId: user.id,
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

        const trip = await transaction.fishingTrip.create({
          data: {
            userId: user.id,
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
            activities: {
              create: {
                actorUserId: user.id,
                actorName: userName,
                action: "trip_created",
                metadata: {
                  title,
                  lakeId,
                  lakeName,
                  tripType,
                  status,
                },
              },
            },
          },
          select: {
            id: true,
          },
        });

        return trip.id;
      }
    );

    const trip = await getTripWithRelations(createdTripId);

    if (!trip) {
      return NextResponse.json(
        {
          message:
            "Wyprawa została utworzona, ale nie udało się pobrać jej danych.",
        },
        {
          status: 201,
        }
      );
    }

    return NextResponse.json(
      prepareTrip(trip, user.id),
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("[trips/POST] Nie udało się utworzyć wyprawy:", error);

    return NextResponse.json(
      {
        message: "Nie udało się utworzyć wyprawy.",
      },
      {
        status: 500,
      }
    );
  }
}
