import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

  const checklists = await prisma.tripChecklist.findMany({
    where: {
      userId: user.id,
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(checklists);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany, aby utworzyć checklistę." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const title = String(body.title || "").trim();

  if (!title) {
    return NextResponse.json(
      { message: "Nazwa checklisty jest wymagana." },
      { status: 400 }
    );
  }

  const checklist = await prisma.tripChecklist.create({
    data: {
      userId: user.id,
      title,
      tripType: body.tripType || "custom",
      note: body.note || null,
    },
    include: {
      items: true,
    },
  });

  return NextResponse.json(checklist, { status: 201 });
}