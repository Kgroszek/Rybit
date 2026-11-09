"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { FishingTrip } from "@/components/trips/types";
import {
  buildCalendarDays,
  formatTripDateRange,
  getTripDateKeys,
  getTripPhase,
  toDateKey,
} from "@/components/trips/utils";
import { cn } from "@/lib/cn";

export function TripsCalendar({
  trips,
}: {
  trips: FishingTrip[];
}) {
  const [initialCalendarDate] = useState(() => {
    const nearest =
      trips
        .filter((trip) => getTripPhase(trip) !== "finished")
        .sort(
          (a, b) =>
            new Date(a.startsAt).getTime() -
            new Date(b.startsAt).getTime()
        )[0] ?? null;

    const date = nearest ? new Date(nearest.startsAt) : new Date();

    return Number.isNaN(date.getTime()) ? new Date() : date;
  });

  const [month, setMonth] = useState(
    () =>
      new Date(
        initialCalendarDate.getFullYear(),
        initialCalendarDate.getMonth(),
        1
      )
  );

  const [selectedDate, setSelectedDate] = useState(() =>
    toDateKey(initialCalendarDate)
  );

  const days = useMemo(() => buildCalendarDays(month), [month]);

  const tripsByDate = useMemo(() => {
    const result = new Map<string, FishingTrip[]>();

    trips.forEach((trip) => {
      getTripDateKeys(trip).forEach((key) => {
        const current = result.get(key) ?? [];
        current.push(trip);
        result.set(key, current);
      });
    });

    return result;
  }, [trips]);

  const selectedTrips = tripsByDate.get(selectedDate) ?? [];

  const monthLabel = new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    year: "numeric",
  }).format(month);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-8 p-5 sm:p-6 xl:grid xl:grid-cols-[minmax(0,1.35fr)_360px] xl:gap-10">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-primary">
                Kalendarz wypraw
              </p>

              <h2 className="mt-1.5 capitalize font-display text-xl font-extrabold text-text sm:text-2xl">
                {monthLabel}
              </h2>
            </div>

            <div className="flex gap-2">
              <CalendarNavButton
                label="Poprzedni miesiąc"
                onClick={() =>
                  setMonth(
                    new Date(
                      month.getFullYear(),
                      month.getMonth() - 1,
                      1
                    )
                  )
                }
              >
                ‹
              </CalendarNavButton>

              <CalendarNavButton
                label="Następny miesiąc"
                onClick={() =>
                  setMonth(
                    new Date(
                      month.getFullYear(),
                      month.getMonth() + 1,
                      1
                    )
                  )
                }
              >
                ›
              </CalendarNavButton>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-1.5 text-center">
            {["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map(
              (day) => (
                <span
                  key={day}
                  className="py-2 text-[10px] font-black uppercase tracking-[0.08em] text-text-muted"
                >
                  {day}
                </span>
              )
            )}

            {days.map((date) => {
              const key = toDateKey(date);
              const dateTrips = tripsByDate.get(key) ?? [];
              const belongsToMonth =
                date.getMonth() === month.getMonth();
              const isSelected = key === selectedDate;
              const isToday = key === toDateKey(new Date());

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  className={cn(
                    "relative flex min-h-12 flex-col items-center justify-center rounded-control text-sm font-bold transition",
                    isSelected
                      ? "bg-primary text-white shadow-sm"
                      : isToday
                        ? "bg-primary-100 text-primary-800"
                        : belongsToMonth
                          ? "text-text-secondary hover:bg-surface-muted"
                          : "text-text-muted/45"
                  )}
                  aria-pressed={isSelected}
                >
                  {date.getDate()}

                  {dateTrips.length > 0 && (
                    <span
                      className={cn(
                        "mt-1 h-1.5 w-1.5 rounded-full",
                        isSelected ? "bg-white" : "bg-primary"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="min-w-0 border-t border-border pt-6 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
          <p className="text-xs font-bold text-text-muted">
            Wybrany dzień
          </p>

          <h3 className="mt-1.5 font-display text-lg font-extrabold text-text">
            {formatSelectedDate(selectedDate)}
          </h3>

          {selectedTrips.length > 0 ? (
            <div className="mt-5 space-y-3">
              {selectedTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/wyprawy/${trip.id}`}
                  className="block rounded-control border border-border bg-surface-muted px-4 py-3.5 transition hover:border-primary-200 hover:bg-primary-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-text">
                        {trip.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-text-muted">
                        {trip.lakeName ||
                          trip.lake?.name ||
                          "Bez łowiska"}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-text-secondary">
                        {formatTripDateRange(trip)}
                      </p>
                    </div>

                    <Badge
                      variant={
                        getTripPhase(trip) === "active"
                          ? "warning"
                          : getTripPhase(trip) === "finished"
                            ? "success"
                            : "primary"
                      }
                    >
                      {trip.preparationProgress}%
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-control bg-surface-muted px-4 py-5">
              <p className="text-sm font-bold text-text-secondary">
                Brak wypraw
              </p>
              <p className="mt-1 text-xs leading-5 text-text-muted">
                W wybranym dniu nie masz zaplanowanej żadnej wyprawy.
              </p>
            </div>
          )}
        </aside>
      </div>
    </Card>
  );
}

function CalendarNavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-control border border-border bg-surface text-lg font-bold text-text-secondary transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
    >
      {children}
    </button>
  );
}

function formatSelectedDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}
