import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany, aby zgłosić poprawkę." },
      { status: 401 }
    );
  }

  const { slug } = await params;
  const body = await request.json();

  const category = String(body.category || "").trim();
  const description = String(body.description || "").trim();

  if (!category || !description) {
    return NextResponse.json(
      { message: "Wybierz typ problemu i opisz poprawkę." },
      { status: 400 }
    );
  }

  if (description.length < 10) {
    return NextResponse.json(
      { message: "Opis poprawki powinien mieć minimum 10 znaków." },
      { status: 400 }
    );
  }

  const lake = await prisma.lake.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!lake) {
    return NextResponse.json(
      { message: "Nie znaleziono łowiska." },
      { status: 404 }
    );
  }

  const report = await prisma.lakeCorrectionReport.create({
    data: {
      lakeId: lake.id,
      userId: user.id,
      userEmail: user.email || null,
      category,
      description,
      status: "pending",
    },
  });

  return NextResponse.json(
    {
      message: "Zgłoszenie poprawki zostało wysłane do administratora.",
      report,
    },
    { status: 201 }
  );
}