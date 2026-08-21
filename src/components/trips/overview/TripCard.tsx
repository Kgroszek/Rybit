"use client";

import { CheckListIcon } from "@/components/icons/CheckListIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import type { FishingTrip } from "@/components/trips/types";
import {
  formatTripDateRange,
  getRemainingPreparationItems,
  getTripPhase,
  getTripTypeLabel,
} from "@/components/trips/utils";
import { TripPhaseBadge } from "@/components/trips/overview/TripPhaseBadge";
import { TripProgress } from "@/components/trips/overview/TripProgress";

export function TripCard({
  trip,
  onEdit,
  onDelete,
}: {
  trip: FishingTrip;
  onEdit: (trip: FishingTrip) => void;
  onDelete: (trip: FishingTrip) => void;
}) {
  const phase = getTripPhase(trip);
  const remaining = getRemainingPreparationItems(trip);

  return (
    <Card
      variant="interactive"
      className="flex h-full min-w-0 flex-col overflow-hidden"
    >
      <div className="relative h-44 overflow-hidden bg-surface-muted">
        {trip.lakeImage ? (
          <img
            src={trip.lakeImage}
            alt={trip.lakeName || trip.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(145deg,var(--rybio-primary-100)_0%,var(--rybio-aqua-50)_62%,var(--rybio-surface-muted)_100%)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/55 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <TripPhaseBadge phase={phase} />

          <span className="rounded-full border border-white/20 bg-navy-950/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            {trip.isOwner ? "Moja" : "Współdzielona"}
          </span>
        </div>

        <p className="absolute bottom-4 left-4 right-4 text-xs font-bold uppercase tracking-[0.12em] text-white/85">
          {getTripTypeLabel(trip.tripType)}
        </p>
      </div>

      <div className="flex flex-1 flex-col px-5 py-5">
        <h2 className="line-clamp-2 font-display text-xl font-extrabold tracking-[-0.02em] text-text">
          {trip.title}
        </h2>

        <p className="mt-2 text-sm font-bold text-text-secondary">
          {formatTripDateRange(trip)}
        </p>

        <p className="mt-1 truncate text-sm text-text-muted">
          {trip.lakeName || trip.lake?.name || "Bez wybranego łowiska"}
        </p>

        <div className="mt-5">
          <TripProgress
            value={trip.preparationProgress}
            compact
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-text-muted">
          <span>{trip.participantsCount} os.</span>
          <span>{trip._count.catches} połowów</span>

          {remaining > 0 && phase !== "finished" && (
            <span className="font-bold text-warning-foreground">
              {remaining} do spakowania
            </span>
          )}
        </div>

        {trip.pendingMembersCount > 0 && trip.isOwner && (
          <div className="mt-4 rounded-control border border-warning-border bg-warning-subtle px-3 py-2.5 text-xs font-bold text-warning-foreground">
            {trip.pendingMembersCount}{" "}
            {trip.pendingMembersCount === 1
              ? "zaproszenie oczekuje"
              : "zaproszenia oczekują"}{" "}
            na odpowiedź
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-5">
          <ButtonLink
            href={`/wyprawy/${trip.id}`}
            fullWidth
            className="min-w-0 flex-1"
          >
            Otwórz wyprawę
          </ButtonLink>

          {(trip.checklistId || trip.canEdit) && phase !== "finished" && (
            <ButtonLink
              href={`/wyprawy/${trip.id}?tab=checklista`}
              variant="secondary"
              className="h-11 w-11 px-0"
              aria-label="Otwórz checklistę"
              title="Checklista"
            >
              <CheckListIcon className="h-4 w-4" />
            </ButtonLink>
          )}

          {trip.canEdit && (
            <IconButton
              label="Edytuj wyprawę"
              variant="outline"
              icon={<PencilIcon className="h-4 w-4" />}
              onClick={() => onEdit(trip)}
            />
          )}

          {trip.canDelete && (
            <IconButton
              label="Usuń wyprawę"
              variant="ghost"
              className="text-danger hover:bg-danger-subtle hover:text-danger"
              icon={<TrashIcon className="h-4 w-4" />}
              onClick={() => onDelete(trip)}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
