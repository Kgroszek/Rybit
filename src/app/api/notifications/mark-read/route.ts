import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
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

  const body = await request.json().catch(() => null);

  const notificationIds = Array.isArray(body?.notificationIds)
    ? body.notificationIds.filter((id: unknown) => typeof id === "string")
    : [];

  if (notificationIds.length === 0) {
    return NextResponse.json(
      { message: "Nie wybrano żadnych powiadomień." },
      { status: 400 }
    );
  }

  await prisma.userNotification.updateMany({
    where: {
      id: {
        in: notificationIds,
      },
      userId: user.id,
    },
    data: {
      isRead: true,
    },
  });

  return NextResponse.json({
    message: "Powiadomienia zostały oznaczone jako przeczytane.",
  });
}