import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  getOwnerLakeWithPermission,
  RESERVATION_STATUSES,
} from "@/lib/owner-access";
import { warsawDateTimeToUtc } from "@/lib/owner-time";
import { prisma } from "@/lib/prisma";
import {
  findReservationConflict,
  getReservationConflictMessage,
  isReservationConcurrencyError,
  lockLakeReservationWrites,
  RESERVATION_TRANSACTION_OPTIONS,
  type ReservationScope,
} from "@/lib/reservation-safety";

const RESERVATION_TYPES = [
  "reservation",
  "competition",
  "maintenance",
  "private_event",
  "block",
] as const;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string; reservationId: string }> }
) {
  const { slug, reservationId } = await context.params;
  const { user, ownerLake } = await getOwnerLakeWithPermission(
    slug,
    "canManageReservations"
  );

  if (!user) {
    return NextResponse.json(
      { message: "Zaloguj się ponownie." },
      { status: 401 }
    );
  }

  if (!ownerLake) {
    return NextResponse.json(
      { message: "Brak uprawnień do rezerwacji." },
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

  try {
    const result = await prisma.$transaction(async (tx) => {
      await lockLakeReservationWrites(tx, ownerLake.lake.id);

      const existing = await tx.lakeReservation.findFirst({
        where: {
          id: reservationId,
          lakeId: ownerLake.lake.id,
        },
      });

      if (!existing) {
        return {
          kind: "not-found" as const,
        };
      }

      const scope: ReservationScope =
        body.scope === "lake"
          ? "lake"
          : body.scope === "spot"
            ? "spot"
            : existing.scope === "lake"
              ? "lake"
              : "spot";

      const type = normalizeType(body.type ?? existing.type, scope);
      const status = normalizeStatus(body.status ?? existing.status);
      const startsAt = parseDate(body.startsAt) ?? existing.startsAt;
      const endsAt = parseDate(body.endsAt) ?? existing.endsAt;

      if (endsAt <= startsAt) {
        return {
          kind: "invalid-range" as const,
        };
      }

      const spotId =
        scope === "spot"
          ? getString(body.spotId) || existing.spotId
          : null;

      if (scope === "spot") {
        if (!spotId) {
          return {
            kind: "spot-required" as const,
          };
        }

        const spot = await tx.lakeSpot.findFirst({
          where: {
            id: spotId,
            lakeId: ownerLake.lake.id,
            isActive: true,
          },
          select: {
            id: true,
          },
        });

        if (!spot) {
          return {
            kind: "spot-not-found" as const,
          };
        }
      }

      if (isBlockingStatus(status)) {
        const conflict = await findReservationConflict(tx, {
          lakeId: ownerLake.lake.id,
          scope,
          spotId,
          startsAt,
          endsAt,
          excludeReservationId: reservationId,
        });

        if (conflict) {
          return {
            kind: "conflict" as const,
            conflict,
          };
        }
      }

      const currentContact =
        existing.scope === "spot"
          ? {
              name: existing.customerName,
              phone: existing.customerPhone,
              email: existing.customerEmail,
            }
          : {
              name: existing.organizerName,
              phone: existing.organizerPhone,
              email: existing.organizerEmail,
            };

      const contactName =
        body.contactName !== undefined
          ? getNullableString(body.contactName)
          : currentContact.name;
      const contactPhone =
        body.contactPhone !== undefined
          ? getNullableString(body.contactPhone)
          : currentContact.phone;
      const contactEmail =
        body.contactEmail !== undefined
          ? getNullableString(body.contactEmail)
          : currentContact.email;

      await tx.lakeReservation.update({
        where: {
          id: existing.id,
        },
        data: {
          scope,
          spotId,
          type,
          status,
          title:
            body.title !== undefined
              ? getNullableString(body.title)
              : existing.title,
          startsAt,
          endsAt,
          customerName: scope === "spot" ? contactName : null,
          customerPhone: scope === "spot" ? contactPhone : null,
          customerEmail: scope === "spot" ? contactEmail : null,
          organizerName: scope === "lake" ? contactName : null,
          organizerPhone: scope === "lake" ? contactPhone : null,
          organizerEmail: scope === "lake" ? contactEmail : null,
          peopleCount:
            body.peopleCount !== undefined
              ? getPositiveInt(body.peopleCount, existing.peopleCount)
              : existing.peopleCount,
          note:
            body.note !== undefined
              ? getNullableString(body.note)
              : existing.note,
          internalNote:
            body.internalNote !== undefined
              ? getNullableString(body.internalNote)
              : existing.internalNote,
          isPublicEvent:
            scope === "lake"
              ? body.isPublicEvent !== undefined
                ? body.isPublicEvent === true
                : existing.isPublicEvent
              : false,
        },
      });

      return {
        kind: "updated" as const,
      };
    }, RESERVATION_TRANSACTION_OPTIONS);

    if (result.kind === "not-found") {
      return NextResponse.json(
        { message: "Nie znaleziono rezerwacji." },
        { status: 404 }
      );
    }

    if (result.kind === "invalid-range") {
      return NextResponse.json(
        { message: "Data zakończenia musi być późniejsza niż data rozpoczęcia." },
        { status: 400 }
      );
    }

    if (result.kind === "spot-required") {
      return NextResponse.json(
        { message: "Wybierz stanowisko." },
        { status: 400 }
      );
    }

    if (result.kind === "spot-not-found") {
      return NextResponse.json(
        { message: "Nie znaleziono stanowiska." },
        { status: 404 }
      );
    }

    if (result.kind === "conflict") {
      return NextResponse.json(
        { message: getReservationConflictMessage(result.conflict) },
        { status: 409 }
      );
    }

    revalidateOwnerPaths(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isReservationConcurrencyError(error)) {
      return NextResponse.json(
        {
          message:
            "Wybrany termin został właśnie zajęty przez inną rezerwację. Odśwież kalendarz i spróbuj ponownie.",
        },
        { status: 409 }
      );
    }

    console.error("[owner/reservations/PATCH]", error);

    return NextResponse.json(
      { message: "Nie udało się zaktualizować rezerwacji." },
      { status: 500 }
    );
  }
}

function normalizeType(value: unknown, scope: ReservationScope) {
  if (scope === "spot") return "reservation";

  return RESERVATION_TYPES.includes(
    value as (typeof RESERVATION_TYPES)[number]
  )
    ? (value as string)
    : "block";
}

function normalizeStatus(value: unknown) {
  if (value === "paid") return "confirmed";

  return RESERVATION_STATUSES.includes(
    value as (typeof RESERVATION_STATUSES)[number]
  )
    ? (value as string)
    : "confirmed";
}

function isBlockingStatus(status: string) {
  return status === "pending" || status === "confirmed";
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
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 999
    ? parsed
    : fallback;
}

function revalidateOwnerPaths(slug: string) {
  revalidatePath(`/moje-lowiska/${slug}`);
  revalidatePath(`/moje-lowiska/${slug}/rezerwacje`);
  revalidatePath(`/moje-lowiska/${slug}/stanowiska`);
}
