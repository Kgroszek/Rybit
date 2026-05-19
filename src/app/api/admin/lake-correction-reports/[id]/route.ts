import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    id: string;
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

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const status = String(body?.status || "").trim();
  const adminNote = String(body?.adminNote || "").trim();

  if (!["resolved", "rejected"].includes(status)) {
    return NextResponse.json(
      { message: "Nieprawidłowy status zgłoszenia." },
      { status: 400 }
    );
  }

  const existingReport = await prisma.lakeCorrectionReport.findUnique({
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
      { message: "Nie znaleziono zgłoszenia poprawki." },
      { status: 404 }
    );
  }

  if (existingReport.status !== "pending") {
    return NextResponse.json(
      { message: "To zgłoszenie zostało już obsłużone." },
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
    include: {
      lake: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  await prisma.userNotification.create({
    data: {
      userId: existingReport.userId,
      title:
        status === "resolved"
          ? "Twoja poprawka łowiska została rozpatrzona"
          : "Twoja poprawka łowiska została odrzucona",
      message:
        status === "resolved"
          ? `Administrator rozpatrzył Twoją poprawkę dotyczącą łowiska: ${existingReport.lake.name}.`
          : `Administrator odrzucił Twoją poprawkę dotyczącą łowiska: ${existingReport.lake.name}.`,
      href: `/lowiska/${existingReport.lake.slug}`,
      type: "lake_correction_report",
    },
  });

  return NextResponse.json({
    message:
      status === "resolved"
        ? "Zgłoszenie poprawki zostało oznaczone jako rozwiązane."
        : "Zgłoszenie poprawki zostało odrzucone.",
    report,
  });
}