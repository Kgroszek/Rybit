import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { message: "Brak uprawnień administratora." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const adminNote = String(body?.adminNote || "").trim();

  const submission = await prisma.lakeSubmission.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
      name: true,
      status: true,
    },
  });

  if (!submission) {
    return NextResponse.json(
      { message: "Nie znaleziono zgłoszenia." },
      { status: 404 }
    );
  }

  if (submission.status !== "pending") {
    return NextResponse.json(
      { message: "To zgłoszenie zostało już obsłużone." },
      { status: 400 }
    );
  }

  await prisma.lakeSubmission.update({
    where: {
      id,
    },
    data: {
      status: "rejected",
      adminNote: adminNote || null,
    },
  });

  if (submission.userId) {
    await prisma.userNotification.create({
      data: {
        userId: submission.userId,
        title: "Zgłoszenie łowiska zostało odrzucone",
        message:
          adminNote ||
          `Twoje zgłoszenie łowiska „${submission.name}” zostało odrzucone przez administratora.`,
        href: `/moje-zgloszenia-lowisk/${submission.id}`,
        type: "lake_submission_rejected",
        isRead: false,
      },
    });
  }

  return NextResponse.json({
    message: "Zgłoszenie zostało odrzucone.",
  });
}