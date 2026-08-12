import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  ACTIVE_RESERVATION_STATUSES,
  getOwnerLakeWithPermission,
  RESERVATION_STATUSES,
} from "@/lib/owner-access";
import { warsawDateTimeToUtc } from "@/lib/owner-time";
import { prisma } from "@/lib/prisma";

const RESERVATION_TYPES = [
  "reservation",
  "competition",
  "maintenance",
  "private_event",
  "block",
] as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const { user, ownerLake } = await getOwnerLakeWithPermission(
    slug,
    "canManageReservations"
  );

  if (!user) {
    return NextResponse.json({ message: "Zaloguj się ponownie." }, { status: 401 });
  }

  if (!ownerLake) {
    return NextResponse.json({ message: "Brak uprawnień do rezerwacji." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ message: "Nieprawidłowe dane." }, { status: 400 });
  }

  const scope = body.scope === "lake" ? "lake" : "spot";
  const type = normalizeType(body.type, scope);
  const status = normalizeStatus(body.status);
  const startsAt = parseDate(body.startsAt);
  const endsAt = parseDate(body.endsAt);

  if (!startsAt || !endsAt || endsAt <= startsAt) {
    return NextResponse.json(
      { message: "Data zakończenia musi być późniejsza niż data rozpoczęcia." },
      { status: 400 }
    );
  }

  let spotId: string | null = null;

  if (scope === "spot") {
    spotId = getString(body.spotId);
    if (!spotId) {
      return NextResponse.json({ message: "Wybierz stanowisko." }, { status: 400 });
    }

    const spot = await prisma.lakeSpot.findFirst({
      where: {
        id: spotId,
        lakeId: ownerLake.lake.id,
        isActive: true,
      },
      select: { id: true },
    });

    if (!spot) {
      return NextResponse.json({ message: "Nie znaleziono stanowiska." }, { status: 404 });
    }
  }

  if (isBlockingStatus(status)) {
    const conflict = await findConflict({
      lakeId: ownerLake.lake.id,
      scope,
      spotId,
      startsAt,
      endsAt,
    });

    if (conflict) {
      return NextResponse.json(
        {
          message:
            conflict.scope === "lake"
              ? "W tym terminie całe łowisko jest już zablokowane."
              : `Termin koliduje z inną rezerwacją${conflict.spot?.name ? ` na stanowisku ${conflict.spot.name}` : ""}.`,
        },
        { status: 409 }
      );
    }
  }

  const peopleCount = getPositiveInt(body.peopleCount, 1);
  const contactName = getNullableString(body.contactName);
  const contactPhone = getNullableString(body.contactPhone);
  const contactEmail = getNullableString(body.contactEmail);

  const reservation = await prisma.lakeReservation.create({
    data: {
      lakeId: ownerLake.lake.id,
      spotId,
      scope,
      type,
      status,
      title: getNullableString(body.title),
      startsAt,
      endsAt,
      customerName: scope === "spot" ? contactName : null,
      customerPhone: scope === "spot" ? contactPhone : null,
      customerEmail: scope === "spot" ? contactEmail : null,
      organizerName: scope === "lake" ? contactName : null,
      organizerPhone: scope === "lake" ? contactPhone : null,
      organizerEmail: scope === "lake" ? contactEmail : null,
      peopleCount,
      note: getNullableString(body.note),
      internalNote: getNullableString(body.internalNote),
      isPublicEvent: scope === "lake" && body.isPublicEvent === true,
      createdByUserId: user.id,
    },
    select: { id: true },
  });

  revalidateOwnerPaths(slug);

  return NextResponse.json({ ok: true, reservationId: reservation.id });
}

function normalizeType(value: unknown, scope: string) {
  if (scope === "spot") return "reservation";
  return RESERVATION_TYPES.includes(value as (typeof RESERVATION_TYPES)[number])
    ? (value as string)
    : "block";
}

function normalizeStatus(value: unknown) {
  return RESERVATION_STATUSES.includes(value as (typeof RESERVATION_STATUSES)[number])
    ? (value as string)
    : "confirmed";
}

function isBlockingStatus(status: string) {
  return status === "pending" || status === "confirmed";
}

async function findConflict({
  lakeId,
  scope,
  spotId,
  startsAt,
  endsAt,
}: {
  lakeId: string;
  scope: string;
  spotId: string | null;
  startsAt: Date;
  endsAt: Date;
}) {
  return prisma.lakeReservation.findFirst({
    where: {
      lakeId,
      status: { in: [...ACTIVE_RESERVATION_STATUSES] },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
      OR:
        scope === "lake"
          ? undefined
          : [
              { scope: "lake" },
              { scope: "spot", spotId },
            ],
    },
    select: {
      id: true,
      scope: true,
      spot: { select: { name: true } },
    },
  });
}

function parseDate(value: unknown) {
  if (typeof value !== "string" || !value) return null;

  const localMatch = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/);
  if (localMatch) {
    return warsawDateTimeToUtc(localMatch[1], localMatch[2]);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function getNullableString(value: unknown) {
  const result = getString(value);
  return result || null;
}

function getPositiveInt(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 999 ? parsed : fallback;
}

function revalidateOwnerPaths(slug: string) {
  revalidatePath(`/moje-lowiska/${slug}`);
  revalidatePath(`/moje-lowiska/${slug}/rezerwacje`);
  revalidatePath(`/moje-lowiska/${slug}/stanowiska`);
}
