export type ChecklistTemplateItem = {
  name: string;
  category: string;
  quantity: number;
  unit: string | null;
  isImportant: boolean;
  note?: string;
};

export type ChecklistTemplate = {
  id: string;
  label: string;
  description: string;
  items: ChecklistTemplateItem[];
};

export const CHECKLIST_CATEGORIES = [
  "Sprzęt",
  "Przynęty",
  "Odzież",
  "Jedzenie",
  "Dokumenty",
  "Bezpieczeństwo",
  "Wymagania łowiska",
  "Inne",
] as const;

const BASE_ITEMS: ChecklistTemplateItem[] = [
  { name: "Dokument tożsamości", category: "Dokumenty", quantity: 1, unit: "szt.", isImportant: true },
  { name: "Zezwolenie / karta wędkarska", category: "Dokumenty", quantity: 1, unit: "szt.", isImportant: true },
  { name: "Apteczka", category: "Bezpieczeństwo", quantity: 1, unit: "szt.", isImportant: true },
  { name: "Telefon", category: "Inne", quantity: 1, unit: "szt.", isImportant: true },
  { name: "Powerbank", category: "Inne", quantity: 1, unit: "szt.", isImportant: false },
  { name: "Worki na śmieci", category: "Inne", quantity: 2, unit: "szt.", isImportant: false },
];

const METHOD_ITEMS: Record<string, ChecklistTemplateItem[]> = {
  spinning: [
    { name: "Wędka spinningowa", category: "Sprzęt", quantity: 1, unit: "szt.", isImportant: true },
    { name: "Kołowrotek", category: "Sprzęt", quantity: 1, unit: "szt.", isImportant: true },
    { name: "Pudełko z przynętami", category: "Przynęty", quantity: 1, unit: "szt.", isImportant: true },
    { name: "Szczypce / kombinerki", category: "Sprzęt", quantity: 1, unit: "szt.", isImportant: true },
    { name: "Podbierak", category: "Sprzęt", quantity: 1, unit: "szt.", isImportant: false },
  ],
  feeder: [
    { name: "Wędka feederowa", category: "Sprzęt", quantity: 1, unit: "szt.", isImportant: true },
    { name: "Kołowrotek", category: "Sprzęt", quantity: 1, unit: "szt.", isImportant: true },
    { name: "Koszyczki zanętowe", category: "Sprzęt", quantity: 4, unit: "szt.", isImportant: true },
    { name: "Zanęta", category: "Przynęty", quantity: 2, unit: "kg", isImportant: true },
    { name: "Przypony / haczyki", category: "Sprzęt", quantity: 10, unit: "szt.", isImportant: true },
  ],
  method_feeder: [
    { name: "Wędka do method feeder", category: "Sprzęt", quantity: 1, unit: "szt.", isImportant: true },
    { name: "Kołowrotek", category: "Sprzęt", quantity: 1, unit: "szt.", isImportant: true },
    { name: "Podajniki method feeder", category: "Sprzęt", quantity: 4, unit: "szt.", isImportant: true },
    { name: "Przypony z haczykami", category: "Sprzęt", quantity: 10, unit: "szt.", isImportant: true },
    { name: "Pellet / zanęta", category: "Przynęty", quantity: 2, unit: "kg", isImportant: true },
    { name: "Przynęty haczykowe", category: "Przynęty", quantity: 2, unit: "opak.", isImportant: true },
    { name: "Podbierak", category: "Sprzęt", quantity: 1, unit: "szt.", isImportant: true },
  ],
  carp: [
    { name: "Wędki karpiowe", category: "Sprzęt", quantity: 2, unit: "szt.", isImportant: true },
    { name: "Kołowrotki", category: "Sprzęt", quantity: 2, unit: "szt.", isImportant: true },
    { name: "Sygnalizatory brań", category: "Sprzęt", quantity: 2, unit: "szt.", isImportant: true },
    { name: "Rod pod / podpórki", category: "Sprzęt", quantity: 1, unit: "zest.", isImportant: true },
    { name: "Mata / kołyska karpiowa", category: "Sprzęt", quantity: 1, unit: "szt.", isImportant: true },
    { name: "Podbierak karpiowy", category: "Sprzęt", quantity: 1, unit: "szt.", isImportant: true },
    { name: "Kulki / pellet", category: "Przynęty", quantity: 2, unit: "kg", isImportant: true },
  ],
  float: [
    { name: "Wędka spławikowa", category: "Sprzęt", quantity: 1, unit: "szt.", isImportant: true },
    { name: "Spławiki", category: "Sprzęt", quantity: 4, unit: "szt.", isImportant: true },
    { name: "Haczyki i przypony", category: "Sprzęt", quantity: 10, unit: "szt.", isImportant: true },
    { name: "Zanęta", category: "Przynęty", quantity: 1, unit: "kg", isImportant: true },
  ],
  night: [
    { name: "Latarka czołowa", category: "Bezpieczeństwo", quantity: 1, unit: "szt.", isImportant: true },
    { name: "Zapasowe baterie", category: "Bezpieczeństwo", quantity: 1, unit: "kpl.", isImportant: true },
    { name: "Śpiwór", category: "Odzież", quantity: 1, unit: "szt.", isImportant: true },
    { name: "Ciepła bluza", category: "Odzież", quantity: 1, unit: "szt.", isImportant: true },
  ],
};

export function getTripDurationDays(startsAt?: string | Date, endsAt?: string | Date | null) {
  if (!startsAt || !endsAt) return 1;
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 1;
  return Math.max(1, Math.ceil((end - start) / 86_400_000));
}

function getDurationItems(days: number, tripType?: string): ChecklistTemplateItem[] {
  const items: ChecklistTemplateItem[] = [
    { name: "Woda do picia", category: "Jedzenie", quantity: Math.max(2, days * 2), unit: "l", isImportant: true },
    { name: "Posiłki / prowiant", category: "Jedzenie", quantity: Math.max(2, days * 3), unit: "porcje", isImportant: true },
    { name: "Skarpety na zmianę", category: "Odzież", quantity: Math.max(1, days), unit: "pary", isImportant: false },
    { name: "Bielizna na zmianę", category: "Odzież", quantity: Math.max(1, days), unit: "szt.", isImportant: false },
  ];

  if (days >= 2 || tripType === "night") {
    items.push(
      { name: "Latarka czołowa", category: "Bezpieczeństwo", quantity: 1, unit: "szt.", isImportant: true },
      { name: "Zapasowe baterie / ładowanie", category: "Bezpieczeństwo", quantity: 1, unit: "kpl.", isImportant: true },
      { name: "Śpiwór", category: "Odzież", quantity: 1, unit: "szt.", isImportant: true },
      { name: "Karimata / łóżko", category: "Odzież", quantity: 1, unit: "szt.", isImportant: false },
      { name: "Kosmetyczka / środki higieny", category: "Inne", quantity: 1, unit: "zest.", isImportant: false }
    );
  }

  if (days >= 3) {
    items.push(
      { name: "Zapasowa odzież", category: "Odzież", quantity: 1, unit: "zest.", isImportant: true },
      { name: "Ładowarka do telefonu", category: "Inne", quantity: 1, unit: "szt.", isImportant: true },
      { name: "Leki przyjmowane na stałe", category: "Bezpieczeństwo", quantity: days, unit: "dni", isImportant: true }
    );
  }

  return items;
}

function dedupe(items: ChecklistTemplateItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.trim().toLocaleLowerCase("pl-PL");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getTripTypeTemplateLabel(value: string) {
  const labels: Record<string, string> = {
    custom: "Wyprawa ogólna",
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

export function getChecklistTemplates(days: number, tripType?: string, lakeGearRequirements: string[] = []): ChecklistTemplate[] {
  const methodItems = METHOD_ITEMS[tripType || ""] ?? [];
  const lakeItems: ChecklistTemplateItem[] = lakeGearRequirements
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({
      name: text.length > 118 ? `${text.slice(0, 115)}...` : text,
      category: "Wymagania łowiska",
      quantity: 1,
      unit: "szt.",
      isImportant: true,
      note: `Wymaganie wskazane przez wybrane łowisko: ${text}`.slice(0, 500),
    }));

  const templates: ChecklistTemplate[] = [
    {
      id: "adaptive",
      label: "Przygotuj checklistę dla mnie",
      description: `${days} ${days === 1 ? "dzień" : "dni"}${tripType ? ` · ${getTripTypeTemplateLabel(tripType)}` : ""}${lakeItems.length ? ` · ${lakeItems.length} wymagań łowiska` : ""}`,
      items: dedupe([...BASE_ITEMS, ...getDurationItems(days, tripType), ...methodItems, ...lakeItems]),
    },
    {
      id: "basic",
      label: "Podstawowa",
      description: "Dokumenty, bezpieczeństwo i najważniejsze rzeczy.",
      items: dedupe([
        ...BASE_ITEMS,
        { name: "Woda do picia", category: "Jedzenie", quantity: 2, unit: "l", isImportant: true },
        { name: "Prowiant", category: "Jedzenie", quantity: 2, unit: "porcje", isImportant: true },
      ]),
    },
  ];

  if (methodItems.length > 0 && tripType !== "night") {
    templates.push({
      id: "method",
      label: getTripTypeTemplateLabel(tripType || "custom"),
      description: "Sprzęt i akcesoria dobrane do wybranej metody.",
      items: dedupe(methodItems),
    });
  }

  if (days >= 2 || tripType === "night") {
    templates.push({
      id: "overnight",
      label: "Nocka / wyjazd wielodniowy",
      description: "Nocleg, światło, ubrania, jedzenie i higiena.",
      items: dedupe(getDurationItems(Math.max(days, 2), "night")),
    });
  }

  return templates;
}
