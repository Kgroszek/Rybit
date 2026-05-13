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

  const submission = await prisma.lakeSubmission.findUnique({
    where: {
      id,
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
      adminNote: body?.adminNote || null,
    },
  });

  return NextResponse.json({
    message: "Zgłoszenie zostało odrzucone.",
  });
}