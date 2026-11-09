import { NextResponse } from "next/server";

import { FISHING_GEAR_SELECT } from "@/lib/gear/gear-select";
import {
  parseFishingGearInput,
} from "@/lib/gear/gear-validation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  {
    params,
  }: RouteProps
) {
  const { id } = await params;

  const access =
    await getGearAccess(id);

  if (access.error) {
    return access.error;
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

  const updated =
    await prisma.fishingGear.update({
      where: {
        id,
      },
      data: parsed.data,
      select: FISHING_GEAR_SELECT,
    });

  return NextResponse.json(
    updated
  );
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: RouteProps
) {
  const { id } = await params;

  const access =
    await getGearAccess(id);

  if (access.error) {
    return access.error;
  }

  await prisma.fishingGear.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    message:
      "Sprzęt został usunięty.",
  });
}

async function getGearAccess(
  id: string
) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        {
          message:
            "Musisz być zalogowany.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  const gear =
    await prisma.fishingGear.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
      },
    });

  if (!gear) {
    return {
      error: NextResponse.json(
        {
          message:
            "Nie znaleziono sprzętu.",
        },
        {
          status: 404,
        }
      ),
    };
  }

  if (gear.userId !== user.id) {
    return {
      error: NextResponse.json(
        {
          message:
            "Nie masz uprawnień do tego sprzętu.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    error: null,
  };
}
