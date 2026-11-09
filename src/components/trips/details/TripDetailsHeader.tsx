import Link from "next/link";

import { CheckListIcon } from "@/components/icons/CheckListIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { MarkerIcon } from "@/components/icons/MarkerIcon";
import { TripActionPopup } from "@/components/dashboard/TripActionPopup";
import { TripStatusActions } from "@/components/dashboard/TripStatusActions";
import { Badge } from "@/components/ui/Badge";
import {
  ButtonLink,
  buttonClassName,
} from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TripProgress } from "@/components/trips/overview/TripProgress";
import type { TripDetailsData } from "@/lib/trips/details-query";
import {
  formatTripDateRange,
  getNavigationUrl,
  getTripDetailPhase,
  getTripTypeLabel,
} from "@/lib/trips/details-utils";

export function TripDetailsHeader({
  trip,
  isOwner,
  accessRole,
  canEdit,
  participantCount,
  preparationProgress,
}: {
  trip: TripDetailsData;
  isOwner: boolean;
  accessRole: string;
  canEdit: boolean;
  participantCount: number;
  preparationProgress: number;
}) {
  const phase = getTripDetailPhase(
    trip.status,
    trip.startsAt,
    trip.endsAt
  );

  const phaseVariant = {
    upcoming: "primary",
    active: "warning",
    finished: "success",
    cancelled: "danger",
  } as const;

  const phaseLabel = {
    upcoming: "Nadchodząca",
    active: "W trakcie",
    finished: "Zakończona",
    cancelled: "Anulowana",
  } as const;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/wyprawy"
          className="w-fit text-sm font-bold text-primary transition hover:text-primary-hover"
        >
          Centrum wypraw
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral" size="md">
            {isOwner
              ? "Właściciel"
              : accessRole === "co_owner"
                ? "Współwłaściciel"
                : accessRole === "editor"
                  ? "Edytor"
                  : "Podgląd"}
          </Badge>

          <TripStatusActions
            tripId={trip.id}
            status={trip.status}
            canEdit={canEdit}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="relative min-h-[230px] overflow-hidden bg-surface-muted lg:min-h-[360px]">
            {trip.lake?.images[0]?.url ? (
              <img
                src={trip.lake.images[0].url}
                alt={
                  trip.lakeName ||
                  trip.lake?.name ||
                  trip.title
                }
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(145deg,var(--rybio-blue-100)_0%,var(--rybio-aqua-50)_58%,var(--rybio-surface-muted)_100%)]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/65 via-navy-950/5 to-transparent" />

            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              <Badge
                variant={phaseVariant[phase]}
                size="md"
              >
                {phaseLabel[phase]}
              </Badge>

              <Badge
                variant="dark"
                size="md"
                className="border-white/15 bg-navy-950/75 backdrop-blur"
              >
                {getTripTypeLabel(trip.tripType)}
              </Badge>
            </div>

            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-sm font-bold leading-6 text-white">
                {trip.lakeName ||
                  trip.lake?.name ||
                  "Bez wybranego łowiska"}
              </p>

              {trip.lake && (
                <p className="mt-1 text-xs text-white/75">
                  {trip.lake.city} · woj.{" "}
                  {trip.lake.voivodeship}
                </p>
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-col px-5 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                Centrum wyprawy
              </p>

              <h1 className="mt-2 break-words font-display text-3xl font-extrabold tracking-[-0.035em] text-text sm:text-4xl">
                {trip.title}
              </h1>

              <p className="mt-3 text-sm font-bold leading-6 text-text-secondary sm:text-[15px]">
                {formatTripDateRange(
                  trip.startsAt,
                  trip.endsAt
                )}
              </p>

              <p className="mt-1.5 text-sm text-text-muted">
                {participantCount}{" "}
                {participantCount === 1
                  ? "uczestnik"
                  : "uczestników"}
              </p>
            </div>

            <div className="mt-7">
              <TripProgress
                value={preparationProgress}
                label="Gotowość do wyprawy"
              />
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {phase !== "finished" &&
                phase !== "cancelled" && (
                  <TripActionPopup
                    tripId={trip.id}
                    action="checklist"
                    canEdit={canEdit}
                    icon={
                      <CheckListIcon className="h-4 w-4 shrink-0" />
                    }
                    label={
                      trip.checklistId
                        ? "Przygotowanie"
                        : "Utwórz checklistę"
                    }
                    tripStartsAt={trip.startsAt}
                    tripEndsAt={trip.endsAt}
                    tripType={trip.tripType}
                    lakeGearRequirements={
                      trip.lake?.gearRequirements.map(
                        (item) => item.text
                      ) ?? []
                    }
                    className={buttonClassName({
                      variant:
                        phase === "active"
                          ? "secondary"
                          : "primary",
                      size: "md",
                    })}
                  />
                )}

              {canEdit && phase !== "cancelled" && (
                <ButtonLink
                  href={`/polowy?new=1&tripId=${trip.id}`}
                  variant={
                    phase === "active"
                      ? "primary"
                      : "secondary"
                  }
                >
                  <FishIcon className="h-4 w-4" />
                  Dodaj połów
                </ButtonLink>
              )}

              {trip.lake && (
                <a
                  href={getNavigationUrl(
                    trip.lake.lat,
                    trip.lake.lng
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClassName({
                    variant: "outline",
                    size: "md",
                  })}
                >
                  <MarkerIcon className="h-4 w-4" />
                  Nawigacja
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
