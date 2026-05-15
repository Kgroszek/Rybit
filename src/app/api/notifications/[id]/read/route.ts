import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(_request: Request, { params }: RouteProps) {
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

  const { id } = await params;

  const notification = await prisma.userNotification.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!notification) {
    return NextResponse.json(
      { message: "Nie znaleziono powiadomienia." },
      { status: 404 }
    );
  }

  const updatedNotification = await prisma.userNotification.update({
    where: {
      id,
    },
    data: {
      isRead: true,
    },
  });

  return NextResponse.json({
    message: "Powiadomienie zostało oznaczone jako przeczytane.",
    notification: updatedNotification,
  });
}