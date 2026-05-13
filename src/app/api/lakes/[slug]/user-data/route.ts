import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      isFavourite: false,
      userRating: 0,
    });
  }

  const { slug } = await params;

  const lake = await prisma.lake.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (!lake) {
    return NextResponse.json(
      { message: "Nie znaleziono łowiska." },
      { status: 404 }
    );
  }

  const [favourite, rating] = await Promise.all([
    prisma.favourite.findUnique({
      where: {
        userId_lakeId: {
          userId: user.id,
          lakeId: lake.id,
        },
      },
    }),

    prisma.rating.findUnique({
      where: {
        userId_lakeId: {
          userId: user.id,
          lakeId: lake.id,
        },
      },
    }),
  ]);

  return NextResponse.json({
    isFavourite: Boolean(favourite),
    userRating: rating?.value ?? 0,
  });
}