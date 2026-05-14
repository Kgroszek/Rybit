"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FishingCatch = {
  id: string;
  userId: string;
  fishName: string;
  weight: number | null;
  length: number | null;
  method: string;
  bait: string | null;
  caughtAt: string;
  lakeId: string | null;
  lakeName: string | null;
  tripId: string | null;
  tripTitle: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

type LakeOption = {
  id: string;
  name: string;
  city: string;
  voivodeship: string;
};

type TripOption = {
  id: string;
  title: string;
  startsAt: string;
};

type CatchesPageProps = {
  initialCatches: FishingCatch[];
  lakes: LakeOption[];
  trips: TripOption[];
};

type CatchFormState = {
  fishName: string;
  customFishName: string;
  weight: string;
  length: string;
  method: string;
  bait: string;
  caughtAt: string;
  lakeId: string;
  tripId: string;
  note: string;
};

const initialFormState: CatchFormState = {
  fishName: "",
  customFishName: "",
  weight: "",
  length: "",
  method: "spinning",
  bait: "",
  caughtAt: "",
  lakeId: "",
  tripId: "",
  note: "",
};

const fishSpecies = [
  { label: "Amur biały", value: "Amur biały" },
  { label: "Boleń", value: "Boleń" },
  { label: "Brzana", value: "Brzana" },
  { label: "Certa", value: "Certa" },
  { label: "Ciernik", value: "Ciernik" },
  { label: "Cierniczek", value: "Cierniczek" },
  { label: "Czebaczek amurski", value: "Czebaczek amurski" },
  { label: "Głowacica", value: "Głowacica" },
  { label: "Jaź", value: "Jaź" },
  { label: "Jazgarz", value: "Jazgarz" },
  { label: "Jelec", value: "Jelec" },
  { label: "Karaś pospolity", value: "Karaś pospolity" },
  { label: "Karaś srebrzysty", value: "Karaś srebrzysty" },
  { label: "Karp", value: "Karp" },
  { label: "Kiełb", value: "Kiełb" },
  { label: "Kleń", value: "Kleń" },
  { label: "Koza", value: "Koza" },
  { label: "Krąp", value: "Krąp" },
  { label: "Leszcz", value: "Leszcz" },
  { label: "Lin", value: "Lin" },
  { label: "Lipień", value: "Lipień" },
  { label: "Łosoś atlantycki", value: "Łosoś atlantycki" },
  { label: "Miętus", value: "Miętus" },
  { label: "Okoń", value: "Okoń" },
  { label: "Piekielnica", value: "Piekielnica" },
  { label: "Piskorz", value: "Piskorz" },
  { label: "Płoć", value: "Płoć" },
  { label: "Pstrąg potokowy", value: "Pstrąg potokowy" },
  { label: "Pstrąg tęczowy", value: "Pstrąg tęczowy" },
  { label: "Pstrąg źródlany", value: "Pstrąg źródlany" },
  { label: "Różanka", value: "Różanka" },
  { label: "Sandacz", value: "Sandacz" },
  { label: "Sieja", value: "Sieja" },
  { label: "Sielawa", value: "Sielawa" },
  { label: "Słonecznica", value: "Słonecznica" },
  { label: "Strzebla potokowa", value: "Strzebla potokowa" },
  { label: "Sum", value: "Sum" },
  { label: "Sumik karłowaty", value: "Sumik karłowaty" },
  { label: "Szczupak", value: "Szczupak" },
  { label: "Śliz", value: "Śliz" },
  { label: "Świnka", value: "Świnka" },
  { label: "Tołpyga biała", value: "Tołpyga biała" },
  { label: "Tołpyga pstra", value: "Tołpyga pstra" },
  { label: "Troć wędrowna", value: "Troć wędrowna" },
  { label: "Ukleja", value: "Ukleja" },
  { label: "Węgorz europejski", value: "Węgorz europejski" },
  { label: "Wzdręga", value: "Wzdręga" },
  { label: "Inny gatunek", value: "other" },
];

const methods = [
  { label: "Spinning", value: "spinning" },
  { label: "Feeder", value: "feeder" },
  { label: "Method feeder", value: "method_feeder" },
  { label: "Karpiówka", value: "carp" },
  { label: "Spławik", value: "float" },
  { label: "Muchówka", value: "fly" },
  { label: "Inna", value: "other" },
];

export function CatchesPage({
  initialCatches,
  lakes,
  trips,
}: CatchesPageProps) {
  const router = useRouter();

  const [catches, setCatches] = useState<FishingCatch[]>(initialCatches);
  const [form, setForm] = useState<CatchFormState>(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(initialCatches.length === 0);
  const [editingCatchId, setEditingCatchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  function updateField<K extends keyof CatchFormState>(
    field: K,
    value: CatchFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleStartEdit(item: FishingCatch) {
    const isKnownFish = fishSpecies.some(
      (species) => species.value === item.fishName
    );

    setEditingCatchId(item.id);

    setForm({
      fishName: isKnownFish ? item.fishName : "other",
      customFishName: isKnownFish ? "" : item.fishName,
      weight: item.weight !== null ? String(item.weight) : "",
      length: item.length !== null ? String(item.length) : "",
      method: item.method,
      bait: item.bait || "",
      caughtAt: toDateTimeLocalValue(item.caughtAt),
      lakeId: item.lakeId || "",
      tripId: item.tripId || "",
      note: item.note || "",
    });

    setIsFormOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleCancelForm() {
    setEditingCatchId(null);
    setForm(initialFormState);
    setIsFormOpen(false);
  }

  const filteredCatches = useMemo(() => {
    return catches.filter((item) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        item.fishName.toLowerCase().includes(searchValue) ||
        item.lakeName?.toLowerCase().includes(searchValue) ||
        item.tripTitle?.toLowerCase().includes(searchValue) ||
        item.bait?.toLowerCase().includes(searchValue) ||
        item.note?.toLowerCase().includes(searchValue);

      const matchesMethod =
        methodFilter === "all" || item.method === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [catches, search, methodFilter]);

  const totalCatches = catches.length;

  const biggestWeight = catches.reduce((max, item) => {
    return Math.max(max, item.weight || 0);
  }, 0);

  const biggestLength = catches.reduce((max, item) => {
    return Math.max(max, item.length || 0);
  }, 0);

  const uniqueSpecies = new Set(catches.map((item) => item.fishName)).size;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const finalFishName =
      form.fishName === "other" ? form.customFishName.trim() : form.fishName;

    if (!finalFishName) {
      alert("Wybierz gatunek ryby albo wpisz własny.");
      return;
    }

    setIsLoading(true);

    const url = editingCatchId
      ? `/api/catches/${editingCatchId}`
      : "/api/catches";

    const method = editingCatchId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        fishName: finalFishName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Nie udało się zapisać połowu.");
      setIsLoading(false);
      return;
    }

    if (editingCatchId) {
      setCatches((current) =>
        current.map((item) => (item.id === editingCatchId ? data : item))
      );
    } else {
      setCatches((current) => [data, ...current]);
    }

    setForm(initialFormState);
    setEditingCatchId(null);
    setIsFormOpen(false);
    setIsLoading(false);
    router.refresh();
  }

  async function handleDeleteCatch(id: string) {
    const confirmed = confirm("Czy na pewno chcesz usunąć ten połów?");

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/catches/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.message || "Nie udało się usunąć połowu.");
      return;
    }

    setCatches((current) => current.filter((item) => item.id !== id));

    if (editingCatchId === id) {
      handleCancelForm();
    }

    router.refresh();
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Moje połowy
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Zapisuj złowione ryby, metody, przynęty, łowiska i notatki z wypraw.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isFormOpen) {
              handleCancelForm();
              return;
            }

            setEditingCatchId(null);
            setForm(initialFormState);
            setIsFormOpen(true);
          }}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          {isFormOpen ? "Zamknij formularz" : "+ Dodaj połów"}
        </button>
      </div>

      <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Wszystkie połowy" value={String(totalCatches)} />
        <StatCard label="Gatunki" value={String(uniqueSpecies)} />
        <StatCard
          label="Największa waga"
          value={biggestWeight > 0 ? `${biggestWeight.toFixed(2)} kg` : "Brak"}
        />
        <StatCard
          label="Największa długość"
          value={biggestLength > 0 ? `${biggestLength.toFixed(0)} cm` : "Brak"}
        />
      </section>

      {isFormOpen && (
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            {editingCatchId ? "Edytuj połów" : "Dodaj połów"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <Select
                label="Gatunek ryby"
                value={form.fishName}
                onChange={(value) => updateField("fishName", value)}
                options={[
                  { label: "Wybierz gatunek", value: "" },
                  ...fishSpecies,
                ]}
              />

              {form.fishName === "other" && (
                <Input
                  label="Wpisz gatunek"
                  value={form.customFishName}
                  onChange={(value) => updateField("customFishName", value)}
                  placeholder="np. inny gatunek"
                  required
                />
              )}

              <Select
                label="Metoda"
                value={form.method}
                onChange={(value) => updateField("method", value)}
                options={methods}
              />

              <Input
                label="Waga w kg"
                value={form.weight}
                onChange={(value) => updateField("weight", value)}
                placeholder="np. 3.25"
                type="number"
              />

              <Input
                label="Długość w cm"
                value={form.length}
                onChange={(value) => updateField("length", value)}
                placeholder="np. 72"
                type="number"
              />

              <Input
                label="Przynęta"
                value={form.bait}
                onChange={(value) => updateField("bait", value)}
                placeholder="np. guma 10 cm / pellet 2 mm"
              />

              <Input
                label="Data i godzina połowu"
                value={form.caughtAt}
                onChange={(value) => updateField("caughtAt", value)}
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
                    label: `${lake.name} — ${lake.city}`,
                    value: lake.id,
                  })),
                ]}
              />

              <Select
                label="Wyprawa"
                value={form.tripId}
                onChange={(value) => updateField("tripId", value)}
                options={[
                  { label: "Bez przypisanej wyprawy", value: "" },
                  ...trips.map((trip) => ({
                    label: `${trip.title} — ${formatShortDate(trip.startsAt)}`,
                    value: trip.id,
                  })),
                ]}
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
                placeholder="np. Branie przy trzcinach, około 6:20 rano."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelForm}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
                  : editingCatchId
                    ? "Zapisz zmiany"
                    : "Dodaj połów"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Szukaj po gatunku, łowisku, wyprawie, przynęcie..."
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500"
          />

          <select
            value={methodFilter}
            onChange={(event) => setMethodFilter(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500"
          >
            <option value="all">Wszystkie metody</option>
            {methods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {filteredCatches.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filteredCatches.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    {getMethodLabel(item.method)}
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-950">
                    {item.fishName}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {formatDateTime(item.caughtAt)}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                  🎣
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoTile
                  label="Waga"
                  value={item.weight ? `${item.weight.toFixed(2)} kg` : "Brak"}
                />

                <InfoTile
                  label="Długość"
                  value={item.length ? `${item.length.toFixed(0)} cm` : "Brak"}
                />

                <InfoTile label="Przynęta" value={item.bait || "Brak"} />

                <InfoTile
                  label="Łowisko"
                  value={item.lakeName || "Nie przypisano"}
                />

                <InfoTile
                  label="Wyprawa"
                  value={item.tripTitle || "Nie przypisano"}
                />
              </div>

              {item.note && (
                <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {item.note}
                </p>
              )}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleStartEdit(item)}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Edytuj
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteCatch(item.id)}
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
            Brak połowów do wyświetlenia
          </p>

          <p className="mt-2 text-slate-500">
            Dodaj pierwszy połów albo zmień filtry.
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
        step={type === "number" ? "0.01" : undefined}
        min={type === "number" ? 0 : undefined}
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

function getMethodLabel(value: string) {
  return methods.find((item) => item.value === value)?.label || value;
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

function toDateTimeLocalValue(date: string) {
  const parsedDate = new Date(date);

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const hours = String(parsedDate.getHours()).padStart(2, "0");
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}