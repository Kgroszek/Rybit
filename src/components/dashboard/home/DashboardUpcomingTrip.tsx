import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { MarkerIcon } from "@/components/icons/MarkerIcon";
import type {
  DashboardTrip,
  PreparationSummary,
} from "@/components/dashboard/home/types";
import {
  formatTimeUntilTrip,
  formatTripDateRange,
} from "@/components/dashboard/home/utils";
import { ButtonLink } from "@/components/ui/Button";
import {
  Card,
  CardContent,
} from "@/components/ui/Card";

export function DashboardUpcomingTrip({
  trip,
  preparation,
  now,
}: {
  trip: DashboardTrip;
  preparation: PreparationSummary;
  now: Date;
}) {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Najbliższa wyprawa
            </p>

            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-text">
              {trip.title}
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {trip.lakeName && (
                <Pill>
                  <MarkerIcon className="h-4 w-4" />
                  {trip.lakeName}
                </Pill>
              )}

              <Pill>
                <CalendarIcon className="h-4 w-4" />
                {formatTripDateRange(
                  trip.startsAt,
                  trip.endsAt
                )}
              </Pill>

              <Pill>
                {formatTimeUntilTrip(
                  trip.startsAt,
                  now
                )}
              </Pill>
            </div>

            <div className="mt-5 grid max-w-xl gap-2 sm:grid-cols-2">
              <Metric
                label="Checklista"
                value={
                  preparation.checklistTotal > 0
                    ? `${preparation.checklistPacked}/${preparation.checklistTotal}`
                    : "Brak"
                }
              />
              <Metric
                label="Sprzęt"
                value={
                  preparation.gearTotal > 0
                    ? `${preparation.gearPacked}/${preparation.gearTotal}`
                    : "Brak"
                }
              />
            </div>
          </div>

          <ButtonLink
            href={`/wyprawy/${trip.id}`}
            variant="dark"
          >
            Otwórz wyprawę
          </ButtonLink>
        </div>
      </CardContent>
    </Card>
  );
}

function Pill({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-bold text-text-secondary">
      {children}
    </span>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-control bg-surface-muted px-4 py-3">
      <p className="text-xs font-semibold text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-extrabold text-text">
        {value}
      </p>
    </div>
  );
}
