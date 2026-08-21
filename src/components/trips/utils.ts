import type {
  FishingTrip,
  LakeOption,
  TripPhase,
  TripSort,
} from "@/components/trips/types";

const DAY_MS = 86_400_000;

export function getTripPhase(
  trip: Pick<FishingTrip, "status" | "startsAt" | "endsAt">,
  now = new Date()
): TripPhase {
  const normalizedStatus = trip.status.trim().toLowerCase();

  if (normalizedStatus === "cancelled" || normalizedStatus === "canceled") {
    return "cancelled";
  }

  if (normalizedStatus === "completed" || normalizedStatus === "finished") {
    return "finished";
  }

  const nowTime = now.getTime();
  const startsAt = new Date(trip.startsAt).getTime();
  const endsAt = trip.endsAt ? new Date(trip.endsAt).getTime() : null;

  if (Number.isFinite(endsAt) && endsAt !== null && endsAt < nowTime) {
    return "finished";
  }

  if (
    normalizedStatus === "active" ||
    (Number.isFinite(startsAt) &&
      startsAt <= nowTime &&
      (endsAt === null || !Number.isFinite(endsAt) || endsAt >= nowTime))
  ) {
    return "active";
  }

  return "upcoming";
}

export function getTripTypeLabel(value: string) {
  const labels: Record<string, string> = {
    custom: "Własna",
    spinning: "Spinning",
    feeder: "Feeder",
    method_feeder: "Method feeder",
    carp: "Karpiówka",
    float: "Spławik",
    night: "Nocka",
    competition: "Zawody",
  };

  return labels[value] ?? "Wyprawa";
}

export function getSortLabel(sort: TripSort) {
  const labels: Record<TripSort, string> = {
    nearest: "Najbliższe",
    farthest: "Najdalsze",
    newest: "Ostatnio dodane",
    name: "Nazwa A–Z",
  };

  return labels[sort];
}

export function formatTripDateRange(
  tripOrStart: Pick<FishingTrip, "startsAt" | "endsAt"> | string,
  explicitEnd?: string | null
) {
  const startsAt =
    typeof tripOrStart === "string" ? tripOrStart : tripOrStart.startsAt;
  const endsAt =
    typeof tripOrStart === "string" ? explicitEnd ?? null : tripOrStart.endsAt;

  const start = new Date(startsAt);

  if (Number.isNaN(start.getTime())) {
    return "Termin do ustalenia";
  }

  const startDate = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(start);

  if (!endsAt) {
    return startDate;
  }

  const end = new Date(endsAt);

  if (Number.isNaN(end.getTime())) {
    return startDate;
  }

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return startDate;
  }

  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${new Intl.DateTimeFormat(
      "pl-PL",
      {
        month: "long",
        year: "numeric",
      }
    ).format(end)}`;
  }

  return `${new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
  }).format(start)} – ${new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(end)}`;
}

export function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Niepoprawna data";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function toDateTimeLocalValue(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000
  );

  return localDate.toISOString().slice(0, 16);
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function buildCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayBasedDay = (firstDay.getDay() + 6) % 7;
  const firstVisibleDay = new Date(
    month.getFullYear(),
    month.getMonth(),
    1 - mondayBasedDay
  );

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstVisibleDay);
    date.setDate(firstVisibleDay.getDate() + index);
    return date;
  });
}

export function getTripDateKeys(
  trip: Pick<FishingTrip, "startsAt" | "endsAt">
) {
  const start = new Date(trip.startsAt);

  if (Number.isNaN(start.getTime())) {
    return [];
  }

  const end = trip.endsAt ? new Date(trip.endsAt) : start;
  const safeEnd = Number.isNaN(end.getTime()) || end < start ? start : end;

  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const endDay = new Date(
    safeEnd.getFullYear(),
    safeEnd.getMonth(),
    safeEnd.getDate()
  );

  const totalDays = Math.min(
    366,
    Math.floor((endDay.getTime() - startDay.getTime()) / DAY_MS) + 1
  );

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(startDay);
    date.setDate(startDay.getDate() + index);
    return toDateKey(date);
  });
}

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function formatLakeOption(lake: LakeOption) {
  return [lake.name, lake.city, lake.voivodeship].filter(Boolean).join(" • ");
}

export function getRemainingPreparationItems(trip: FishingTrip) {
  const checklistRemaining = Math.max(
    trip.requiredChecklistItemsCount -
      trip.packedRequiredChecklistItemsCount,
    0
  );

  const gearRemaining = Math.max(
    trip.requiredGearItemsCount - trip.packedRequiredGearItemsCount,
    0
  );

  return checklistRemaining + gearRemaining;
}
