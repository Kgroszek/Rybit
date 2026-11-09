import { AlertIcon } from "@/components/icons/AlertIcon";
import { CheckListIcon } from "@/components/icons/CheckListIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { FishingTrip } from "@/components/trips/types";
import {
  formatTripDateRange,
  getRemainingPreparationItems,
  getTripPhase,
  getTripTypeLabel,
} from "@/components/trips/utils";
import { TripPhaseBadge } from "@/components/trips/overview/TripPhaseBadge";
import { TripProgress } from "@/components/trips/overview/TripProgress";

export function TripsPriorityCard({
  trip,
}: {
  trip: FishingTrip | null;
}) {
  if (!trip) {
    return (
      <Card className="overflow-hidden">
        <div className="grid min-h-[280px] place-items-center px-6 py-10 text-center">
          <div className="max-w-lg">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
              Najbliższa wyprawa
            </p>

            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-[-0.025em] text-text">
              Nie masz zaplanowanego wyjazdu
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
              Gdy zaplanujesz wyprawę, tutaj zobaczysz termin, poziom
              przygotowania i najważniejsze rzeczy do zrobienia przed wyjazdem.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const phase = getTripPhase(trip);
  const remainingItems = getRemainingPreparationItems(trip);
  const needsPreparation =
    phase === "upcoming" &&
    (trip.preparationProgress < 100 ||
      trip.preparationWarnings.length > 0);

  const primaryHref = needsPreparation
    ? `/wyprawy/${trip.id}?tab=checklista`
    : `/wyprawy/${trip.id}`;

  const primaryLabel =
    phase === "active"
      ? "Przejdź do wyprawy"
      : needsPreparation
        ? "Przygotuj wyprawę"
        : "Otwórz wyprawę";

  return (
    <Card className="overflow-hidden">
      <div className="grid lg:grid-cols-[minmax(250px,0.82fr)_minmax(0,1.55fr)]">
        <div className="relative min-h-[230px] bg-surface-muted lg:min-h-[330px]">
          {trip.lakeImage ? (
            <img
              src={trip.lakeImage}
              alt={trip.lakeName || trip.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(145deg,var(--rybio-primary-100)_0%,var(--rybio-aqua-50)_55%,var(--rybio-surface-muted)_100%)]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/55 via-transparent to-transparent" />

          <div className="absolute left-5 top-5">
            <TripPhaseBadge phase={phase} />
          </div>

          <p className="absolute bottom-5 left-5 right-5 text-sm font-bold text-white">
            {trip.lakeName || trip.lake?.name || "Bez wybranego łowiska"}
          </p>
        </div>

        <div className="flex min-w-0 flex-col px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                Najbliższa wyprawa
              </p>

              <h2 className="mt-2.5 break-words font-display text-2xl font-extrabold tracking-[-0.03em] text-text sm:text-3xl">
                {trip.title}
              </h2>

              <p className="mt-2 text-sm font-bold leading-6 text-text-secondary">
                {formatTripDateRange(trip)}
              </p>

              <p className="mt-1 text-sm text-text-muted">
                {getTripTypeLabel(trip.tripType)}
                {" · "}
                {trip.participantsCount}{" "}
                {trip.participantsCount === 1 ? "osoba" : "osoby"}
              </p>
            </div>

            <span className="w-fit shrink-0 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-bold text-text-secondary">
              {trip.isOwner ? "Twoja wyprawa" : "Współdzielona"}
            </span>
          </div>

          <div className="mt-7">
            <TripProgress
              value={trip.preparationProgress}
              label="Przygotowanie wyprawy"
            />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2.5">
            <MiniMetric
              label="Checklista"
              value={`${trip.packedChecklistItemsCount}/${trip.checklistItemsCount}`}
            />
            <MiniMetric
              label="Sprzęt"
              value={`${trip.packedRequiredGearItemsCount}/${trip.requiredGearItemsCount}`}
            />
            <MiniMetric
              label="Połowy"
              value={String(trip._count.catches)}
            />
          </div>

          {(remainingItems > 0 || trip.preparationWarnings.length > 0) && (
            <div className="mt-5 rounded-control border border-warning-border bg-warning-subtle px-4 py-3.5">
              <div className="flex items-start gap-3">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning-foreground" />

                <div className="min-w-0">
                  <p className="text-sm font-bold text-warning-foreground">
                    {remainingItems > 0
                      ? `${remainingItems} ${
                          remainingItems === 1
                            ? "ważna rzecz została"
                            : "ważnych rzeczy zostało"
                        } do przygotowania`
                      : "Wyprawa wymaga jeszcze uwagi"}
                  </p>

                  {trip.preparationWarnings[0] && (
                    <p className="mt-1 text-xs leading-5 text-warning-foreground">
                      {trip.preparationWarnings[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:flex-wrap">
            <ButtonLink href={primaryHref}>
              {needsPreparation && (
                <CheckListIcon className="h-4 w-4" />
              )}
              {primaryLabel}
            </ButtonLink>

            {phase === "active" ? (
              <ButtonLink
                href={`/polowy?new=1&tripId=${trip.id}`}
                variant="secondary"
              >
                <FishIcon className="h-4 w-4" />
                Dodaj połów
              </ButtonLink>
            ) : (
              <ButtonLink
                href={`/wyprawy/${trip.id}`}
                variant="outline"
              >
                Szczegóły
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function MiniMetric({
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

      <p className="mt-1 font-display text-sm font-extrabold text-text sm:text-base">
        {value}
      </p>
    </div>
  );
}
