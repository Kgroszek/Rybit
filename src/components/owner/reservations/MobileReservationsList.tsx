"use client";

import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReservationStatusBadge } from "@/components/owner/reservations/ReservationStatusBadge";
import {
  dateKeyFromIso,
  formatDateTime,
  formatDay,
  reservationName,
} from "@/components/owner/reservations/reservation-utils";
import type {
  OwnerReservationItem,
} from "@/components/owner/reservations/types";

export function MobileReservationsList({
  reservations,
  onOpenReservation,
}: {
  reservations: OwnerReservationItem[];
  onOpenReservation: (
    reservation: OwnerReservationItem
  ) => void;
}) {
  const visible = [...reservations]
    .filter((item) => item.status !== "cancelled")
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() -
        new Date(b.startsAt).getTime()
    );

  const groups = groupByStartDate(visible);

  if (visible.length === 0) {
    return (
      <div className="p-4 sm:p-5">
        <EmptyState
          icon={<CalendarIcon className="h-5 w-5" />}
          title="Brak rezerwacji w tym okresie"
          description="Zmień zakres kalendarza albo dodaj nową rezerwację."
          className="min-h-48"
        />
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {groups.map((group) => {
        const day = formatDay(group.dateKey);

        return (
          <section
            key={group.dateKey}
            className="px-4 py-5 sm:px-5"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.1em] text-text-muted">
                  {day.weekday}
                </p>
                <p className="mt-1 font-display text-base font-extrabold text-text">
                  {day.date}
                </p>
              </div>

              <span className="text-xs font-bold text-text-muted">
                {group.items.length}{" "}
                {group.items.length === 1
                  ? "rezerwacja"
                  : "rezerwacje"}
              </span>
            </div>

            <div className="space-y-2.5">
              {group.items.map((reservation) => (
                <button
                  key={reservation.id}
                  type="button"
                  onClick={() =>
                    onOpenReservation(reservation)
                  }
                  className="w-full rounded-control border border-border bg-surface-muted px-4 py-4 text-left transition hover:border-primary-200 hover:bg-primary-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-text">
                        {reservationName(
                          reservation
                        )}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-text-muted">
                        {reservation.scope === "lake"
                          ? "Całe łowisko"
                          : reservation.spot?.name ??
                            "Stanowisko"}
                        {reservation.peopleCount > 0
                          ? ` · ${reservation.peopleCount} os.`
                          : ""}
                      </p>
                    </div>

                    <ReservationStatusBadge
                      status={reservation.status}
                    />
                  </div>

                  <p className="mt-3 text-xs leading-5 text-text-secondary">
                    {formatDateTime(
                      reservation.startsAt
                    )}{" "}
                    →{" "}
                    {formatDateTime(
                      reservation.endsAt
                    )}
                  </p>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function groupByStartDate(
  reservations: OwnerReservationItem[]
) {
  const map = new Map<
    string,
    OwnerReservationItem[]
  >();

  for (const reservation of reservations) {
    const dateKey = dateKeyFromIso(
      reservation.startsAt
    );
    map.set(dateKey, [
      ...(map.get(dateKey) ?? []),
      reservation,
    ]);
  }

  return Array.from(map.entries()).map(
    ([dateKey, items]) => ({
      dateKey,
      items,
    })
  );
}
