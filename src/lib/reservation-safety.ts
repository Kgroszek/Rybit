import type { Prisma } from "@prisma/client";

import { ACTIVE_RESERVATION_STATUSES } from "@/lib/owner-access";

export type ReservationScope = "lake" | "spot";

type FindReservationConflictInput = {
  lakeId: string;
  scope: ReservationScope;
  spotId: string | null;
  startsAt: Date;
  endsAt: Date;
  excludeReservationId?: string;
};

export async function lockLakeReservationWrites(
  tx: Prisma.TransactionClient,
  lakeId: string
) {
  // Lock transakcyjny jest wspólny z triggerem PostgreSQL. Dzięki temu dwa
  // równoległe requesty dla tego samego łowiska nie sprawdzają dostępności
  // jednocześnie. Po zwolnieniu blokady kolejny SELECT widzi już zapis.
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${lakeId})::bigint)`;
}

export async function findReservationConflict(
  tx: Prisma.TransactionClient,
  {
    lakeId,
    scope,
    spotId,
    startsAt,
    endsAt,
    excludeReservationId,
  }: FindReservationConflictInput
) {
  return tx.lakeReservation.findFirst({
    where: {
      ...(excludeReservationId
        ? {
            id: {
              not: excludeReservationId,
            },
          }
        : {}),
      lakeId,
      status: {
        in: [...ACTIVE_RESERVATION_STATUSES],
      },
      startsAt: {
        lt: endsAt,
      },
      endsAt: {
        gt: startsAt,
      },
      OR:
        scope === "lake"
          ? undefined
          : [
              {
                scope: "lake",
              },
              {
                scope: "spot",
                spotId,
              },
            ],
    },
    select: {
      id: true,
      scope: true,
      spot: {
        select: {
          name: true,
        },
      },
    },
  });
}

export function getReservationConflictMessage(
  conflict: Awaited<ReturnType<typeof findReservationConflict>>
) {
  if (!conflict) {
    return "Wybrany termin nie jest już dostępny.";
  }

  if (conflict.scope === "lake") {
    return "W tym terminie całe łowisko jest już zablokowane.";
  }

  return `Termin koliduje z inną rezerwacją${
    conflict.spot?.name ? ` na stanowisku ${conflict.spot.name}` : ""
  }.`;
}

/**
 * P2034 = konflikt zapisu / deadlock zgłoszony przez Prisma.
 * `reservation_conflict` pochodzi z triggera PostgreSQL dodanego migracją.
 */
export function isReservationConcurrencyError(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";

  if (code === "P2034") {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error ?? "");

  return (
    message.includes("reservation_conflict") ||
    message.includes("P0001") ||
    message.includes("23P01")
  );
}

export const RESERVATION_TRANSACTION_OPTIONS = {
  maxWait: 5_000,
  timeout: 10_000,
} as const;
