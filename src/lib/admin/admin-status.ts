import type {
  AdminStatusMeta,
} from "@/lib/admin/admin-types";

const STATUS_MAP: Record<
  string,
  AdminStatusMeta
> = {
  pending: {
    label: "Oczekuje",
    variant: "warning",
  },
  approved: {
    label: "Zaakceptowane",
    variant: "success",
  },
  accepted: {
    label: "Zaakceptowane",
    variant: "success",
  },
  resolved: {
    label: "Rozwiązane",
    variant: "success",
  },
  rejected: {
    label: "Odrzucone",
    variant: "danger",
  },
  hidden: {
    label: "Ukryte",
    variant: "neutral",
  },
  private: {
    label: "Prywatne",
    variant: "neutral",
  },
  published: {
    label: "Opublikowane",
    variant: "success",
  },
  draft: {
    label: "Szkic",
    variant: "neutral",
  },
};

export function getAdminStatusMeta(
  status: string | null | undefined
): AdminStatusMeta {
  const normalized =
    String(status ?? "")
      .trim()
      .toLowerCase();

  if (
    normalized &&
    STATUS_MAP[normalized]
  ) {
    return STATUS_MAP[
      normalized
    ];
  }

  return {
    label:
      status?.trim() ||
      "Nieznany",
    variant: "neutral",
  };
}

export function getAdminOwnerTypeLabel(
  type: string | null | undefined
) {
  if (type === "commercial") {
    return "Komercyjne";
  }

  if (type === "pzw") {
    return "PZW";
  }

  return "Inne";
}

export function getAdminFishingTypeLabel(
  type: string | null | undefined
) {
  if (type === "general") {
    return "Ogólne";
  }

  if (type === "spinning") {
    return "Spinningowe";
  }

  if (type === "carp") {
    return "Karpiowe";
  }

  return "Inne";
}

export function getAdminCorrectionCategoryLabel(
  category: string | null | undefined
) {
  const labels: Record<
    string,
    string
  > = {
    basic: "Dane podstawowe",
    address: "Adres",
    contact: "Kontakt",
    prices: "Cennik",
    rules: "Regulamin",
    amenities: "Udogodnienia",
    fish: "Ryby",
    images: "Zdjęcia",
    other: "Inne",
  };

  return (
    labels[
      String(
        category ?? ""
      )
    ] ??
    category ??
    "Inne"
  );
}

export function getAdminClaimRoleLabel(
  role: string | null | undefined
) {
  const labels: Record<
    string,
    string
  > = {
    owner: "Właściciel",
    manager:
      "Zarządca / administrator",
    employee: "Pracownik",
    association:
      "Przedstawiciel stowarzyszenia",
    other:
      "Inna osoba uprawniona",
  };

  return (
    labels[
      String(role ?? "")
    ] ?? "Nie podano"
  );
}

export function getAdminCatchMethodLabel(
  method: string | null | undefined
) {
  const normalized =
    String(method ?? "");

  const labels: Record<
    string,
    string
  > = {
    spinning: "Spinning",
    feeder: "Grunt",
    ground: "Grunt",
    method_feeder:
      "Method feeder",
    carp: "Karpiówka",
    float: "Spławik",
    fly: "Muchówka",
    other: "Inna metoda",
  };

  return (
    labels[normalized] ||
    normalized ||
    "Brak"
  );
}
