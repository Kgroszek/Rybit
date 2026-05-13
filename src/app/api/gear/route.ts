import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany." },
      { status: 401 }
    );
  }

  const gear = await prisma.fishingGear.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(gear);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany, aby dodać sprzęt." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const name = String(body.name || "").trim();
  const category = String(body.category || "").trim();
  const fishingMethod = String(body.fishingMethod || "").trim();
  const condition = String(body.condition || "").trim();

  if (!name || !category || !fishingMethod || !condition) {
    return NextResponse.json(
      { message: "Nazwa, kategoria, metoda i stan są wymagane." },
      { status: 400 }
    );
  }

  const price =
    body.price !== undefined && body.price !== ""
      ? Number(body.price)
      : null;

  if (price !== null && Number.isNaN(price)) {
    return NextResponse.json(
      { message: "Cena musi być liczbą." },
      { status: 400 }
    );
  }

  const quantity =
  body.quantity !== undefined && body.quantity !== ""
    ? Number(body.quantity)
    : 1;

if (!Number.isInteger(quantity) || quantity < 1) {
  return NextResponse.json(
    { message: "Ilość musi być liczbą całkowitą większą od 0." },
    { status: 400 }
  );
}

  const gear = await prisma.fishingGear.create({
    data: {
      userId: user.id,
      name,
      quantity,
      category,
      brand: body.brand || null,
      model: body.model || null,
      fishingMethod,
      condition,
      status: body.status || "active",
      price,
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
      note: body.note || null,
      isDefault: Boolean(body.isDefault),
    },
  });

  return NextResponse.json(gear, { status: 201 });
}