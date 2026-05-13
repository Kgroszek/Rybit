import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(_request: Request, { params }: RouteProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany, aby dodać łowisko do ulubionych." },
      { status: 401 }
    );
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

  const existingFavourite = await prisma.favourite.findUnique({
    where: {
      userId_lakeId: {
        userId: user.id,
        lakeId: lake.id,
      },
    },
  });

  if (existingFavourite) {
    await prisma.favourite.delete({
      where: {
        id: existingFavourite.id,
      },
    });

    return NextResponse.json({
      isFavourite: false,
      message: "Usunięto z ulubionych.",
    });
  }

  await prisma.favourite.create({
    data: {
      userId: user.id,
      lakeId: lake.id,
    },
  });

  return NextResponse.json({
    isFavourite: true,
    message: "Dodano do ulubionych.",
  });
}