export function getOwnerTypeLabel(type: string) {
  if (type === "pzw") return "Łowisko PZW";
  if (type === "commercial") return "Łowisko komercyjne";
  return "Łowisko wędkarskie";
}

export function getFishingTypeLabel(type: string) {
  if (type === "general") return "Ogólne";
  if (type === "spinning") return "Spinningowe";
  if (type === "carp") return "Karpiowe";
  return "Inne";
}

export function getNavigationUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function cleanListItemText(value: string) {
  return value
    .trim()
    .replace(/^[-–—•●▪▫]\s*/g, "")
    .replace(/^\*\s*/g, "")
    .replace(/^\d+[.)]\s*/g, "")
    .replace(/^[a-zA-Z][.)]\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isVisibleTextItem(value: string, blockedLabel: string) {
  const normalizedValue = value.toLowerCase().trim();

  return (
    normalizedValue.length > 0 &&
    !normalizedValue.startsWith(blockedLabel) &&
    !normalizedValue.includes("http://") &&
    !normalizedValue.includes("https://")
  );
}

export function getCleanList(values: string[], blockedLabel: string) {
  return values
    .map(cleanListItemText)
    .filter((value) => isVisibleTextItem(value, blockedLabel));
}

export function getWebsiteUrl(value: string) {
  const cleanValue = value.trim();

  if (/^https?:\/\//i.test(cleanValue)) {
    return cleanValue;
  }

  return `https://${cleanValue}`;
}

export function formatRating(value: string | number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(1).replace(".", ",") : "—";
}

export function formatWeight(value: number) {
  return `${value.toFixed(2).replace(".", ",")} kg`;
}

export function formatDistance(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 10) return `${value.toFixed(1).replace(".", ",")} km`;
  return `${Math.round(value)} km`;
}

export function formatRankingDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
