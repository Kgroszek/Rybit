import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth";

type RouteProps = {
  params: Promise<{
    reportId: string;
  }>;
};

const ALLOWED_ACTIONS = ["dismiss", "hide"] as const;

type AdminAction = (typeof ALLOWED_ACTIONS)[number];

function isAdminAction(value: string): value is AdminAction {
  return ALLOWED_ACTIONS.includes(value as AdminAction);
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

  const { reportId } = await params;

  if (!reportId) {
    return NextResponse.json(
      {
        message: "Brakuje identyfikatora zgłoszenia.",
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

  const adminNote = String(
    (body as { adminNote?: unknown }).adminNote ?? ""
  ).trim();

  if (!isAdminAction(action)) {
    return NextResponse.json(
      {
        message: "Nieprawidłowa akcja.",
      },
      {
        status: 400,
      }
    );
  }

  if (adminNote.length > 2000) {
    return NextResponse.json(
      {
        message:
          "Notatka administratora może mieć maksymalnie 2000 znaków.",
      },
      {
        status: 400,
      }
    );
  }

  const report = await prisma.fishingCatchReport.findUnique({
    where: {
      id: reportId,
    },
    include: {
      fishingCatch: true,
    },
  });

  if (!report) {
    return NextResponse.json(
      {
        message: "Nie znaleziono zgłoszenia.",
      },
      {
        status: 404,
      }
    );
  }

  if (report.status !== "pending") {
    return NextResponse.json(
      {
        message: "To zgłoszenie zostało już obsłużone.",
      },
      {
        status: 409,
      }
    );
  }

  if (action === "dismiss") {
    const updatedReport =
      await prisma.fishingCatchReport.update({
        where: {
          id: reportId,
        },
        data: {
          status: "rejected",
          adminNote: adminNote || null,
        },
        include: {
          fishingCatch: true,
        },
      });

    await prisma.userNotification.create({
      data: {
        userId: report.userId,
        title: "Zgłoszenie połowu zostało odrzucone",
        message: `Administrator sprawdził zgłoszenie połowu: ${report.fishingCatch.fishName}.`,
        href: "/powiadomienia",
        type: "catch_report",
      },
    });

    return NextResponse.json({
      message: "Zgłoszenie zostało odrzucone.",
      report: updatedReport,
    });
  }

  const [updatedReport, updatedCatch] =
    await prisma.$transaction([
      prisma.fishingCatchReport.update({
        where: {
          id: reportId,
        },
        data: {
          status: "accepted",
          adminNote: adminNote || null,
        },
        include: {
          fishingCatch: true,
        },
      }),

      prisma.fishingCatch.update({
        where: {
          id: report.catchId,
        },
        data: {
          isPublic: false,
          rankingStatus: "hidden",
        },
      }),
    ]);

  await prisma.userNotification.createMany({
    data: [
      {
        userId: report.fishingCatch.userId,
        title: "Twój połów został ukryty z rankingu",
        message: `Połów ${report.fishingCatch.fishName} został ukryty po weryfikacji zgłoszenia.`,
        href: "/polowy",
        type: "catch_report",
      },
      {
        userId: report.userId,
        title: "Twoje zgłoszenie zostało zaakceptowane",
        message: `Połów ${report.fishingCatch.fishName} został ukryty z rankingu.`,
        href: "/powiadomienia",
        type: "catch_report",
      },
    ],
  });

  return NextResponse.json({
    message: "Połów został ukryty z rankingu.",
    report: updatedReport,
    fishingCatch: updatedCatch,
  });
}