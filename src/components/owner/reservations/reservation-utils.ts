import type {
  BookingTimes,
  OwnerReservationItem,
  ReservationFormState,
} from "@/components/owner/reservations/types";

export const RESERVATION_RANGE_OPTIONS = [7, 14, 30] as const;

export const RESERVATION_TYPE_OPTIONS = [
  {
    value: "competition",
    label: "Zawody wędkarskie",
  },
  {
    value: "private_event",
    label: "Wydarzenie prywatne",
  },
  {
    value: "maintenance",
    label: "Prace / serwis",
  },
  {
    value: "block",
    label: "Inna blokada",
  },
] as const;

export const RESERVATION_STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Do potwierdzenia",
  },
  {
    value: "confirmed",
    label: "Potwierdzona",
  },
  {
    value: "completed",
    label: "Zakończona",
  },
  {
    value: "no_show",
    label: "Nie przyjechał",
  },
  {
    value: "cancelled",
    label: "Anulowana",
  },
] as const;

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  pending: "Do potwierdzenia",
  confirmed: "Potwierdzona",
  paid: "Potwierdzona",
  completed: "Zakończona",
  no_show: "Nie przyjechał",
  cancelled: "Anulowana",
};

export const RESERVATION_TYPE_LABELS: Record<string, string> = {
  reservation: "Rezerwacja",
  competition: "Zawody",
  maintenance: "Prace / serwis",
  private_event: "Wydarzenie prywatne",
  block: "Blokada łowiska",
};

export function addDays(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(
    Date.UTC(year, month - 1, day + amount)
  );

  return date.toISOString().slice(0, 10);
}

export function getWarsawDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const map = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${map.year}-${map.month}-${map.day}`;
}

export function dateKeyFromIso(iso: string) {
  return getWarsawDateKey(new Date(iso));
}

export function formatDay(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00Z`);

  return {
    weekday: new Intl.DateTimeFormat("pl-PL", {
      timeZone: "UTC",
      weekday: "short",
    }).format(date),
    date: new Intl.DateTimeFormat("pl-PL", {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
    }).format(date),
  };
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatCompactDateTime(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function toDateTimeLocal(iso: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date(iso))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function reservationName(item: OwnerReservationItem) {
  return (
    item.title ||
    (item.scope === "lake"
      ? item.organizerName
      : item.customerName) ||
    RESERVATION_TYPE_LABELS[item.type] ||
    "Rezerwacja"
  );
}

export function reservationContact(item: OwnerReservationItem) {
  return item.scope === "lake"
    ? {
        name: item.organizerName ?? "",
        phone: item.organizerPhone ?? "",
        email: item.organizerEmail ?? "",
      }
    : {
        name: item.customerName ?? "",
        phone: item.customerPhone ?? "",
        email: item.customerEmail ?? "",
      };
}

export function reservationCoversDate(
  reservation: OwnerReservationItem,
  dateKey: string
) {
  const start = dateKeyFromIso(reservation.startsAt);
  const end = dateKeyFromIso(reservation.endsAt);

  if (start === end) {
    return dateKey === start;
  }

  return dateKey >= start && dateKey < end;
}

export function formFromReservation(
  item: OwnerReservationItem
): ReservationFormState {
  const contact = reservationContact(item);

  return {
    id: item.id,
    scope: item.scope === "lake" ? "lake" : "spot",
    type: item.type,
    status:
      item.status === "paid" ? "confirmed" : item.status,
    spotId: item.spotId ?? "",
    title: item.title ?? "",
    startsAt: toDateTimeLocal(item.startsAt),
    endsAt: toDateTimeLocal(item.endsAt),
    contactName: contact.name,
    contactPhone: contact.phone,
    contactEmail: contact.email,
    peopleCount: String(item.peopleCount || 1),
    note: item.note ?? "",
    internalNote: item.internalNote ?? "",
    isPublicEvent: item.isPublicEvent,
  };
}

export function createEmptyForm(
  dateKey: string,
  settings: BookingTimes,
  spotId: string
): ReservationFormState {
  const endDate = addDays(dateKey, 1);

  return {
    id: null,
    scope: spotId ? "spot" : "lake",
    type: spotId ? "reservation" : "block",
    status: "confirmed",
    spotId,
    title: "",
    startsAt: `${dateKey}T${
      settings.defaultStartTime || "12:00"
    }`,
    endsAt: `${endDate}T${
      settings.defaultEndTime || "10:00"
    }`,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    peopleCount: "1",
    note: "",
    internalNote: "",
    isPublicEvent: false,
  };
}

export function applyReservationPreset(
  form: ReservationFormState,
  settings: BookingTimes,
  kind: "standard" | "fullDay" | "day" | "night"
): ReservationFormState {
  const baseDate =
    form.startsAt.slice(0, 10) || getWarsawDateKey();
  const nextDate = addDays(baseDate, 1);

  if (kind === "day") {
    return {
      ...form,
      startsAt: `${baseDate}T${
        settings.dayStartTime || "08:00"
      }`,
      endsAt: `${baseDate}T${
        settings.dayEndTime || "16:00"
      }`,
    };
  }

  if (kind === "night") {
    return {
      ...form,
      startsAt: `${baseDate}T${
        settings.nightStartTime || "16:00"
      }`,
      endsAt: `${nextDate}T${
        settings.nightEndTime || "06:00"
      }`,
    };
  }

  if (kind === "fullDay") {
    return {
      ...form,
      startsAt: `${baseDate}T${
        settings.fullDayStartTime || "06:00"
      }`,
      endsAt: `${nextDate}T${
        settings.fullDayEndTime || "07:00"
      }`,
    };
  }

  return {
    ...form,
    startsAt: `${baseDate}T${
      settings.defaultStartTime || "12:00"
    }`,
    endsAt: `${nextDate}T${
      settings.defaultEndTime || "10:00"
    }`,
  };
}

export function validateReservationForm(
  form: ReservationFormState
) {
  if (form.scope === "spot" && !form.spotId) {
    return "Wybierz stanowisko.";
  }

  if (!form.startsAt || !form.endsAt) {
    return "Uzupełnij początek i koniec rezerwacji.";
  }

  const start = new Date(form.startsAt).getTime();
  const end = new Date(form.endsAt).getTime();

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end <= start
  ) {
    return "Data zakończenia musi być późniejsza niż data rozpoczęcia.";
  }

  const peopleCount = Number(form.peopleCount);

  if (
    !Number.isInteger(peopleCount) ||
    peopleCount < 1 ||
    peopleCount > 999
  ) {
    return "Liczba osób musi mieścić się w zakresie 1–999.";
  }

  if (form.contactEmail.trim()) {
    const emailLooksValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.contactEmail.trim()
      );

    if (!emailLooksValid) {
      return "Sprawdź adres e-mail.";
    }
  }

  return null;
}

export function canonicalReservationsUrl(
  lakeSlug: string,
  from: string,
  days: number
) {
  return `/moje-lowiska/${lakeSlug}/rezerwacje?from=${from}&days=${days}`;
}
