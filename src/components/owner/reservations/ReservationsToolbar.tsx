"use client";

import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { Button } from "@/components/ui/Button";
import {
  RESERVATION_RANGE_OPTIONS,
} from "@/components/owner/reservations/reservation-utils";
import { cn } from "@/lib/cn";

export function ReservationsToolbar({
  from,
  days,
  rangeLabel,
  onPrevious,
  onToday,
  onNext,
  onRangeChange,
}: {
  from: string;
  days: number;
  rangeLabel: string;
  onPrevious: () => void;
  onToday: () => void;
  onNext: () => void;
  onRangeChange: (days: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-bold text-text-muted">
          Widoczny okres
        </p>
        <p className="mt-1 font-display text-base font-extrabold text-text">
          {rangeLabel}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPrevious}
            aria-label={`Poprzednie ${days} dni od ${from}`}
          >
            <ArrowSmallRightIcon className="h-4 w-4 rotate-180" />
            <span className="hidden sm:inline">Poprzednie</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onToday}
          >
            Dzisiaj
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onNext}
            aria-label={`Następne ${days} dni od ${from}`}
          >
            <span className="hidden sm:inline">Następne</span>
            <ArrowSmallRightIcon className="h-4 w-4" />
          </Button>
        </div>

        <div
          className="grid grid-cols-3 gap-1.5 rounded-control bg-surface-muted p-1.5"
          aria-label="Zakres kalendarza"
        >
          {RESERVATION_RANGE_OPTIONS.map((value) => {
            const active = value === days;

            return (
              <button
                key={value}
                type="button"
                onClick={() => onRangeChange(value)}
                aria-pressed={active}
                className={cn(
                  "h-9 rounded-xl px-3 text-xs font-bold transition",
                  active
                    ? "bg-surface text-primary-700 shadow-[0_1px_3px_rgba(13,30,51,0.08)]"
                    : "text-text-secondary hover:text-text"
                )}
              >
                {value} dni
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
