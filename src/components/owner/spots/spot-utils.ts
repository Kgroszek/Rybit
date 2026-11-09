import type {
  SpotDto,
  SpotFormState,
} from "@/components/owner/spots/types";

export const EMPTY_SPOT_FORM: SpotFormState = {
  id: null,
  name: "",
  description: "",
  maxPeople: "2",
  isActive: true,
};

export function formFromSpot(
  spot: SpotDto
): SpotFormState {
  return {
    id: spot.id,
    name: spot.name,
    description: spot.description ?? "",
    maxPeople: String(spot.maxPeople),
    isActive: spot.isActive,
  };
}

export function validateSpotForm(
  form: SpotFormState
) {
  const name = form.name.trim();

  if (name.length < 2) {
    return "Nazwa stanowiska musi mieć co najmniej 2 znaki.";
  }

  if (name.length > 120) {
    return "Nazwa stanowiska może mieć maksymalnie 120 znaków.";
  }

  const maxPeople = Number(form.maxPeople);

  if (
    !Number.isInteger(maxPeople) ||
    maxPeople < 1 ||
    maxPeople > 99
  ) {
    return "Maksymalna liczba osób musi mieścić się w zakresie 1–99.";
  }

  if (form.description.trim().length > 1200) {
    return "Opis może mieć maksymalnie 1200 znaków.";
  }

  return null;
}

export function formatSpotReservationRange(
  startsAt: string,
  endsAt: string
) {
  const formatter = new Intl.DateTimeFormat(
    "pl-PL",
    {
      timeZone: "Europe/Warsaw",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return `${formatter.format(
    new Date(startsAt)
  )} – ${formatter.format(
    new Date(endsAt)
  )}`;
}

export function formatSpotReservationEnd(
  endsAt: string
) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(endsAt));
}

export function getSpotReservationLabel(
  spot: SpotDto
) {
  if (!spot.nextReservation) {
    return "Brak kolejnej rezerwacji";
  }

  if (spot.isOccupiedNow) {
    return `Trwa do ${formatSpotReservationEnd(
      spot.nextReservation.endsAt
    )}`;
  }

  return formatSpotReservationRange(
    spot.nextReservation.startsAt,
    spot.nextReservation.endsAt
  );
}

export function getSpotReservationContact(
  spot: SpotDto
) {
  return (
    spot.nextReservation?.title ||
    spot.nextReservation?.customerName ||
    null
  );
}
