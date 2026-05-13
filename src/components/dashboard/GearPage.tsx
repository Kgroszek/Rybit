"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FishingGear = {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  category: string;
  brand: string | null;
  model: string | null;
  fishingMethod: string;
  condition: string;
  status: string;
  price: number | null;
  purchaseDate: string | null;
  note: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type GearPageProps = {
  initialGear: FishingGear[];
};

type GearFormState = {
  name: string;
  quantity: string;
  category: string;
  brand: string;
  model: string;
  fishingMethod: string;
  condition: string;
  status: string;
  price: string;
  purchaseDate: string;
  note: string;
  isDefault: boolean;
};

const initialFormState: GearFormState = {
  name: "",
  quantity: "1",
  category: "rod",
  brand: "",
  model: "",
  fishingMethod: "spinning",
  condition: "good",
  status: "active",
  price: "",
  purchaseDate: "",
  note: "",
  isDefault: false,
};

const categories = [
  { label: "Wędki", value: "rod" },
  { label: "Kołowrotki", value: "reel" },
  { label: "Żyłki i plecionki", value: "line" },
  { label: "Przynęty", value: "bait" },
  { label: "Haczyki i zestawy", value: "rigs" },
  { label: "Akcesoria", value: "accessories" },
  { label: "Odzież", value: "clothing" },
  { label: "Elektronika", value: "electronics" },
  { label: "Torby i pudełka", value: "bags" },
  { label: "Inne", value: "other" },
];

const fishingMethods = [
  { label: "Spinning", value: "spinning" },
  { label: "Feeder", value: "feeder" },
  { label: "Method feeder", value: "method_feeder" },
  { label: "Karpiówka", value: "carp" },
  { label: "Spławik", value: "float" },
  { label: "Muchówka", value: "fly" },
  { label: "Uniwersalne", value: "universal" },
];

const conditions = [
  { label: "Nowy", value: "new" },
  { label: "Bardzo dobry", value: "very_good" },
  { label: "Dobry", value: "good" },
  { label: "Do sprawdzenia", value: "to_check" },
  { label: "Uszkodzony", value: "damaged" },
];

const statuses = [
  { label: "Aktywny", value: "active" },
  { label: "Do sprawdzenia", value: "to_check" },
  { label: "W naprawie", value: "repair" },
  { label: "Nieużywany", value: "inactive" },
];

export function GearPage({ initialGear }: GearPageProps) {
  const router = useRouter();

  const [gearItems, setGearItems] = useState<FishingGear[]>(initialGear);
  const [form, setForm] = useState<GearFormState>(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGearId, setEditingGearId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");

  function updateField<K extends keyof GearFormState>(
    field: K,
    value: GearFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleStartEdit(item: FishingGear) {
    setEditingGearId(item.id);

    setForm({
      name: item.name,
      quantity: String(item.quantity || 1),
      category: item.category,
      brand: item.brand || "",
      model: item.model || "",
      fishingMethod: item.fishingMethod,
      condition: item.condition,
      status: item.status,
      price: item.price !== null ? String(item.price) : "",
      purchaseDate: item.purchaseDate ? item.purchaseDate.slice(0, 10) : "",
      note: item.note || "",
      isDefault: item.isDefault,
    });

    setIsFormOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleCancelForm() {
    setEditingGearId(null);
    setForm(initialFormState);
    setIsFormOpen(false);
  }

  const filteredGear = useMemo(() => {
    return gearItems.filter((item) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        item.name.toLowerCase().includes(searchValue) ||
        item.brand?.toLowerCase().includes(searchValue) ||
        item.model?.toLowerCase().includes(searchValue) ||
        item.note?.toLowerCase().includes(searchValue);

      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      const matchesMethod =
        methodFilter === "all" || item.fishingMethod === methodFilter;

      const matchesCondition =
        conditionFilter === "all" || item.condition === conditionFilter;

      return (
        matchesSearch && matchesCategory && matchesMethod && matchesCondition
      );
    });
  }, [gearItems, search, categoryFilter, methodFilter, conditionFilter]);

  const totalQuantity = gearItems.reduce((sum, item) => {
    return sum + (item.quantity || 1);
  }, 0);

  const totalValue = gearItems.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 1);
  }, 0);

  const defaultItems = gearItems.reduce((sum, item) => {
    if (!item.isDefault) {
      return sum;
    }

    return sum + (item.quantity || 1);
  }, 0);

  const toCheckItems = gearItems.reduce((sum, item) => {
    if (item.condition === "to_check" || item.status === "to_check") {
      return sum + (item.quantity || 1);
    }

    return sum;
  }, 0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);

    const url = editingGearId ? `/api/gear/${editingGearId}` : "/api/gear";
    const method = editingGearId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Nie udało się zapisać sprzętu.");
      setIsLoading(false);
      return;
    }

    if (editingGearId) {
      setGearItems((current) =>
        current.map((item) => (item.id === editingGearId ? data : item))
      );
    } else {
      setGearItems((current) => [data, ...current]);
    }

    setForm(initialFormState);
    setEditingGearId(null);
    setIsFormOpen(false);
    setIsLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const confirmed = confirm("Czy na pewno chcesz usunąć ten sprzęt?");

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/gear/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.message || "Nie udało się usunąć sprzętu.");
      return;
    }

    setGearItems((current) => current.filter((item) => item.id !== id));

    if (editingGearId === id) {
      handleCancelForm();
    }

    router.refresh();
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Mój ekwipunek
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Zarządzaj sprzętem, kontroluj jego stan i przygotuj bazę pod
            przyszłe checklisty wypraw.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isFormOpen) {
              handleCancelForm();
              return;
            }

            setEditingGearId(null);
            setForm(initialFormState);
            setIsFormOpen(true);
          }}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          {isFormOpen ? "Zamknij formularz" : "+ Dodaj sprzęt"}
        </button>
      </div>

      <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cały sprzęt" value={String(totalQuantity)} />
        <StatCard label="Gotowe na wyprawę" value={String(defaultItems)} />
        <StatCard label="Do sprawdzenia" value={String(toCheckItems)} />
        <StatCard
          label="Wartość sprzętu"
          value={`${totalValue.toFixed(0)} zł`}
        />
      </section>

      {isFormOpen && (
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            {editingGearId ? "Edytuj sprzęt" : "Dodaj sprzęt"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <Input
                label="Nazwa sprzętu"
                value={form.name}
                onChange={(value) => updateField("name", value)}
                placeholder="np. Shimano Catana 3000"
                required
              />

              <Input
                label="Ilość"
                value={form.quantity}
                onChange={(value) => updateField("quantity", value)}
                placeholder="np. 5"
                type="number"
                required
              />

              <Select
                label="Kategoria"
                value={form.category}
                onChange={(value) => updateField("category", value)}
                options={categories}
              />

              <Input
                label="Marka"
                value={form.brand}
                onChange={(value) => updateField("brand", value)}
                placeholder="np. Shimano"
              />

              <Input
                label="Model"
                value={form.model}
                onChange={(value) => updateField("model", value)}
                placeholder="np. Catana 3000"
              />

              <Select
                label="Metoda łowienia"
                value={form.fishingMethod}
                onChange={(value) => updateField("fishingMethod", value)}
                options={fishingMethods}
              />

              <Select
                label="Stan"
                value={form.condition}
                onChange={(value) => updateField("condition", value)}
                options={conditions}
              />

              <Select
                label="Status"
                value={form.status}
                onChange={(value) => updateField("status", value)}
                options={statuses}
              />

              <Input
                label="Cena / wartość za sztukę"
                value={form.price}
                onChange={(value) => updateField("price", value)}
                placeholder="np. 249"
                type="number"
              />

              <Input
                label="Data zakupu"
                value={form.purchaseDate}
                onChange={(value) => updateField("purchaseDate", value)}
                type="date"
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
                placeholder="np. Do lekkiego spinningu, używany z plecionką 0.10."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(event) =>
                  updateField("isDefault", event.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />

              <span className="text-sm font-semibold text-slate-700">
                Najczęściej zabieram na wyprawę
              </span>
            </label>

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
                  : editingGearId
                    ? "Zapisz zmiany"
                    : "Dodaj sprzęt"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_180px_180px_180px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Szukaj po nazwie, marce, modelu lub notatce..."
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500"
          />

          <FilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { label: "Wszystkie kategorie", value: "all" },
              ...categories,
            ]}
          />

          <FilterSelect
            value={methodFilter}
            onChange={setMethodFilter}
            options={[
              { label: "Wszystkie metody", value: "all" },
              ...fishingMethods,
            ]}
          />

          <FilterSelect
            value={conditionFilter}
            onChange={setConditionFilter}
            options={[
              { label: "Wszystkie stany", value: "all" },
              ...conditions,
            ]}
          />
        </div>
      </section>

      {filteredGear.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filteredGear.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    {getCategoryLabel(item.category)}
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-950">
                    {item.name}
                  </h2>

                  {(item.brand || item.model) && (
                    <p className="mt-1 text-sm text-slate-500">
                      {[item.brand, item.model].filter(Boolean).join(" • ")}
                    </p>
                  )}
                </div>

                <ConditionBadge condition={item.condition} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoTile label="Ilość" value={String(item.quantity || 1)} />

                <InfoTile
                  label="Metoda"
                  value={getFishingMethodLabel(item.fishingMethod)}
                />

                <InfoTile label="Status" value={getStatusLabel(item.status)} />

                <InfoTile
                  label="Wartość"
                  value={
                    item.price
                      ? `${(item.price * (item.quantity || 1)).toFixed(0)} zł`
                      : "Brak"
                  }
                />

                <InfoTile
                  label="Cena za szt."
                  value={item.price ? `${item.price.toFixed(0)} zł` : "Brak"}
                />

                <InfoTile
                  label="Na wyprawę"
                  value={item.isDefault ? "Tak" : "Nie"}
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
                  onClick={() => handleDelete(item.id)}
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
            Brak sprzętu do wyświetlenia
          </p>

          <p className="mt-2 text-slate-500">
            Dodaj pierwszy element ekwipunku albo zmień filtry.
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
        min={type === "number" ? 1 : undefined}
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

function ConditionBadge({ condition }: { condition: string }) {
  if (condition === "new" || condition === "very_good") {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        {getConditionLabel(condition)}
      </span>
    );
  }

  if (condition === "to_check") {
    return (
      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
        Do sprawdzenia
      </span>
    );
  }

  if (condition === "damaged") {
    return (
      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
        Uszkodzony
      </span>
    );
  }

  return (
    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
      {getConditionLabel(condition)}
    </span>
  );
}

function getCategoryLabel(value: string) {
  return categories.find((item) => item.value === value)?.label || value;
}

function getFishingMethodLabel(value: string) {
  return fishingMethods.find((item) => item.value === value)?.label || value;
}

function getConditionLabel(value: string) {
  return conditions.find((item) => item.value === value)?.label || value;
}

function getStatusLabel(value: string) {
  return statuses.find((item) => item.value === value)?.label || value;
}