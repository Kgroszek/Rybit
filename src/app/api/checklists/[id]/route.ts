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

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params;

  const result = await getUserChecklist(id);

  if (result.error) {
    return result.error;
  }

  const body = await request.json();

  const checklist = await prisma.tripChecklist.update({
    where: {
      id,
    },
    data: {
      title: body.title,
      tripType: body.tripType,
      status: body.status,
      note: body.note,
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return NextResponse.json(checklist);
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const { id } = await params;

  const result = await getUserChecklist(id);

  if (result.error) {
    return result.error;
  }

  await prisma.tripChecklist.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    message: "Checklista została usunięta.",
  });
}