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

export async function GET(
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
          isFavourite: false,
          userRating: 0,
        },
        {
          headers:
            PRIVATE_NO_STORE_HEADERS,
        }
      );
    }

    const { slug } = await params;

    /*
     * Wcześniej:
     * 1. Lake.findUnique()
     * 2. Favourite.findUnique()
     * 3. Rating.findUnique()
     *
     * Teraz wszystkie potrzebne dane użytkownika pobieramy
     * jednym zapytaniem do Prisma.
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

          ratings: {
            where: {
              userId: user.id,
            },
            select: {
              value: true,
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

    return NextResponse.json(
      {
        isFavourite:
          lake.favourites.length >
          0,

        userRating:
          lake.ratings[0]?.value ??
          0,
      },
      {
        headers:
          PRIVATE_NO_STORE_HEADERS,
      }
    );
  } catch (error) {
    console.error(
      "[api/lakes/[slug]/user-data]",
      error
    );

    return NextResponse.json(
      {
        message:
          "Nie udało się pobrać danych użytkownika.",
      },
      {
        status: 500,
        headers:
          PRIVATE_NO_STORE_HEADERS,
      }
    );
  }
}
