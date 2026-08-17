import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { count: 0 },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    const count = await prisma.userNotification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    return NextResponse.json(
      { count },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "[notifications/unread-count] Nie udało się pobrać licznika:",
      error
    );

    return NextResponse.json(
      { count: 0 },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}