import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control":
    "private, no-store, max-age=0",
} as const;

export async function POST(
  _request: Request,
  { params }: RouteProps
) {
  try {
    const supabase =
      await createClient();

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Musisz być zalogowany, aby dodać łowisko do ulubionych.",
        },
        {
          status: 401,
          headers:
            PRIVATE_NO_STORE_HEADERS,
        }
      );
    }

    const { slug } = await params;

    /*
     * Lake + aktualny favourite pobieramy w jednym zapytaniu.
     * Wcześniej były to dwa osobne odczyty.
     */
    const lake =
      await prisma.lake.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
          favourites: {
            where: {
              userId: user.id,
            },
            select: {
              id: true,
            },
            take: 1,
          },
        },
      });

    if (!lake) {
      return NextResponse.json(
        {
          message:
            "Nie znaleziono łowiska.",
        },
        {
          status: 404,
          headers:
            PRIVATE_NO_STORE_HEADERS,
        }
      );
    }

    const existingFavourite =
      lake.favourites[0];

    if (existingFavourite) {
      await prisma.favourite.delete({
        where: {
          id:
            existingFavourite.id,
        },
      });

      return NextResponse.json(
        {
          isFavourite: false,
          message:
            "Usunięto z ulubionych.",
        },
        {
          headers:
            PRIVATE_NO_STORE_HEADERS,
        }
      );
    }

    await prisma.favourite.create({
      data: {
        userId: user.id,
        lakeId: lake.id,
      },
    });

    return NextResponse.json(
      {
        isFavourite: true,
        message:
          "Dodano do ulubionych.",
      },
      {
        headers:
          PRIVATE_NO_STORE_HEADERS,
      }
    );
  } catch (error) {
    console.error(
      "[api/lakes/[slug]/favourite]",
      error
    );

    return NextResponse.json(
      {
        message:
          "Nie udało się zmienić ulubionych.",
      },
      {
        status: 500,
        headers:
          PRIVATE_NO_STORE_HEADERS,
      }
    );
  }
}
