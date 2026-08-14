"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { useToast } from "@/components/ui/ToastProvider";
import { TripInvitations } from "@/components/dashboard/TripInvitationActions";
import { AlertIcon } from "@/components/icons/AlertIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { CheckListIcon } from "@/components/icons/CheckListIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { MapIcon } from "@/components/icons/MapIcon";
import { HookIcon } from "@/components/icons/HookIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";


type TripMemberDto = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string | null;
  role: string;
  status: string;
  invitedByUserId: string;
  acceptedAt: string | null;
  createdAt: string;
};

type TripLakeDto = {
  id: string;
  name: string;
  slug: string;
  city: string;
  voivodeship: string;
  lat: number;
  lng: number;
  images: {
    url: string;
  }[];
} | null;

type TripChecklistItemDto = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string | null;
  isPacked: boolean;
  isImportant: boolean;
  source: string;
  gearId: string | null;
  note: string | null;
};

type TripChecklistDto = {
  id: string;
  title: string;
  status: string;
  items: TripChecklistItemDto[];
} | null;

type FishingTrip = {
  id: string;
  userId: string;

  title: string;
  lakeId: string | null;
  lakeName: string | null;
  lake: TripLakeDto;
  lakeImage: string | null;

  tripType: string;
  status: string;
  startsAt: string;
  endsAt: string | null;

  peopleCount: number;
  note: string | null;

  checklistId: string | null;
  checklist: TripChecklistDto;

  summary: string | null;
  summaryRating: number | null;
  weatherSummary: string | null;
  completedAt: string | null;

  isSummaryPublic: boolean;
  shareToken: string | null;

  members: TripMemberDto[];
  gearItems: {
    id: string;
    isRequired: boolean;
    isPacked: boolean;
  }[];

  _count: {
    notes: number;
    costs: number;
    media: number;
    catches: number;
    reminders: number;
  };

  isOwner: boolean;
  accessRole: string;
  canEdit: boolean;
  canManageMembers: boolean;
  canDelete: boolean;

  acceptedMembersCount: number;
  pendingMembersCount: number;
  participantsCount: number;

  checklistItemsCount: number;
  packedChecklistItemsCount: number;
  requiredChecklistItemsCount: number;
  packedRequiredChecklistItemsCount: number;

  requiredGearItemsCount: number;
  packedRequiredGearItemsCount: number;

  checklistProgress: number;
  requiredChecklistProgress: number;
  requiredGearProgress: number;
  detailsProgress: number;
  preparationProgress: number;
  preparationWarnings: string[];

  createdAt: string;
  updatedAt: string;
};

type LakeOption = {
  id: string;
  name: string;
  city: string;
  voivodeship: string;
};

type TripsPageProps = {
  initialTrips: FishingTrip[];
  lakes: LakeOption[];
  initialLakeId?: string | null;
  initialLakeName?: string | null;
  pendingInvitations?: Array<{
    id: string;
    role: string;
    trip: {
      id: string;
      title: string;
      lakeName: string | null;
      startsAt: string;
    };
  }>;
};

type TripFormState = {
  title: string;
  lakeId: string;
  tripType: string;
  status: string;
  startsAt: string;
  endsAt: string;
  peopleCount: string;
  note: string;
  createChecklist: boolean;
};

type ApiResponse = {
  message?: string;
};

type TripTab = "upcoming" | "active" | "finished" | "all";
type TripSort = "nearest" | "farthest" | "newest" | "name";
type ViewMode = "grid" | "list";

const initialFormState: TripFormState = {
  title: "",
  lakeId: "",
  tripType: "custom",
  status: "planned",
  startsAt: "",
  endsAt: "",
  peopleCount: "1",
  note: "",
  createChecklist: true,
};

const tripTypes = [
  { label: "Własna", value: "custom" },
  { label: "Spinning", value: "spinning" },
  { label: "Feeder", value: "feeder" },
  { label: "Method feeder", value: "method_feeder" },
  { label: "Karpiówka", value: "carp" },
  { label: "Spławik", value: "float" },
  { label: "Nocka", value: "night" },
  { label: "Zawody", value: "competition" },
];


const tabs: {
  label: string;
  value: TripTab;
}[] = [
  { label: "Nadchodzące", value: "upcoming" },
  { label: "W trakcie", value: "active" },
  { label: "Zakończone", value: "finished" },
  { label: "Wszystkie", value: "all" },
];

async function readApiResponse(response: Response) {
  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return {
      message: "Serwer nie zwrócił poprawnej odpowiedzi.",
    };
  }
}

export function TripsPage({
  initialTrips,
  lakes,
  initialLakeId = null,
  initialLakeName = null,
  pendingInvitations = [],
}: TripsPageProps) {
  const router = useRouter();
  const toast = useToast();

  const initialLakeExists = lakes.some((lake) => lake.id === initialLakeId);

  const initialFormWithLake = useMemo<TripFormState>(
    () => ({
      ...initialFormState,
      lakeId: initialLakeExists ? initialLakeId || "" : "",
      title:
        initialLakeExists && initialLakeName
          ? `Wyprawa na ${initialLakeName}`
          : "",
    }),
    [initialLakeExists, initialLakeId, initialLakeName]
  );

  const [trips, setTrips] = useState<FishingTrip[]>(initialTrips);
  const [form, setForm] = useState<TripFormState>(initialFormWithLake);
  const [formStep, setFormStep] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(initialLakeExists);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [checklistTripId, setChecklistTripId] = useState<string | null>(null);
  const [isChecklistSaving, setIsChecklistSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TripTab>("upcoming");
  const [typeFilter, setTypeFilter] = useState("all");
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const [sort, setSort] = useState<TripSort>("nearest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [areMobileFiltersOpen, setAreMobileFiltersOpen] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() =>
    toDateKey(new Date())
  );

  useEffect(() => {
    setTrips(initialTrips);
  }, [initialTrips]);

  useEffect(() => {
    setForm(initialFormWithLake);
  }, [initialFormWithLake]);

  const now = new Date();

  const tripCounts = useMemo(() => {
    const upcoming = trips.filter((trip) => getTripPhase(trip, now) === "upcoming");
    const active = trips.filter((trip) => getTripPhase(trip, now) === "active");
    const finished = trips.filter(
      (trip) => getTripPhase(trip, now) === "finished"
    );
    const shared = trips.filter((trip) => !trip.isOwner);

    const thingsToPack = trips
      .filter((trip) => {
        const phase = getTripPhase(trip, now);
        return phase === "upcoming" || phase === "active";
      })
      .reduce((sum, trip) => {
        const requiredChecklistRemaining = Math.max(
          trip.requiredChecklistItemsCount -
            trip.packedRequiredChecklistItemsCount,
          0
        );

        const requiredGearRemaining = Math.max(
          trip.requiredGearItemsCount - trip.packedRequiredGearItemsCount,
          0
        );

        return sum + requiredChecklistRemaining + requiredGearRemaining;
      }, 0);

    return {
      upcoming: upcoming.length,
      active: active.length,
      finished: finished.length,
      shared: shared.length,
      thingsToPack,
    };
  }, [trips, now]);

  const nearestTrip = useMemo(() => {
    return (
      trips
        .filter((trip) => {
          const phase = getTripPhase(trip, now);
          return phase === "upcoming" || phase === "active";
        })
        .sort(
          (firstTrip, secondTrip) =>
            new Date(firstTrip.startsAt).getTime() -
            new Date(secondTrip.startsAt).getTime()
        )[0] ?? null
    );
  }, [trips, now]);

  const filteredTrips = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return trips
      .filter((trip) => {
        const phase = getTripPhase(trip, now);

        const matchesTab =
          activeTab === "all" ||
          (activeTab === "upcoming" && phase === "upcoming") ||
          (activeTab === "active" && phase === "active") ||
          (activeTab === "finished" && phase === "finished");

        const matchesSearch =
          !searchValue ||
          trip.title.toLowerCase().includes(searchValue) ||
          trip.lakeName?.toLowerCase().includes(searchValue) ||
          trip.lake?.name.toLowerCase().includes(searchValue) ||
          trip.note?.toLowerCase().includes(searchValue);

        const matchesType =
          typeFilter === "all" || trip.tripType === typeFilter;

        const matchesOwnership =
          ownershipFilter === "all" ||
          (ownershipFilter === "owned" && trip.isOwner) ||
          (ownershipFilter === "shared" && !trip.isOwner);

        return matchesTab && matchesSearch && matchesType && matchesOwnership;
      })
      .sort((firstTrip, secondTrip) => {
        if (sort === "name") {
          return firstTrip.title.localeCompare(secondTrip.title, "pl");
        }

        if (sort === "newest") {
          return (
            new Date(secondTrip.createdAt).getTime() -
            new Date(firstTrip.createdAt).getTime()
          );
        }

        const firstDate = new Date(firstTrip.startsAt).getTime();
        const secondDate = new Date(secondTrip.startsAt).getTime();

        return sort === "farthest"
          ? secondDate - firstDate
          : firstDate - secondDate;
      });
  }, [
    trips,
    search,
    activeTab,
    typeFilter,
    ownershipFilter,
    sort,
    now,
  ]);

  const activeFiltersCount =
    Number(Boolean(search.trim())) +
    Number(typeFilter !== "all") +
    Number(ownershipFilter !== "all") +
    Number(sort !== "nearest");

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth),
    [calendarMonth]
  );

  const tripsByDate = useMemo(() => {
    const result = new Map<string, FishingTrip[]>();

    trips.forEach((trip) => {
      const keys = getTripDateKeys(trip);

      keys.forEach((key) => {
        const current = result.get(key) ?? [];
        current.push(trip);
        result.set(key, current);
      });
    });

    return result;
  }, [trips]);

  const selectedDayTrips = tripsByDate.get(selectedCalendarDate) ?? [];

  const checklistTrip = checklistTripId
    ? trips.find((trip) => trip.id === checklistTripId) ?? null
    : null;

  async function openChecklist(trip: FishingTrip) {
    if (trip.checklistId && trip.checklist) {
      setChecklistTripId(trip.id);
      return;
    }

    if (!trip.canEdit) {
      toast.error({
        title: "Ta wyprawa nie ma checklisty.",
        description: "Tylko użytkownik z prawem edycji może ją utworzyć.",
      });
      return;
    }

    setIsChecklistSaving(true);

    try {
      const response = await fetch(`/api/trips/${trip.id}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ensure" }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        checklist?: TripChecklistDto;
      };

      if (!response.ok || !data.checklist) {
        toast.error({
          title: "Nie udało się utworzyć checklisty.",
          description: data.message || "Spróbuj ponownie za chwilę.",
        });
        return;
      }

      setTrips((currentTrips) =>
        currentTrips.map((item) =>
          item.id === trip.id
            ? {
                ...item,
                checklistId: data.checklist?.id ?? null,
                checklist: data.checklist ?? null,
                checklistItemsCount: data.checklist?.items.length ?? 0,
                packedChecklistItemsCount: 0,
                checklistProgress: 0,
                preparationWarnings: item.preparationWarnings.filter(
                  (warning) => warning !== "Nie utworzono checklisty"
                ),
              }
            : item
        )
      );

      setChecklistTripId(trip.id);
      router.refresh();
      toast.success({ title: "Checklista została utworzona." });
    } catch {
      toast.error({
        title: "Nie udało się utworzyć checklisty.",
        description: "Wystąpił problem z połączeniem.",
      });
    } finally {
      setIsChecklistSaving(false);
    }
  }

  function closeChecklist() {
    if (isChecklistSaving) {
      return;
    }

    setChecklistTripId(null);
  }

  function updateChecklistInTrip(
    tripId: string,
    items: TripChecklistItemDto[]
  ) {
    setTrips((currentTrips) =>
      currentTrips.map((trip) => {
        if (trip.id !== tripId || !trip.checklist) {
          return trip;
        }

        const packedCount = items.filter((item) => item.isPacked).length;
        const requiredItems = items.filter((item) => item.isImportant);
        const packedRequiredCount = requiredItems.filter(
          (item) => item.isPacked
        ).length;

        const checklistProgress = calculatePercent(packedCount, items.length);
        const requiredChecklistProgress = calculatePercent(
          packedRequiredCount,
          requiredItems.length
        );

        const preparationParts = [trip.detailsProgress];
        if (items.length > 0) preparationParts.push(checklistProgress);
        if (trip.requiredGearItemsCount > 0) preparationParts.push(trip.requiredGearProgress);

        const preparationProgress = Math.round(
          preparationParts.reduce((sum, value) => sum + value, 0) / preparationParts.length
        );

        return {
          ...trip,
          checklist: {
            ...trip.checklist,
            items,
          },
          checklistItemsCount: items.length,
          packedChecklistItemsCount: packedCount,
          requiredChecklistItemsCount: requiredItems.length,
          packedRequiredChecklistItemsCount: packedRequiredCount,
          checklistProgress,
          requiredChecklistProgress,
          preparationProgress,
        };
      })
    );
  }

  async function handleToggleChecklistItem(
    trip: FishingTrip,
    itemId: string,
    isPacked: boolean
  ) {
    if (!trip.canEdit || !trip.checklist) {
      return;
    }

    setIsChecklistSaving(true);

    try {
      const response = await fetch(`/api/trips/${trip.id}/checklist`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          isPacked,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        items?: TripChecklistItemDto[];
      };

      if (!response.ok) {
        toast.error({
          title: "Nie udało się zaktualizować checklisty.",
          description: data.message || "Spróbuj ponownie za chwilę.",
        });
        return;
      }

      if (data.items) {
        updateChecklistInTrip(trip.id, data.items);
      }
    } catch {
      toast.error({
        title: "Nie udało się zaktualizować checklisty.",
        description: "Wystąpił problem z połączeniem.",
      });
    } finally {
      setIsChecklistSaving(false);
    }
  }

  async function handleAddChecklistItem(
    trip: FishingTrip,
    item: {
      name: string;
      category: string;
      quantity: number;
      unit: string;
      isImportant: boolean;
      note: string;
    }
  ) {
    if (!trip.canEdit) {
      return false;
    }

    setIsChecklistSaving(true);

    try {
      const response = await fetch(`/api/trips/${trip.id}/checklist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        items?: TripChecklistItemDto[];
      };

      if (!response.ok) {
        toast.error({
          title: "Nie udało się dodać elementu.",
          description: data.message || "Spróbuj ponownie za chwilę.",
        });
        return false;
      }

      if (data.items) {
        updateChecklistInTrip(trip.id, data.items);
      }

      toast.success({
        title: "Dodano do checklisty.",
        description: item.name,
      });

      return true;
    } catch {
      toast.error({
        title: "Nie udało się dodać elementu.",
        description: "Wystąpił problem z połączeniem.",
      });
      return false;
    } finally {
      setIsChecklistSaving(false);
    }
  }

  async function handleDeleteChecklistItem(
    trip: FishingTrip,
    itemId: string
  ) {
    if (!trip.canEdit) {
      return;
    }

    setIsChecklistSaving(true);

    try {
      const response = await fetch(`/api/trips/${trip.id}/checklist`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        items?: TripChecklistItemDto[];
      };

      if (!response.ok) {
        toast.error({
          title: "Nie udało się usunąć elementu.",
          description: data.message || "Spróbuj ponownie za chwilę.",
        });
        return;
      }

      if (data.items) {
        updateChecklistInTrip(trip.id, data.items);
      }
    } catch {
      toast.error({
        title: "Nie udało się usunąć elementu.",
        description: "Wystąpił problem z połączeniem.",
      });
    } finally {
      setIsChecklistSaving(false);
    }
  }

  function updateField<K extends keyof TripFormState>(
    field: K,
    value: TripFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleOpenCreateForm() {
    setEditingTripId(null);
    setForm(initialFormWithLake);
    setFormStep(1);
    setIsFormOpen(true);
  }

  function handleStartEdit(trip: FishingTrip) {
    if (!trip.canEdit) {
      toast.error({
        title: "Nie możesz edytować tej wyprawy.",
        description: "Masz dostęp tylko do podglądu tej współdzielonej wyprawy.",
      });

      return;
    }

    setEditingTripId(trip.id);
    setForm({
      title: trip.title,
      lakeId: trip.lakeId || "",
      tripType: trip.tripType,
      status: trip.status,
      startsAt: toDateTimeLocalValue(trip.startsAt),
      endsAt: trip.endsAt ? toDateTimeLocalValue(trip.endsAt) : "",
      peopleCount: String(trip.peopleCount || 1),
      note: trip.note || "",
      createChecklist: Boolean(trip.checklistId),
    });

    setFormStep(1);
    setIsFormOpen(true);
  }

  function handleCancelForm() {
    if (isLoading) {
      return;
    }

    setEditingTripId(null);
    setForm(initialFormWithLake);
    setFormStep(1);
    setIsFormOpen(false);
  }

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setOwnershipFilter("all");
    setSort("nearest");
    setAreMobileFiltersOpen(false);
  }

  function validateStep(step: number) {
    if (step === 1) {
      if (!form.title.trim()) {
        toast.error({
          title: "Podaj tytuł wyprawy.",
          description: "Tytuł jest wymagany, żeby zapisać wyprawę.",
        });

        return false;
      }

      const peopleCount = Number(form.peopleCount);

      if (!Number.isInteger(peopleCount) || peopleCount < 1 || peopleCount > 100) {
        toast.error({
          title: "Niepoprawna liczba osób.",
          description: "Podaj liczbę od 1 do 100.",
        });

        return false;
      }
    }

    if (step === 2) {
      if (!form.startsAt) {
        toast.error({
          title: "Wybierz datę rozpoczęcia.",
          description: "Data i godzina rozpoczęcia są wymagane.",
        });

        return false;
      }

      const startsAt = new Date(form.startsAt);

      if (Number.isNaN(startsAt.getTime())) {
        toast.error({
          title: "Niepoprawna data rozpoczęcia.",
          description: "Sprawdź datę i godzinę rozpoczęcia wyprawy.",
        });

        return false;
      }

      if (form.endsAt) {
        const endsAt = new Date(form.endsAt);

        if (Number.isNaN(endsAt.getTime())) {
          toast.error({
            title: "Niepoprawna data zakończenia.",
            description: "Sprawdź datę i godzinę zakończenia wyprawy.",
          });

          return false;
        }

        if (endsAt <= startsAt) {
          toast.error({
            title: "Niepoprawny zakres dat.",
            description:
              "Zakończenie wyprawy musi przypadać po jej rozpoczęciu.",
          });

          return false;
        }
      }
    }

    return true;
  }

  function goToNextFormStep() {
    if (!validateStep(formStep)) {
      return;
    }

    setFormStep((current) => Math.min(current + 1, 3));
  }

  function goToPreviousFormStep() {
    setFormStep((current) => Math.max(current - 1, 1));
  }

  function validateForm() {
    return validateStep(1) && validateStep(2);
  }

  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const isEditing = Boolean(editingTripId);
    const toastId = toast.loading({
      title: isEditing ? "Zapisywanie zmian..." : "Planowanie wyprawy...",
      description: isEditing
        ? "Aktualizujemy dane wyprawy."
        : "Tworzymy nową wyprawę w Centrum wypraw.",
    });

    const url = editingTripId ? `/api/trips/${editingTripId}` : "/api/trips";
    const method = editingTripId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          peopleCount: Number(form.peopleCount),
          endsAt: form.endsAt || null,
        }),
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        toast.update(toastId, {
          type: "error",
          title: isEditing
            ? "Nie udało się zapisać zmian."
            : "Nie udało się zaplanować wyprawy.",
          description: data.message || "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });

        return;
      }

      setEditingTripId(null);
      setForm(initialFormWithLake);
      setFormStep(1);
      setIsFormOpen(false);
      router.refresh();

      toast.update(toastId, {
        type: "success",
        title: isEditing
          ? "Wyprawa została zaktualizowana."
          : "Wyprawa została zaplanowana.",
        description: form.createChecklist
          ? "Wyprawa i checklista są gotowe do dalszego przygotowania."
          : "Dane wyprawy zostały zapisane.",
        duration: 4500,
      });
    } catch (error) {
      toast.update(toastId, {
        type: "error",
        title: isEditing
          ? "Nie udało się zapisać zmian."
          : "Nie udało się zaplanować wyprawy.",
        description:
          error instanceof Error
            ? error.message
            : "Wystąpił problem z połączeniem.",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteTrip(trip: FishingTrip) {
    if (!trip.canDelete) {
      toast.error({
        title: "Nie możesz usunąć tej wyprawy.",
        description: "Tylko właściciel może usunąć całą wyprawę.",
      });

      return;
    }

    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć wyprawę „${trip.title}”?`
    );

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading({
      title: "Usuwanie wyprawy...",
      description: "Usuwamy wyprawę wraz z jej danymi.",
    });

    try {
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: "DELETE",
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        toast.update(toastId, {
          type: "error",
          title: "Nie udało się usunąć wyprawy.",
          description: data.message || "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });

        return;
      }

      setTrips((current) => current.filter((item) => item.id !== trip.id));
      router.refresh();

      if (editingTripId === trip.id) {
        handleCancelForm();
      }

      toast.update(toastId, {
        type: "success",
        title: "Wyprawa została usunięta.",
        description: "Wyprawa zniknęła z Centrum wypraw.",
        duration: 4500,
      });
    } catch {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się usunąć wyprawy.",
        description: "Wystąpił problem z połączeniem. Spróbuj ponownie.",
        duration: 6000,
      });
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden pb-28 md:pb-0">
      <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600">
            Planowanie i przygotowanie
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Centrum wypraw
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            Planuj terminy, współdziel wyprawy, przygotowuj checklisty i sprzęt,
            zapisuj koszty, notatki, zdjęcia oraz połowy.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isFormOpen) {
              handleCancelForm();
              return;
            }

            handleOpenCreateForm();
          }}
          className="rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
        >
          {isFormOpen ? "Zamknij formularz" : "+ Zaplanuj wyprawę"}
        </button>
      </header>

      <TripInvitations invitations={pendingInvitations} />

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Nadchodzące"
          value={String(tripCounts.upcoming)}
          description={tripCounts.active > 0 ? `${tripCounts.active} wypraw w trakcie` : "zaplanowane wyprawy"}
        />

        <StatCard
          label="Do spakowania"
          value={String(tripCounts.thingsToPack)}
          description="ważne rzeczy i sprzęt"
          emphasis={tripCounts.thingsToPack > 0}
        />

        <StatCard
          label="Współdzielone"
          value={String(tripCounts.shared)}
          description={pendingInvitations.length > 0 ? `${pendingInvitations.length} zaproszeń oczekuje` : "zaakceptowane wspólne wyprawy"}
        />
      </section>

      <section className="mb-6 grid gap-5 2xl:grid-cols-[minmax(0,1.35fr)_420px]">
        <NearestTripCard
          trip={nearestTrip}
          onEdit={handleStartEdit}
          onChecklist={openChecklist}
        />

        <TripCalendar
          month={calendarMonth}
          days={calendarDays}
          tripsByDate={tripsByDate}
          selectedDate={selectedCalendarDate}
          selectedTrips={selectedDayTrips}
          onMonthChange={setCalendarMonth}
          onDateSelect={setSelectedCalendarDate}
        />
      </section>

      <QuickActions
        nearestTrip={nearestTrip}
        onChecklist={openChecklist}
      />

      {isFormOpen && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-[2px] sm:p-6"
          onClick={handleCancelForm}
        >
          <div
            className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-600">
                  Centrum wypraw
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-slate-950 sm:text-2xl">
                  {editingTripId ? "Edytuj wyprawę" : "Zaplanuj wyprawę"}
                </h2>

                <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                  Wszystkie dane zapiszesz bez opuszczania Centrum wypraw.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancelForm}
                disabled={isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
                aria-label="Zamknij formularz"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <TripForm
                form={form}
                formStep={formStep}
                editingTripId={editingTripId}
                lakes={lakes}
                isLoading={isLoading}
                initialLakeExists={initialLakeExists}
                onSubmit={handleSubmit}
                onCancel={handleCancelForm}
                onNext={goToNextFormStep}
                onBack={goToPreviousFormStep}
                onFieldChange={updateField}
                isMobile
              />
            </div>
          </div>
        </div>
      )}

      {checklistTrip && checklistTrip.checklist && (
        <ChecklistModal
          trip={checklistTrip}
          isSaving={isChecklistSaving}
          onClose={closeChecklist}
          onToggle={handleToggleChecklistItem}
          onAddItem={handleAddChecklistItem}
          onDeleteItem={handleDeleteChecklistItem}
        />
      )}

      <section className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`shrink-0 rounded-2xl px-4 py-2.5 text-sm font-extrabold transition ${
                  activeTab === tab.value
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <ViewModeSwitcher
            viewMode={viewMode}
            onChange={setViewMode}
            className="hidden xl:flex"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Szukaj po nazwie, łowisku lub notatce..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="flex gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setAreMobileFiltersOpen((current) => !current)}
              className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-black text-slate-700"
            >
              Filtry
              {activeFiltersCount > 0 && (
                <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <ViewModeSwitcher
              viewMode={viewMode}
              onChange={setViewMode}
              compact
            />
          </div>
        </div>

        <div
          className={`mt-3 gap-3 ${
            areMobileFiltersOpen
              ? "grid sm:grid-cols-2"
              : "hidden"
          } lg:flex lg:flex-wrap lg:items-center`}
        >
          <div className="lg:w-[190px]">
            <FilterSelect
              value={typeFilter}
              onChange={setTypeFilter}
              options={[{ label: "Wszystkie typy", value: "all" }, ...tripTypes]}
            />
          </div>

          <div className="lg:w-[210px]">
            <FilterSelect
              value={ownershipFilter}
              onChange={setOwnershipFilter}
              options={[
                { label: "Wszystkie wyprawy", value: "all" },
                { label: "Moje wyprawy", value: "owned" },
                { label: "Współdzielone", value: "shared" },
              ]}
            />
          </div>

          <div className="lg:w-[190px]">
            <FilterSelect
              value={sort}
              onChange={(value) => setSort(value as TripSort)}
              options={[
                { label: "Najbliższe", value: "nearest" },
                { label: "Najdalsze", value: "farthest" },
                { label: "Ostatnio dodane", value: "newest" },
                { label: "Nazwa A-Z", value: "name" },
              ]}
            />
          </div>

          <button
            type="button"
            onClick={clearFilters}
            disabled={activeFiltersCount === 0}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-blue-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 lg:ml-auto"
          >
            Wyczyść filtry
          </button>
        </div>

        {activeFiltersCount > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Aktywne:
            </span>

            {search.trim() && (
              <FilterChip
                label={`Szukaj: ${search.trim()}`}
                onRemove={() => setSearch("")}
              />
            )}

            {typeFilter !== "all" && (
              <FilterChip
                label={getTripTypeLabel(typeFilter)}
                onRemove={() => setTypeFilter("all")}
              />
            )}

            {ownershipFilter !== "all" && (
              <FilterChip
                label={
                  ownershipFilter === "owned"
                    ? "Moje wyprawy"
                    : "Współdzielone"
                }
                onRemove={() => setOwnershipFilter("all")}
              />
            )}

            {sort !== "nearest" && (
              <FilterChip
                label={`Sortowanie: ${getSortLabel(sort)}`}
                onRemove={() => setSort("nearest")}
              />
            )}
          </div>
        )}
      </section>

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-500">
          Wyniki: <span className="text-slate-950">{filteredTrips.length}</span>
        </p>

        <p className="hidden text-xs font-semibold text-slate-400 sm:block">
          {activeTab === "all"
            ? "Wszystkie wyprawy"
            : tabs.find((tab) => tab.value === activeTab)?.label}
        </p>
      </div>

      {filteredTrips.length > 0 ? (
        viewMode === "grid" ? (
          <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onEdit={handleStartEdit}
                onDelete={handleDeleteTrip}
                onChecklist={openChecklist}
              />
            ))}
          </section>
        ) : (
          <section className="space-y-4">
            {filteredTrips.map((trip) => (
              <TripListItem
                key={trip.id}
                trip={trip}
                onEdit={handleStartEdit}
                onDelete={handleDeleteTrip}
                onChecklist={openChecklist}
              />
            ))}
          </section>
        )
      ) : (
        <EmptyTripsState
          hasFilters={activeFiltersCount > 0 || activeTab !== "all"}
          onCreate={handleOpenCreateForm}
          onClear={() => {
            setActiveTab("all");
            clearFilters();
          }}
        />
      )}

      <button
        type="button"
        onClick={handleOpenCreateForm}
        className="fixed bottom-24 right-4 z-[900] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-3xl font-light text-white shadow-xl transition hover:bg-blue-700 md:hidden"
        aria-label="Zaplanuj wyprawę"
      >
        +
      </button>
    </div>
  );
}

function NearestTripCard({
  trip,
  onEdit,
  onChecklist,
}: {
  trip: FishingTrip | null;
  onEdit: (trip: FishingTrip) => void;
  onChecklist: (trip: FishingTrip) => void;
}) {
  if (!trip) {
    return (
      <section className="rounded-3xl border border-dashed border-blue-200 bg-gradient-to-br from-emerald-50 via-blue-50 to-sky-100 p-6 shadow-sm">
        <p className="text-xs font-mediuem uppercase tracking-[0.16em] text-blue-600">
          Najbliższa wyprawa
        </p>

        <h2 className="mt-3 text-2xl font-medium text-slate-950">
          Nie masz zaplanowanej wyprawy
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Zaplanuj termin, wybierz łowisko i przygotuj checklistę przed
          kolejnym wyjazdem.
        </p>
      </section>
    );
  }

  const phase = getTripPhase(trip, new Date());

  return (
    <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-emerald-50 via-blue-50 to-sky-100 shadow-sm">
      <div className="grid h-full gap-0 lg:grid-cols-[220px_1fr]">
        <div className="relative min-h-52 bg-slate-200">
          {trip.lakeImage ? (
            <img
              src={trip.lakeImage}
              alt={trip.lakeName || trip.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-52 items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-100 text-5xl">
              🎣
            </div>
          )}

          <div className="absolute left-4 top-4">
            <PhaseBadge phase={phase} />
          </div>
        </div>

        <div className="flex flex-col p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-600">
                Najbliższa wyprawa
              </p>

              <h2 className="mt-2 break-words text-2xl font-extrabold text-slate-950 sm:text-3xl">
                {trip.title}
              </h2>

              <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
                {formatTripDateRange(trip)}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {trip.lakeName || trip.lake?.name || "Bez wybranego łowiska"}
              </p>
            </div>

            <OwnershipBadge trip={trip} />
          </div>

          <div className="mt-5">
            <ProgressHeader
              label="Przygotowanie wyprawy"
              value={trip.preparationProgress}
            />

            <ProgressBar value={trip.preparationProgress} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniMetric
              label="Checklista"
              value={`${trip.packedChecklistItemsCount}/${trip.checklistItemsCount}`}
            />

            <MiniMetric
              label="Sprzęt"
              value={`${trip.packedRequiredGearItemsCount}/${trip.requiredGearItemsCount}`}
            />

            <MiniMetric
              label="Uczestnicy"
              value={String(trip.participantsCount)}
            />

            <MiniMetric label="Połowy" value={String(trip._count.catches)} />
          </div>

          {trip.preparationWarnings.length > 0 && (
            <div className="mt-4 rounded-2xl bg-white/70 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600">Do zrobienia przed wyjazdem</p>
              <div className="mt-2 space-y-1">
                {trip.preparationWarnings.slice(0, 3).map((warning) => (
                  <p key={warning} className="text-xs font-bold text-amber-700 flex gap-2 items-center"> <AlertIcon className="h-4 w-4 text-amber-700"/> {warning}</p>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:flex-wrap">
            <Link
              href={`/wyprawy/${trip.id}`}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
            >
              Otwórz wyprawę
            </Link>

            {(trip.checklistId || trip.canEdit) && (
              <button
                type="button"
                onClick={() => void onChecklist(trip)}
                className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-blue-700 transition hover:bg-blue-100"
              >
                <CheckListIcon className="h-4 w-4 transition-colors"/>
                Checklista
              </button>
            )}

            {trip.canEdit && (
              <button
                type="button"
                onClick={() => onEdit(trip)}
                className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-white/70 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-white"
              >
                <PencilIcon className="h-4 w-4 transition-colors"/>
                Edytuj
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TripCalendar({
  month,
  days,
  tripsByDate,
  selectedDate,
  selectedTrips,
  onMonthChange,
  onDateSelect,
}: {
  month: Date;
  days: Date[];
  tripsByDate: Map<string, FishingTrip[]>;
  selectedDate: string;
  selectedTrips: FishingTrip[];
  onMonthChange: (date: Date) => void;
  onDateSelect: (dateKey: string) => void;
}) {
  const monthLabel = new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    year: "numeric",
  }).format(month);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            Kalendarz wypraw
          </p>

          <h2 className="mt-1 capitalize text-xl font-black text-slate-950">
            {monthLabel}
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              onMonthChange(
                new Date(month.getFullYear(), month.getMonth() - 1, 1)
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-600 transition hover:bg-slate-200"
            aria-label="Poprzedni miesiąc"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() =>
              onMonthChange(
                new Date(month.getFullYear(), month.getMonth() + 1, 1)
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-600 transition hover:bg-slate-200"
            aria-label="Następny miesiąc"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center">
        {["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map((day) => (
          <span
            key={day}
            className="py-2 text-[11px] font-black uppercase text-slate-400"
          >
            {day}
          </span>
        ))}

        {days.map((date) => {
          const dateKey = toDateKey(date);
          const dateTrips = tripsByDate.get(dateKey) ?? [];
          const belongsToMonth = date.getMonth() === month.getMonth();
          const isSelected = selectedDate === dateKey;
          const isToday = dateKey === toDateKey(new Date());

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onDateSelect(dateKey)}
              className={`relative flex min-h-11 flex-col items-center justify-center rounded-xl text-sm font-bold transition ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : isToday
                    ? "bg-blue-50 text-blue-700"
                    : belongsToMonth
                      ? "text-slate-700 hover:bg-slate-100"
                      : "text-slate-300"
              }`}
            >
              {date.getDate()}

              {dateTrips.length > 0 && (
                <span
                  className={`mt-1 h-1.5 w-1.5 rounded-full ${
                    isSelected ? "bg-white" : "bg-blue-600"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
          Wybrany dzień
        </p>

        {selectedTrips.length > 0 ? (
          <div className="mt-3 space-y-2">
            {selectedTrips.slice(0, 3).map((trip) => (
              <Link
                key={trip.id}
                href={`/wyprawy/${trip.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2.5 transition hover:bg-slate-100"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-800">
                    {trip.title}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {trip.lakeName || "Bez łowiska"}
                  </p>
                </div>

                <span className="shrink-0 text-xs font-black text-blue-600">
                  Otwórz
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Brak wypraw w wybranym dniu.
          </p>
        )}
      </div>
    </section>
  );
}

function QuickActions({
  nearestTrip,
  onChecklist,
}: {
  nearestTrip: FishingTrip | null;
  onChecklist: (trip: FishingTrip) => void;
}) {
  return (
    <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <QuickAction
        href="/lowiska"
        title="Znajdź łowisko"
        description="Wybierz miejsce kolejnej wyprawy"
        icon={<MapIcon className="h-5 w-5 text-blue-600 transition-colors" />}
      />

      <button
        type="button"
        onClick={() => nearestTrip && void onChecklist(nearestTrip)}
        disabled={!nearestTrip || (!nearestTrip.checklistId && !nearestTrip.canEdit)}
        className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
          <CheckListIcon className="h-5 w-5 text-blue-600 transition-colors"/>
        </div>

        <div className="min-w-0">
          <p className="font-black text-slate-950">Checklista wyprawy</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {nearestTrip?.checklistId
              ? "Otwórz checklistę bez zmiany strony"
              : nearestTrip?.canEdit
                ? "Utwórz checklistę dla najbliższej wyprawy"
                : "Najbliższa wyprawa nie ma checklisty"}
          </p>
        </div>
      </button>

      <QuickAction
        href="/ekwipunek"
        title="Ekwipunek"
        description="Sprawdź swój sprzęt"
        icon={<HookIcon className="h-5 w-5 text-blue-600 transition-colors" />}
      />

      <QuickAction
        href="/polowy"
        title="Dodaj połów"
        description="Uzupełnij dziennik wyprawy"
        icon={<FishIcon className="h-5 w-5 text-blue-600 transition-colors" />}
      />
    </section>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="font-black text-slate-950">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </Link>
  );
}

function TripCard({
  trip,
  onEdit,
  onDelete,
  onChecklist,
}: {
  trip: FishingTrip;
  onEdit: (trip: FishingTrip) => void;
  onDelete: (trip: FishingTrip) => void;
  onChecklist: (trip: FishingTrip) => void;
}) {
  const phase = getTripPhase(trip, new Date());

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-44 bg-slate-100">
        {trip.lakeImage ? (
          <img
            src={trip.lakeImage}
            alt={trip.lakeName || trip.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 text-5xl">
            🎣
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <PhaseBadge phase={phase} />
          <OwnershipBadge trip={trip} />
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-white/75">
            {getTripTypeLabel(trip.tripType)}
          </p>

          <h2 className="mt-1 line-clamp-2 text-xl font-black text-white">
            {trip.title}
          </h2>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-semibold leading-6 text-slate-600">
          {formatTripDateRange(trip)}
        </p>

        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
          {trip.lakeName || trip.lake?.name || "Bez wybranego łowiska"}
        </p>

        <div className="mt-5">
          <ProgressHeader
            label="Przygotowanie"
            value={trip.preparationProgress}
          />
          <ProgressBar value={trip.preparationProgress} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniMetric
            label="Lista"
            value={`${trip.packedChecklistItemsCount}/${trip.checklistItemsCount}`}
          />

          <MiniMetric
            label="Osoby"
            value={String(trip.participantsCount)}
          />

          <MiniMetric label="Połowy" value={String(trip._count.catches)} />
        </div>

        {trip.pendingMembersCount > 0 && trip.isOwner && (
          <p className="mt-4 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">
            {trip.pendingMembersCount} zaproszeń oczekuje na odpowiedź
          </p>
        )}

       <div className="mt-auto pt-5">
          <Link
            href={`/wyprawy/${trip.id}`}
            className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
          >
            Otwórz centrum wyprawy
          </Link>

          <div className="mt-2 flex gap-2">
  {(trip.checklistId || trip.canEdit) && (
    <button
      type="button"
      onClick={() => void onChecklist(trip)}
      className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
    >
      <CheckListIcon className="h-4 w-4 shrink-0" />
      <span>Checklista</span>
    </button>
  )}

  {trip.canEdit && (
    <button
      type="button"
      onClick={() => onEdit(trip)}
      className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
    >
      <PencilIcon className="h-4 w-4 shrink-0" />
      <span>Edytuj</span>
    </button>
  )}

  {trip.canDelete ? (
    <div className="group relative shrink-0">
      <button
        type="button"
        onClick={() => onDelete(trip)}
        aria-label="Usuń wyprawę"
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
      >
        <TrashIcon className="h-5 w-5" />
      </button>

      <div
        className="
          pointer-events-none absolute bottom-full left-1/2 z-20 mb-2
          -translate-x-1/2 whitespace-nowrap
          rounded-lg bg-slate-950 px-2.5 py-1.5
          text-[11px] font-bold text-white
          opacity-0 shadow-lg transition
          group-hover:opacity-100
        "
      >
        Usuń

        <span
          className="
            absolute left-1/2 top-full
            -translate-x-1/2
            border-4 border-transparent
            border-t-slate-950
          "
        />
      </div>
    </div>
  ) : (
    <Link
      href={`/wyprawy/${trip.id}?tab=uczestnicy`}
      className="flex flex-1 items-center justify-center rounded-xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-100"
    >
      Uczestnicy
    </Link>
  )}
</div>
        </div>
      </div>
    </article>
  );
}

function TripListItem({
  trip,
  onEdit,
  onDelete,
  onChecklist,
}: {
  trip: FishingTrip;
  onEdit: (trip: FishingTrip) => void;
  onDelete: (trip: FishingTrip) => void;
  onChecklist: (trip: FishingTrip) => void;
}) {
  const phase = getTripPhase(trip, new Date());

  return (
    <article className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md lg:grid-cols-[240px_1fr_auto]">
      <div className="relative min-h-52 bg-slate-100">
        {trip.lakeImage ? (
          <img
            src={trip.lakeImage}
            alt={trip.lakeName || trip.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full min-h-52 items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 text-5xl">
            🎣
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <PhaseBadge phase={phase} />
          <OwnershipBadge trip={trip} />
        </div>
      </div>

      <div className="min-w-0 p-5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
          {getTripTypeLabel(trip.tripType)}
        </p>

        <h2 className="mt-2 break-words text-2xl font-black text-slate-950">
          {trip.title}
        </h2>

        <p className="mt-2 text-sm font-semibold text-slate-600">
          {formatTripDateRange(trip)}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {trip.lakeName || trip.lake?.name || "Bez wybranego łowiska"}
        </p>

        {trip.note && (
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
            {trip.note}
          </p>
        )}

        <div className="mt-5 max-w-xl">
          <ProgressHeader
            label="Przygotowanie"
            value={trip.preparationProgress}
          />
          <ProgressBar value={trip.preparationProgress} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <SmallInfo label={`Checklista ${trip.checklistProgress}%`} />
          <SmallInfo label={`Sprzęt ${trip.requiredGearProgress}%`} />
          <SmallInfo label={`${trip.participantsCount} uczestników`} />
          <SmallInfo label={`${trip._count.notes} notatek`} />
          <SmallInfo label={`${trip._count.costs} kosztów`} />
          <SmallInfo label={`${trip._count.catches} połowów`} />
        </div>
      </div>

      <div className="flex min-w-48 flex-col gap-3 border-t border-slate-100 p-5 lg:border-l lg:border-t-0">
        <Link
          href={`/wyprawy/${trip.id}`}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
        >
          Otwórz
        </Link>

        {(trip.checklistId || trip.canEdit) && (
          <button
            type="button"
            onClick={() => void onChecklist(trip)}
            className="rounded-2xl bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
          >
            Checklista
          </button>
        )}

        {trip.canEdit && (
          <button
            type="button"
            onClick={() => onEdit(trip)}
            className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
          >
            Edytuj
          </button>
        )}

        {trip.canDelete && (
          <button
            type="button"
            onClick={() => onDelete(trip)}
            className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100"
          >
            Usuń
          </button>
        )}

        <Link
          href={`/wyprawy/${trip.id}?tab=uczestnicy`}
          className="rounded-2xl bg-blue-50 px-5 py-3 text-center text-sm font-black text-blue-700 transition hover:bg-blue-100"
        >
          Uczestnicy
        </Link>
      </div>
    </article>
  );
}

function ChecklistModal({
  trip,
  isSaving,
  onClose,
  onToggle,
  onAddItem,
  onDeleteItem,
}: {
  trip: FishingTrip;
  isSaving: boolean;
  onClose: () => void;
  onToggle: (trip: FishingTrip, itemId: string, isPacked: boolean) => void;
  onAddItem: (
    trip: FishingTrip,
    item: {
      name: string;
      category: string;
      quantity: number;
      unit: string;
      isImportant: boolean;
      note: string;
    }
  ) => Promise<boolean>;
  onDeleteItem: (trip: FishingTrip, itemId: string) => void;
}) {
  const checklist = trip.checklist;
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Sprzęt");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("szt.");
  const [isImportant, setIsImportant] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSaving, onClose]);

  if (!checklist) {
    return null;
  }

  const items = checklist.items;
  const packedCount = items.filter((item) => item.isPacked).length;
  const progress = calculatePercent(packedCount, items.length);
  const importantItems = items.filter((item) => item.isImportant);
  const packedImportantCount = importantItems.filter(
    (item) => item.isPacked
  ).length;

  const groupedItems = items.reduce<Record<string, TripChecklistItemDto[]>>(
    (groups, item) => {
      const key = item.category?.trim() || "Inne";
      groups[key] = groups[key] ? [...groups[key], item] : [item];
      return groups;
    },
    {}
  );

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = name.trim();
    const parsedQuantity = Number(quantity);

    if (!cleanName || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return;
    }

    const saved = await onAddItem(trip, {
      name: cleanName,
      category: category.trim() || "Inne",
      quantity: parsedQuantity,
      unit: unit.trim(),
      isImportant,
      note: note.trim(),
    });

    if (saved) {
      setName("");
      setQuantity("1");
      setUnit("szt.");
      setIsImportant(false);
      setNote("");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-[2px] sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
              Checklista wyprawy
            </p>

            <h2 className="mt-1 break-words text-xl font-black text-slate-950 sm:text-2xl">
              {trip.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {packedCount}/{items.length} spakowanych • {progress}% gotowe
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
            aria-label="Zamknij checklistę"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <section className="rounded-3xl bg-gradient-to-br from-emerald-50 via-blue-50 to-sky-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-950">
                  Postęp przygotowania checklisty
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Ważne elementy: {packedImportantCount}/{importantItems.length}
                </p>
              </div>

              <span className="text-2xl font-black text-blue-700">
                {progress}%
              </span>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>

          {trip.canEdit && (
            <form
              onSubmit={handleAdd}
              className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-black text-slate-950">
                    Dodaj element
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Nowa pozycja od razu pojawi się na wspólnej checkliście.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1.4fr)_180px_100px_110px]">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="np. Mata karpiowa"
                  maxLength={120}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500"
                />

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-blue-500"
                >
                  {["Sprzęt", "Przynęty", "Odzież", "Jedzenie", "Dokumenty", "Bezpieczeństwo", "Inne"].map(
                    (item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    )
                  )}
                </select>

                <input
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  type="number"
                  min="1"
                  max="999"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500"
                  aria-label="Ilość"
                />

                <input
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                  placeholder="szt."
                  maxLength={20}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500"
                  aria-label="Jednostka"
                />
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Opcjonalna notatka..."
                  maxLength={500}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500"
                />

                <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-white px-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                  <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(event) => setIsImportant(event.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  Ważne
                </label>

                <button
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Zapisywanie..." : "+ Dodaj"}
                </button>
              </div>
            </form>
          )}

          {items.length > 0 ? (
            <div className="mt-5 space-y-5">
              {Object.entries(groupedItems).map(([group, groupItems]) => (
                <section key={group}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
                      {group}
                    </h3>
                    <span className="text-xs font-bold text-slate-400">
                      {groupItems.filter((item) => item.isPacked).length}/
                      {groupItems.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {groupItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${
                          item.isPacked
                            ? "border-emerald-100 bg-emerald-50"
                            : item.isImportant
                              ? "border-amber-100 bg-amber-50"
                              : "border-slate-200 bg-white"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            trip.canEdit &&
                            onToggle(trip, item.id, !item.isPacked)
                          }
                          disabled={!trip.canEdit || isSaving}
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-black transition ${
                            item.isPacked
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          } disabled:cursor-default`}
                          aria-label={
                            item.isPacked
                              ? `Oznacz ${item.name} jako niespakowane`
                              : `Oznacz ${item.name} jako spakowane`
                          }
                        >
                          {item.isPacked ? "✓" : ""}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p
                              className={`break-words font-black ${
                                item.isPacked
                                  ? "text-emerald-700 line-through"
                                  : "text-slate-900"
                              }`}
                            >
                              {item.name}
                            </p>

                            {item.isImportant && (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-700">
                                Ważne
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {item.quantity} {item.unit || "szt."}
                          </p>

                          {item.note && (
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {item.note}
                            </p>
                          )}
                        </div>

                        {trip.canEdit && (
                          <button
                            type="button"
                            onClick={() => {
                              const confirmed = window.confirm(
                                `Usunąć „${item.name}” z checklisty?`
                              );

                              if (confirmed) {
                                onDeleteItem(trip, item.id);
                              }
                            }}
                            disabled={isSaving}
                            className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            Usuń
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl bg-slate-50 p-8 text-center">
              <p className="font-black text-slate-950">Checklista jest pusta</p>
              <p className="mt-2 text-sm text-slate-500">
                Dodaj pierwszą rzecz do przygotowania przed wyprawą.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TripForm({
  form,
  formStep,
  editingTripId,
  lakes,
  isLoading,
  initialLakeExists,
  onSubmit,
  onCancel,
  onNext,
  onBack,
  onFieldChange,
  isMobile = false,
}: {
  form: TripFormState;
  formStep: number;
  editingTripId: string | null;
  lakes: LakeOption[];
  isLoading: boolean;
  initialLakeExists: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  onNext: () => void;
  onBack: () => void;
  onFieldChange: <K extends keyof TripFormState>(
    field: K,
    value: TripFormState[K]
  ) => void;
  isMobile?: boolean;
}) {
  return (
    <div>
      {!isMobile && (
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-950">
            {editingTripId ? "Edytuj wyprawę" : "Zaplanuj wyprawę"}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Uzupełnij podstawowe informacje, miejsce, termin i przygotowanie.
            Uczestników dodasz później w szczegółach wyprawy.
          </p>
        </div>
      )}

      <FormSteps activeStep={formStep} />

      {initialLakeExists && !editingTripId && (
        <p className="mb-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
          Formularz został uzupełniony wybranym wcześniej łowiskiem.
        </p>
      )}

      {formStep === 1 && (
        <div className="space-y-6">
          <FormGroup
            title="Podstawowe informacje"
            description="Nazwa, typ oraz liczba osób planowanych na wyprawę."
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <Input
                label="Tytuł wyprawy"
                value={form.title}
                onChange={(value) => onFieldChange("title", value)}
                placeholder="np. Weekend na Carpland"
                required
              />

              <Select
                label="Typ wyprawy"
                value={form.tripType}
                onChange={(value) => onFieldChange("tripType", value)}
                options={tripTypes}
              />

              <Input
                label="Planowana liczba osób"
                value={form.peopleCount}
                onChange={(value) => onFieldChange("peopleCount", value)}
                type="number"
                min="1"
                max="100"
                required
              />

            </div>
          </FormGroup>
        </div>
      )}

      {formStep === 2 && (
        <div className="space-y-6">
          <FormGroup
            title="Łowisko i termin"
            description="Wybierz miejsce oraz zakres czasu wyprawy."
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <LakeSearchSelect
                  lakes={lakes}
                  value={form.lakeId}
                  onChange={(value) => onFieldChange("lakeId", value)}
                />
              </div>

              <Input
                label="Rozpoczęcie"
                value={form.startsAt}
                onChange={(value) => onFieldChange("startsAt", value)}
                type="datetime-local"
                required
              />

              <Input
                label="Zakończenie"
                value={form.endsAt}
                onChange={(value) => onFieldChange("endsAt", value)}
                type="datetime-local"
              />
            </div>
          </FormGroup>
        </div>
      )}

      {formStep === 3 && (
        <div className="space-y-6">
          <FormGroup
            title="Przygotowanie"
            description="Utwórz checklistę i zapisz dodatkowe informacje."
          >
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <input
                type="checkbox"
                checked={form.createChecklist}
                onChange={(event) =>
                  onFieldChange("createChecklist", event.target.checked)
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
              />

              <div>
                <span className="text-sm font-black text-blue-950">
                  Utwórz checklistę wyprawy
                </span>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Po zapisaniu wyprawy będziesz mógł dodać rzeczy, sprzęt i
                  oznaczać je jako spakowane.
                </p>
              </div>
            </label>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-black text-slate-700">
                Notatka organizacyjna
              </span>

              <textarea
                value={form.note}
                onChange={(event) => onFieldChange("note", event.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="np. Zabierz pellet 2 mm, podbierak, matę i ciepłe ubranie."
                className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

              <p className="mt-2 text-xs font-semibold text-slate-400">
                {form.note.length}/2000 znaków
              </p>
            </label>
          </FormGroup>

          <FormSummary form={form} lakes={lakes} />
        </div>
      )}

      <div
        className={`mt-7 flex gap-3 ${
          isMobile
            ? "sticky bottom-0 -mx-5 border-t border-slate-100 bg-white px-5 py-4"
            : "justify-between"
        }`}
      >
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Anuluj
          </button>

          {formStep > 1 && (
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
            >
              Wstecz
            </button>
          )}
        </div>

        {formStep < 3 ? (
          <button
            type="button"
            onClick={onNext}
            disabled={isLoading}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            Dalej
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isLoading
              ? "Zapisywanie..."
              : editingTripId
                ? "Zapisz zmiany"
                : "Zaplanuj wyprawę"}
          </button>
        )}
      </div>
    </div>
  );
}

function FormSteps({ activeStep }: { activeStep: number }) {
  const steps = [
    { number: 1, label: "Podstawowe" },
    { number: 2, label: "Miejsce i termin" },
    { number: 3, label: "Przygotowanie" },
  ];

  return (
    <div className="mb-6 grid grid-cols-3 gap-2">
      {steps.map((step) => (
        <div
          key={step.number}
          className={`rounded-2xl px-3 py-3 text-center ${
            activeStep === step.number
              ? "bg-blue-600 text-white"
              : activeStep > step.number
                ? "bg-blue-50 text-blue-700"
                : "bg-slate-100 text-slate-400"
          }`}
        >
          <p className="text-xs font-black">Krok {step.number}</p>
          <p className="mt-1 hidden text-xs font-bold sm:block">{step.label}</p>
        </div>
      ))}
    </div>
  );
}

function FormSummary({
  form,
  lakes,
}: {
  form: TripFormState;
  lakes: LakeOption[];
}) {
  const lake = lakes.find((item) => item.id === form.lakeId);

  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <h3 className="font-black text-slate-950">Podsumowanie</h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SummaryRow label="Nazwa" value={form.title || "Nie podano"} />
        <SummaryRow
          label="Typ"
          value={getTripTypeLabel(form.tripType)}
        />
        <SummaryRow
          label="Łowisko"
          value={lake?.name || "Bez łowiska"}
        />
        <SummaryRow
          label="Uczestnicy"
          value={form.peopleCount || "1"}
        />
        <SummaryRow
          label="Rozpoczęcie"
          value={form.startsAt ? formatDateTime(form.startsAt) : "Nie podano"}
        />
        <SummaryRow
          label="Zakończenie"
          value={form.endsAt ? formatDateTime(form.endsAt) : "Nie podano"}
        />
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function FormGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function StatCard({
  label,
  value,
  description,
  emphasis = false,
}: {
  label: string;
  value: string;
  description: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`min-w-[190px] rounded-3xl border p-4 shadow-sm md:min-w-0 md:p-5 ${
        emphasis
          ? "border-amber-100 bg-amber-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p
        className={`text-sm font-bold ${
          emphasis ? "text-amber-700" : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>

      <p
        className={`mt-1 text-xs font-semibold ${
          emphasis ? "text-amber-600" : "text-slate-400"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function ProgressHeader({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>

      <span className="text-sm font-black text-blue-700">{value}%</span>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-white/80 ring-1 ring-slate-200">
      <div
        className="h-full rounded-full bg-blue-600 transition-all"
        style={{
          width: `${safeValue}%`,
        }}
      />
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}

function SmallInfo({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      {label}
    </span>
  );
}

function OwnershipBadge({ trip }: { trip: FishingTrip }) {
  return (
    <span
      className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-black ${
        trip.isOwner
          ? "bg-white text-slate-700 shadow-sm"
          : "bg-violet-50 text-violet-700"
      }`}
    >
      {trip.isOwner ? "Twoja wyprawa" : "Współdzielona"}
    </span>
  );
}

function PhaseBadge({
  phase,
}: {
  phase: "upcoming" | "active" | "finished" | "cancelled";
}) {
  const styles = {
    upcoming: "bg-blue-50 text-blue-700",
    active: "bg-amber-50 text-amber-700",
    finished: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-600",
  };

  const labels = {
    upcoming: "Nadchodząca",
    active: "W trakcie",
    finished: "Zakończona",
    cancelled: "Anulowana",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${styles[phase]}`}>
      {labels[phase]}
    </span>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-blue-50 py-1 pl-3 pr-1 text-xs font-black text-blue-700">
      <span className="truncate">{label}</span>

      <button
        type="button"
        onClick={onRemove}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 transition hover:bg-blue-100"
        aria-label={`Usuń filtr: ${label}`}
      >
        ×
      </button>
    </span>
  );
}

function EmptyTripsState({
  hasFilters,
  onCreate,
  onClear,
}: {
  hasFilters: boolean;
  onCreate: () => void;
  onClear: () => void;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
        🗓️
      </div>

      <p className="mt-5 text-xl font-black text-slate-950">
        {hasFilters
          ? "Brak wypraw spełniających kryteria"
          : "Nie masz jeszcze żadnej wyprawy"}
      </p>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Zmień zakładkę lub wyczyść filtry, aby zobaczyć pozostałe wyprawy."
          : "Zaplanuj termin, wybierz łowisko i rozpocznij przygotowania do kolejnego wyjazdu."}
      </p>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCreate}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
        >
          + Zaplanuj wyprawę
        </button>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Pokaż wszystkie
          </button>
        )}
      </div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        min={min}
        max={max}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

function LakeSearchSelect({
  lakes,
  value,
  onChange,
}: {
  lakes: LakeOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedLake = lakes.find((lake) => lake.id === value) ?? null;

  const [query, setQuery] = useState(() =>
    selectedLake ? formatLakeOption(selectedLake) : ""
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const currentLake = lakes.find((lake) => lake.id === value) ?? null;

    setQuery(currentLake ? formatLakeOption(currentLake) : "");
  }, [value, lakes]);

  const filteredLakes = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);

    if (!normalizedQuery) {
      return lakes.slice(0, 12);
    }

    return lakes
      .filter((lake) => {
        const searchableValue = normalizeSearchText(
          `${lake.name} ${lake.city} ${lake.voivodeship}`
        );

        return searchableValue.includes(normalizedQuery);
      })
      .slice(0, 12);
  }, [lakes, query]);

  function handleInputChange(nextValue: string) {
    setQuery(nextValue);
    setIsOpen(true);

    if (value) {
      onChange("");
    }
  }

  function handleSelectLake(lake: LakeOption) {
    onChange(lake.id);
    setQuery(formatLakeOption(lake));
    setIsOpen(false);
  }

  function handleClear() {
    onChange("");
    setQuery("");
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-black text-slate-700">
        Łowisko
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          ⌕
        </span>

        <input
          type="text"
          value={query}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 150);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder="Wpisz nazwę łowiska, miasto lub województwo..."
          autoComplete="off"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white py-0 pl-11 pr-12 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />

        {(query || value) && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClear}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-lg font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Wyczyść wybrane łowisko"
          >
            ×
          </button>
        )}
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        Zacznij wpisywać nazwę, np. „Carpland”, albo miejscowość. Pokazujemy
        maksymalnie 12 najlepiej pasujących wyników.
      </p>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[82px] z-[1400] max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClear}
            className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition ${
              !value && !query
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div>
              <p className="text-sm font-black">Bez przypisanego łowiska</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Wyprawę możesz zaplanować bez wyboru konkretnego miejsca.
              </p>
            </div>
          </button>

          <div className="my-2 border-t border-slate-100" />

          {filteredLakes.length > 0 ? (
            <div className="space-y-1">
              {filteredLakes.map((lake) => {
                const isSelected = lake.id === value;

                return (
                  <button
                    key={lake.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelectLake(lake)}
                    className={`flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left transition ${
                      isSelected
                        ? "bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm font-black ${
                          isSelected ? "text-blue-700" : "text-slate-900"
                        }`}
                      >
                        {lake.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {lake.city}, woj. {lake.voivodeship}
                      </p>
                    </div>

                    {isSelected && (
                      <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-black text-blue-700">
                        Wybrane
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-black text-slate-700">
                Nie znaleziono łowiska
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Spróbuj wpisać krótszą nazwę albo nazwę miejscowości.
              </p>
            </div>
          )}
        </div>
      )}

      {selectedLake && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-blue-950">
              {selectedLake.name}
            </p>

            <p className="mt-0.5 truncate text-xs text-blue-700">
              {selectedLake.city}, woj. {selectedLake.voivodeship}
            </p>
          </div>

          <span className="shrink-0 text-xs font-black text-blue-600">
            Wybrane
          </span>
        </div>
      )}
    </div>
  );
}

function formatLakeOption(lake: LakeOption) {
  return `${lake.name} — ${lake.city}, woj. ${lake.voivodeship}`;
}

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function ViewModeSwitcher({
  viewMode,
  onChange,
  compact = false,
  className = "",
}: {
  viewMode: ViewMode;
  onChange: (value: ViewMode) => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1 ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`rounded-xl font-black transition ${
          compact ? "px-3 py-2.5 text-xs" : "px-3 py-2 text-sm"
        } ${
          viewMode === "grid"
            ? "bg-blue-600 text-white"
            : "text-slate-500 hover:bg-slate-50"
        }`}
      >
        Kafelki
      </button>

      <button
        type="button"
        onClick={() => onChange("list")}
        className={`rounded-xl font-black transition ${
          compact ? "px-3 py-2.5 text-xs" : "px-3 py-2 text-sm"
        } ${
          viewMode === "list"
            ? "bg-blue-600 text-white"
            : "text-slate-500 hover:bg-slate-50"
        }`}
      >
        Lista
      </button>
    </div>
  );
}

function calculatePercent(completed: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

function getTripPhase(
  trip: FishingTrip,
  now: Date
): "upcoming" | "active" | "finished" | "cancelled" {
  if (trip.status === "cancelled") {
    return "cancelled";
  }

  if (trip.status === "finished") {
    return "finished";
  }

  const startsAt = new Date(trip.startsAt);
  const endsAt = trip.endsAt ? new Date(trip.endsAt) : null;

  if (startsAt > now) {
    return "upcoming";
  }

  if (!endsAt || endsAt >= now) {
    return "active";
  }

  return "finished";
}

function getTripTypeLabel(value: string) {
  return tripTypes.find((item) => item.value === value)?.label || value;
}

function getSortLabel(value: TripSort) {
  if (value === "farthest") return "Najdalsze";
  if (value === "newest") return "Ostatnio dodane";
  if (value === "name") return "Nazwa A-Z";
  return "Najbliższe";
}

function formatDateTime(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Niepoprawna data";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function formatTripDateRange(trip: FishingTrip) {
  const startsAt = new Date(trip.startsAt);

  if (Number.isNaN(startsAt.getTime())) {
    return "Niepoprawny termin";
  }

  const startText = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(startsAt);

  if (!trip.endsAt) {
    return startText;
  }

  const endsAt = new Date(trip.endsAt);

  if (Number.isNaN(endsAt.getTime())) {
    return startText;
  }

  const endText = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(endsAt);

  return `${startText} – ${endText}`;
}

function toDateTimeLocalValue(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const hours = String(parsedDate.getHours()).padStart(2, "0");
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayIndex = (firstDay.getDay() + 6) % 7;
  const calendarStart = new Date(firstDay);

  calendarStart.setDate(firstDay.getDate() - mondayIndex);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return date;
  });
}

function getTripDateKeys(trip: FishingTrip) {
  const startsAt = new Date(trip.startsAt);

  if (Number.isNaN(startsAt.getTime())) {
    return [];
  }

  const endsAt = trip.endsAt ? new Date(trip.endsAt) : startsAt;

  if (Number.isNaN(endsAt.getTime())) {
    return [toDateKey(startsAt)];
  }

  const keys: string[] = [];
  const cursor = new Date(
    startsAt.getFullYear(),
    startsAt.getMonth(),
    startsAt.getDate()
  );

  const end = new Date(
    endsAt.getFullYear(),
    endsAt.getMonth(),
    endsAt.getDate()
  );

  let safetyCounter = 0;

  while (cursor <= end && safetyCounter < 366) {
    keys.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
    safetyCounter += 1;
  }

  return keys;
}
