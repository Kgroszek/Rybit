import type {
  TripChecklistItem,
  TripCost,
} from "@/lib/trips/details-query";

export type TripDetailPhase =
  | "upcoming"
  | "active"
  | "finished"
  | "cancelled";

export type TripDetailsMainTab =
  | "przeglad"
  | "przygotowanie"
  | "notatki"
  | "koszty"
  | "zdjecia"
  | "polowy"
  | "uczestnicy";

export type TripPreparationTab =
  | "checklista"
  | "sprzet";

export function percent(done: number, total: number) {
  return total > 0
    ? Math.round((done / total) * 100)
    : 0;
}

export function resolveTripDetailsView(
  rawTab?: string,
  rawPreparation?: string
): {
  tab: TripDetailsMainTab;
  preparation: TripPreparationTab;
} {
  if (rawTab === "checklista") {
    return {
      tab: "przygotowanie",
      preparation: "checklista",
    };
  }

  if (rawTab === "sprzet") {
    return {
      tab: "przygotowanie",
      preparation: "sprzet",
    };
  }

  if (rawTab === "podsumowanie") {
    return {
      tab: "przeglad",
      preparation: "checklista",
    };
  }

  const allowedTabs: TripDetailsMainTab[] = [
    "przeglad",
    "przygotowanie",
    "notatki",
    "koszty",
    "zdjecia",
    "polowy",
    "uczestnicy",
  ];

  const tab = allowedTabs.includes(
    rawTab as TripDetailsMainTab
  )
    ? (rawTab as TripDetailsMainTab)
    : "przeglad";

  return {
    tab,
    preparation:
      rawPreparation === "sprzet"
        ? "sprzet"
        : "checklista",
  };
}

export function getTripDetailPhase(
  status: string,
  startsAt: Date | string,
  endsAt: Date | string | null,
  now = new Date()
): TripDetailPhase {
  const normalized = status.trim().toLowerCase();

  if (
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return "cancelled";
  }

  if (
    normalized === "completed" ||
    normalized === "finished"
  ) {
    return "finished";
  }

  const start = new Date(startsAt).getTime();
  const end = endsAt
    ? new Date(endsAt).getTime()
    : null;
  const current = now.getTime();

  if (
    end !== null &&
    Number.isFinite(end) &&
    end < current
  ) {
    return "finished";
  }

  if (
    normalized === "active" ||
    (Number.isFinite(start) &&
      start <= current &&
      (end === null ||
        !Number.isFinite(end) ||
        end >= current))
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
    fly: "Muchówka",
    night: "Nocka",
    competition: "Zawody",
  };

  return labels[value] ?? value;
}

export function getStatusLabel(value: string) {
  const labels: Record<string, string> = {
    planned: "Zaplanowana",
    active: "W trakcie",
    completed: "Zakończona",
    finished: "Zakończona",
    cancelled: "Anulowana",
    canceled: "Anulowana",
  };

  return labels[value] ?? value;
}

export function getMethodLabel(value: string) {
  const labels: Record<string, string> = {
    spinning: "Spinning",
    feeder: "Feeder",
    method_feeder: "Method feeder",
    carp: "Karpiówka",
    float: "Spławik",
    fly: "Muchówka",
    other: "Inna metoda",
  };

  return labels[value] ?? value;
}

export function getNoteTypeLabel(value: string) {
  const labels: Record<string, string> = {
    general: "Ogólna",
    plan: "Plan",
    water: "Woda",
    bait: "Przynęty",
    result: "Wyniki",
  };

  return labels[value] ?? value;
}

export function getCostCategoryLabel(value: string) {
  const labels: Record<string, string> = {
    fuel: "Paliwo",
    fishing: "Wędkowanie",
    food: "Jedzenie",
    accommodation: "Nocleg",
    bait: "Przynęty i zanęty",
    equipment: "Sprzęt",
    other: "Pozostałe",
  };

  return labels[value] ?? value;
}

export function getChecklistCategoryLabel(
  value: string
) {
  const labels: Record<string, string> = {
    "Wymagania łowiska": "Wymagania łowiska",
    Dokumenty: "Dokumenty",
    Bezpieczeństwo: "Bezpieczeństwo",
    Sprzęt: "Sprzęt wędkarski",
    Przynęty: "Przynęty i zanęty",
    Jedzenie: "Jedzenie i picie",
    Odzież: "Odzież i nocleg",
    Inne: "Pozostałe",
  };

  return labels[value] ?? value;
}

export function groupChecklistItems(
  items: TripChecklistItem[]
) {
  const map = new Map<string, TripChecklistItem[]>();

  for (const item of items) {
    const category =
      item.category?.trim() || "Inne";
    const current = map.get(category) ?? [];
    current.push(item);
    map.set(category, current);
  }

  const priority = [
    "Wymagania łowiska",
    "Dokumenty",
    "Bezpieczeństwo",
    "Sprzęt",
    "Przynęty",
    "Jedzenie",
    "Odzież",
    "Inne",
  ];

  return Array.from(map.entries())
    .map(([category, categoryItems]) => ({
      category,
      items: categoryItems,
      packedCount: categoryItems.filter(
        (item) => item.isPacked
      ).length,
      unpackedCount: categoryItems.filter(
        (item) => !item.isPacked
      ).length,
    }))
    .sort((first, second) => {
      const firstIndex = priority.indexOf(
        first.category
      );
      const secondIndex = priority.indexOf(
        second.category
      );

      const normalizedFirst =
        firstIndex === -1 ? 999 : firstIndex;
      const normalizedSecond =
        secondIndex === -1 ? 999 : secondIndex;

      return (
        normalizedFirst -
          normalizedSecond ||
        first.category.localeCompare(
          second.category,
          "pl"
        )
      );
    });
}

export function formatDateTime(
  date: Date | string
) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatTripDateRange(
  startsAt: Date | string,
  endsAt: Date | string | null
) {
  const start = new Date(startsAt);

  if (Number.isNaN(start.getTime())) {
    return "Termin do ustalenia";
  }

  const startText = new Intl.DateTimeFormat(
    "pl-PL",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(start);

  if (!endsAt) {
    return startText;
  }

  const end = new Date(endsAt);

  if (Number.isNaN(end.getTime())) {
    return startText;
  }

  const endText = new Intl.DateTimeFormat(
    "pl-PL",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(end);

  return `${startText} – ${endText}`;
}

export function formatMoney(
  value: number,
  currency = "PLN"
) {
  return `${value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export function getNavigationUrl(
  lat: number,
  lng: number
) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function calculateCostSettlement(
  costs: TripCost[],
  participants: Array<{
    id: string;
    name: string;
  }>
) {
  if (participants.length === 0) {
    return {
      sharePerPerson: 0,
      balances: [],
      transfers: [],
    };
  }

  const total = costs.reduce(
    (sum, cost) => sum + cost.amount,
    0
  );
  const sharePerPerson =
    total / participants.length;

  const paid = new Map<string, number>();

  for (const cost of costs) {
    paid.set(
      cost.paidByUserId,
      (paid.get(cost.paidByUserId) ?? 0) +
        cost.amount
    );
  }

  const balances = participants.map(
    (participant) => ({
      ...participant,
      paid: paid.get(participant.id) ?? 0,
      balance:
        (paid.get(participant.id) ?? 0) -
        sharePerPerson,
    })
  );

  const creditors = balances
    .filter((item) => item.balance > 0.009)
    .map((item) => ({
      ...item,
      remaining: item.balance,
    }));

  const debtors = balances
    .filter((item) => item.balance < -0.009)
    .map((item) => ({
      ...item,
      remaining: Math.abs(item.balance),
    }));

  const transfers: Array<{
    from: string;
    to: string;
    amount: number;
  }> = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (
    creditorIndex < creditors.length &&
    debtorIndex < debtors.length
  ) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amount = Math.min(
      creditor.remaining,
      debtor.remaining
    );

    if (amount > 0.009) {
      transfers.push({
        from: debtor.name,
        to: creditor.name,
        amount:
          Math.round(amount * 100) / 100,
      });
    }

    creditor.remaining -= amount;
    debtor.remaining -= amount;

    if (creditor.remaining <= 0.009) {
      creditorIndex += 1;
    }

    if (debtor.remaining <= 0.009) {
      debtorIndex += 1;
    }
  }

  return {
    sharePerPerson,
    balances,
    transfers,
  };
}

export function groupActivities<T extends {
  id: string;
  actorUserId: string;
  actorName: string | null;
  action: string;
  createdAt: Date;
}>(activities: T[]) {
  const groups: Array<{
    key: string;
    actorUserId: string;
    actorName: string | null;
    action: string;
    createdAt: Date;
    count: number;
  }> = [];

  const WINDOW_MS = 5 * 60 * 1000;

  for (const activity of activities) {
    const previous =
      groups[groups.length - 1];

    const canMerge =
      previous &&
      previous.actorUserId ===
        activity.actorUserId &&
      previous.action === activity.action &&
      Math.abs(
        previous.createdAt.getTime() -
          activity.createdAt.getTime()
      ) <= WINDOW_MS;

    if (canMerge) {
      previous.count += 1;
      continue;
    }

    groups.push({
      key: activity.id,
      actorUserId: activity.actorUserId,
      actorName: activity.actorName,
      action: activity.action,
      createdAt: activity.createdAt,
      count: 1,
    });
  }

  return groups;
}

export function getActivityLabel(value: string) {
  const labels: Record<string, string> = {
    trip_created: "utworzył(a) wyprawę",
    trip_updated: "zaktualizował(a) wyprawę",
    trip_finished: "zakończył(a) wyprawę",
    trip_cancelled: "anulował(a) wyprawę",
    trip_restored: "przywrócił(a) wyprawę",
    member_invited: "zaprosił(a) uczestnika",
    member_joined: "dołączył(a) do wyprawy",
    member_declined: "odrzucił(a) zaproszenie",
    member_removed: "usunął/usunęła uczestnika",
    member_role_changed:
      "zmienił(a) rolę uczestnika",
    checklist_updated:
      "zaktualizował(a) checklistę",
    gear_updated: "zaktualizował(a) sprzęt",
    note_added: "dodał(a) notatkę",
    note_updated: "zaktualizował(a) notatkę",
    note_deleted: "usunął/usunęła notatkę",
    cost_added: "dodał(a) koszt",
    cost_deleted: "usunął/usunęła koszt",
    media_added: "dodał(a) zdjęcie",
    media_added_bulk: "dodał(a) zdjęcia",
    media_deleted: "usunął/usunęła zdjęcie",
    catch_added: "dodał(a) połów",
  };

  return labels[value] ?? "wykonał(a) zmianę";
}

export function getLocalUserDisplayName(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const metadata = user.user_metadata ?? {};

  const values = [
    metadata.display_name,
    metadata.full_name,
    metadata.name,
    metadata.username,
    metadata.user_name,
  ];

  const name = values.find(
    (value): value is string =>
      typeof value === "string" &&
      value.trim().length > 0
  );

  return (
    name?.trim() ||
    user.email?.split("@")[0] ||
    "Użytkownik Rybio"
  );
}
