import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getTripApiAccess,
  getUserDisplayName,
} from "@/lib/trip-api-access";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getChecklist(checklistId: string) {
  return prisma.tripChecklist.findUnique({
    where: { id: checklistId },
    select: {
      id: true,
      title: true,
      status: true,
      items: {
        orderBy: [{ category: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
          category: true,
          quantity: true,
          unit: true,
          isPacked: true,
          isImportant: true,
          source: true,
          gearId: true,
          note: true,
        },
      },
    },
  });
}

async function ensureChecklist(trip: {
  id: string;
  userId: string;
  title: string;
  tripType: string;
  checklistId: string | null;
}) {
  if (trip.checklistId) {
    return trip.checklistId;
  }

  return prisma.$transaction(async (tx) => {
    const checklist = await tx.tripChecklist.create({
      data: {
        userId: trip.userId,
        title: `Checklista — ${trip.title}`,
        tripType: trip.tripType,
        status: "preparing",
        note: "Checklista utworzona dla wyprawy.",
      },
      select: { id: true },
    });

    await tx.fishingTrip.update({
      where: { id: trip.id },
      data: { checklistId: checklist.id },
    });

    return checklist.id;
  });
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const access = await getTripApiAccess(id);

  if (!access.ok) {
    return NextResponse.json(
      { message: access.message },
      { status: access.status }
    );
  }

  if (!access.trip.checklistId) {
    return NextResponse.json({ checklist: null, canEdit: access.canEdit });
  }

  const checklist = await getChecklist(access.trip.checklistId);

  return NextResponse.json({ checklist, canEdit: access.canEdit });
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const access = await getTripApiAccess(id);

    if (!access.ok) {
      return NextResponse.json(
        { message: access.message },
        { status: access.status }
      );
    }

    if (!access.canEdit) {
      return NextResponse.json(
        { message: "Nie masz uprawnień do edycji checklisty." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    const checklistId = await ensureChecklist(access.trip);

    if (body.action === "apply-template") {
      const rawItems = Array.isArray(body.items) ? body.items : [];

      if (rawItems.length === 0 || rawItems.length > 60) {
        return NextResponse.json(
          { message: "Szablon musi zawierać od 1 do 60 pozycji." },
          { status: 400 }
        );
      }

      const existingItems = await prisma.tripChecklistItem.findMany({
        where: { checklistId },
        select: { name: true },
      });

      const existingNames = new Set(
        existingItems.map((item) => item.name.trim().toLowerCase())
      );

      const normalizedItems: {
        checklistId: string;
        name: string;
        category: string;
        quantity: number;
        unit: string | null;
        isImportant: boolean;
        note: string | null;
        source: string;
      }[] = [];

      for (const rawItem of rawItems) {
        if (!rawItem || typeof rawItem !== "object") continue;

        const item = rawItem as Record<string, unknown>;
        const name = String(item.name ?? "").trim();
        const category = String(item.category ?? "Inne").trim() || "Inne";
        const quantity = Number(item.quantity ?? 1);
        const unit = String(item.unit ?? "").trim();
        const note = String(item.note ?? "").trim();
        const isImportant = Boolean(item.isImportant);
        const key = name.toLowerCase();

        if (name.length < 2 || name.length > 120) continue;
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) continue;
        if (category.length > 60 || unit.length > 20 || note.length > 500) continue;
        if (existingNames.has(key)) continue;

        existingNames.add(key);
        normalizedItems.push({
          checklistId,
          name,
          category,
          quantity,
          unit: unit || null,
          isImportant,
          note: note || null,
          source: "template",
        });
      }

      const templateLabel = String(body.templateLabel ?? "Szablon").trim().slice(0, 80);

      await prisma.$transaction(async (tx) => {
        if (normalizedItems.length > 0) {
          await tx.tripChecklistItem.createMany({
            data: normalizedItems,
          });
        }

        await tx.tripActivity.create({
          data: {
            tripId: id,
            actorUserId: access.user.id,
            actorName: getUserDisplayName(access.user),
            action: "checklist_updated",
            metadata: {
              operation: "template_applied",
              templateLabel,
              addedCount: normalizedItems.length,
            },
          },
        });
      });

      return NextResponse.json({
        message: "Szablon checklisty został zastosowany.",
        addedCount: normalizedItems.length,
        checklist: await getChecklist(checklistId),
      });
    }

    if (body.action === "ensure") {
      const checklist = await getChecklist(checklistId);

      return NextResponse.json({
        message: "Checklista jest gotowa.",
        checklist,
      });
    }

    const name = String(body.name ?? "").trim();
    const category = String(body.category ?? "Inne").trim() || "Inne";
    const quantity = Number(body.quantity ?? 1);
    const unit = String(body.unit ?? "").trim();
    const note = String(body.note ?? "").trim();
    const isImportant = Boolean(body.isImportant);

    if (name.length < 2 || name.length > 120) {
      return NextResponse.json(
        { message: "Nazwa elementu musi mieć od 2 do 120 znaków." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
      return NextResponse.json(
        { message: "Ilość musi być liczbą od 1 do 999." },
        { status: 400 }
      );
    }

    if (category.length > 60 || unit.length > 20 || note.length > 500) {
      return NextResponse.json(
        { message: "Kategoria, jednostka lub notatka jest zbyt długa." },
        { status: 400 }
      );
    }

    const actorName = getUserDisplayName(access.user);

    await prisma.$transaction(async (tx) => {
      await tx.tripChecklistItem.create({
        data: {
          checklistId,
          name,
          category,
          quantity,
          unit: unit || null,
          isImportant,
          note: note || null,
          source: "manual",
        },
      });

      await tx.tripActivity.create({
        data: {
          tripId: id,
          actorUserId: access.user.id,
          actorName,
          action: "checklist_updated",
          metadata: {
            operation: "item_added",
            name,
          },
        },
      });
    });

    return NextResponse.json({
      message: "Element został dodany.",
      checklist: await getChecklist(checklistId),
    });
  } catch (error) {
    console.error("[trip checklist POST]", error);

    return NextResponse.json(
      { message: "Nie udało się zapisać checklisty." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const access = await getTripApiAccess(id);

    if (!access.ok) {
      return NextResponse.json(
        { message: access.message },
        { status: access.status }
      );
    }

    if (!access.canEdit || !access.trip.checklistId) {
      return NextResponse.json(
        { message: "Nie możesz edytować tej checklisty." },
        { status: access.trip.checklistId ? 403 : 404 }
      );
    }

    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    const itemId = String(body?.itemId ?? "").trim();

    if (!itemId) {
      return NextResponse.json(
        { message: "Nie wskazano elementu checklisty." },
        { status: 400 }
      );
    }

    const item = await prisma.tripChecklistItem.findFirst({
      where: {
        id: itemId,
        checklistId: access.trip.checklistId,
      },
      select: { id: true },
    });

    if (!item) {
      return NextResponse.json(
        { message: "Nie znaleziono elementu checklisty." },
        { status: 404 }
      );
    }

    const data: {
      isPacked?: boolean;
      isImportant?: boolean;
      name?: string;
      category?: string;
      quantity?: number;
      unit?: string | null;
      note?: string | null;
    } = {};

    if (typeof body?.isPacked === "boolean") data.isPacked = body.isPacked;
    if (typeof body?.isImportant === "boolean")
      data.isImportant = body.isImportant;

    if (typeof body?.name === "string") {
      const name = body.name.trim();
      if (name.length < 2 || name.length > 120) {
        return NextResponse.json(
          { message: "Nazwa elementu musi mieć od 2 do 120 znaków." },
          { status: 400 }
        );
      }
      data.name = name;
    }

    if (typeof body?.category === "string") {
      data.category = body.category.trim() || "Inne";
    }

    if (typeof body?.quantity === "number") {
      if (!Number.isInteger(body.quantity) || body.quantity < 1 || body.quantity > 999) {
        return NextResponse.json(
          { message: "Ilość musi być liczbą od 1 do 999." },
          { status: 400 }
        );
      }
      data.quantity = body.quantity;
    }

    if (typeof body?.unit === "string") data.unit = body.unit.trim() || null;
    if (typeof body?.note === "string") data.note = body.note.trim() || null;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "Nie przekazano zmian." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.tripChecklistItem.update({
        where: { id: itemId },
        data,
      });

      await tx.tripActivity.create({
        data: {
          tripId: id,
          actorUserId: access.user.id,
          actorName: getUserDisplayName(access.user),
          action: "checklist_updated",
          metadata: {
            operation: "item_updated",
            itemId,
            ...data,
          },
        },
      });
    });

    return NextResponse.json({
      message: "Checklista została zaktualizowana.",
      checklist: await getChecklist(access.trip.checklistId),
    });
  } catch (error) {
    console.error("[trip checklist PATCH]", error);

    return NextResponse.json(
      { message: "Nie udało się zaktualizować checklisty." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const access = await getTripApiAccess(id);

    if (!access.ok) {
      return NextResponse.json(
        { message: access.message },
        { status: access.status }
      );
    }

    if (!access.canEdit || !access.trip.checklistId) {
      return NextResponse.json(
        { message: "Nie możesz edytować tej checklisty." },
        { status: access.trip.checklistId ? 403 : 404 }
      );
    }

    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    const itemId = String(body?.itemId ?? "").trim();

    const item = await prisma.tripChecklistItem.findFirst({
      where: {
        id: itemId,
        checklistId: access.trip.checklistId,
      },
      select: { id: true, name: true },
    });

    if (!item) {
      return NextResponse.json(
        { message: "Nie znaleziono elementu checklisty." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.tripChecklistItem.delete({ where: { id: item.id } });
      await tx.tripActivity.create({
        data: {
          tripId: id,
          actorUserId: access.user.id,
          actorName: getUserDisplayName(access.user),
          action: "checklist_updated",
          metadata: {
            operation: "item_deleted",
            itemId: item.id,
            name: item.name,
          },
        },
      });
    });

    return NextResponse.json({
      message: "Element został usunięty.",
      checklist: await getChecklist(access.trip.checklistId),
    });
  } catch (error) {
    console.error("[trip checklist DELETE]", error);

    return NextResponse.json(
      { message: "Nie udało się usunąć elementu checklisty." },
      { status: 500 }
    );
  }
}
