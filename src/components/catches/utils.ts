import type {
  CatchFilterState,
  CatchFormState,
  FishingCatch,
  TripOption,
} from "@/components/catches/types";
import { CATCH_METHODS, INITIAL_CATCH_FORM_STATE } from "@/components/catches/constants";

export function getMethodLabel(value: string) {
  return CATCH_METHODS.find((item) => item.value === value)?.label ?? value;
}

export function formatDateTime(date: string | Date) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Brak daty";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function formatCatchDateLong(date: string | Date) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Brak daty";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function formatShortDate(date: string | Date) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
  }).format(parsed);
}

export function toDateTimeLocalValue(date: string | Date) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function getMethodFromTripType(tripType?: string | null) {
  if (!tripType) {
    return null;
  }

  const normalized = tripType.trim().toLowerCase();
  const aliases: Record<string, string> = {
    spinning: "spinning",
    feeder: "feeder",
    method_feeder: "method_feeder",
    "method feeder": "method_feeder",
    method: "method_feeder",
    carp: "carp",
    karpiowa: "carp",
    karpiowka: "carp",
    "karpiówka": "carp",
    float: "float",
    splawik: "float",
    "spławik": "float",
    fly: "fly",
    muchowka: "fly",
    "muchówka": "fly",
  };

  return aliases[normalized] ?? null;
}

export function getActiveTrip(trips: TripOption[]) {
  const now = Date.now();

  return (
    trips.find((trip) => {
      if (["cancelled", "canceled"].includes(trip.status)) {
        return false;
      }

      const startsAt = new Date(trip.startsAt).getTime();
      if (!Number.isFinite(startsAt)) {
        return false;
      }

      const parsedEnd = trip.endsAt ? new Date(trip.endsAt).getTime() : Number.NaN;
      const endsAt = Number.isFinite(parsedEnd)
        ? parsedEnd
        : startsAt + 24 * 60 * 60 * 1000;

      return startsAt <= now && now <= endsAt;
    }) ?? null
  );
}

export function createCatchFormStateForTrip(
  trip: TripOption | null,
  useCurrentTime: boolean
): CatchFormState {
  return {
    ...INITIAL_CATCH_FORM_STATE,
    caughtAt: useCurrentTime ? toDateTimeLocalValue(new Date()) : "",
    tripId: trip?.id ?? "",
    lakeId: trip?.lakeId ?? "",
    method: getMethodFromTripType(trip?.tripType) ?? INITIAL_CATCH_FORM_STATE.method,
  };
}

export function createCatchFormStateForEdit(item: FishingCatch): CatchFormState {
  const knownSpecies = new Set<string>([
    "Amur biały", "Boleń", "Brzana", "Certa", "Ciernik", "Cierniczek",
    "Czebaczek amurski", "Głowacica", "Jaź", "Jazgarz", "Jelec", "Jesiotr",
    "Karaś pospolity", "Karaś srebrzysty", "Karp", "Kiełb", "Kleń", "Koza",
    "Krąp", "Leszcz", "Lin", "Lipień", "Łosoś atlantycki", "Miętus", "Okoń",
    "Piekielnica", "Piskorz", "Płoć", "Pstrąg potokowy", "Pstrąg tęczowy",
    "Pstrąg źródlany", "Różanka", "Sandacz", "Sieja", "Sielawa", "Słonecznica",
    "Strzebla potokowa", "Sum", "Sumik karłowaty", "Szczupak", "Śliz", "Świnka",
    "Tołpyga biała", "Tołpyga pstra", "Troć wędrowna", "Ukleja",
    "Węgorz europejski", "Wzdręga",
  ]);
  const isKnown = knownSpecies.has(item.fishName);

  return {
    fishName: isKnown ? item.fishName : "other",
    customFishName: isKnown ? "" : item.fishName,
    weight: item.weight !== null ? String(item.weight) : "",
    length: item.length !== null ? String(item.length) : "",
    method: item.method,
    bait: item.bait ?? "",
    caughtAt: toDateTimeLocalValue(item.caughtAt),
    lakeId: item.lakeId ?? "",
    tripId: item.tripId ?? "",
    note: item.note ?? "",
    isPublic: item.isPublic,
  };
}

export function getCatchStatusKey(item: FishingCatch) {
  if (!item.isPublic) {
    return "private";
  }

  if (item.rankingStatus === "approved") {
    return "approved";
  }

  if (["rejected", "hidden"].includes(item.rankingStatus)) {
    return "rejected";
  }

  return "pending";
}

export function matchesCatchFilters(item: FishingCatch, filters: CatchFilterState) {
  const search = normalizeSearchText(filters.search);
  const searchable = normalizeSearchText(
    [item.fishName, item.lakeName, item.tripTitle, item.bait, item.note, getMethodLabel(item.method)]
      .filter(Boolean)
      .join(" ")
  );

  if (search && !searchable.includes(search)) {
    return false;
  }

  if (filters.method !== "all" && item.method !== filters.method) {
    return false;
  }

  if (filters.species !== "all" && item.fishName !== filters.species) {
    return false;
  }

  if (filters.status !== "all" && getCatchStatusKey(item) !== filters.status) {
    return false;
  }

  if (filters.lakeId !== "all" && item.lakeId !== filters.lakeId) {
    return false;
  }

  if (filters.tripId !== "all" && item.tripId !== filters.tripId) {
    return false;
  }

  const caughtAt = new Date(item.caughtAt).getTime();

  if (filters.fromDate) {
    const from = new Date(`${filters.fromDate}T00:00:00`).getTime();
    if (Number.isFinite(from) && caughtAt < from) {
      return false;
    }
  }

  if (filters.toDate) {
    const to = new Date(`${filters.toDate}T23:59:59.999`).getTime();
    if (Number.isFinite(to) && caughtAt > to) {
      return false;
    }
  }

  return true;
}

export function countActiveCatchFilters(filters: CatchFilterState) {
  return [
    filters.method !== "all",
    filters.species !== "all",
    filters.status !== "all",
    filters.lakeId !== "all",
    filters.tripId !== "all",
    Boolean(filters.fromDate),
    Boolean(filters.toDate),
  ].filter(Boolean).length;
}

export function getCatchStats(catches: FishingCatch[]) {
  return {
    total: catches.length,
    species: new Set(catches.map((item) => item.fishName)).size,
    biggestWeight: catches.reduce((max, item) => Math.max(max, item.weight ?? 0), 0),
    biggestLength: catches.reduce((max, item) => Math.max(max, item.length ?? 0), 0),
  };
}

export async function compressCatchImage(file: File): Promise<File> {
  const maxWidth = 1600;
  const maxHeight = 1600;
  const quality = 0.75;

  const imageBitmap = await createImageBitmap(file);

  try {
    let width = imageBitmap.width;
    let height = imageBitmap.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Nie udało się przygotować kompresji zdjęcia.");
    }

    context.drawImage(imageBitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("Nie udało się skompresować zdjęcia."));
            return;
          }

          resolve(result);
        },
        "image/webp",
        quality
      );
    });

    const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");

    return new File([blob], `${fileNameWithoutExtension}.webp`, {
      type: "image/webp",
    });
  } finally {
    imageBitmap.close?.();
  }
}
