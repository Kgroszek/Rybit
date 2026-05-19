import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany, aby zgłosić połów." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);

  const reason = String(body?.reason || "").trim();

  if (!reason) {
    return NextResponse.json(
      { message: "Uzasadnienie zgłoszenia jest wymagane." },
      { status: 400 }
    );
  }

  if (reason.length < 10) {
    return NextResponse.json(
      { message: "Uzasadnienie powinno mieć minimum 10 znaków." },
      { status: 400 }
    );
  }

  const fishingCatch = await prisma.fishingCatch.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
      isPublic: true,
      rankingStatus: true,
    },
  });

  if (!fishingCatch) {
    return NextResponse.json(
      { message: "Nie znaleziono połowu." },
      { status: 404 }
    );
  }

  if (!fishingCatch.isPublic) {
    return NextResponse.json(
      { message: "Można zgłaszać tylko publiczne połowy." },
      { status: 400 }
    );
  }

  if (fishingCatch.rankingStatus === "hidden") {
    return NextResponse.json(
      { message: "Ten połów jest już ukryty w rankingu." },
      { status: 400 }
    );
  }

  if (fishingCatch.userId === user.id) {
    return NextResponse.json(
      { message: "Nie możesz zgłosić własnego połowu." },
      { status: 400 }
    );
  }

  const existingReport = await prisma.fishingCatchReport.findUnique({
    where: {
      catchId_userId: {
        catchId: id,
        userId: user.id,
      },
    },
  });

  if (existingReport) {
    return NextResponse.json(
      { message: "Już zgłosiłeś ten połów." },
      { status: 409 }
    );
  }

  const report = await prisma.fishingCatchReport.create({
    data: {
      catchId: id,
      userId: user.id,
      userEmail: user.email,
      reason,
      status: "pending",
    },
  });

  return NextResponse.json(
    {
      message: "Zgłoszenie zostało wysłane do administratora.",
      report,
    },
    { status: 201 }
  );
}