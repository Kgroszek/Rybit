"use client";

import Link from "next/link";

import { FishIcon } from "@/components/icons/FishIcon";
import { TripChecklistDialog } from "@/components/trips/actions/TripChecklistDialog";
import { TripCostDialog } from "@/components/trips/actions/TripCostDialog";
import { TripGearDialog } from "@/components/trips/actions/TripGearDialog";
import { TripMediaDialog } from "@/components/trips/actions/TripMediaDialog";
import { TripNoteDialog } from "@/components/trips/actions/TripNoteDialog";
import { TripActionTrigger } from "@/components/trips/actions/TripActionTrigger";
import type { TripActionPopupProps } from "@/components/trips/actions/types";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Adapter kompatybilności dla starszych miejsc w projekcie.
 *
 * Nowy kod powinien importować bezpośrednio wyspecjalizowany dialog.
 * Adapter nie posiada własnego stanu ani logiki requestów.
 */
export function TripActionPopup(
  props: TripActionPopupProps
) {
  const {
    action,
    tripId,
    canEdit,
    label,
    icon,
    className,
    tripStartsAt,
    tripEndsAt,
    tripType,
    lakeGearRequirements,
    participants,
  } = props;

  if (action === "checklist") {
    return (
      <TripChecklistDialog
        tripId={tripId}
        canEdit={canEdit}
        label={label || "Otwórz checklistę"}
        icon={icon}
        className={className}
        tripStartsAt={tripStartsAt}
        tripEndsAt={tripEndsAt}
        tripType={tripType}
        lakeGearRequirements={
          lakeGearRequirements
        }
      />
    );
  }

  if (action === "gear") {
    return (
      <TripGearDialog
        tripId={tripId}
        canEdit={canEdit}
        label={label || "Edytuj sprzęt"}
        icon={icon}
        className={className}
      />
    );
  }

  if (action === "note") {
    return (
      <TripNoteDialog
        tripId={tripId}
        canEdit={canEdit}
        label={label || "Dodaj notatkę"}
        icon={icon}
        className={className}
      />
    );
  }

  if (action === "cost") {
    return (
      <TripCostDialog
        tripId={tripId}
        canEdit={canEdit}
        participants={participants}
        label={label || "Dodaj koszt"}
        icon={icon}
        className={className}
      />
    );
  }

  if (action === "media") {
    return (
      <TripMediaDialog
        tripId={tripId}
        canEdit={canEdit}
        label={label || "Dodaj zdjęcia"}
        icon={icon}
        className={className}
      />
    );
  }

  const catchLabel = label || "Dodaj połów";
  const catchIcon = icon || (
    <FishIcon className="h-4 w-4" />
  );

  if (!canEdit) {
    return (
      <TripActionTrigger
        label={catchLabel}
        icon={catchIcon}
        className={className}
        disabled
        onClick={() => undefined}
      />
    );
  }

  const href = `/polowy?new=1&tripId=${tripId}`;

  // Stare wywołania mogły przekazywać kompletny własny styl przycisku.
  // W takim przypadku nie dokładamy do niego kolejnego wariantu ButtonLink.
  if (className) {
    return (
      <Link href={href} className={className}>
        <span className="inline-flex items-center justify-center gap-2">
          {catchIcon}
          <span>{catchLabel}</span>
        </span>
      </Link>
    );
  }

  return (
    <ButtonLink href={href}>
      {catchIcon}
      {catchLabel}
    </ButtonLink>
  );
}

export type { TripActionPopupProps };
