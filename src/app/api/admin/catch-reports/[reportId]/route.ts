import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type RouteProps = {
  params: Promise<{
    reportId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteProps) {
  const admin = await requireAdmin();

  if (!admin) {
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

    return NextResponse.json(updatedReport);
  }

  const [updatedReport] = await prisma.$transaction([
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
        rankingStatus: "rejected",
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

  return NextResponse.json(updatedReport);
}