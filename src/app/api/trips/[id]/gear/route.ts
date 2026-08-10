import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getTripApiAccess,
  getUserDisplayName,
} from "@/lib/trip-api-access";

type RouteProps = {
  params: Promise<{ id: string }>;
};

async function getPayload(tripId: string, userId: string) {
  const [availableGear, tripItems] = await Promise.all([
    prisma.fishingGear.findMany({
      where: {
        userId,
        status: "active",
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        quantity: true,
        category: true,
        brand: true,
        model: true,
        fishingMethod: true,
        condition: true,
        isDefault: true,
      },
    }),
    prisma.tripGearItem.findMany({
      where: { tripId },
      orderBy: [{ isRequired: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        gearId: true,
        addedByUserId: true,
        name: true,
        category: true,
        quantity: true,
        unit: true,
        note: true,
        isRequired: true,
        isPacked: true,
      },
    }),
  ]);

  return { availableGear, tripItems };
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

  return NextResponse.json({
    ...(await getPayload(id, access.user.id)),
    canEdit: access.canEdit,
  });
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
        { message: "Nie masz uprawnień do edycji sprzętu wyprawy." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    if (!body) {
      return NextResponse.json(
        { message: "Nieprawidłowe dane." },
        { status: 400 }
      );
    }

    const action = String(body.action ?? "sync-owned");

    if (action === "add-custom") {
      const name = String(body.name ?? "").trim();
      const category = String(body.category ?? "Inne").trim() || "Inne";
      const unit = String(body.unit ?? "szt.").trim() || "szt.";
      const note = String(body.note ?? "").trim();
      const quantity = Number(body.quantity);
      const isRequired =
        typeof body.isRequired === "boolean" ? body.isRequired : true;

      if (name.length < 2 || name.length > 120) {
        return NextResponse.json(
          { message: "Nazwa sprzętu musi mieć od 2 do 120 znaków." },
          { status: 400 }
        );
      }

      if (category.length > 60) {
        return NextResponse.json(
          { message: "Kategoria może mieć maksymalnie 60 znaków." },
          { status: 400 }
        );
      }

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
        return NextResponse.json(
          { message: "Ilość musi być liczbą od 1 do 999." },
          { status: 400 }
        );
      }

      if (unit.length > 20) {
        return NextResponse.json(
          { message: "Jednostka może mieć maksymalnie 20 znaków." },
          { status: 400 }
        );
      }

      if (note.length > 500) {
        return NextResponse.json(
          { message: "Notatka może mieć maksymalnie 500 znaków." },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        const item = await tx.tripGearItem.create({
          data: {
            tripId: id,
            gearId: null,
            addedByUserId: access.user.id,
            name,
            category,
            quantity,
            unit,
            note: note || null,
            isRequired,
            isPacked: false,
          },
          select: {
            id: true,
          },
        });

        await tx.tripActivity.create({
          data: {
            tripId: id,
            actorUserId: access.user.id,
            actorName: getUserDisplayName(access.user),
            action: "gear_updated",
            metadata: {
              operation: "custom_item_added",
              itemId: item.id,
              itemName: name,
            },
          },
        });
      });

      return NextResponse.json({
        message: "Sprzęt został dodany tylko do tej wyprawy.",
        ...(await getPayload(id, access.user.id)),
      });
    }

    if (action !== "sync-owned") {
      return NextResponse.json(
        { message: "Nieznana akcja." },
        { status: 400 }
      );
    }

    const gearIds = Array.isArray(body.gearIds)
      ? Array.from(
          new Set(
            body.gearIds
              .map((value) => String(value).trim())
              .filter(Boolean)
          )
        )
      : [];

    const ownedGear = await prisma.fishingGear.findMany({
      where: {
        userId: access.user.id,
        id: { in: gearIds },
        status: "active",
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        category: true,
        brand: true,
        model: true,
      },
    });

    if (ownedGear.length !== gearIds.length) {
      return NextResponse.json(
        { message: "Co najmniej jeden wybrany sprzęt nie należy do Ciebie." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const currentItems = await tx.tripGearItem.findMany({
        where: {
          tripId: id,
          addedByUserId: access.user.id,
          gearId: { not: null },
        },
        select: { id: true, gearId: true },
      });

      const currentByGear = new Map(
        currentItems
          .filter((item) => item.gearId)
          .map((item) => [item.gearId as string, item])
      );

      const selectedSet = new Set(gearIds);

      const idsToDelete = currentItems
        .filter((item) => item.gearId && !selectedSet.has(item.gearId))
        .map((item) => item.id);

      if (idsToDelete.length > 0) {
        await tx.tripGearItem.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      for (const selectedGear of ownedGear) {
        if (currentByGear.has(selectedGear.id)) continue;

        const description = [selectedGear.brand, selectedGear.model]
          .filter(Boolean)
          .join(" ")
          .trim();

        await tx.tripGearItem.create({
          data: {
            tripId: id,
            gearId: selectedGear.id,
            addedByUserId: access.user.id,
            name: selectedGear.name,
            category: selectedGear.category,
            quantity: Math.max(selectedGear.quantity, 1),
            unit: "szt.",
            note: description || null,
            isRequired: true,
            isPacked: false,
          },
        });
      }

      await tx.tripActivity.create({
        data: {
          tripId: id,
          actorUserId: access.user.id,
          actorName: getUserDisplayName(access.user),
          action: "gear_updated",
          metadata: {
            operation: "selection_synced",
            selectedGearIds: gearIds,
          },
        },
      });
    });

    return NextResponse.json({
      message: "Sprzęt wyprawy został zaktualizowany.",
      ...(await getPayload(id, access.user.id)),
    });
  } catch (error) {
    console.error("[trip gear POST]", error);

    return NextResponse.json(
      { message: "Nie udało się zapisać sprzętu wyprawy." },
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

    if (!access.canEdit) {
      return NextResponse.json(
        { message: "Nie masz uprawnień do edycji sprzętu wyprawy." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => null)) as {
      itemId?: unknown;
      isPacked?: unknown;
      isRequired?: unknown;
    } | null;

    const itemId = String(body?.itemId ?? "").trim();
    const item = await prisma.tripGearItem.findFirst({
      where: { id: itemId, tripId: id },
      select: { id: true },
    });

    if (!item) {
      return NextResponse.json(
        { message: "Nie znaleziono sprzętu na tej wyprawie." },
        { status: 404 }
      );
    }

    const data: { isPacked?: boolean; isRequired?: boolean } = {};
    if (typeof body?.isPacked === "boolean") data.isPacked = body.isPacked;
    if (typeof body?.isRequired === "boolean")
      data.isRequired = body.isRequired;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "Nie przekazano zmian." },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.tripGearItem.update({
        where: { id: item.id },
        data,
      }),
      prisma.tripActivity.create({
        data: {
          tripId: id,
          actorUserId: access.user.id,
          actorName: getUserDisplayName(access.user),
          action: "gear_updated",
          metadata: {
            operation: "item_updated",
            itemId: item.id,
            ...data,
          },
        },
      }),
    ]);

    return NextResponse.json({
      message: "Sprzęt został zaktualizowany.",
      ...(await getPayload(id, access.user.id)),
    });
  } catch (error) {
    console.error("[trip gear PATCH]", error);

    return NextResponse.json(
      { message: "Nie udało się zaktualizować sprzętu." },
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

    if (!access.canEdit) {
      return NextResponse.json(
        { message: "Nie masz uprawnień do edycji sprzętu wyprawy." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => null)) as
      | { itemId?: unknown }
      | null;

    const itemId = String(body?.itemId ?? "").trim();

    if (!itemId) {
      return NextResponse.json(
        { message: "Nie wskazano elementu do usunięcia." },
        { status: 400 }
      );
    }

    const item = await prisma.tripGearItem.findFirst({
      where: {
        id: itemId,
        tripId: id,
      },
      select: {
        id: true,
        gearId: true,
        name: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { message: "Nie znaleziono sprzętu na tej wyprawie." },
        { status: 404 }
      );
    }

    if (item.gearId) {
      return NextResponse.json(
        {
          message:
            "Sprzęt połączony z Ekwipunkiem usuń przez odznaczenie go w zakładce „Z mojego ekwipunku”.",
        },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.tripGearItem.delete({
        where: { id: item.id },
      }),
      prisma.tripActivity.create({
        data: {
          tripId: id,
          actorUserId: access.user.id,
          actorName: getUserDisplayName(access.user),
          action: "gear_updated",
          metadata: {
            operation: "custom_item_removed",
            itemId: item.id,
            itemName: item.name,
          },
        },
      }),
    ]);

    return NextResponse.json({
      message: "Sprzęt został usunięty z wyprawy.",
      ...(await getPayload(id, access.user.id)),
    });
  } catch (error) {
    console.error("[trip gear DELETE]", error);

    return NextResponse.json(
      { message: "Nie udało się usunąć sprzętu z wyprawy." },
      { status: 500 }
    );
  }
}

