import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type TemplateInputItem = {
  name: string;
  category: string;
  quantity: number;
  unit: string | null;
  isImportant: boolean;
  note: string | null;
  position: number;
};

function normalizeItems(value: unknown): TemplateInputItem[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 80) {
    return [];
  }

  const names = new Set<string>();
  const result: TemplateInputItem[] = [];

  for (const [index, raw] of value.entries()) {
    if (!raw || typeof raw !== "object") continue;

    const item = raw as Record<string, unknown>;
    const name = String(item.name ?? "").trim();
    const category = String(item.category ?? "Inne").trim() || "Inne";
    const quantity = Number(item.quantity ?? 1);
    const unit = String(item.unit ?? "").trim();
    const note = String(item.note ?? "").trim();
    const isImportant = Boolean(item.isImportant);
    const key = name.toLocaleLowerCase("pl-PL");

    if (name.length < 2 || name.length > 120) continue;
    if (category.length > 60 || unit.length > 20 || note.length > 500) continue;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) continue;
    if (names.has(key)) continue;

    names.add(key);
    result.push({
      name,
      category,
      quantity,
      unit: unit || null,
      isImportant,
      note: note || null,
      position: index,
    });
  }

  return result;
}

function templateSelect() {
  return {
    id: true,
    name: true,
    description: true,
    tripType: true,
    updatedAt: true,
    items: {
      orderBy: [{ position: "asc" as const }, { createdAt: "asc" as const }],
      select: {
        name: true,
        category: true,
        quantity: true,
        unit: true,
        isImportant: true,
        note: true,
      },
    },
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Musisz być zalogowany." }, { status: 401 });
  }

  const templates = await prisma.userChecklistTemplate.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: templateSelect(),
  });

  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Musisz być zalogowany." }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ message: "Nieprawidłowe dane." }, { status: 400 });
    }

    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim();
    const tripType = String(body.tripType ?? "custom").trim() || "custom";
    const items = normalizeItems(body.items);

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        { message: "Nazwa szablonu musi mieć od 2 do 80 znaków." },
        { status: 400 }
      );
    }

    if (description.length > 300 || tripType.length > 40) {
      return NextResponse.json(
        { message: "Opis lub typ wyprawy jest zbyt długi." },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { message: "Szablon musi zawierać co najmniej jeden poprawny element." },
        { status: 400 }
      );
    }

    const template = await prisma.userChecklistTemplate.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        tripType,
        items: {
          create: items,
        },
      },
      select: templateSelect(),
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Masz już szablon o takiej nazwie." },
        { status: 409 }
      );
    }

    console.error("[checklist templates POST]", error);
    return NextResponse.json(
      { message: "Nie udało się zapisać szablonu checklisty." },
      { status: 500 }
    );
  }
}
