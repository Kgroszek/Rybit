import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getOwnerLakeWithPermission } from "@/lib/owner-access";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string; spotId: string }> }
) {
  const { slug, spotId } = await context.params;
  const { user, ownerLake } = await getOwnerLakeWithPermission(
    slug,
    "canManageSpots"
  );

  if (!user) {
    return NextResponse.json({ message: "Zaloguj się ponownie." }, { status: 401 });
  }

  if (!ownerLake) {
    return NextResponse.json({ message: "Brak uprawnień do stanowisk." }, { status: 403 });
  }

  const spot = await prisma.lakeSpot.findFirst({
    where: {
      id: spotId,
      lakeId: ownerLake.lake.id,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!spot) {
    return NextResponse.json({ message: "Nie znaleziono stanowiska." }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        action?: unknown;
        name?: unknown;
        description?: unknown;
        maxPeople?: unknown;
        isActive?: unknown;
      }
    | null;

  if (body?.action === "moveUp" || body?.action === "moveDown") {
    await moveSpot(ownerLake.lake.id, spotId, body.action);
    revalidateOwnerLakePaths(ownerLake.lake.slug);
    return NextResponse.json({ ok: true });
  }

  const name = getRequiredString(body?.name);
  if (!name) {
    return NextResponse.json({ message: "Podaj nazwę stanowiska." }, { status: 400 });
  }

  const maxPeople = getPositiveInt(body?.maxPeople, 2);

  await prisma.lakeSpot.update({
    where: {
      id: spotId,
    },
    data: {
      name,
      description: getOptionalString(body?.description),
      maxPeople,
      isActive: body?.isActive !== false,
      ...(body?.isActive === false
        ? {
            isReservableOnline: false,
          }
        : {}),
    },
  });

  revalidateOwnerLakePaths(ownerLake.lake.slug);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string; spotId: string }> }
) {
  const { slug, spotId } = await context.params;
  const { user, ownerLake } = await getOwnerLakeWithPermission(
    slug,
    "canManageSpots"
  );

  if (!user) {
    return NextResponse.json({ message: "Zaloguj się ponownie." }, { status: 401 });
  }

  if (!ownerLake) {
    return NextResponse.json({ message: "Brak uprawnień do stanowisk." }, { status: 403 });
  }

  const spot = await prisma.lakeSpot.findFirst({
    where: {
      id: spotId,
      lakeId: ownerLake.lake.id,
    },
    select: {
      id: true,
    },
  });

  if (!spot) {
    return NextResponse.json({ message: "Nie znaleziono stanowiska." }, { status: 404 });
  }

  const reservationsCount = await prisma.lakeReservation.count({
    where: {
      spotId,
    },
  });

  let deactivated = false;

  if (reservationsCount > 0) {
    deactivated = true;
    await prisma.lakeSpot.update({
      where: {
        id: spotId,
      },
      data: {
        isActive: false,
        isReservableOnline: false,
      },
    });
  } else {
    await prisma.lakeSpot.delete({
      where: {
        id: spotId,
      },
    });
    await normalizeOrder(ownerLake.lake.id);
  }

  revalidateOwnerLakePaths(ownerLake.lake.slug);
  return NextResponse.json({ ok: true, deactivated });
}

async function moveSpot(
  lakeId: string,
  spotId: string,
  direction: "moveUp" | "moveDown"
) {
  const spots = await prisma.lakeSpot.findMany({
    where: {
      lakeId,
    },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
    },
  });

  const currentIndex = spots.findIndex((spot) => spot.id === spotId);
  if (currentIndex === -1) return;

  const targetIndex = direction === "moveUp" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= spots.length) return;

  const next = [...spots];
  [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];

  await prisma.$transaction(
    next.map((spot, index) =>
      prisma.lakeSpot.update({
        where: { id: spot.id },
        data: { sortOrder: index },
      })
    )
  );
}

async function normalizeOrder(lakeId: string) {
  const spots = await prisma.lakeSpot.findMany({
    where: { lakeId },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "asc" },
    ],
    select: { id: true },
  });

  if (spots.length === 0) return;

  await prisma.$transaction(
    spots.map((spot, index) =>
      prisma.lakeSpot.update({
        where: { id: spot.id },
        data: { sortOrder: index },
      })
    )
  );
}

function getRequiredString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function getOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getPositiveInt(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 99 ? parsed : fallback;
}

function revalidateOwnerLakePaths(slug: string) {
  revalidatePath("/moje-lowiska");
  revalidatePath(`/moje-lowiska/${slug}`);
  revalidatePath(`/moje-lowiska/${slug}/stanowiska`);
  revalidatePath(`/moje-lowiska/${slug}/rezerwacje`);
}
