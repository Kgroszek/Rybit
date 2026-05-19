import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    reportId: string;
  }>;
};

function getAdminEmails() {
  const singleAdminEmail = process.env.ADMIN_EMAIL ?? "";
  const multipleAdminEmails = process.env.ADMIN_EMAILS ?? "";

  return [singleAdminEmail, multipleAdminEmails]
    .join(",")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminUser(user: {
  email?: string;
  app_metadata?: {
    role?: string;
  };
  user_metadata?: {
    role?: string;
  };
}) {
  const adminEmails = getAdminEmails();
  const userEmail = user.email?.trim().toLowerCase() ?? "";

  return (
    user.app_metadata?.role === "admin" ||
    user.user_metadata?.role === "admin" ||
    adminEmails.includes(userEmail)
  );
}

export async function PATCH(request: Request, { params }: RouteProps) {
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

  if (!isAdminUser(user)) {
    return NextResponse.json(
      { message: "Brak uprawnień administratora." },
      { status: 403 }
    );
  }

  const { reportId } = await params;
  const body = await request.json().catch(() => null);

  const action = String(body?.action || "").trim();
  const adminNote = String(body?.adminNote || "").trim();

  if (!["dismiss", "hide"].includes(action)) {
    return NextResponse.json(
      { message: "Nieprawidłowa akcja." },
      { status: 400 }
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
      { message: "Nie znaleziono zgłoszenia." },
      { status: 404 }
    );
  }

  if (report.status !== "pending") {
    return NextResponse.json(
      { message: "To zgłoszenie zostało już obsłużone." },
      { status: 400 }
    );
  }

  if (action === "dismiss") {
    const updatedReport = await prisma.fishingCatchReport.update({
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

  const [updatedReport, updatedCatch] = await prisma.$transaction([
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

  await prisma.userNotification.create({
    data: {
      userId: report.fishingCatch.userId,
      title: "Twój połów został ukryty z rankingu",
      message: `Połów ${report.fishingCatch.fishName} został ukryty po weryfikacji zgłoszenia.`,
      href: "/polowy",
      type: "catch_report",
    },
  });

  await prisma.userNotification.create({
    data: {
      userId: report.userId,
      title: "Twoje zgłoszenie zostało zaakceptowane",
      message: `Połów ${report.fishingCatch.fishName} został ukryty z rankingu.`,
      href: "/powiadomienia",
      type: "catch_report",
    },
  });

  return NextResponse.json({
    message: "Połów został ukryty z rankingu.",
    report: updatedReport,
    fishingCatch: updatedCatch,
  });
}