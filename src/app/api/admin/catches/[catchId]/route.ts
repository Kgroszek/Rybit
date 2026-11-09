import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth";

type RouteProps = {
  params: Promise<{
    catchId: string;
  }>;
};

const ALLOWED_ACTIONS = ["approve", "reject"] as const;

type ModerationAction =
  (typeof ALLOWED_ACTIONS)[number];

class CatchModerationConflictError extends Error {}

function isModerationAction(
  value: string
): value is ModerationAction {
  return ALLOWED_ACTIONS.includes(
    value as ModerationAction
  );
}

export async function PATCH(
  request: Request,
  { params }: RouteProps
) {
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

  if (!isAdminUser(user)) {
    return NextResponse.json(
      {
        message: "Brak uprawnień administratora.",
      },
      {
        status: 403,
      }
    );
  }

  const { catchId } = await params;

  if (!catchId) {
    return NextResponse.json(
      {
        message: "Brakuje identyfikatora połowu.",
      },
      {
        status: 400,
      }
    );
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      {
        message: "Nieprawidłowe dane żądania.",
      },
      {
        status: 400,
      }
    );
  }

  const action = String(
    (body as { action?: unknown }).action ?? ""
  )
    .trim()
    .toLowerCase();

  if (!isModerationAction(action)) {
    return NextResponse.json(
      {
        message: "Nieprawidłowa akcja.",
      },
      {
        status: 400,
      }
    );
  }

  const existingCatch =
    await prisma.fishingCatch.findUnique({
      where: {
        id: catchId,
      },
      select: {
        id: true,
        userId: true,
        fishName: true,
        lakeId: true,
        imageUrl: true,
        imagePath: true,
        weight: true,
        length: true,
        isPublic: true,
        rankingStatus: true,
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

  if (
    !existingCatch.isPublic ||
    existingCatch.rankingStatus !== "pending"
  ) {
    return NextResponse.json(
      {
        message:
          "Ten połów nie oczekuje już na zatwierdzenie.",
      },
      {
        status: 409,
      }
    );
  }

  if (action === "approve") {
    if (!existingCatch.lakeId) {
      return NextResponse.json(
        {
          message:
            "Nie można zatwierdzić połowu bez wybranego łowiska.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !existingCatch.imageUrl &&
      !existingCatch.imagePath
    ) {
      return NextResponse.json(
        {
          message:
            "Nie można zatwierdzić połowu bez zdjęcia.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      existingCatch.weight === null &&
      existingCatch.length === null
    ) {
      return NextResponse.json(
        {
          message:
            "Nie można zatwierdzić połowu bez wagi lub długości.",
        },
        {
          status: 400,
        }
      );
    }
  }

  const nextRankingStatus =
    action === "approve" ? "approved" : "rejected";

  const nextIsPublic = action === "approve";

  const notificationTitle =
    action === "approve"
      ? "Twój połów został zatwierdzony"
      : "Twój połów został odrzucony";

  const notificationMessage =
    action === "approve"
      ? `Połów ${existingCatch.fishName} został zatwierdzony i dodany do rankingu łowiska.`
      : `Połów ${existingCatch.fishName} został odrzucony podczas weryfikacji i nie został dodany do rankingu.`;

  try {
    const updatedCatch = await prisma.$transaction(
      async (transaction) => {
        const updateResult =
          await transaction.fishingCatch.updateMany({
            where: {
              id: catchId,
              isPublic: true,
              rankingStatus: "pending",
            },
            data: {
              isPublic: nextIsPublic,
              rankingStatus: nextRankingStatus,
            },
          });

        if (updateResult.count === 0) {
          throw new CatchModerationConflictError();
        }

        await transaction.userNotification.create({
          data: {
            userId: existingCatch.userId,
            title: notificationTitle,
            message: notificationMessage,
            href: "/polowy",
            type: "catch_report",
          },
        });

        return transaction.fishingCatch.findUniqueOrThrow({
          where: {
            id: catchId,
          },
        });
      }
    );

    return NextResponse.json({
      message:
        action === "approve"
          ? "Połów został zatwierdzony i dodany do rankingu."
          : "Połów został odrzucony.",
      fishingCatch: updatedCatch,
    });
  } catch (error) {
    if (
      error instanceof CatchModerationConflictError
    ) {
      return NextResponse.json(
        {
          message:
            "Ten połów został już obsłużony przez innego administratora.",
        },
        {
          status: 409,
        }
      );
    }

    console.error(
      "[admin/catches] Błąd moderacji połowu:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Nie udało się zmienić statusu połowu.",
      },
      {
        status: 500,
      }
    );
  }
}