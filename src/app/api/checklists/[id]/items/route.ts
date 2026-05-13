import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getUserChecklist(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { message: "Musisz być zalogowany." },
        { status: 401 }
      ),
      checklist: null,
      user: null,
    };
  }

  const checklist = await prisma.tripChecklist.findUnique({
    where: {
      id,
    },
  });

  if (!checklist) {
    return {
      error: NextResponse.json(
        { message: "Nie znaleziono checklisty." },
        { status: 404 }
      ),
      checklist: null,
      user,
    };
  }

  if (checklist.userId !== user.id) {
    return {
      error: NextResponse.json(
        { message: "Nie masz dostępu do tej checklisty." },
        { status: 403 }
      ),
      checklist: null,
      user,
    };
  }

  return {
    error: null,
    checklist,
    user,
  };
}

export async function POST(request: Request, { params }: RouteProps) {
  const { id } = await params;

  const result = await getUserChecklist(id);

  if (result.error) {
    return result.error;
  }

  const body = await request.json();

  const name = String(body.name || "").trim();

  if (!name) {
    return NextResponse.json(
      { message: "Nazwa elementu jest wymagana." },
      { status: 400 }
    );
  }

  const quantity =
    body.quantity !== undefined && body.quantity !== ""
      ? Number(body.quantity)
      : 1;

  if (!Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json(
      { message: "Ilość musi być liczbą całkowitą większą od 0." },
      { status: 400 }
    );
  }

  const item = await prisma.tripChecklistItem.create({
    data: {
      checklistId: id,
      name,
      category: body.category || "other",
      quantity,
      unit: body.unit || null,
      isImportant: Boolean(body.isImportant),
      source: body.source || "manual",
      gearId: body.gearId || null,
      note: body.note || null,
    },
  });

  return NextResponse.json(item, { status: 201 });
}