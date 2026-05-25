"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

type FishingTrip = {
  id: string;
  userId: string;
  title: string;
  lakeId: string | null;
  lakeName: string | null;
  tripType: string;
  status: string;
  startsAt: string;
  note: string | null;
  checklistId: string | null;
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
};

type TripFormState = {
  title: string;
  lakeId: string;
  tripType: string;
  status: string;
  startsAt: string;
  note: string;
  createChecklist: boolean;
};

type ApiResponse = {
  message?: string;
};

const initialFormState: TripFormState = {
  title: "",
  lakeId: "",
  tripType: "custom",
  status: "planned",
  startsAt: "",
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

const statuses = [
  { label: "Planowana", value: "planned" },
  { label: "Zakończona", value: "finished" },
  { label: "Anulowana", value: "cancelled" },
];

async function readApiResponse(response: Response) {
  try {
    return (await response.json()) as FishingTrip & ApiResponse;
  } catch {
    return {
      message: "Serwer nie zwrócił poprawnej odpowiedzi.",
    } as FishingTrip & ApiResponse;
  }
}

export function TripsPage({
  initialTrips,
  lakes,
  initialLakeId = null,
  initialLakeName = null,
}: TripsPageProps) {
  const toast = useToast();

  const initialLakeExists = lakes.some((lake) => lake.id === initialLakeId);

  const initialFormWithLake: TripFormState = {
    ...initialFormState,
    lakeId: initialLakeExists ? initialLakeId || "" : "",
    title:
      initialLakeExists && initialLakeName
        ? `Wyprawa na ${initialLakeName}`
        : "",
  };

  const [trips, setTrips] = useState<FishingTrip[]>(initialTrips);
  const [form, setForm] = useState<TripFormState>(initialFormWithLake);
  const [isFormOpen, setIsFormOpen] = useState(initialLakeExists);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [areMobileFiltersOpen, setAreMobileFiltersOpen] = useState(false);

  const activeFiltersCount =
    Number(Boolean(search.trim())) +
    Number(statusFilter !== "all") +
    Number(typeFilter !== "all");

  function updateField<K extends keyof TripFormState>(
    field: K,
    value: TripFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleStartEdit(trip: FishingTrip) {
    setEditingTripId(trip.id);

    setForm({
      title: trip.title,
      lakeId: trip.lakeId || "",
      tripType: trip.tripType,
      status: trip.status,
      startsAt: toDateTimeLocalValue(trip.startsAt),
      note: trip.note || "",
      createChecklist: Boolean(trip.checklistId),
    });

    setIsFormOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleCancelForm() {
    if (isLoading) {
      return;
    }

    setEditingTripId(null);
    setForm(initialFormWithLake);
    setIsFormOpen(false);
  }

  function handleOpenCreateForm() {
    setEditingTripId(null);
    setForm(initialFormWithLake);
    setIsFormOpen(true);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setAreMobileFiltersOpen(false);
  }

  const plannedTrips = trips.filter((trip) => trip.status === "planned");
  const finishedTrips = trips.filter((trip) => trip.status === "finished");
  const cancelledTrips = trips.filter((trip) => trip.status === "cancelled");

  const nearestTrip = useMemo(() => {
    const now = new Date();

    return (
      trips
        .filter((trip) => trip.status === "planned")
        .filter((trip) => new Date(trip.startsAt) >= now)
        .sort(
          (firstTrip, secondTrip) =>
            new Date(firstTrip.startsAt).getTime() -
            new Date(secondTrip.startsAt).getTime()
        )[0] ?? null
    );
  }, [trips]);

  const filteredTrips = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return trips
      .filter((trip) => {
        const matchesSearch =
          !searchValue ||
          trip.title.toLowerCase().includes(searchValue) ||
          trip.lakeName?.toLowerCase().includes(searchValue) ||
          trip.note?.toLowerCase().includes(searchValue);

        const matchesStatus =
          statusFilter === "all" || trip.status === statusFilter;

        const matchesType = typeFilter === "all" || trip.tripType === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort(
        (firstTrip, secondTrip) =>
          new Date(secondTrip.startsAt).getTime() -
          new Date(firstTrip.startsAt).getTime()
      );
  }, [trips, search, statusFilter, typeFilter]);

  function validateForm() {
    if (!form.title.trim()) {
      toast.error({
        title: "Podaj tytuł wyprawy.",
        description: "Tytuł jest wymagany, żeby zapisać wyprawę.",
      });

      return false;
    }

    if (!form.startsAt) {
      toast.error({
        title: "Wybierz datę wyprawy.",
        description: "Data i godzina rozpoczęcia są wymagane.",
      });

      return false;
    }

    const parsedDate = new Date(form.startsAt);

    if (Number.isNaN(parsedDate.getTime())) {
      toast.error({
        title: "Niepoprawna data wyprawy.",
        description: "Sprawdź datę i godzinę rozpoczęcia.",
      });

      return false;
    }

    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const isEditing = Boolean(editingTripId);

    const toastId = toast.loading({
      title: isEditing ? "Zapisywanie zmian..." : "Planowanie wyprawy...",
      description: isEditing
        ? "Aktualizujemy dane wyprawy."
        : "Dodajemy nową wyprawę do Twojego kalendarza.",
    });

    const url = editingTripId ? `/api/trips/${editingTripId}` : "/api/trips";
    const method = editingTripId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        const errorMessage = data.message || "Nie udało się zapisać wyprawy.";

        toast.update(toastId, {
          type: "error",
          title: isEditing
            ? "Nie udało się zapisać zmian."
            : "Nie udało się zaplanować wyprawy.",
          description: errorMessage,
          duration: 6000,
        });

        setIsLoading(false);
        return;
      }

      const savedTrip = data as FishingTrip;

      if (editingTripId) {
        setTrips((current) =>
          current.map((trip) => (trip.id === editingTripId ? savedTrip : trip))
        );
      } else {
        setTrips((current) => [savedTrip, ...current]);
      }

      setForm(initialFormWithLake);
      setEditingTripId(null);
      setIsFormOpen(false);
      setIsLoading(false);

      toast.update(toastId, {
        type: "success",
        title: isEditing
          ? "Wyprawa została zaktualizowana."
          : "Wyprawa została zaplanowana.",
        description: form.createChecklist
          ? "Dane zapisano. Checklista wyprawy jest gotowa do uzupełnienia."
          : "Dane wyprawy zostały zapisane.",
        duration: 4500,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Wystąpił problem podczas zapisywania wyprawy.";

      toast.update(toastId, {
        type: "error",
        title: isEditing
          ? "Nie udało się zapisać zmian."
          : "Nie udało się zaplanować wyprawy.",
        description: errorMessage,
        duration: 6000,
      });

      setIsLoading(false);
    }
  }

  async function handleDeleteTrip(id: string) {
    const confirmed = confirm("Czy na pewno chcesz usunąć tę wyprawę?");

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading({
      title: "Usuwanie wyprawy...",
      description: "Usuwamy wyprawę z Twojego kalendarza.",
    });

    try {
      const response = await fetch(`/api/trips/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await readApiResponse(response);

        toast.update(toastId, {
          type: "error",
          title: "Nie udało się usunąć wyprawy.",
          description: data.message || "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });

        return;
      }

      setTrips((current) => current.filter((trip) => trip.id !== id));

      if (editingTripId === id) {
        handleCancelForm();
      }

      toast.update(toastId, {
        type: "success",
        title: "Wyprawa została usunięta.",
        description: "Wyprawa zniknęła z Twojego kalendarza.",
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
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Moje wyprawy
          </h1>

          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500 sm:text-sm sm:leading-6">
            Planuj wyjazdy nad wodę, przypisuj łowiska, twórz checklisty i
            zapisuj notatki z wypraw.
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
          className="rounded-2xl bg-blue-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:text-sm"
        >
          {isFormOpen ? "Zamknij formularz" : "+ Zaplanuj wyprawę"}
        </button>
      </div>

      <section className="mb-6 flex w-full max-w-full gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:pb-0 xl:grid-cols-4">
        <StatCard label="Wszystkie wyprawy" value={String(trips.length)} />
        <StatCard label="Planowane" value={String(plannedTrips.length)} />
        <StatCard label="Zakończone" value={String(finishedTrips.length)} />
        <StatCard label="Anulowane" value={String(cancelledTrips.length)} />
      </section>

      {nearestTrip && (
        <section className="mb-6 rounded-3xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
                Najbliższa wyprawa
              </p>

              <h2 className="mt-2 break-words text-2xl font-bold text-slate-950">
                {nearestTrip.title}
              </h2>

              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                {formatDateTime(nearestTrip.startsAt)}
                {nearestTrip.lakeName ? ` • ${nearestTrip.lakeName}` : ""}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:flex">
              {nearestTrip.checklistId && (
                <Link
                  href="/checklisty"
                  className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                >
                  Otwórz checklisty
                </Link>
              )}

              <Link
                href={`/polowy?tripId=${nearestTrip.id}`}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Dodaj połów
              </Link>
            </div>
          </div>
        </section>
      )}

      {isFormOpen && (
        <>
          <section className="mb-6 hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:block">
            <TripForm
              form={form}
              editingTripId={editingTripId}
              lakes={lakes}
              isLoading={isLoading}
              initialLakeExists={initialLakeExists}
              onSubmit={handleSubmit}
              onCancel={handleCancelForm}
              onFieldChange={updateField}
            />
          </section>

          <div
            className="fixed inset-0 z-[1200] flex items-end bg-slate-950/60 p-0 md:hidden"
            onClick={handleCancelForm}
          >
            <div
              className="max-h-[88vh] w-full overflow-hidden rounded-t-[2rem] bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                    Wyprawy
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    {editingTripId ? "Edytuj wyprawę" : "Zaplanuj wyprawę"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleCancelForm}
                  disabled={isLoading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Zamknij formularz"
                >
                  ×
                </button>
              </div>

              <div className="max-h-[calc(88vh-73px)] overflow-y-auto px-5 py-5">
                <TripForm
                  form={form}
                  editingTripId={editingTripId}
                  lakes={lakes}
                  isLoading={isLoading}
                  initialLakeExists={initialLakeExists}
                  onSubmit={handleSubmit}
                  onCancel={handleCancelForm}
                  onFieldChange={updateField}
                  isMobile
                />
              </div>
            </div>
          </div>
        </>
      )}

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_220px] xl:items-center">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Szukaj po tytule, łowisku lub notatce..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500"
          />

          <div className="flex gap-3 xl:hidden">
            <button
              type="button"
              onClick={() => setAreMobileFiltersOpen((current) => !current)}
              className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
            >
              {areMobileFiltersOpen ? "Ukryj filtry" : "Filtry"}

              {activeFiltersCount > 0 && (
                <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-blue-600 transition hover:bg-slate-50"
            >
              Wyczyść
            </button>
          </div>

          <div
            className={`grid gap-3 xl:contents ${
              areMobileFiltersOpen ? "grid" : "hidden xl:grid"
            }`}
          >
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: "Wszystkie statusy", value: "all" },
                ...statuses,
              ]}
            />

            <FilterSelect
              value={typeFilter}
              onChange={setTypeFilter}
              options={[{ label: "Wszystkie typy", value: "all" }, ...tripTypes]}
            />
          </div>
        </div>
      </section>

      {filteredTrips.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredTrips.map((trip) => (
            <article
              key={trip.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    {getTripTypeLabel(trip.tripType)}
                  </p>

                  <h2 className="mt-2 break-words text-xl font-bold text-slate-950">
                    {trip.title}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {formatDateTime(trip.startsAt)}
                  </p>
                </div>

                <StatusBadge status={trip.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoTile
                  label="Łowisko"
                  value={trip.lakeName || "Nie przypisano"}
                />

                <InfoTile label="Status" value={getStatusLabel(trip.status)} />

                <InfoTile
                  label="Checklista"
                  value={trip.checklistId ? "Tak" : "Nie"}
                />

                <InfoTile label="Połowy" value="Dodaj w dzienniku" />
              </div>

              {trip.note && (
                <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {trip.note}
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-end">
                {trip.checklistId && (
                  <Link
                    href="/checklisty"
                    className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:py-2.5"
                  >
                    Checklista
                  </Link>
                )}

                <Link
                  href={`/polowy?tripId=${trip.id}`}
                  className="rounded-xl bg-blue-50 px-4 py-3 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-100 sm:py-2.5"
                >
                  Dodaj połów
                </Link>

                <button
                  type="button"
                  onClick={() => handleStartEdit(trip)}
                  className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 sm:py-2.5"
                >
                  Edytuj
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteTrip(trip.id)}
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 sm:py-2.5"
                >
                  Usuń
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
            🗓️
          </div>

          <p className="mt-5 text-xl font-bold text-slate-950">
            Brak wypraw do wyświetlenia
          </p>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Zaplanuj pierwszą wyprawę, przypisz łowisko i przygotuj checklistę
            rzeczy do zabrania.
          </p>

          <button
            type="button"
            onClick={handleOpenCreateForm}
            className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
          >
            + Zaplanuj pierwszą wyprawę
          </button>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:ml-3 sm:w-auto"
            >
              Wyczyść filtry
            </button>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={handleOpenCreateForm}
        className="fixed bottom-24 right-4 z-[900] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-3xl font-light leading-none text-white shadow-xl transition hover:bg-blue-700 md:hidden"
        aria-label="Zaplanuj wyprawę"
      >
        +
      </button>
    </div>
  );
}

function TripForm({
  form,
  editingTripId,
  lakes,
  isLoading,
  initialLakeExists,
  onSubmit,
  onCancel,
  onFieldChange,
  isMobile = false,
}: {
  form: TripFormState;
  editingTripId: string | null;
  lakes: LakeOption[];
  isLoading: boolean;
  initialLakeExists: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onFieldChange: <K extends keyof TripFormState>(
    field: K,
    value: TripFormState[K]
  ) => void;
  isMobile?: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {!isMobile && (
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            {editingTripId ? "Edytuj wyprawę" : "Zaplanuj wyprawę"}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Uzupełnij datę, typ wyprawy, łowisko i notatkę. Możesz od razu
            utworzyć checklistę.
          </p>
        </div>
      )}

      {initialLakeExists && !editingTripId && (
        <p className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          Planujesz wyprawę na wybrane łowisko.
        </p>
      )}

      <FormGroup title="Podstawowe" description="Nazwa oraz termin wyprawy.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Tytuł wyprawy"
            value={form.title}
            onChange={(value) => onFieldChange("title", value)}
            placeholder="np. Poranny feeder na komercji"
            required
          />

          <Input
            label="Data i godzina rozpoczęcia"
            value={form.startsAt}
            onChange={(value) => onFieldChange("startsAt", value)}
            type="datetime-local"
            required
          />
        </div>
      </FormGroup>

      <FormGroup title="Miejsce i typ" description="Przypisz łowisko oraz metodę.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Select
            label="Łowisko"
            value={form.lakeId}
            onChange={(value) => onFieldChange("lakeId", value)}
            options={[
              { label: "Bez przypisanego łowiska", value: "" },
              ...lakes.map((lake) => ({
                label: `${lake.name} — ${lake.city}, woj. ${lake.voivodeship}`,
                value: lake.id,
              })),
            ]}
          />

          <Select
            label="Typ wyprawy"
            value={form.tripType}
            onChange={(value) => onFieldChange("tripType", value)}
            options={tripTypes}
          />

          <Select
            label="Status"
            value={form.status}
            onChange={(value) => onFieldChange("status", value)}
            options={statuses}
          />
        </div>
      </FormGroup>

      <FormGroup
        title="Checklista"
        description="Utwórz listę rzeczy do przygotowania przed wyjazdem."
      >
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={form.createChecklist}
            onChange={(event) =>
              onFieldChange("createChecklist", event.target.checked)
            }
            className="h-4 w-4 rounded border-slate-300 accent-blue-600"
          />

          <span className="text-sm font-semibold text-slate-700">
            Utwórz checklistę wyprawy
          </span>
        </label>
      </FormGroup>

      <FormGroup title="Notatka" description="Dodaj własne informacje o wyprawie.">
        <textarea
          value={form.note}
          onChange={(event) => onFieldChange("note", event.target.value)}
          rows={4}
          placeholder="np. Zabierz pellet 2 mm, podbierak, matę i ciepłe ubranie."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      </FormGroup>

      <div
        className={`flex gap-3 ${
          isMobile
            ? "sticky bottom-0 -mx-5 border-t border-slate-100 bg-white px-5 py-4"
            : "justify-end"
        }`}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
        >
          Anuluj
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
        >
          {isLoading
            ? "Zapisywanie..."
            : editingTripId
              ? "Zapisz zmiany"
              : "Zaplanuj wyprawę"}
        </button>
      </div>
    </form>
  );
}

function FormGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <h3 className="text-base font-black text-slate-950">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      {children}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[170px] max-w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:min-w-0 md:p-5">
      <p className="break-words text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
        {value}
      </p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
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
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

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
    </div>
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
      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "planned") {
    return (
      <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
        Planowana
      </span>
    );
  }

  if (status === "finished") {
    return (
      <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        Zakończona
      </span>
    );
  }

  if (status === "cancelled") {
    return (
      <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
        Anulowana
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      {status}
    </span>
  );
}

function getTripTypeLabel(value: string) {
  return tripTypes.find((item) => item.value === value)?.label || value;
}

function getStatusLabel(value: string) {
  return statuses.find((item) => item.value === value)?.label || value;
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function toDateTimeLocalValue(date: string) {
  const parsedDate = new Date(date);

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const hours = String(parsedDate.getHours()).padStart(2, "0");
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}