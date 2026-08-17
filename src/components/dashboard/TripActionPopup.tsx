"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/ui/ToastProvider";
import { TrashIcon } from "@/components/icons/TrashIcon";

type ActionType =
  | "checklist"
  | "gear"
  | "note"
  | "cost"
  | "media"
  | "catch";

type TripActionPopupProps = {
  tripId: string;
  action: ActionType;
  canEdit: boolean;
  label?: string;
  icon?: ReactNode;
  className?: string;
  tripStartsAt?: string | Date;
  tripEndsAt?: string | Date | null;
  tripType?: string;
  lakeGearRequirements?: string[];
  participants?: { id: string; name: string }[];
};

type ChecklistItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string | null;
  isPacked: boolean;
  isImportant: boolean;
  note: string | null;
};

type Checklist = {
  id: string;
  title: string;
  status: string;
  items: ChecklistItem[];
} | null;

type AvailableGear = {
  id: string;
  name: string;
  quantity: number;
  category: string;
  brand: string | null;
  model: string | null;
  fishingMethod: string;
  condition: string;
  isDefault: boolean;
};

type TripGearItem = {
  id: string;
  gearId: string | null;
  addedByUserId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string | null;
  note: string | null;
  isRequired: boolean;
  isPacked: boolean;
};

const checklistCategories = [
  "Sprzęt",
  "Przynęty",
  "Odzież",
  "Jedzenie",
  "Dokumenty",
  "Bezpieczeństwo",
  "Wymagania łowiska",
  "Inne",
];

const fishingMethods = [
  { value: "spinning", label: "Spinning" },
  { value: "feeder", label: "Feeder" },
  { value: "method_feeder", label: "Method feeder" },
  { value: "carp", label: "Karpiówka" },
  { value: "float", label: "Spławik" },
  { value: "fly", label: "Muchówka" },
  { value: "other", label: "Inna metoda" },
];

const noteTypes = [
  { value: "general", label: "Ogólna" },
  { value: "plan", label: "Plan" },
  { value: "water", label: "Warunki / woda" },
  { value: "bait", label: "Przynęty" },
  { value: "result", label: "Wyniki" },
];

const costCategories = [
  { value: "fuel", label: "Paliwo" },
  { value: "fishing", label: "Opłaty za łowisko" },
  { value: "food", label: "Jedzenie" },
  { value: "accommodation", label: "Nocleg" },
  { value: "bait", label: "Przynęty i zanęty" },
  { value: "equipment", label: "Sprzęt" },
  { value: "other", label: "Pozostałe" },
];


type ChecklistTemplateItem = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  isImportant: boolean;
  note?: string;
};

type ChecklistTemplate = {
  id: string;
  label: string;
  description: string;
  items: ChecklistTemplateItem[];
};

type UserChecklistTemplate = {
  id: string;
  name: string;
  description: string | null;
  tripType: string;
  updatedAt: string;
  items: ChecklistTemplateItem[];
};

const baseChecklistItems: ChecklistTemplateItem[] = [
  { name: "Dokument tożsamości", category: "Dokumenty", quantity: 1, unit: "szt.", isImportant: true },
  { name: "Zezwolenie / karta wędkarska", category: "Dokumenty", quantity: 1, unit: "szt.", isImportant: true },
  { name: "Apteczka", category: "Bezpieczeństwo", quantity: 1, unit: "szt.", isImportant: true },
  { name: "Telefon", category: "Inne", quantity: 1, unit: "szt.", isImportant: true },
  { name: "Powerbank", category: "Inne", quantity: 1, unit: "szt.", isImportant: false },
  { name: "Worki na śmieci", category: "Inne", quantity: 2, unit: "szt.", isImportant: false },
];

const methodChecklistItems: Record<string, ChecklistTemplateItem[]> = {
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

function getTripDurationDays(startsAt?: string | Date, endsAt?: string | Date | null) {
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

function dedupeTemplateItems(items: ChecklistTemplateItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getChecklistTemplates(
  days: number,
  tripType?: string,
  lakeGearRequirements: string[] = []
): ChecklistTemplate[] {
  const methodItems = methodChecklistItems[tripType || ""] ?? [];
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

  const adaptiveItems = dedupeTemplateItems([
    ...baseChecklistItems,
    ...getDurationItems(days, tripType),
    ...methodItems,
    ...lakeItems,
  ]);

  const templates: ChecklistTemplate[] = [
    {
      id: "adaptive",
      label: "Przygotuj checklistę dla mnie",
      description: `${days} ${days === 1 ? "dzień" : "dni"}${tripType ? ` • ${getTripTypeTemplateLabel(tripType)}` : ""}${lakeItems.length > 0 ? ` • ${lakeItems.length} wymagań łowiska` : ""}`,
      items: adaptiveItems,
    },
    {
      id: "basic",
      label: "Podstawowa",
      description: "Dokumenty, bezpieczeństwo i najważniejsze rzeczy.",
      items: dedupeTemplateItems([
        ...baseChecklistItems,
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
      items: dedupeTemplateItems(methodItems),
    });
  }

  if (days >= 2 || tripType === "night") {
    templates.push({
      id: "overnight",
      label: "Nocka / wyjazd wielodniowy",
      description: "Nocleg, światło, ubrania, jedzenie i higiena.",
      items: dedupeTemplateItems(getDurationItems(Math.max(days, 2), "night")),
    });
  }

  return templates;
}

function getTripTypeTemplateLabel(value: string) {
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
  return labels[value] || "Wyprawa";
}

function defaultLabel(action: ActionType) {
  if (action === "checklist") return "Otwórz checklistę";
  if (action === "gear") return "Dodaj sprzęt";
  if (action === "note") return "+ Dodaj notatkę";
  if (action === "cost") return "+ Dodaj koszt";
  if (action === "media") return "+ Dodaj zdjęcia";
  return "+ Dodaj połów";
}

export function TripActionPopup({
  tripId,
  action,
  canEdit,
  label,
  icon,
  className = "",
  tripStartsAt,
  tripEndsAt,
  tripType,
  lakeGearRequirements = [],
  participants = [],
}: TripActionPopupProps) {
  const router = useRouter();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [checklist, setChecklist] = useState<Checklist>(null);
  const [checklistLoaded, setChecklistLoaded] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("Sprzęt");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemUnit, setItemUnit] = useState("szt.");
  const [itemImportant, setItemImportant] = useState(false);
  const [itemNote, setItemNote] = useState("");

  const [userChecklistTemplates, setUserChecklistTemplates] = useState<UserChecklistTemplate[]>([]);
  const [userTemplatesLoaded, setUserTemplatesLoaded] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const [availableGear, setAvailableGear] = useState<AvailableGear[]>([]);
  const [tripGear, setTripGear] = useState<TripGearItem[]>([]);
  const [selectedGearIds, setSelectedGearIds] = useState<string[]>([]);
  const [gearLoaded, setGearLoaded] = useState(false);

  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [notePinned, setNotePinned] = useState(false);

  const [costLabel, setCostLabel] = useState("");
  const [costCategory, setCostCategory] = useState("fuel");
  const [costAmount, setCostAmount] = useState("");
  const [costNote, setCostNote] = useState("");
  const [costPaidByUserId, setCostPaidByUserId] = useState("");

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaCaption, setMediaCaption] = useState("");

  const [fishName, setFishName] = useState("");
  const [catchWeight, setCatchWeight] = useState("");
  const [catchLength, setCatchLength] = useState("");
  const [catchMethod, setCatchMethod] = useState("spinning");
  const [catchBait, setCatchBait] = useState("");
  const [caughtAt, setCaughtAt] = useState(() => toDateTimeLocal(new Date()));
  const [catchNote, setCatchNote] = useState("");
  const [catchPublic, setCatchPublic] = useState(false);
  const [catchImage, setCatchImage] = useState<File | null>(null);

  const packedChecklistCount = useMemo(
    () => checklist?.items.filter((item) => item.isPacked).length ?? 0,
    [checklist]
  );

  const checklistProgress = checklist?.items.length
    ? Math.round((packedChecklistCount / checklist.items.length) * 100)
    : 0;

  const tripDurationDays = useMemo(
    () => getTripDurationDays(tripStartsAt, tripEndsAt),
    [tripStartsAt, tripEndsAt]
  );

  const checklistTemplates = useMemo(
    () => getChecklistTemplates(tripDurationDays, tripType, lakeGearRequirements),
    [tripDurationDays, tripType, lakeGearRequirements]
  );

  useEffect(() => {
    if (!costPaidByUserId && participants.length > 0) {
      setCostPaidByUserId(participants[0].id);
    }
  }, [participants, costPaidByUserId]);

  useEffect(() => {
    if (!open) return;

    if (action === "checklist" && !checklistLoaded) {
      void loadChecklist();
    }

    if (action === "checklist" && canEdit && !userTemplatesLoaded) {
      void loadUserChecklistTemplates();
    }

    if (action === "gear" && !gearLoaded) {
      void loadGear();
    }
  }, [open, action, checklistLoaded, gearLoaded]);

  async function getJson(response: Response) {
    try {
      return (await response.json()) as Record<string, any>;
    } catch {
      return {};
    }
  }

  function showError(message: string) {
    toast.error({
      title: "Nie udało się zapisać zmian.",
      description: message,
    });
  }

  async function loadChecklist() {
    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/checklist`, {
        cache: "no-store",
      });
      const data = await getJson(response);

      if (!response.ok) {
        showError(data.message || "Nie udało się pobrać checklisty.");
        return;
      }

      setChecklist((data.checklist as Checklist) ?? null);
      setChecklistLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserChecklistTemplates() {
    setTemplatesLoading(true);

    try {
      const response = await fetch("/api/checklist-templates", {
        cache: "no-store",
      });
      const data = await getJson(response);

      if (!response.ok) {
        showError(data.message || "Nie udało się pobrać Twoich szablonów.");
        return;
      }

      setUserChecklistTemplates(
        (data.templates ?? []) as UserChecklistTemplate[]
      );
      setUserTemplatesLoaded(true);
    } finally {
      setTemplatesLoading(false);
    }
  }

  async function saveCurrentChecklistAsTemplate(event: FormEvent) {
    event.preventDefault();

    if (!checklist || checklist.items.length === 0) {
      showError("Najpierw dodaj co najmniej jeden element do checklisty.");
      return;
    }

    if (templateName.trim().length < 2) {
      showError("Podaj nazwę szablonu.");
      return;
    }

    setTemplateSaving(true);

    try {
      const response = await fetch("/api/checklist-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          description: templateDescription,
          tripType: tripType || "custom",
          items: checklist.items.map((item) => ({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit || "",
            isImportant: item.isImportant,
            note: item.note || "",
          })),
        }),
      });
      const data = await getJson(response);

      if (!response.ok) {
        showError(data.message || "Nie udało się zapisać szablonu.");
        return;
      }

      const created = data.template as UserChecklistTemplate;
      setUserChecklistTemplates((current) => [
        created,
        ...current.filter((template) => template.id !== created.id),
      ]);
      setTemplateName("");
      setTemplateDescription("");

      toast.success({
        title: "Szablon checklisty został zapisany.",
        description: "Będzie dostępny przy kolejnych wyprawach.",
      });
    } finally {
      setTemplateSaving(false);
    }
  }

  async function overwriteUserChecklistTemplate(template: UserChecklistTemplate) {
    if (!checklist || checklist.items.length === 0) {
      showError("Aktualna checklista jest pusta.");
      return;
    }

    if (
      !window.confirm(
        `Nadpisać szablon „${template.name}” aktualną checklistą?`
      )
    ) {
      return;
    }

    setTemplateSaving(true);

    try {
      const response = await fetch(`/api/checklist-templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          description: template.description || "",
          tripType: tripType || template.tripType || "custom",
          items: checklist.items.map((item) => ({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit || "",
            isImportant: item.isImportant,
            note: item.note || "",
          })),
        }),
      });
      const data = await getJson(response);

      if (!response.ok) {
        showError(data.message || "Nie udało się zaktualizować szablonu.");
        return;
      }

      const updated = data.template as UserChecklistTemplate;
      setUserChecklistTemplates((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );

      toast.success({ title: "Szablon został zaktualizowany." });
    } finally {
      setTemplateSaving(false);
    }
  }

  async function deleteUserChecklistTemplate(template: UserChecklistTemplate) {
    if (!window.confirm(`Usunąć szablon „${template.name}”?`)) {
      return;
    }

    setTemplateSaving(true);

    try {
      const response = await fetch(`/api/checklist-templates/${template.id}`, {
        method: "DELETE",
      });
      const data = await getJson(response);

      if (!response.ok) {
        showError(data.message || "Nie udało się usunąć szablonu.");
        return;
      }

      setUserChecklistTemplates((current) =>
        current.filter((item) => item.id !== template.id)
      );

      toast.success({ title: "Szablon został usunięty." });
    } finally {
      setTemplateSaving(false);
    }
  }

  async function ensureChecklist() {
    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ensure" }),
      });
      const data = await getJson(response);

      if (!response.ok) {
        showError(data.message || "Nie udało się utworzyć checklisty.");
        return;
      }

      setChecklist((data.checklist as Checklist) ?? null);
      setChecklistLoaded(true);
      router.refresh();
      toast.success({ title: "Checklista została utworzona." });
    } finally {
      setLoading(false);
    }
  }

  async function applyChecklistTemplate(template: ChecklistTemplate) {
    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply-template",
          templateId: template.id,
          templateLabel: template.label,
          items: template.items,
        }),
      });
      const data = await getJson(response);

      if (!response.ok) {
        showError(data.message || "Nie udało się dodać szablonu checklisty.");
        return;
      }

      setChecklist((data.checklist as Checklist) ?? null);
      setChecklistLoaded(true);
      router.refresh();
      toast.success({
        title: data.addedCount > 0
          ? `Dodano ${data.addedCount} pozycji do checklisty.`
          : "Checklista zawiera już te pozycje.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function addChecklistItem(event: FormEvent) {
    event.preventDefault();
    if (!itemName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemName,
          category: itemCategory,
          quantity: Number(itemQuantity || 1),
          unit: itemUnit,
          isImportant: itemImportant,
          note: itemNote,
        }),
      });
      const data = await getJson(response);

      if (!response.ok) {
        showError(data.message || "Nie udało się dodać elementu.");
        return;
      }

      setChecklist((data.checklist as Checklist) ?? null);
      setItemName("");
      setItemQuantity("1");
      setItemNote("");
      setItemImportant(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function updateChecklistItem(
    itemId: string,
    patch: Record<string, unknown>
  ) {
    const response = await fetch(`/api/trips/${tripId}/checklist`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, ...patch }),
    });
    const data = await getJson(response);

    if (!response.ok) {
      showError(data.message || "Nie udało się zaktualizować elementu.");
      return;
    }

    setChecklist((data.checklist as Checklist) ?? null);
    router.refresh();
  }

  async function deleteChecklistItem(itemId: string) {
    const response = await fetch(`/api/trips/${tripId}/checklist`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    const data = await getJson(response);

    if (!response.ok) {
      showError(data.message || "Nie udało się usunąć elementu.");
      return;
    }

    setChecklist((data.checklist as Checklist) ?? null);
    router.refresh();
  }

  async function loadGear() {
    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/gear`, {
        cache: "no-store",
      });
      const data = await getJson(response);

      if (!response.ok) {
        showError(data.message || "Nie udało się pobrać sprzętu.");
        return;
      }

      const available = (data.availableGear ?? []) as AvailableGear[];
      const items = (data.tripItems ?? []) as TripGearItem[];

      setAvailableGear(available);
      setTripGear(items);
      setSelectedGearIds(
        available
          .filter((gear) => items.some((item) => item.gearId === gear.id))
          .map((gear) => gear.id)
      );
      setGearLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  async function saveGearSelection() {
    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/gear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-owned", gearIds: selectedGearIds }),
      });
      const data = await getJson(response);

      if (!response.ok) {
        showError(data.message || "Nie udało się zapisać sprzętu.");
        return;
      }

      setTripGear((data.tripItems ?? []) as TripGearItem[]);
      router.refresh();
      toast.success({ title: "Sprzęt wyprawy został zapisany." });
    } finally {
      setLoading(false);
    }
  }

  async function addCustomGear(input: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    note: string;
    isRequired: boolean;
  }) {
    setLoading(true);

    try {
      const response = await fetch(`/api/trips/${tripId}/gear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-custom",
          ...input,
        }),
      });

      const data = await getJson(response);

      if (!response.ok) {
        showError(
          data.message || "Nie udało się dodać sprzętu tylko do tej wyprawy."
        );
        return false;
      }

      setTripGear((data.tripItems ?? []) as TripGearItem[]);
      router.refresh();

      toast.success({
        title: "Sprzęt został dodany do tej wyprawy.",
      });

      return true;
    } finally {
      setLoading(false);
    }
  }

  async function deleteCustomGear(item: TripGearItem) {
    if (item.gearId) return;

    if (!window.confirm(`Usunąć „${item.name}” z tej wyprawy?`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/trips/${tripId}/gear`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });

      const data = await getJson(response);

      if (!response.ok) {
        showError(data.message || "Nie udało się usunąć sprzętu.");
        return;
      }

      setTripGear((data.tripItems ?? []) as TripGearItem[]);
      router.refresh();

      toast.success({
        title: "Sprzęt został usunięty z wyprawy.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function toggleGearPacked(item: TripGearItem) {
    const response = await fetch(`/api/trips/${tripId}/gear`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, isPacked: !item.isPacked }),
    });
    const data = await getJson(response);

    if (!response.ok) {
      showError(data.message || "Nie udało się zmienić statusu sprzętu.");
      return;
    }

    setTripGear((data.tripItems ?? []) as TripGearItem[]);
    router.refresh();
  }

  async function submitSimpleJson(
    endpoint: string,
    body: Record<string, unknown>,
    successTitle: string
  ) {
    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await getJson(response);

      if (!response.ok) {
        showError(data.message || "Nie udało się zapisać danych.");
        return false;
      }

      toast.success({ title: successTitle });
      router.refresh();
      setOpen(false);
      return true;
    } finally {
      setLoading(false);
    }
  }

  async function submitNote(event: FormEvent) {
    event.preventDefault();
    const ok = await submitSimpleJson(
      `/api/trips/${tripId}/notes`,
      { content: noteContent, type: noteType, isPinned: notePinned },
      "Notatka została dodana."
    );
    if (ok) {
      setNoteContent("");
      setNotePinned(false);
    }
  }

  async function submitCost(event: FormEvent) {
    event.preventDefault();
    const ok = await submitSimpleJson(
      `/api/trips/${tripId}/costs`,
      {
        label: costLabel,
        category: costCategory,
        amount: Number(costAmount.replace(",", ".")),
        note: costNote,
        paidByUserId: costPaidByUserId || undefined,
      },
      "Koszt został dodany."
    );
    if (ok) {
      setCostLabel("");
      setCostAmount("");
      setCostNote("");
    }
  }

  async function submitMedia(event: FormEvent) {
    event.preventDefault();
    if (mediaFiles.length === 0) {
      showError("Wybierz co najmniej jedno zdjęcie.");
      return;
    }

    const formData = new FormData();
    mediaFiles.forEach((file) => formData.append("images", file));
    formData.append("caption", mediaCaption);

    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/media`, {
        method: "POST",
        body: formData,
      });
      const data = await getJson(response);

      if (!response.ok) {
        showError(data.message || "Nie udało się dodać zdjęcia.");
        return;
      }

      toast.success({
        title: mediaFiles.length === 1 ? "Zdjęcie zostało dodane." : `Dodano ${mediaFiles.length} zdjęć.`,
      });
      setMediaFiles([]);
      setMediaCaption("");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function submitCatch(event: FormEvent) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("fishName", fishName);
    formData.append("weight", catchWeight);
    formData.append("length", catchLength);
    formData.append("method", catchMethod);
    formData.append("bait", catchBait);
    formData.append("caughtAt", caughtAt);
    formData.append("note", catchNote);
    formData.append("isPublic", String(catchPublic));
    if (catchImage) formData.append("image", catchImage);

    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/catches`, {
        method: "POST",
        body: formData,
      });
      const data = await getJson(response);

      if (!response.ok) {
        showError(data.message || "Nie udało się dodać połowu.");
        return;
      }

      toast.success({ title: "Połów został dodany." });
      setFishName("");
      setCatchWeight("");
      setCatchLength("");
      setCatchBait("");
      setCatchNote("");
      setCatchImage(null);
      setCatchPublic(false);
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!canEdit && action !== "checklist" && action !== "gear"}
        className={
          className ||
          "rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        <span className="inline-flex items-center justify-center gap-2">
          {icon}
          <span>{label || defaultLabel(action)}</span>
        </span>
      </button>

      {open && (
        <Modal title={getTitle(action)} onClose={() => setOpen(false)}>
          {action === "checklist" && (
            <ChecklistContent
              checklist={checklist}
              loading={loading}
              canEdit={canEdit}
              progress={checklistProgress}
              itemName={itemName}
              setItemName={setItemName}
              itemCategory={itemCategory}
              setItemCategory={setItemCategory}
              itemQuantity={itemQuantity}
              setItemQuantity={setItemQuantity}
              itemUnit={itemUnit}
              setItemUnit={setItemUnit}
              itemImportant={itemImportant}
              setItemImportant={setItemImportant}
              itemNote={itemNote}
              setItemNote={setItemNote}
              onEnsure={ensureChecklist}
              onAdd={addChecklistItem}
              onTogglePacked={(item: ChecklistItem) =>
                updateChecklistItem(item.id, { isPacked: !item.isPacked })
              }
              onDelete={deleteChecklistItem}
              templates={checklistTemplates}
              tripDurationDays={tripDurationDays}
              tripType={tripType}
              onApplyTemplate={applyChecklistTemplate}
              userTemplates={userChecklistTemplates}
              templatesLoading={templatesLoading}
              templateSaving={templateSaving}
              templateName={templateName}
              setTemplateName={setTemplateName}
              templateDescription={templateDescription}
              setTemplateDescription={setTemplateDescription}
              onSaveCurrentAsTemplate={saveCurrentChecklistAsTemplate}
              onOverwriteUserTemplate={overwriteUserChecklistTemplate}
              onDeleteUserTemplate={deleteUserChecklistTemplate}
            />
          )}

          {action === "gear" && (
            <GearContent
              loading={loading}
              canEdit={canEdit}
              availableGear={availableGear}
              tripGear={tripGear}
              selectedGearIds={selectedGearIds}
              setSelectedGearIds={setSelectedGearIds}
              onSave={saveGearSelection}
              onTogglePacked={toggleGearPacked}
              onAddCustom={addCustomGear}
              onDeleteCustom={deleteCustomGear}
            />
          )}

          {action === "note" && (
            <form onSubmit={submitNote} className="space-y-5">
              <SelectField
                label="Typ notatki"
                value={noteType}
                onChange={setNoteType}
                options={noteTypes}
              />
              <TextAreaField
                label="Treść"
                value={noteContent}
                onChange={setNoteContent}
                placeholder="np. Zanęcić punkt o 5:30, sprawdzić wiatr przed wyjazdem..."
                required
              />
              <CheckboxField
                checked={notePinned}
                onChange={setNotePinned}
                label="Przypnij notatkę na górze"
              />
              <SubmitButton loading={loading} label="Dodaj notatkę" />
            </form>
          )}

          {action === "cost" && (
            <form onSubmit={submitCost} className="space-y-5">
              <InputField
                label="Nazwa kosztu"
                value={costLabel}
                onChange={setCostLabel}
                placeholder="np. Paliwo"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Kategoria"
                  value={costCategory}
                  onChange={setCostCategory}
                  options={costCategories}
                />
                <InputField
                  label="Kwota (PLN)"
                  value={costAmount}
                  onChange={setCostAmount}
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              {participants.length > 0 && (
                <SelectField
                  label="Kto zapłacił?"
                  value={costPaidByUserId || participants[0]?.id || ""}
                  onChange={setCostPaidByUserId}
                  options={participants.map((participant) => ({
                    value: participant.id,
                    label: participant.name,
                  }))}
                />
              )}
              <TextAreaField
                label="Notatka"
                value={costNote}
                onChange={setCostNote}
                placeholder="Opcjonalnie"
              />
              <p className="rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                Budżet to suma wszystkich kosztów. W podsumowaniu rozliczamy zarejestrowanych uczestników po równo i pokazujemy, kto komu powinien zwrócić pieniądze.
              </p>
              <SubmitButton loading={loading} label="Dodaj koszt" />
            </form>
          )}

          {action === "media" && (
            <form onSubmit={submitMedia} className="space-y-5">
              <MultiFileField
                label="Zdjęcia"
                accept="image/*"
                files={mediaFiles}
                onChange={setMediaFiles}
                required
              />
              <TextAreaField
                label="Opis zdjęcia"
                value={mediaCaption}
                onChange={setMediaCaption}
                placeholder="Opcjonalny opis"
              />
              <SubmitButton
                loading={loading}
                label={mediaFiles.length > 1 ? `Dodaj ${mediaFiles.length} zdjęć` : "Dodaj zdjęcie"}
              />
            </form>
          )}

          {action === "catch" && (
            <form onSubmit={submitCatch} className="space-y-5">
              <InputField
                label="Gatunek ryby"
                value={fishName}
                onChange={setFishName}
                placeholder="np. Karp"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Waga (kg)"
                  value={catchWeight}
                  onChange={setCatchWeight}
                  type="number"
                  step="0.01"
                  min="0.01"
                />
                <InputField
                  label="Długość (cm)"
                  value={catchLength}
                  onChange={setCatchLength}
                  type="number"
                  step="0.1"
                  min="0.1"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Metoda"
                  value={catchMethod}
                  onChange={setCatchMethod}
                  options={fishingMethods}
                />
                <InputField
                  label="Data i godzina"
                  value={caughtAt}
                  onChange={setCaughtAt}
                  type="datetime-local"
                  required
                />
              </div>
              <InputField
                label="Przynęta"
                value={catchBait}
                onChange={setCatchBait}
                placeholder="Opcjonalnie"
              />
              <FileField
                label="Zdjęcie ryby"
                accept="image/*"
                onChange={setCatchImage}
              />
              <TextAreaField
                label="Notatka"
                value={catchNote}
                onChange={setCatchNote}
                placeholder="Warunki, zestaw, dodatkowe informacje..."
              />
              <CheckboxField
                checked={catchPublic}
                onChange={setCatchPublic}
                label="Dodaj połów publicznie i do rankingu łowiska"
              />
              <SubmitButton loading={loading} label="Dodaj połów" />
            </form>
          )}
        </Modal>
      )}
    </>
  );
}

function ChecklistContent({
  checklist,
  loading,
  canEdit,
  progress,
  itemName,
  setItemName,
  itemCategory,
  setItemCategory,
  itemQuantity,
  setItemQuantity,
  itemUnit,
  setItemUnit,
  itemImportant,
  setItemImportant,
  itemNote,
  setItemNote,
  onEnsure,
  onAdd,
  onTogglePacked,
  onDelete,
  templates,
  tripDurationDays,
  tripType,
  onApplyTemplate,
  userTemplates,
  templatesLoading,
  templateSaving,
  templateName,
  setTemplateName,
  templateDescription,
  setTemplateDescription,
  onSaveCurrentAsTemplate,
  onOverwriteUserTemplate,
  onDeleteUserTemplate,
}: any) {
  if (loading && !checklist) {
    return <LoadingState />;
  }

  const groups = checklist
    ? checklistCategories
        .map((category) => ({
          category,
          items: checklist.items.filter(
            (item: ChecklistItem) => item.category === category
          ),
        }))
        .filter((group) => group.items.length > 0)
    : [];

  const otherItems = checklist
    ? checklist.items.filter(
        (item: ChecklistItem) =>
          !checklistCategories.includes(item.category)
      )
    : [];

  if (otherItems.length > 0) {
    groups.push({ category: "Pozostałe", items: otherItems });
  }

  return (
    <div className="space-y-6">
      {canEdit && (
        <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                Podpowiedzi Rybio
              </p>
              <h3 className="mt-1 text-lg font-bold text-blue-950">
                Gotowe szablony checklisty
              </h3>
              <p className="mt-1 text-sm leading-6 text-blue-800">
                Dopasowaliśmy propozycje do czasu wyprawy: {tripDurationDays}{" "}
                {tripDurationDays === 1 ? "dzień" : "dni"}
                {tripType ? ` • ${getTripTypeTemplateLabel(tripType)}` : ""}.
              </p>
            </div>
            <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
              Możesz dodać kilka szablonów
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {templates.map((template: ChecklistTemplate) => (
              <button
                key={template.id}
                type="button"
                onClick={() => onApplyTemplate(template)}
                disabled={loading}
                className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-50 ${
                  template.id === "adaptive"
                    ? "border-blue-300 bg-blue-600 text-white hover:border-blue-400"
                    : "border-blue-100 bg-white hover:border-blue-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`font-bold ${template.id === "adaptive" ? "text-white" : "text-slate-950"}`}>{template.label}</p>
                    <p className={`mt-1 text-xs leading-5 ${template.id === "adaptive" ? "text-blue-100" : "text-slate-500"}`}>
                      {template.description}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${template.id === "adaptive" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"}`}>
                    +{template.items.length}
                  </span>
                </div>
                <p className={`mt-3 text-xs font-bold ${template.id === "adaptive" ? "text-white" : "text-blue-600"}`}>
                  {template.id === "adaptive" ? "Dodaj rekomendowaną checklistę" : "Dodaj do checklisty"}
                </p>
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs leading-5 text-blue-700">
            Pozycje, które już są na liście, nie zostaną dodane drugi raz.
          </p>
        </section>
      )}

      {canEdit && (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                Prywatne
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">
                Moje szablony
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Zapisz raz przygotowaną checklistę i używaj jej przy kolejnych
                wyprawach.
              </p>
            </div>

            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {userTemplates.length} {userTemplates.length === 1 ? "szablon" : "szablonów"}
            </span>
          </div>

          {templatesLoading ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
              Wczytywanie Twoich szablonów...
            </div>
          ) : userTemplates.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {userTemplates.map((template: UserChecklistTemplate) => (
                <article
                  key={template.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-bold text-slate-950">
                        {template.name}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {template.description || "Własny szablon checklisty"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                      {template.items.length} poz.
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onApplyTemplate({
                          id: `user:${template.id}`,
                          label: template.name,
                          description:
                            template.description || "Własny szablon checklisty",
                          items: template.items,
                        })
                      }
                      disabled={loading || templateSaving}
                      className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      Użyj szablonu
                    </button>

                    {checklist?.items?.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onOverwriteUserTemplate(template)}
                        disabled={templateSaving}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                      >
                        Nadpisz obecną listą
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteUserTemplate(template)}
                      disabled={templateSaving}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      aria-label={`Usuń szablon ${template.name}`}
                      title="Usuń"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
              <p className="text-sm font-bold text-slate-700">
                Nie masz jeszcze własnych szablonów
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Przygotuj checklistę poniżej, a potem zapisz ją jako szablon.
              </p>
            </div>
          )}

          {checklist?.items?.length > 0 && (
            <form
              onSubmit={onSaveCurrentAsTemplate}
              className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4"
            >
              <div>
                <p className="text-sm font-bold text-blue-950">
                  Zapisz obecną checklistę jako szablon
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Stan „spakowane” nie jest zapisywany — nowa wyprawa zawsze
                  zacznie z czystą checklistą.
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InputField
                  label="Nazwa szablonu"
                  value={templateName}
                  onChange={setTemplateName}
                  placeholder="np. Method feeder — weekend"
                  required
                />
                <InputField
                  label="Opis (opcjonalnie)"
                  value={templateDescription}
                  onChange={setTemplateDescription}
                  placeholder="np. Moja standardowa lista na 2 dni"
                />
              </div>

              <button
                type="submit"
                disabled={templateSaving}
                className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {templateSaving ? "Zapisywanie..." : "Zapisz jako mój szablon"}
              </button>
            </form>
          )}
        </section>
      )}

      {!checklist ? (
        <div className="py-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            ✅
          </div>
          <h3 className="mt-4 text-xl font-bold text-slate-950">
            Brak checklisty
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Utwórz pustą listę albo od razu wybierz jeden z szablonów powyżej.
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={onEnsure}
              className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Utwórz pustą checklistę
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-3xl bg-blue-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-blue-950">
                  Postęp checklisty
                </p>
                <p className="mt-1 text-xs text-blue-700">
                  {checklist.items.filter((item: ChecklistItem) => item.isPacked).length}/
                  {checklist.items.length} spakowane
                </p>
              </div>
              <span className="text-2xl font-extrabold text-blue-700">
                {progress}%
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {groups.length > 0 ? (
            <div className="space-y-5">
              {groups.map((group) => {
                const packed = group.items.filter((item: ChecklistItem) => item.isPacked).length;
                const remaining = group.items.length - packed;

                return (
                  <details key={group.category} open={remaining > 0} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-slate-50 px-4 py-3 [&::-webkit-details-marker]:hidden">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{group.category}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{packed}/{group.items.length} spakowane</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                        {remaining > 0 ? `${remaining} do spakowania` : "Gotowe"}
                      </span>
                    </summary>
                    <div className="space-y-2 p-3">
                      {group.items.map((item: ChecklistItem) => (
                        <label
                          key={item.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition ${
                            item.isPacked
                              ? "border-emerald-100 bg-emerald-50"
                              : "border-slate-200 bg-white hover:border-blue-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={item.isPacked}
                            onChange={() => onTogglePacked(item)}
                            disabled={!canEdit}
                            className="mt-1 h-5 w-5 accent-blue-600"
                          />
                          <div className="min-w-0 flex-1">
                            <p className={`font-bold ${item.isPacked ? "text-emerald-700 line-through" : "text-slate-800"}`}>
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {item.quantity} {item.unit || ""}{item.isImportant ? " • ważne" : ""}
                            </p>
                            {item.note && <p className="mt-1 text-xs text-slate-500">{item.note}</p>}
                          </div>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onDelete(item.id);
                              }}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                              aria-label={`Usuń ${item.name}`}
                              title="Usuń"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </label>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
              Checklista jest pusta. Dodaj szablon albo pierwszy element poniżej.
            </p>
          )}

          {canEdit && (
            <form
              onSubmit={onAdd}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
            >
              <h3 className="font-bold text-slate-950">Dodaj własny element</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InputField
                  label="Nazwa"
                  value={itemName}
                  onChange={setItemName}
                  required
                />
                <SelectField
                  label="Kategoria"
                  value={itemCategory}
                  onChange={setItemCategory}
                  options={checklistCategories.map((value) => ({
                    value,
                    label: value,
                  }))}
                />
                <InputField
                  label="Ilość"
                  value={itemQuantity}
                  onChange={setItemQuantity}
                  type="number"
                  min="1"
                  required
                />
                <InputField
                  label="Jednostka"
                  value={itemUnit}
                  onChange={setItemUnit}
                />
              </div>
              <div className="mt-3">
                <TextAreaField
                  label="Notatka"
                  value={itemNote}
                  onChange={setItemNote}
                  placeholder="Opcjonalnie"
                />
              </div>
              <div className="mt-3">
                <CheckboxField
                  checked={itemImportant}
                  onChange={setItemImportant}
                  label="Ważny element"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                + Dodaj do checklisty
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

function GearContent({
  loading,
  canEdit,
  availableGear,
  tripGear,
  selectedGearIds,
  setSelectedGearIds,
  onSave,
  onTogglePacked,
  onAddCustom,
  onDeleteCustom,
}: any) {
  const [onlyUnpacked, setOnlyUnpacked] = useState(false);
  const [addTab, setAddTab] = useState<"owned" | "custom">("owned");
  const [gearSearch, setGearSearch] = useState("");

  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("Inne");
  const [customQuantity, setCustomQuantity] = useState("1");
  const [customUnit, setCustomUnit] = useState("szt.");
  const [customNote, setCustomNote] = useState("");
  const [customRequired, setCustomRequired] = useState(true);

  const visibleTripGear = onlyUnpacked
    ? tripGear.filter((item: TripGearItem) => !item.isPacked)
    : tripGear;

  const normalizedSearch = gearSearch.trim().toLocaleLowerCase("pl-PL");

  const filteredAvailableGear = normalizedSearch
    ? availableGear.filter((gear: AvailableGear) =>
        [
          gear.name,
          gear.category,
          gear.brand,
          gear.model,
          gear.fishingMethod,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("pl-PL")
          .includes(normalizedSearch)
      )
    : availableGear;

  async function submitCustomGear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const quantity = Number.parseInt(customQuantity, 10);

    if (!customName.trim()) {
      return;
    }

    const added = await onAddCustom({
      name: customName.trim(),
      category: customCategory.trim() || "Inne",
      quantity: Number.isFinite(quantity) ? quantity : 1,
      unit: customUnit.trim() || "szt.",
      note: customNote.trim(),
      isRequired: customRequired,
    });

    if (added) {
      setCustomName("");
      setCustomCategory("Inne");
      setCustomQuantity("1");
      setCustomUnit("szt.");
      setCustomNote("");
      setCustomRequired(true);
    }
  }

  if (loading && availableGear.length === 0 && tripGear.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-950">
              Sprzęt na tej wyprawie
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Zaznacz spakowane rzeczy bez wychodzenia z tego okna.
            </p>
          </div>

          {tripGear.length > 0 && (
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={onlyUnpacked}
                onChange={(event) => setOnlyUnpacked(event.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              Tylko niespakowane
            </label>
          )}
        </div>

        {tripGear.length > 0 ? (
          visibleTripGear.length > 0 ? (
            <div className="mt-3 space-y-2">
              {visibleTripGear.map((item: TripGearItem) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 rounded-2xl border p-3 ${
                    item.isPacked
                      ? "border-emerald-100 bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.isPacked}
                    onChange={() => onTogglePacked(item)}
                    disabled={!canEdit}
                    className="mt-1 h-5 w-5 shrink-0 accent-blue-600"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={`break-words font-bold ${
                          item.isPacked
                            ? "text-emerald-700 line-through"
                            : "text-slate-800"
                        }`}
                      >
                        {item.name}
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          item.gearId
                            ? "bg-blue-50 text-blue-700"
                            : "bg-violet-50 text-violet-700"
                        }`}
                      >
                        {item.gearId ? "Z Ekwipunku" : "Tylko ta wyprawa"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.category} • {item.quantity} {item.unit || "szt."}
                      {item.isRequired ? " • wymagany" : ""}
                    </p>

                    {item.note && (
                      <p className="mt-1 break-words text-xs leading-5 text-slate-400">
                        {item.note}
                      </p>
                    )}
                  </div>

                  {canEdit && !item.gearId && (
                    <div className="group relative shrink-0">
                      <button
                        type="button"
                        onClick={() => onDeleteCustom(item)}
                        disabled={loading}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        aria-label={`Usuń ${item.name}`}
                        title="Usuń"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>

                      <div
                        className="
                          pointer-events-none absolute bottom-full left-1/2 z-30 mb-2
                          -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950
                          px-2.5 py-1.5 text-[11px] font-semibold text-white
                          opacity-0 shadow-lg transition group-hover:opacity-100
                        "
                      >
                        Usuń
                        <span
                          className="
                            absolute left-1/2 top-full -translate-x-1/2
                            border-4 border-transparent border-t-slate-950
                          "
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
              <p className="text-sm font-bold text-slate-700">
                Wszystko jest już spakowane
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Wyłącz filtr, aby zobaczyć cały sprzęt tej wyprawy.
              </p>
            </div>
          )
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
            <p className="text-sm font-bold text-slate-700">
              Nie dodano jeszcze sprzętu
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Wybierz coś z Ekwipunku albo dodaj jednorazowy element tylko do
              tej wyprawy.
            </p>
          </div>
        )}
      </section>

      {canEdit && (
        <section className="border-t border-slate-100 pt-5">
          <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setAddTab("owned")}
              className={`rounded-xl px-3 py-2.5 text-xs font-bold transition sm:text-sm ${
                addTab === "owned"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Z mojego ekwipunku
            </button>

            <button
              type="button"
              onClick={() => setAddTab("custom")}
              className={`rounded-xl px-3 py-2.5 text-xs font-bold transition sm:text-sm ${
                addTab === "custom"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tylko do tej wyprawy
            </button>
          </div>

          {addTab === "owned" ? (
            <div className="mt-5">
              <div>
                <h3 className="text-sm font-bold text-slate-950">
                  Wybierz z Ekwipunku
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Te przedmioty pozostają zapisane w Twoim module Ekwipunek.
                </p>
              </div>

              {availableGear.length > 0 && (
                <div className="relative mt-4">
                  <input
                    type="search"
                    value={gearSearch}
                    onChange={(event) => setGearSearch(event.target.value)}
                    placeholder="Szukaj po nazwie, marce lub kategorii..."
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              )}

              {availableGear.length > 0 ? (
                filteredAvailableGear.length > 0 ? (
                  <div className="mt-3 max-h-[340px] space-y-2 overflow-y-auto pr-1">
                    {filteredAvailableGear.map((gear: AvailableGear) => {
                      const selected = selectedGearIds.includes(gear.id);

                      return (
                        <label
                          key={gear.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition ${
                            selected
                              ? "border-blue-200 bg-blue-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              setSelectedGearIds((current: string[]) =>
                                selected
                                  ? current.filter((id) => id !== gear.id)
                                  : [...current, gear.id]
                              )
                            }
                            className="mt-1 h-5 w-5 shrink-0 accent-blue-600"
                          />

                          <div className="min-w-0">
                            <p className="break-words font-bold text-slate-800">
                              {gear.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {gear.category}
                              {[gear.brand, gear.model].filter(Boolean).length >
                              0
                                ? ` • ${[gear.brand, gear.model]
                                    .filter(Boolean)
                                    .join(" ")}`
                                : ""}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl bg-slate-50 p-5 text-center">
                    <p className="text-sm font-bold text-slate-700">
                      Brak pasującego sprzętu
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Spróbuj wpisać krótszą nazwę lub kategorię.
                    </p>
                  </div>
                )
              ) : (
                <div className="mt-3 rounded-2xl bg-slate-50 p-5 text-center">
                  <p className="text-sm font-bold text-slate-700">
                    Twój Ekwipunek jest pusty
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Możesz przejść do drugiej zakładki i dodać rzecz tylko do
                    tej wyprawy.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={onSave}
                disabled={loading}
                className="mt-4 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Zapisywanie..." : "Zapisz wybór z Ekwipunku"}
              </button>
            </div>
          ) : (
            <form onSubmit={submitCustomGear} className="mt-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-950">
                  Dodaj jednorazowy element
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Zostanie zapisany wyłącznie w tej wyprawie i nie pojawi się
                  w Twoim głównym Ekwipunku.
                </p>
              </div>

              <InputField
                label="Nazwa"
                value={customName}
                onChange={setCustomName}
                placeholder="np. Pożyczony podbierak"
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Kategoria"
                  value={customCategory}
                  onChange={setCustomCategory}
                  placeholder="np. Akcesoria"
                  required
                />

                <div className="grid grid-cols-[1fr_120px] gap-3">
                  <InputField
                    label="Ilość"
                    value={customQuantity}
                    onChange={setCustomQuantity}
                    type="number"
                    min="1"
                    max="999"
                    required
                  />
                  <InputField
                    label="Jednostka"
                    value={customUnit}
                    onChange={setCustomUnit}
                    placeholder="szt."
                    required
                  />
                </div>
              </div>

              <TextAreaField
                label="Notatka (opcjonalnie)"
                value={customNote}
                onChange={setCustomNote}
                placeholder="np. odebrać od Kamila przed wyjazdem"
              />

              <CheckboxField
                checked={customRequired}
                onChange={setCustomRequired}
                label="Uwzględnij ten element jako wymagany w przygotowaniu"
              />

              <SubmitButton
                loading={loading}
                label="Dodaj tylko do tej wyprawy"
              />
            </form>
          )}
        </section>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-950/65 p-3 sm:p-6" onMouseDown={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Centrum wyprawy</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-950 sm:text-2xl">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-600 hover:bg-slate-200"
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>
        <div className="max-h-[calc(92vh-82px)] overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder, required = false, step, min }: any) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
        className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder, required = false }: any) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        rows={4}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: any) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      >
        {options.map((option: { value: string; label: string }) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function CheckboxField({ checked, onChange, label }: any) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-5 w-5 accent-blue-600"
      />
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </label>
  );
}

function MultiFileField({ label, accept, files, onChange, required = false }: any) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="file"
        accept={accept}
        multiple
        required={required}
        onChange={(event) => onChange(Array.from(event.target.files ?? []))}
        className="block w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-bold file:text-white"
      />
      <p className="mt-2 text-xs text-slate-400">Do 10 zdjęć jednocześnie, maksymalnie 5 MB każde.</p>
      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((file: File) => (
            <span key={`${file.name}-${file.size}`} className="max-w-full truncate rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {file.name}
            </span>
          ))}
        </div>
      )}
    </label>
  );
}

function FileField({ label, accept, onChange, required = false }: any) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="file"
        accept={accept}
        required={required}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        className="block w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-bold file:text-white"
      />
      <p className="mt-2 text-xs text-slate-400">Maksymalnie 5 MB.</p>
    </label>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Zapisywanie..." : label}
    </button>
  );
}

function LoadingState() {
  return <div className="py-12 text-center text-sm font-bold text-slate-500">Ładowanie...</div>;
}

function getTitle(action: ActionType) {
  if (action === "checklist") return "Checklista wyprawy";
  if (action === "gear") return "Sprzęt na wyprawę";
  if (action === "note") return "Dodaj notatkę";
  if (action === "cost") return "Dodaj koszt";
  if (action === "media") return "Dodaj zdjęcia";
  return "Dodaj połów";
}

function toDateTimeLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}