"use client";

import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  dateKeyFromIso,
  formatCompactDateTime,
  formatDay,
  getWarsawDateKey,
  reservationCoversDate,
  reservationName,
} from "@/components/owner/reservations/reservation-utils";
import {
  reservationBarClassName,
} from "@/components/owner/reservations/ReservationStatusBadge";
import type {
  OwnerReservationItem,
  OwnerSpotOption,
} from "@/components/owner/reservations/types";
import { cn } from "@/lib/cn";

const DAY_WIDTH = 88;

export function ReservationsTimeline({
  dateKeys,
  spots,
  reservations,
  onOpenNew,
  onOpenReservation,
}: {
  dateKeys: string[];
  spots: OwnerSpotOption[];
  reservations: OwnerReservationItem[];
  onOpenNew: (dateKey: string, spotId?: string) => void;
  onOpenReservation: (
    reservation: OwnerReservationItem
  ) => void;
}) {
  const first = dateKeys[0];
  const afterLast = addOneDay(
    dateKeys[dateKeys.length - 1]
  );
  const wholeLakeReservations = reservations.filter(
    (item) => item.scope === "lake"
  );

  return (
    <div className="overflow-x-auto [scrollbar-gutter:stable]">
      <div className="min-w-max">
        <TimelineHeader dateKeys={dateKeys} />

        <TimelineRow
          label="Całe łowisko"
          sublabel="Zawody i blokady"
          dateKeys={dateKeys}
          reservations={wholeLakeReservations}
          first={first}
          afterLast={afterLast}
          onCellClick={(dateKey) =>
            onOpenNew(dateKey, "")
          }
          onOpenReservation={onOpenReservation}
          isLakeRow
        />

        {spots.map((spot) => (
          <TimelineRow
            key={spot.id}
            label={spot.name}
            sublabel={`maks. ${spot.maxPeople} os.`}
            dateKeys={dateKeys}
            reservations={reservations.filter(
              (item) =>
                item.scope === "spot" &&
                item.spotId === spot.id
            )}
            blockedByReservations={wholeLakeReservations.filter(
              (item) =>
                item.status === "pending" ||
                item.status === "confirmed" ||
                item.status === "paid"
            )}
            first={first}
            afterLast={afterLast}
            onCellClick={(dateKey) =>
              onOpenNew(dateKey, spot.id)
            }
            onOpenReservation={onOpenReservation}
          />
        ))}

        {spots.length === 0 && (
          <div className="p-6 sm:p-8">
            <EmptyState
              icon={<CalendarIcon className="h-5 w-5" />}
              title="Najpierw dodaj stanowiska"
              description="Rezerwacje pojedynczych stanowisk pojawią się w kalendarzu po utworzeniu aktywnych stanowisk."
              className="min-h-48"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineHeader({
  dateKeys,
}: {
  dateKeys: string[];
}) {
  const today = getWarsawDateKey();

  return (
    <div className="flex border-b border-border bg-surface-muted">
      <div className="sticky left-0 z-30 flex w-52 shrink-0 items-center border-r border-border bg-surface-muted px-4 py-3">
        <span className="text-[10px] font-black uppercase tracking-[0.13em] text-text-muted">
          Stanowisko
        </span>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${dateKeys.length}, ${DAY_WIDTH}px)`,
        }}
      >
        {dateKeys.map((dateKey) => {
          const day = formatDay(dateKey);
          const isToday = dateKey === today;

          return (
            <div
              key={dateKey}
              className={cn(
                "border-r border-border px-2 py-3 text-center",
                isToday && "bg-primary-50"
              )}
            >
              <p
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.08em] text-text-muted",
                  isToday && "text-primary-700"
                )}
              >
                {day.weekday}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs font-extrabold text-text-secondary",
                  isToday && "text-primary-800"
                )}
              >
                {day.date}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineRow({
  label,
  sublabel,
  dateKeys,
  reservations,
  blockedByReservations = [],
  first,
  afterLast,
  onCellClick,
  onOpenReservation,
  isLakeRow = false,
}: {
  label: string;
  sublabel: string;
  dateKeys: string[];
  reservations: OwnerReservationItem[];
  blockedByReservations?: OwnerReservationItem[];
  first: string;
  afterLast: string;
  onCellClick: (dateKey: string) => void;
  onOpenReservation: (
    reservation: OwnerReservationItem
  ) => void;
  isLakeRow?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex border-b border-border last:border-b-0",
        isLakeRow ? "bg-primary-50/35" : "bg-surface"
      )}
    >
      <div
        className={cn(
          "sticky left-0 z-20 flex w-52 shrink-0 flex-col justify-center border-r border-border px-4 py-3",
          isLakeRow ? "bg-primary-50" : "bg-surface"
        )}
      >
        <p className="truncate text-sm font-bold text-text">
          {label}
        </p>
        <p className="mt-1 truncate text-[11px] font-semibold text-text-muted">
          {sublabel}
        </p>
      </div>

      <div
        className="relative grid min-h-[68px]"
        style={{
          gridTemplateColumns: `repeat(${dateKeys.length}, ${DAY_WIDTH}px)`,
        }}
      >
        {dateKeys.map((dateKey, index) => {
          const blocked =
            blockedByReservations.some((reservation) =>
              reservationCoversDate(
                reservation,
                dateKey
              )
            );

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() =>
                !blocked && onCellClick(dateKey)
              }
              disabled={blocked}
              style={{
                gridColumnStart: index + 1,
              }}
              className={cn(
                "row-start-1 border-r border-border transition-colors",
                blocked
                  ? "cursor-not-allowed bg-surface-strong/65"
                  : "hover:bg-primary-50"
              )}
              aria-label={
                blocked
                  ? `Całe łowisko zablokowane: ${dateKey}`
                  : `Dodaj rezerwację: ${label}, ${dateKey}`
              }
            />
          );
        })}

        {reservations.map((reservation) => {
          const startKey = dateKeyFromIso(
            reservation.startsAt
          );
          const endKey = dateKeyFromIso(
            reservation.endsAt
          );
          const clippedStart =
            startKey < first ? first : startKey;
          const clippedEnd =
            endKey > afterLast
              ? afterLast
              : endKey;

          const startIndex = Math.max(
            0,
            dateKeys.indexOf(clippedStart)
          );

          let endIndex =
            dateKeys.indexOf(clippedEnd);

          if (endIndex < 0) {
            endIndex = dateKeys.length;
          }

          const span = Math.max(
            1,
            endIndex - startIndex
          );

          return (
            <button
              key={reservation.id}
              type="button"
              onClick={() =>
                onOpenReservation(reservation)
              }
              className={cn(
                "z-10 m-1 min-w-0 overflow-hidden rounded-xl border px-2.5 py-2 text-left shadow-[0_1px_3px_rgba(13,30,51,0.12)] transition hover:-translate-y-px hover:brightness-[0.98]",
                reservationBarClassName(
                  reservation.status
                )
              )}
              style={{
                gridColumn: `${
                  startIndex + 1
                } / span ${span}`,
                gridRow: 1,
              }}
              title={`${reservationName(
                reservation
              )} • ${formatCompactDateTime(
                reservation.startsAt
              )} – ${formatCompactDateTime(
                reservation.endsAt
              )}`}
            >
              <span className="block truncate text-[11px] font-extrabold">
                {reservationName(reservation)}
              </span>
              <span className="mt-0.5 block truncate text-[10px] font-semibold opacity-85">
                {formatCompactDateTime(
                  reservation.startsAt
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function addOneDay(dateKey: string) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  return new Date(
    Date.UTC(year, month - 1, day + 1)
  )
    .toISOString()
    .slice(0, 10);
}
