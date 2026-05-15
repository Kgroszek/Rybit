import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      count: 0,
    });
  }

  const count = await prisma.userNotification.count({
    where: {
      userId: user.id,
      isRead: false,
    },
  });

  return NextResponse.json({
    count,
  });
}