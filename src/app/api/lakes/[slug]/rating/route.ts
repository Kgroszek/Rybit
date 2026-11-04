import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  revalidateLakePublicContent,
} from "@/lib/public-revalidation";
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
  request: Request,
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
            "Musisz być zalogowany, aby ocenić łowisko.",
        },
        {
          status: 401,
          headers:
            PRIVATE_NO_STORE_HEADERS,
        }
      );
    }

    const body =
      await request
        .json()
        .catch(() => null);

    const value = Number(
      body &&
        typeof body ===
          "object"
        ? (
            body as {
              value?: unknown;
            }
          ).value
        : NaN
    );

    if (
      !Number.isInteger(value) ||
      value < 1 ||
      value > 5
    ) {
      return NextResponse.json(
        {
          message:
            "Ocena musi być liczbą od 1 do 5.",
        },
        {
          status: 400,
          headers:
            PRIVATE_NO_STORE_HEADERS,
        }
      );
    }

    const { slug } = await params;

    const lake =
      await prisma.lake.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
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

    /*
     * Upsert oceny, wyliczenie średniej i aktualizacja Lake.rating
     * odbywają się w jednej transakcji.
     *
     * Nie ma więc okna, w którym Rating jest już zapisany,
     * ale Lake.rating nadal zawiera starą wartość.
     */
    const result =
      await prisma.$transaction(
        async (tx) => {
          const rating =
            await tx.rating.upsert({
              where: {
                userId_lakeId: {
                  userId:
                    user.id,
                  lakeId:
                    lake.id,
                },
              },

              create: {
                userId:
                  user.id,
                lakeId:
                  lake.id,
                value,
              },

              update: {
                value,
              },

              select: {
                value: true,
              },
            });

          const average =
            await tx.rating.aggregate({
              where: {
                lakeId:
                  lake.id,
              },
              _avg: {
                value: true,
              },
            });

          const nextRating =
            average._avg.value ??
            0;

          await tx.lake.update({
            where: {
              id: lake.id,
            },
            data: {
              rating:
                Number(
                  nextRating.toFixed(
                    1
                  )
                ),
            },
          });

          return {
            userRating:
              rating.value,
            averageRating:
              nextRating.toFixed(
                1
              ),
          };
        }
      );

    /*
     * Profil publiczny i listy są ISR.
     * Po zmianie oceny oznaczamy je jako nieaktualne,
     * żeby nie czekać do kolejnego godzinnego revalidate.
     */
    revalidateLakePublicContent([
      slug,
    ]);

    return NextResponse.json(
      {
        ...result,
        message:
          "Ocena została zapisana.",
      },
      {
        headers:
          PRIVATE_NO_STORE_HEADERS,
      }
    );
  } catch (error) {
    console.error(
      "[api/lakes/[slug]/rating]",
      error
    );

    return NextResponse.json(
      {
        message:
          "Nie udało się zapisać oceny.",
      },
      {
        status: 500,
        headers:
          PRIVATE_NO_STORE_HEADERS,
      }
    );
  }
}
