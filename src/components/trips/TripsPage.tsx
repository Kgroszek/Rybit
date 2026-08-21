"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { INITIAL_TRIP_FORM } from "@/components/trips/constants";
import { TripInvitations } from "@/components/trips/TripInvitations";
import { TripFormDialog } from "@/components/trips/forms/TripFormDialog";
import { TripCard } from "@/components/trips/overview/TripCard";
import { TripsCalendar } from "@/components/trips/overview/TripsCalendar";
import { TripsEmptyState } from "@/components/trips/overview/TripsEmptyState";
import { TripsHeader } from "@/components/trips/overview/TripsHeader";
import { TripsPriorityCard } from "@/components/trips/overview/TripsPriorityCard";
import { TripsStats } from "@/components/trips/overview/TripsStats";
import { TripsToolbar } from "@/components/trips/overview/TripsToolbar";
import type {
  FishingTrip,
  TripCounts,
  TripFormState,
  TripSort,
  TripTab,
  TripsPageProps,
  TripsViewMode,
} from "@/components/trips/types";
import {
  getRemainingPreparationItems,
  getTripPhase,
  toDateTimeLocalValue,
} from "@/components/trips/utils";
import { useToast } from "@/components/ui/ToastProvider";

type ApiResponse = {
  message?: string;
};

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

  const initialLakeExists = lakes.some(
    (lake) => lake.id === initialLakeId
  );

  const initialForm = useMemo<TripFormState>(
    () => ({
      ...INITIAL_TRIP_FORM,
      lakeId: initialLakeExists
        ? initialLakeId || ""
        : "",
      title:
        initialLakeExists && initialLakeName
          ? `Wyprawa na ${initialLakeName}`
          : "",
    }),
    [
      initialLakeExists,
      initialLakeId,
      initialLakeName,
    ]
  );

  const [trips, setTrips] =
    useState<FishingTrip[]>(initialTrips);
  const [form, setForm] =
    useState<TripFormState>(initialForm);
  const [isFormOpen, setIsFormOpen] =
    useState(initialLakeExists);
  const [editingTripId, setEditingTripId] =
    useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TripTab>(
    () =>
      initialTrips.some(
        (trip) => getTripPhase(trip) === "active"
      )
        ? "active"
        : "upcoming"
  );
  const [typeFilter, setTypeFilter] = useState("all");
  const [ownershipFilter, setOwnershipFilter] =
    useState("all");
  const [sort, setSort] =
    useState<TripSort>("nearest");
  const [viewMode, setViewMode] =
    useState<TripsViewMode>("trips");
  const [areFiltersOpen, setAreFiltersOpen] =
    useState(false);

  useEffect(() => {
    setTrips(initialTrips);
  }, [initialTrips]);

  useEffect(() => {
    if (!editingTripId) {
      setForm(initialForm);
    }
  }, [editingTripId, initialForm]);

  const counts = useMemo<TripCounts>(() => {
    const result: TripCounts = {
      upcoming: 0,
      active: 0,
      finished: 0,
      shared: 0,
      thingsToPack: 0,
    };

    const now = new Date();

    trips.forEach((trip) => {
      const phase = getTripPhase(trip, now);

      if (phase === "upcoming") result.upcoming += 1;
      if (phase === "active") result.active += 1;
      if (phase === "finished") result.finished += 1;
      if (!trip.isOwner) result.shared += 1;

      if (phase === "upcoming" || phase === "active") {
        result.thingsToPack +=
          getRemainingPreparationItems(trip);
      }
    });

    return result;
  }, [trips]);

  const nearestTrip = useMemo(() => {
    const now = new Date();

    return (
      trips
        .filter((trip) => {
          const phase = getTripPhase(trip, now);
          return phase === "active" || phase === "upcoming";
        })
        .sort((first, second) => {
          const firstPhase = getTripPhase(first, now);
          const secondPhase = getTripPhase(second, now);

          if (
            firstPhase === "active" &&
            secondPhase !== "active"
          ) {
            return -1;
          }

          if (
            secondPhase === "active" &&
            firstPhase !== "active"
          ) {
            return 1;
          }

          return (
            new Date(first.startsAt).getTime() -
            new Date(second.startsAt).getTime()
          );
        })[0] ?? null
    );
  }, [trips]);

  const filteredTrips = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLocaleLowerCase("pl-PL");
    const now = new Date();

    return trips
      .filter((trip) => {
        const phase = getTripPhase(trip, now);

        const matchesTab =
          activeTab === "all" ||
          (activeTab === "upcoming" &&
            phase === "upcoming") ||
          (activeTab === "active" &&
            phase === "active") ||
          (activeTab === "finished" &&
            phase === "finished");

        const matchesSearch =
          !normalizedSearch ||
          [
            trip.title,
            trip.lakeName,
            trip.lake?.name,
            trip.note,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLocaleLowerCase("pl-PL")
                .includes(normalizedSearch)
            );

        const matchesType =
          typeFilter === "all" ||
          trip.tripType === typeFilter;

        const matchesOwnership =
          ownershipFilter === "all" ||
          (ownershipFilter === "owned" &&
            trip.isOwner) ||
          (ownershipFilter === "shared" &&
            !trip.isOwner);

        return (
          matchesTab &&
          matchesSearch &&
          matchesType &&
          matchesOwnership
        );
      })
      .sort((first, second) => {
        if (sort === "name") {
          return first.title.localeCompare(
            second.title,
            "pl"
          );
        }

        if (sort === "newest") {
          return (
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime()
          );
        }

        const firstDate = new Date(
          first.startsAt
        ).getTime();
        const secondDate = new Date(
          second.startsAt
        ).getTime();

        return sort === "farthest"
          ? secondDate - firstDate
          : firstDate - secondDate;
      });
  }, [
    activeTab,
    ownershipFilter,
    search,
    sort,
    trips,
    typeFilter,
  ]);

  const activeFiltersCount =
    Number(Boolean(search.trim())) +
    Number(typeFilter !== "all") +
    Number(ownershipFilter !== "all") +
    Number(sort !== "nearest");

  function updateField<K extends keyof TripFormState>(
    field: K,
    value: TripFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreateForm() {
    setEditingTripId(null);
    setForm(initialForm);
    setIsFormOpen(true);
  }

  function openEditForm(trip: FishingTrip) {
    if (!trip.canEdit) {
      toast.error({
        title: "Nie możesz edytować tej wyprawy.",
        description:
          "Masz dostęp tylko do podglądu tej współdzielonej wyprawy.",
      });
      return;
    }

    setEditingTripId(trip.id);
    setForm({
      title: trip.title,
      lakeId: trip.lakeId || "",
      tripType: trip.tripType,
      status: trip.status,
      startsAt: toDateTimeLocalValue(
        trip.startsAt
      ),
      endsAt: trip.endsAt
        ? toDateTimeLocalValue(trip.endsAt)
        : "",
      peopleCount: String(trip.peopleCount || 1),
      note: trip.note || "",
      createChecklist: Boolean(trip.checklistId),
    });
    setIsFormOpen(true);
  }

  function resetAndCloseForm() {
    setEditingTripId(null);
    setForm(initialForm);
    setIsFormOpen(false);
  }

  function closeForm() {
    if (isLoading) {
      return;
    }

    resetAndCloseForm();
  }

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setOwnershipFilter("all");
    setSort("nearest");
  }

  function validateForm() {
    if (!form.title.trim()) {
      toast.error({
        title: "Podaj nazwę wyprawy.",
        description:
          "Nazwa jest potrzebna, żeby zapisać wyprawę.",
      });
      return false;
    }

    const peopleCount = Number(form.peopleCount);

    if (
      !Number.isInteger(peopleCount) ||
      peopleCount < 1 ||
      peopleCount > 100
    ) {
      toast.error({
        title: "Niepoprawna liczba osób.",
        description: "Podaj liczbę od 1 do 100.",
      });
      return false;
    }

    if (!form.startsAt) {
      toast.error({
        title: "Wybierz termin rozpoczęcia.",
        description:
          "Data i godzina rozpoczęcia są wymagane.",
      });
      return false;
    }

    const startsAt = new Date(form.startsAt);

    if (Number.isNaN(startsAt.getTime())) {
      toast.error({
        title: "Niepoprawna data rozpoczęcia.",
        description:
          "Sprawdź datę i godzinę rozpoczęcia.",
      });
      return false;
    }

    if (form.endsAt) {
      const endsAt = new Date(form.endsAt);

      if (Number.isNaN(endsAt.getTime())) {
        toast.error({
          title: "Niepoprawna data zakończenia.",
          description:
            "Sprawdź datę i godzinę zakończenia.",
        });
        return false;
      }

      if (endsAt <= startsAt) {
        toast.error({
          title: "Niepoprawny zakres dat.",
          description:
            "Zakończenie musi przypadać po rozpoczęciu wyprawy.",
        });
        return false;
      }
    }

    return true;
  }

  async function submitForm() {
    if (!validateForm()) {
      return;
    }

    const isEditing = Boolean(editingTripId);
    setIsLoading(true);

    const toastId = toast.loading({
      title: isEditing
        ? "Zapisywanie zmian…"
        : "Planowanie wyprawy…",
      description: isEditing
        ? "Aktualizujemy dane wyprawy."
        : "Tworzymy nową wyprawę.",
    });

    try {
      const response = await fetch(
        editingTripId
          ? `/api/trips/${editingTripId}`
          : "/api/trips",
        {
          method: editingTripId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            status: editingTripId
              ? form.status
              : "planned",
            title: form.title.trim(),
            peopleCount: Number(form.peopleCount),
            endsAt: form.endsAt || null,
            note: form.note.trim() || null,
          }),
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok) {
        toast.update(toastId, {
          type: "error",
          title: isEditing
            ? "Nie udało się zapisać zmian."
            : "Nie udało się zaplanować wyprawy.",
          description:
            data.message ||
            "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });
        return;
      }

      resetAndCloseForm();
      router.refresh();

      toast.update(toastId, {
        type: "success",
        title: isEditing
          ? "Wyprawa została zaktualizowana."
          : "Wyprawa została zaplanowana.",
        description: form.createChecklist
          ? "Możesz teraz przejść do przygotowania checklisty i sprzętu."
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

  async function deleteTrip(trip: FishingTrip) {
    if (!trip.canDelete) {
      return;
    }

    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć wyprawę „${trip.title}”?`
    );

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading({
      title: "Usuwanie wyprawy…",
      description: "Usuwamy wyprawę i jej dane.",
    });

    try {
      const response = await fetch(
        `/api/trips/${trip.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok) {
        toast.update(toastId, {
          type: "error",
          title: "Nie udało się usunąć wyprawy.",
          description:
            data.message ||
            "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });
        return;
      }

      setTrips((current) =>
        current.filter((item) => item.id !== trip.id)
      );
      router.refresh();

      toast.update(toastId, {
        type: "success",
        title: "Wyprawa została usunięta.",
        duration: 4000,
      });
    } catch {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się usunąć wyprawy.",
        description:
          "Wystąpił problem z połączeniem.",
        duration: 6000,
      });
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden pb-28 md:pb-0">
      <div className="space-y-8 lg:space-y-9">
        <TripsHeader onCreate={openCreateForm} />

        <TripInvitations
          invitations={pendingInvitations}
        />

        <TripsStats
          counts={counts}
          pendingInvitations={
            pendingInvitations.length
          }
        />

        <TripsPriorityCard trip={nearestTrip} />

        <div className="space-y-4">
          <TripsToolbar
            activeTab={activeTab}
            search={search}
            typeFilter={typeFilter}
            ownershipFilter={ownershipFilter}
            sort={sort}
            viewMode={viewMode}
            areFiltersOpen={areFiltersOpen}
            activeFiltersCount={activeFiltersCount}
            onTabChange={setActiveTab}
            onSearchChange={setSearch}
            onTypeFilterChange={setTypeFilter}
            onOwnershipFilterChange={
              setOwnershipFilter
            }
            onSortChange={setSort}
            onViewModeChange={setViewMode}
            onToggleFilters={() =>
              setAreFiltersOpen((current) => !current)
            }
            onClearFilters={clearFilters}
          />

          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-sm font-bold text-text-secondary">
              {filteredTrips.length}{" "}
              {filteredTrips.length === 1
                ? "wyprawa"
                : "wypraw"}
            </p>
          </div>
        </div>

        {viewMode === "calendar" ? (
          <TripsCalendar trips={filteredTrips} />
        ) : filteredTrips.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onEdit={openEditForm}
                onDelete={(item) =>
                  void deleteTrip(item)
                }
              />
            ))}
          </section>
        ) : (
          <TripsEmptyState
            hasFilters={
              activeFiltersCount > 0 ||
              activeTab !== "all"
            }
            onCreate={openCreateForm}
            onClear={() => {
              clearFilters();
              setActiveTab("all");
            }}
          />
        )}
      </div>

      <TripFormDialog
        isOpen={isFormOpen}
        isEditing={Boolean(editingTripId)}
        isLoading={isLoading}
        form={form}
        lakes={lakes}
        onClose={closeForm}
        onSubmit={() => void submitForm()}
        onFieldChange={updateField}
      />
    </div>
  );
}
