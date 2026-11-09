import { AlertIcon } from "@/components/icons/AlertIcon";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { TripProgress } from "@/components/trips/overview/TripProgress";
import {
  TripDetailsSection,
} from "@/components/trips/details/TripDetailsSection";
import type { TripDetailsData } from "@/lib/trips/details-query";
import {
  formatDateTime,
  formatTripDateRange,
  getActivityLabel,
  getNavigationUrl,
  getStatusLabel,
  getTripTypeLabel,
} from "@/lib/trips/details-utils";

type ActivityGroup = {
  key: string;
  actorUserId: string;
  actorName: string | null;
  action: string;
  createdAt: Date;
  count: number;
};

export function TripOverview({
  trip,
  detailsProgress,
  checklistProgress,
  gearProgress,
  preparationProgress,
  preparationWarnings,
  activities,
  activityCount,
  activityPage,
  activityTotalPages,
  acceptedMembersCount,
  pendingMembersCount,
  totalWeight,
  biggestCatch,
}: {
  trip: TripDetailsData;
  detailsProgress: number;
  checklistProgress: number;
  gearProgress: number;
  preparationProgress: number;
  preparationWarnings: string[];
  activities: ActivityGroup[];
  activityCount: number;
  activityPage: number;
  activityTotalPages: number;
  acceptedMembersCount: number;
  pendingMembersCount: number;
  totalWeight: number;
  biggestCatch: TripDetailsData["catches"][number] | null;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <main className="space-y-6">
        <TripDetailsSection
          title="Gotowość do wyprawy"
          description="Najważniejsze elementy, które warto zamknąć przed wyjazdem."
          action={
            <ButtonLink
              href={`/wyprawy/${trip.id}?tab=przygotowanie`}
              variant="secondary"
              size="sm"
            >
              Otwórz przygotowanie
            </ButtonLink>
          }
        >
          <div className="space-y-6">
            <ReadinessRow
              label="Dane wyprawy"
              description="Termin, miejsce i podstawowe informacje"
              value={detailsProgress}
            />

            <ReadinessRow
              label="Checklista"
              description="Spakowane elementy checklisty"
              value={checklistProgress}
            />

            <ReadinessRow
              label="Wymagany sprzęt"
              description="Sprzęt oznaczony jako wymagany"
              value={gearProgress}
            />

            {preparationWarnings.length > 0 && (
              <div className="rounded-control border border-warning-border bg-warning-subtle px-4 py-4">
                <div className="flex items-start gap-3">
                  <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning-foreground" />

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-warning-foreground">
                      Wymaga uwagi
                    </p>

                    <div className="mt-2 space-y-1.5">
                      {preparationWarnings.map(
                        (warning) => (
                          <p
                            key={warning}
                            className="text-xs leading-5 text-warning-foreground"
                          >
                            {warning}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-control bg-primary-50 px-4 py-4">
              <TripProgress
                label="Łączna gotowość"
                value={preparationProgress}
              />
            </div>
          </div>
        </TripDetailsSection>

        <TripDetailsSection
          title="Ostatnia aktywność"
          description="Historia najważniejszych zmian wykonywanych przez uczestników."
          action={
            activityCount > 0 ? (
              <Badge variant="neutral" size="md">
                {activityCount} wpisów
              </Badge>
            ) : undefined
          }
        >
          {activities.length > 0 ? (
            <>
              <div className="divide-y divide-border">
                {activities.map((activity) => (
                  <div
                    key={activity.key}
                    className="flex gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <span
                      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-6 text-text">
                        {activity.actorName ||
                          "Użytkownik"}{" "}
                        <span className="font-medium text-text-secondary">
                          {getActivityLabel(
                            activity.action
                          )}
                        </span>
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        {activity.count > 1
                          ? `${activity.count} zmian · `
                          : ""}
                        {formatDateTime(
                          activity.createdAt
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {activityTotalPages > 1 && (
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                  {activityPage > 1 ? (
                    <ButtonLink
                      href={`/wyprawy/${trip.id}?tab=przeglad&activityPage=${activityPage - 1}`}
                      variant="outline"
                      size="sm"
                    >
                      Nowsze
                    </ButtonLink>
                  ) : (
                    <span />
                  )}

                  <span className="text-xs font-bold text-text-muted">
                    {activityPage}/{activityTotalPages}
                  </span>

                  {activityPage <
                  activityTotalPages ? (
                    <ButtonLink
                      href={`/wyprawy/${trip.id}?tab=przeglad&activityPage=${activityPage + 1}`}
                      variant="outline"
                      size="sm"
                    >
                      Starsze
                    </ButtonLink>
                  ) : (
                    <span />
                  )}
                </div>
              )}
            </>
          ) : (
            <EmptyCopy
              title="Brak aktywności"
              description="Historia zmian pojawi się, gdy uczestnicy zaczną pracować nad wyprawą."
            />
          )}
        </TripDetailsSection>
      </main>

      <aside className="space-y-6">
        <TripDetailsSection title="Informacje">
          <div className="divide-y divide-border">
            <DetailRow
              label="Termin"
              value={formatTripDateRange(
                trip.startsAt,
                trip.endsAt
              )}
            />
            <DetailRow
              label="Typ"
              value={getTripTypeLabel(
                trip.tripType
              )}
            />
            <DetailRow
              label="Status"
              value={getStatusLabel(
                trip.status
              )}
            />
            <DetailRow
              label="Planowana liczba osób"
              value={String(trip.peopleCount)}
            />
            <DetailRow
              label="Zaakceptowani"
              value={String(
                acceptedMembersCount + 1
              )}
            />
            <DetailRow
              label="Oczekujące zaproszenia"
              value={String(
                pendingMembersCount
              )}
            />
          </div>

          {trip.note && (
            <div className="mt-5 border-t border-border pt-5">
              <p className="text-xs font-bold text-text-muted">
                Notatka organizacyjna
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                {trip.note}
              </p>
            </div>
          )}
        </TripDetailsSection>

        <TripDetailsSection
          title="Łowisko"
          action={
            trip.lake ? (
              <ButtonLink
                href={`/lowiska/${trip.lake.slug}`}
                variant="outline"
                size="sm"
              >
                Zobacz
              </ButtonLink>
            ) : undefined
          }
        >
          {trip.lake ? (
            <div>
              <p className="font-display text-lg font-extrabold text-text">
                {trip.lake.name}
              </p>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {[
                  trip.lake.street,
                  trip.lake.postalCode,
                  trip.lake.city,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              <p className="text-sm text-text-muted">
                woj. {trip.lake.voivodeship}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="primary">
                  ★{" "}
                  {Number(
                    trip.lake.rating
                  ).toFixed(1)}
                </Badge>

                {trip.lake.fish && (
                  <Badge variant="neutral">
                    {trip.lake.fish}
                  </Badge>
                )}
              </div>

              {trip.lake.gearRequirements
                .length > 0 && (
                <div className="mt-5 rounded-control border border-warning-border bg-warning-subtle px-4 py-3.5">
                  <p className="text-xs font-bold text-warning-foreground">
                    {
                      trip.lake
                        .gearRequirements.length
                    }{" "}
                    {trip.lake
                      .gearRequirements.length ===
                    1
                      ? "wymaganie łowiska"
                      : "wymagania łowiska"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-warning-foreground">
                    Rybio uwzględnia je przy przygotowaniu rekomendowanej checklisty.
                  </p>
                </div>
              )}

              <a
                href={getNavigationUrl(
                  trip.lake.lat,
                  trip.lake.lng
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm font-bold text-primary hover:text-primary-hover"
              >
                Prowadź do łowiska
              </a>
            </div>
          ) : (
            <EmptyCopy
              title="Brak łowiska"
              description="Do tej wyprawy nie przypisano łowiska."
            />
          )}
        </TripDetailsSection>

        <TripDetailsSection title="Połowy">
          <div className="grid grid-cols-2 gap-3">
            <SmallMetric
              label="Liczba"
              value={String(
                trip.catches.length
              )}
            />

            <SmallMetric
              label="Łączna waga"
              value={
                totalWeight > 0
                  ? `${totalWeight.toFixed(
                      2
                    )} kg`
                  : "Brak"
              }
            />
          </div>

          {biggestCatch?.weight && (
            <div className="mt-4 rounded-control border border-warning-border bg-warning-subtle px-4 py-3.5">
              <p className="text-xs font-bold text-warning-foreground">
                Największa ryba
              </p>

              <p className="mt-1 text-sm font-extrabold text-text">
                {biggestCatch.fishName} ·{" "}
                {biggestCatch.weight.toFixed(
                  2
                )}{" "}
                kg
              </p>
            </div>
          )}
        </TripDetailsSection>
      </aside>
    </div>
  );
}

function ReadinessRow({
  label,
  description,
  value,
}: {
  label: string;
  description: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-text">
            {label}
          </p>
          <p className="mt-1 text-xs leading-5 text-text-muted">
            {description}
          </p>
        </div>

        <span className="shrink-0 text-sm font-extrabold text-primary-700">
          {value}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-surface-strong">
        <div
          className="h-full rounded-full bg-primary"
          style={{
            width: `${Math.max(
              0,
              Math.min(value, 100)
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span className="text-xs font-bold text-text-muted">
        {label}
      </span>
      <span className="max-w-[60%] text-right text-sm font-bold text-text">
        {value}
      </span>
    </div>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-control bg-surface-muted px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-sm font-extrabold text-text">
        {value}
      </p>
    </div>
  );
}

function EmptyCopy({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-control bg-surface-muted px-4 py-5 text-center">
      <p className="text-sm font-bold text-text">
        {title}
      </p>
      <p className="mt-1.5 text-xs leading-5 text-text-muted">
        {description}
      </p>
    </div>
  );
}
