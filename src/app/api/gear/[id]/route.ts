import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getCurrentUserGear(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { message: "Musisz być zalogowany." },
        { status: 401 }
      ),
      user: null,
      gear: null,
    };
  }

  const gear = await prisma.fishingGear.findUnique({
    where: {
      id,
    },
  });

  if (!gear) {
    return {
      error: NextResponse.json(
        { message: "Nie znaleziono sprzętu." },
        { status: 404 }
      ),
      user,
      gear: null,
    };
  }

  if (gear.userId !== user.id) {
    return {
      error: NextResponse.json(
        { message: "Nie masz uprawnień do tego sprzętu." },
        { status: 403 }
      ),
      user,
      gear: null,
    };
  }

  return {
    error: null,
    user,
    gear,
  };
}

export async function PUT(request: Request, { params }: RouteProps) {
  const { id } = await params;

  const result = await getCurrentUserGear(id);

  if (result.error) {
    return result.error;
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

  const price =
    body.price !== undefined && body.price !== "" ? Number(body.price) : null;

  if (price !== null && Number.isNaN(price)) {
    return NextResponse.json(
      { message: "Cena musi być liczbą." },
      { status: 400 }
    );
  }

  const updatedGear = await prisma.fishingGear.update({
    where: {
      id,
    },
    data: {
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

  return NextResponse.json(updatedGear);
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const { id } = await params;

  const result = await getCurrentUserGear(id);

  if (result.error) {
    return result.error;
  }

  await prisma.fishingGear.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    message: "Sprzęt został usunięty.",
  });
}