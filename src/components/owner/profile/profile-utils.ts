import type {
  OwnerLakeProfileFormData,
} from "@/components/owner/profile/types";

export function cleanPlaceholderValue(
  value: string | null | undefined
) {
  const normalized = String(value || "").trim();

  if (
    !normalized ||
    normalized.toLocaleLowerCase("pl-PL") ===
      "brak" ||
    normalized.toLocaleLowerCase("pl-PL") ===
      "brak danych"
  ) {
    return "";
  }

  return normalized;
}

export function calculateProfileCompletion(
  lake: OwnerLakeProfileFormData
) {
  const values = [
    lake.name,
    lake.description,
    lake.fish,
    lake.street,
    lake.city,
    lake.postalCode,
    lake.voivodeship,
    lake.area,
    lake.averageDepth,
    lake.bottomType,
    lake.waterType,
    lake.priceListText,
    lake.rulesText,
    lake.contactPhone,
    lake.contactEmail,
    lake.contactWebsite,
  ];

  const meaningful = values.filter(
    (value) => Boolean(value.trim())
  ).length;

  const baseScore = Math.round(
    (meaningful / values.length) * 85
  );

  const imageScore =
    lake.imageCount > 0 ? 10 : 0;

  const fishScore =
    lake.fishSpeciesCount > 0 ? 5 : 0;

  return Math.min(
    100,
    baseScore + imageScore + fishScore
  );
}

export function formatImageDate(
  value: string
) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatFileSize(
  bytes: number
) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(
      1,
      Math.round(bytes / 1024)
    )} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}
