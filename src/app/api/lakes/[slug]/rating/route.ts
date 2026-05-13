import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany, aby ocenić łowisko." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const value = Number(body.value);

  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return NextResponse.json(
      { message: "Ocena musi być liczbą od 1 do 5." },
      { status: 400 }
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

  const rating = await prisma.rating.upsert({
    where: {
      userId_lakeId: {
        userId: user.id,
        lakeId: lake.id,
      },
    },
    create: {
      userId: user.id,
      lakeId: lake.id,
      value,
    },
    update: {
      value,
    },
  });

  const averageRating = await prisma.rating.aggregate({
    where: {
      lakeId: lake.id,
    },
    _avg: {
      value: true,
    },
  });

  const nextRating = averageRating._avg.value ?? 0;

  await prisma.lake.update({
    where: {
      id: lake.id,
    },
    data: {
      rating: Number(nextRating.toFixed(1)),
    },
  });

  return NextResponse.json({
    userRating: rating.value,
    averageRating: nextRating.toFixed(1),
    message: "Ocena została zapisana.",
  });
}