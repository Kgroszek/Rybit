import { NextResponse } from "next/server";

import { FISHING_GEAR_SELECT } from "@/lib/gear/gear-select";
import {
  parseFishingGearInput,
} from "@/lib/gear/gear-validation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user =
    await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        message:
          "Musisz być zalogowany.",
      },
      {
        status: 401,
      }
    );
  }

  const gear =
    await prisma.fishingGear.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: FISHING_GEAR_SELECT,
    });

  return NextResponse.json(gear);
}

export async function POST(
  request: Request
) {
  const user =
    await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        message:
          "Musisz być zalogowany, aby dodać sprzęt.",
      },
      {
        status: 401,
      }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        message:
          "Nieprawidłowy format danych.",
      },
      {
        status: 400,
      }
    );
  }

  const parsed =
    parseFishingGearInput(body);

  if (!parsed.ok) {
    return NextResponse.json(
      {
        message: parsed.message,
      },
      {
        status: 400,
      }
    );
  }

  const gear =
    await prisma.fishingGear.create({
      data: {
        userId: user.id,
        ...parsed.data,
      },
      select: FISHING_GEAR_SELECT,
    });

  return NextResponse.json(
    gear,
    {
      status: 201,
    }
  );
}

async function getCurrentUser() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
