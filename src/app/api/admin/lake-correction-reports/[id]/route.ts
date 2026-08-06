import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const ALLOWED_STATUSES = ["resolved", "rejected"] as const;

type CorrectionReportStatus = (typeof ALLOWED_STATUSES)[number];

function isCorrectionReportStatus(
  value: string
): value is CorrectionReportStatus {
  return ALLOWED_STATUSES.includes(
    value as CorrectionReportStatus
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

  const { id } = await params;

  if (!id) {
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

  const status = String(
    (body as { status?: unknown }).status ?? ""
  )
    .trim()
    .toLowerCase();

  const adminNote = String(
    (body as { adminNote?: unknown }).adminNote ?? ""
  ).trim();

  if (!isCorrectionReportStatus(status)) {
    return NextResponse.json(
      {
        message: "Nieprawidłowy status zgłoszenia.",
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

  const existingReport =
    await prisma.lakeCorrectionReport.findUnique({
      where: {
        id,
      },
      include: {
        lake: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

  if (!existingReport) {
    return NextResponse.json(
      {
        message: "Nie znaleziono zgłoszenia poprawki.",
      },
      {
        status: 404,
      }
    );
  }

  if (existingReport.status !== "pending") {
    return NextResponse.json(
      {
        message: "To zgłoszenie zostało już obsłużone.",
      },
      {
        status: 409,
      }
    );
  }

  const notificationTitle =
    status === "resolved"
      ? "Twoja poprawka łowiska została rozpatrzona"
      : "Twoja poprawka łowiska została odrzucona";

  const notificationMessage =
    status === "resolved"
      ? `Administrator rozpatrzył Twoją poprawkę dotyczącą łowiska: ${existingReport.lake.name}.`
      : `Administrator odrzucił Twoją poprawkę dotyczącą łowiska: ${existingReport.lake.name}.`;

  const [report] = await prisma.$transaction([
    prisma.lakeCorrectionReport.update({
      where: {
        id,
      },
      data: {
        status,
        adminNote: adminNote || null,
      },
      include: {
        lake: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),

    prisma.userNotification.create({
      data: {
        userId: existingReport.userId,
        title: notificationTitle,
        message: notificationMessage,
        href: `/lowiska/${existingReport.lake.slug}`,
        type: "lake_correction_report",
      },
    }),
  ]);

  return NextResponse.json({
    message:
      status === "resolved"
        ? "Zgłoszenie poprawki zostało oznaczone jako rozwiązane."
        : "Zgłoszenie poprawki zostało odrzucone.",
    report,
  });
}