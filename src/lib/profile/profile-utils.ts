export function getProfileDisplayName(
  metadata: Record<string, unknown> | null | undefined
) {
  for (const key of ["name", "full_name", "display_name"]) {
    const value = metadata?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "Wędkarz Rybio";
}

export function getProfileInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "WR";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toLocaleUpperCase("pl-PL");
  }

  return `${parts[0][0]}${parts[1][0]}`.toLocaleUpperCase("pl-PL");
}

export function formatProfileDate(date: Date | string) {
  const parsed = date instanceof Date ? date : new Date(date);

  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export function formatProfileShortDate(date: Date | string) {
  const parsed = date instanceof Date ? date : new Date(date);

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

export function getProfileOwnerTypeLabel(type: string | null) {
  if (type === "commercial") {
    return "Komercyjne";
  }

  if (type === "pzw") {
    return "PZW";
  }

  return "Inne";
}

export function getProfileSubmissionStatus(status: string) {
  if (status === "approved" || status === "accepted") {
    return {
      label: "Zaakceptowane",
      variant: "success" as const,
    };
  }

  if (status === "rejected") {
    return {
      label: "Odrzucone",
      variant: "danger" as const,
    };
  }

  if (status === "pending") {
    return {
      label: "Oczekuje",
      variant: "warning" as const,
    };
  }

  return {
    label: status || "Nieznany",
    variant: "neutral" as const,
  };
}
