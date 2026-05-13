import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    itemId: string;
  }>;
};

async function getUserChecklistItem(itemId: string) {
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
      item: null,
      user: null,
    };
  }

  const item = await prisma.tripChecklistItem.findUnique({
    where: {
      id: itemId,
    },
    include: {
      checklist: true,
    },
  });

  if (!item) {
    return {
      error: NextResponse.json(
        { message: "Nie znaleziono elementu checklisty." },
        { status: 404 }
      ),
      item: null,
      user,
    };
  }

  if (item.checklist.userId !== user.id) {
    return {
      error: NextResponse.json(
        { message: "Nie masz dostępu do tego elementu." },
        { status: 403 }
      ),
      item: null,
      user,
    };
  }

  return {
    error: null,
    item,
    user,
  };
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const { itemId } = await params;

  const result = await getUserChecklistItem(itemId);

  if (result.error) {
    return result.error;
  }

  const body = await request.json();

  const item = await prisma.tripChecklistItem.update({
    where: {
      id: itemId,
    },
    data: {
      name: body.name,
      category: body.category,
      quantity: body.quantity,
      unit: body.unit,
      isPacked: body.isPacked,
      isImportant: body.isImportant,
      note: body.note,
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const { itemId } = await params;

  const result = await getUserChecklistItem(itemId);

  if (result.error) {
    return result.error;
  }

  await prisma.tripChecklistItem.delete({
    where: {
      id: itemId,
    },
  });

  return NextResponse.json({
    message: "Element został usunięty.",
  });
}