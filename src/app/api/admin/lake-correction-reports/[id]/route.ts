import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type RouteProps = {
  params: Promise<{
    id: string;
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

  const { id } = await params;
  const body = await request.json();

  const status = String(body.status || "").trim();
  const adminNote = String(body.adminNote || "").trim();

  if (!["resolved", "rejected"].includes(status)) {
    return NextResponse.json(
      { message: "Nieprawidłowy status zgłoszenia." },
      { status: 400 }
    );
  }

  const report = await prisma.lakeCorrectionReport.update({
    where: {
      id,
    },
    data: {
      status,
      adminNote: adminNote || null,
    },
  });

  return NextResponse.json({
    message: "Status zgłoszenia został zaktualizowany.",
    report,
  });
}