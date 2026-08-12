import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getOwnerLakeWithPermission } from "@/lib/owner-access";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
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

  const body = (await request.json().catch(() => null)) as
    | {
        name?: unknown;
        description?: unknown;
        maxPeople?: unknown;
        isActive?: unknown;
      }
    | null;

  const name = getRequiredString(body?.name);
  if (!name) {
    return NextResponse.json({ message: "Podaj nazwę stanowiska." }, { status: 400 });
  }

  const maxPeople = getPositiveInt(body?.maxPeople, 2);
  const lastSpot = await prisma.lakeSpot.findFirst({
    where: {
      lakeId: ownerLake.lake.id,
    },
    orderBy: [
      { sortOrder: "desc" },
      { createdAt: "desc" },
    ],
    select: {
      sortOrder: true,
    },
  });

  const spot = await prisma.lakeSpot.create({
    data: {
      lakeId: ownerLake.lake.id,
      name,
      slug: await createSpotSlug(ownerLake.lake.id, name),
      description: getOptionalString(body?.description),
      maxPeople,
      isActive: body?.isActive !== false,
      // Public online booking is intentionally disabled in this version.
      isReservableOnline: false,
      sortOrder: (lastSpot?.sortOrder ?? -1) + 1,
    },
    select: {
      id: true,
    },
  });

  revalidateOwnerLakePaths(ownerLake.lake.slug);

  return NextResponse.json({ ok: true, spotId: spot.id });
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

async function createSpotSlug(lakeId: string, name: string) {
  const base = slugify(name) || `stanowisko-${Date.now()}`;
  const existing = await prisma.lakeSpot.findMany({
    where: {
      lakeId,
      slug: {
        startsWith: base,
      },
    },
    select: {
      slug: true,
    },
  });

  const values = new Set(existing.map((item) => item.slug).filter(Boolean));
  if (!values.has(base)) return base;

  let counter = 2;
  while (values.has(`${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pl")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function revalidateOwnerLakePaths(slug: string) {
  revalidatePath("/moje-lowiska");
  revalidatePath(`/moje-lowiska/${slug}`);
  revalidatePath(`/moje-lowiska/${slug}/stanowiska`);
  revalidatePath(`/moje-lowiska/${slug}/rezerwacje`);
}
