"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
  const [isFormOpen, setIsFormOpen] = useState(
    initialTrips.length === 0 || initialLakeExists
  );
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

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
    setEditingTripId(null);
    setForm(initialFormWithLake);
    setIsFormOpen(false);
  }

  function handleOpenCreateForm() {
    setEditingTripId(null);
    setForm(initialFormWithLake);
    setIsFormOpen(true);
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

      router.refresh();
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

      router.refresh();
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
    <div>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Moje wyprawy
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
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
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          {isFormOpen ? "Zamknij formularz" : "+ Zaplanuj wyprawę"}
        </button>
      </div>

      <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Wszystkie wyprawy" value={String(trips.length)} />
        <StatCard label="Planowane" value={String(plannedTrips.length)} />
        <StatCard label="Zakończone" value={String(finishedTrips.length)} />
        <StatCard label="Anulowane" value={String(cancelledTrips.length)} />
      </section>

      {nearestTrip && (
        <section className="mb-6 rounded-3xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
                Najbliższa wyprawa
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                {nearestTrip.title}
              </h2>

              <p className="mt-2 text-sm font-semibold text-slate-600">
                {formatDateTime(nearestTrip.startsAt)}
                {nearestTrip.lakeName ? ` • ${nearestTrip.lakeName}` : ""}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
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
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            {editingTripId ? "Edytuj wyprawę" : "Zaplanuj wyprawę"}
          </h2>

          {initialLakeExists && !editingTripId && (
            <p className="mt-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              Planujesz wyprawę na wybrane łowisko.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <Input
                label="Tytuł wyprawy"
                value={form.title}
                onChange={(value) => updateField("title", value)}
                placeholder="np. Poranny feeder na komercji"
                required
              />

              <Input
                label="Data i godzina rozpoczęcia"
                value={form.startsAt}
                onChange={(value) => updateField("startsAt", value)}
                type="datetime-local"
                required
              />

              <Select
                label="Łowisko"
                value={form.lakeId}
                onChange={(value) => updateField("lakeId", value)}
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
                onChange={(value) => updateField("tripType", value)}
                options={tripTypes}
              />

              <Select
                label="Status"
                value={form.status}
                onChange={(value) => updateField("status", value)}
                options={statuses}
              />

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-4 lg:mt-7">
                <input
                  type="checkbox"
                  checked={form.createChecklist}
                  onChange={(event) =>
                    updateField("createChecklist", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                />

                <span className="text-sm font-semibold text-slate-700">
                  Utwórz checklistę wyprawy
                </span>
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Notatka
              </label>

              <textarea
                value={form.note}
                onChange={(event) => updateField("note", event.target.value)}
                rows={4}
                placeholder="np. Zabierz pellet 2 mm, podbierak, matę i ciepłe ubranie."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelForm}
                disabled={isLoading}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Anuluj
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading
                  ? "Zapisywanie..."
                  : editingTripId
                    ? "Zapisz zmiany"
                    : "Zaplanuj wyprawę"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_220px_220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Szukaj po tytule, łowisku lub notatce..."
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500"
          />

          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[{ label: "Wszystkie statusy", value: "all" }, ...statuses]}
          />

          <FilterSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[{ label: "Wszystkie typy", value: "all" }, ...tripTypes]}
          />
        </div>
      </section>

      {filteredTrips.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filteredTrips.map((trip) => (
            <article
              key={trip.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    {getTripTypeLabel(trip.tripType)}
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-950">
                    {trip.title}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
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

                <InfoTile
                  label="Połowy"
                  value="Dodaj w dzienniku"
                />
              </div>

              {trip.note && (
                <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {trip.note}
                </p>
              )}

              <div className="mt-5 flex flex-wrap justify-end gap-3">
                {trip.checklistId && (
                  <Link
                    href="/checklisty"
                    className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Checklista
                  </Link>
                )}

                <Link
                  href={`/polowy?tripId=${trip.id}`}
                  className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  Dodaj połów
                </Link>

                <button
                  type="button"
                  onClick={() => handleStartEdit(trip)}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Edytuj
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteTrip(trip.id)}
                  className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Usuń
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xl font-bold text-slate-950">
            Brak wypraw do wyświetlenia
          </p>

          <p className="mt-2 text-slate-500">
            Zaplanuj pierwszą wyprawę albo zmień filtry.
          </p>

          <button
            type="button"
            onClick={handleOpenCreateForm}
            className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Zaplanuj wyprawę
          </button>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
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
      className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500"
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

      <p className="mt-1 font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "planned") {
    return (
      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
        Planowana
      </span>
    );
  }

  if (status === "finished") {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        Zakończona
      </span>
    );
  }

  if (status === "cancelled") {
    return (
      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
        Anulowana
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
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