"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

export function TripsPage({ initialTrips, lakes }: TripsPageProps) {
  const router = useRouter();

  const [trips, setTrips] = useState<FishingTrip[]>(initialTrips);
  const [form, setForm] = useState<TripFormState>(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(initialTrips.length === 0);
  const [isLoading, setIsLoading] = useState(false);

  function updateField<K extends keyof TripFormState>(
    field: K,
    value: TripFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  const plannedTrips = trips.filter((trip) => trip.status === "planned");
  const finishedTrips = trips.filter((trip) => trip.status === "finished");

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);

    const response = await fetch("/api/trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Nie udało się utworzyć wyprawy.");
      setIsLoading(false);
      return;
    }

    setTrips((current) => [data, ...current]);
    setForm(initialFormState);
    setIsFormOpen(false);
    setIsLoading(false);
    router.refresh();
  }

  async function handleDeleteTrip(id: string) {
    const confirmed = confirm("Czy na pewno chcesz usunąć tę wyprawę?");

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/trips/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.message || "Nie udało się usunąć wyprawy.");
      return;
    }

    setTrips((current) => current.filter((trip) => trip.id !== id));
    router.refresh();
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Moje wyprawy
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Planuj wyjazdy, przypisuj łowiska, twórz checklisty i zapisuj
            informacje potrzebne przed wyprawą.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen((current) => !current)}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          {isFormOpen ? "Zamknij formularz" : "+ Zaplanuj wyprawę"}
        </button>
      </div>

      <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Wszystkie wyprawy" value={String(trips.length)} />
        <StatCard label="Planowane" value={String(plannedTrips.length)} />
        <StatCard label="Zakończone" value={String(finishedTrips.length)} />
        <StatCard
          label="Najbliższa"
          value={nearestTrip ? formatShortDate(nearestTrip.startsAt) : "Brak"}
        />
      </section>

      {isFormOpen && (
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Zaplanuj wyprawę
          </h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <Input
                label="Nazwa wyprawy"
                value={form.title}
                onChange={(value) => updateField("title", value)}
                placeholder="np. Method feeder — Staw Głęboczek"
                required
              />

              <Select
                label="Łowisko"
                value={form.lakeId}
                onChange={(value) => updateField("lakeId", value)}
                options={[
                  { label: "Bez przypisanego łowiska", value: "" },
                  ...lakes.map((lake) => ({
                    label: `${lake.name} — ${lake.city}`,
                    value: lake.id,
                  })),
                ]}
              />

              <Input
                label="Data i godzina"
                value={form.startsAt}
                onChange={(value) => updateField("startsAt", value)}
                type="datetime-local"
                required
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
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Notatka
              </label>

              <textarea
                value={form.note}
                onChange={(event) => updateField("note", event.target.value)}
                rows={4}
                placeholder="np. Wyjazd o 4:30, zabrać dodatkowe koszyczki i pellet 2 mm."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <input
                type="checkbox"
                checked={form.createChecklist}
                onChange={(event) =>
                  updateField("createChecklist", event.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />

              <span className="text-sm font-semibold text-slate-700">
                Utwórz od razu checklistę do tej wyprawy
              </span>
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setForm(initialFormState);
                  setIsFormOpen(false);
                }}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Anuluj
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Zapisywanie..." : "Zaplanuj wyprawę"}
              </button>
            </div>
          </form>
        </section>
      )}

      {trips.length > 0 ? (
        <section className="grid gap-5">
          {trips.map((trip) => (
            <article
              key={trip.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <StatusBadge status={trip.status} />

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {getTripTypeLabel(trip.tripType)}
                    </span>

                    {trip.checklistId && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        Checklista utworzona
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-slate-950">
                    {trip.title}
                  </h2>

                  <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                    <InfoTile label="Data" value={formatDateTime(trip.startsAt)} />
                    <InfoTile
                      label="Łowisko"
                      value={trip.lakeName || "Nie przypisano"}
                    />
                    <InfoTile
                      label="Status"
                      value={getStatusLabel(trip.status)}
                    />
                  </div>

                  {trip.note && (
                    <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                      {trip.note}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row xl:flex-col">
                  {trip.checklistId && (
                    <Link
                      href="/checklisty"
                      className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Otwórz checklisty
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xl font-bold text-slate-950">
            Brak zaplanowanych wypraw
          </p>

          <p className="mt-2 text-slate-500">
            Dodaj pierwszą wyprawę i przypisz do niej łowisko oraz checklistę.
          </p>
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

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-700">{value}</p>
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

function StatusBadge({ status }: { status: string }) {
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
    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
      Planowana
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

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(date));
}