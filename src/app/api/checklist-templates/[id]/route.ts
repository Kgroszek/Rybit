import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

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
    if (!raw || typeof raw !== "object") {
      continue;
    }

    const item = raw as Record<string, unknown>;

    const name = String(item.name ?? "").trim();
    const category = String(item.category ?? "Inne").trim() || "Inne";
    const quantity = Number(item.quantity ?? 1);
    const unit = String(item.unit ?? "").trim();
    const note = String(item.note ?? "").trim();
    const isImportant = Boolean(item.isImportant);
    const key = name.toLocaleLowerCase("pl-PL");

    if (name.length < 2 || name.length > 120) {
      continue;
    }

    if (
      category.length > 60 ||
      unit.length > 20 ||
      note.length > 500
    ) {
      continue;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 999
    ) {
      continue;
    }

    if (names.has(key)) {
      continue;
    }

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
      orderBy: [
        { position: "asc" as const },
        { createdAt: "asc" as const },
      ],
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

async function getAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function GET(
  _request: Request,
  { params }: RouteProps
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { message: "Musisz być zalogowany." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const template = await prisma.userChecklistTemplate.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: templateSelect(),
    });

    if (!template) {
      return NextResponse.json(
        { message: "Nie znaleziono szablonu checklisty." },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("[checklist template GET]", error);

    return NextResponse.json(
      { message: "Nie udało się pobrać szablonu checklisty." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteProps
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { message: "Musisz być zalogowany." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const body = (await request.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    if (!body) {
      return NextResponse.json(
        { message: "Nieprawidłowe dane." },
        { status: 400 }
      );
    }

    const existingTemplate =
      await prisma.userChecklistTemplate.findFirst({
        where: {
          id,
          userId: user.id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          tripType: true,
        },
      });

    if (!existingTemplate) {
      return NextResponse.json(
        { message: "Nie znaleziono szablonu checklisty." },
        { status: 404 }
      );
    }

    const name =
      body.name === undefined
        ? existingTemplate.name
        : String(body.name ?? "").trim();

    const description =
      body.description === undefined
        ? existingTemplate.description ?? ""
        : String(body.description ?? "").trim();

    const tripType =
      body.tripType === undefined
        ? existingTemplate.tripType
        : String(body.tripType ?? "").trim() || "custom";

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        {
          message:
            "Nazwa szablonu musi mieć od 2 do 80 znaków.",
        },
        { status: 400 }
      );
    }

    if (
      description.length > 300 ||
      tripType.length > 40
    ) {
      return NextResponse.json(
        { message: "Opis lub typ wyprawy jest zbyt długi." },
        { status: 400 }
      );
    }

    const shouldReplaceItems =
      Object.prototype.hasOwnProperty.call(body, "items");

    const items = shouldReplaceItems
      ? normalizeItems(body.items)
      : null;

    if (shouldReplaceItems && (!items || items.length === 0)) {
      return NextResponse.json(
        {
          message:
            "Szablon musi zawierać co najmniej jeden poprawny element.",
        },
        { status: 400 }
      );
    }

    const template = await prisma.$transaction(async (tx) => {
      if (shouldReplaceItems && items) {
        await tx.userChecklistTemplateItem.deleteMany({
          where: {
            templateId: id,
          },
        });

        await tx.userChecklistTemplateItem.createMany({
          data: items.map((item) => ({
            templateId: id,
            ...item,
          })),
        });
      }

      return tx.userChecklistTemplate.update({
        where: {
          id,
        },
        data: {
          name,
          description: description || null,
          tripType,
        },
        select: templateSelect(),
      });
    });

    return NextResponse.json({ template });
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

    console.error("[checklist template PATCH]", error);

    return NextResponse.json(
      { message: "Nie udało się zaktualizować szablonu checklisty." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteProps
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { message: "Musisz być zalogowany." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const result = await prisma.userChecklistTemplate.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { message: "Nie znaleziono szablonu checklisty." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Szablon checklisty został usunięty.",
    });
  } catch (error) {
    console.error("[checklist template DELETE]", error);

    return NextResponse.json(
      { message: "Nie udało się usunąć szablonu checklisty." },
      { status: 500 }
    );
  }
}
