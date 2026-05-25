"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

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

type ApiResponse = {
  message?: string;
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

async function readApiResponse(response: Response) {
  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return {};
  }
}

export function GearPage({ initialGear }: GearPageProps) {
  const toast = useToast();

  const [gearItems, setGearItems] = useState<FishingGear[]>(initialGear);
  const [form, setForm] = useState<GearFormState>(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGearId, setEditingGearId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [areMobileFiltersOpen, setAreMobileFiltersOpen] = useState(false);

  const activeFiltersCount =
    Number(Boolean(search.trim())) +
    Number(categoryFilter !== "all") +
    Number(methodFilter !== "all") +
    Number(conditionFilter !== "all");

  function updateField<K extends keyof GearFormState>(
    field: K,
    value: GearFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreateForm() {
    setEditingGearId(null);
    setForm(initialFormState);
    setIsFormOpen(true);
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
    if (isLoading) {
      return;
    }

    setEditingGearId(null);
    setForm(initialFormState);
    setIsFormOpen(false);
  }

  function clearFilters() {
    setSearch("");
    setCategoryFilter("all");
    setMethodFilter("all");
    setConditionFilter("all");
    setAreMobileFiltersOpen(false);
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

  function validateForm() {
    if (!form.name.trim()) {
      toast.error({
        title: "Podaj nazwę sprzętu.",
        description: "Nazwa jest wymagana, żeby zapisać element ekwipunku.",
      });

      return false;
    }

    const quantity = Number(form.quantity);

    if (!Number.isFinite(quantity) || quantity < 1) {
      toast.error({
        title: "Podaj poprawną ilość.",
        description: "Ilość musi być liczbą większą lub równą 1.",
      });

      return false;
    }

    if (form.price.trim()) {
      const price = Number(form.price);

      if (!Number.isFinite(price) || price < 0) {
        toast.error({
          title: "Podaj poprawną cenę.",
          description: "Cena nie może być mniejsza niż 0.",
        });

        return false;
      }
    }

    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const isEditing = Boolean(editingGearId);

    const toastId = toast.loading({
      title: isEditing ? "Zapisywanie zmian..." : "Dodawanie sprzętu...",
      description: isEditing
        ? "Aktualizujemy element ekwipunku."
        : "Dodajemy nowy element do Twojego ekwipunku.",
    });

    const url = editingGearId ? `/api/gear/${editingGearId}` : "/api/gear";
    const method = editingGearId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as FishingGear & ApiResponse;

      if (!response.ok) {
        const errorMessage = data.message || "Nie udało się zapisać sprzętu.";

        toast.update(toastId, {
          type: "error",
          title: isEditing
            ? "Nie udało się zapisać zmian."
            : "Nie udało się dodać sprzętu.",
          description: errorMessage,
          duration: 6000,
        });

        setIsLoading(false);
        return;
      }

      const savedGear = data as FishingGear;

      if (editingGearId) {
        setGearItems((current) =>
          current.map((item) => (item.id === editingGearId ? savedGear : item))
        );
      } else {
        setGearItems((current) => [savedGear, ...current]);
      }

      setForm(initialFormState);
      setEditingGearId(null);
      setIsFormOpen(false);
      setIsLoading(false);

      toast.update(toastId, {
        type: "success",
        title: isEditing
          ? "Sprzęt został zaktualizowany."
          : "Sprzęt został dodany.",
        description: isEditing
          ? "Zmiany zostały zapisane w Twoim ekwipunku."
          : "Nowy element pojawił się w Twoim ekwipunku.",
        duration: 4500,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Wystąpił problem podczas zapisywania sprzętu.";

      toast.update(toastId, {
        type: "error",
        title: isEditing
          ? "Nie udało się zapisać zmian."
          : "Nie udało się dodać sprzętu.",
        description: errorMessage,
        duration: 6000,
      });

      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = confirm("Czy na pewno chcesz usunąć ten sprzęt?");

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading({
      title: "Usuwanie sprzętu...",
      description: "Usuwamy element z Twojego ekwipunku.",
    });

    try {
      const response = await fetch(`/api/gear/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await readApiResponse(response);

        toast.update(toastId, {
          type: "error",
          title: "Nie udało się usunąć sprzętu.",
          description: data.message || "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });

        return;
      }

      setGearItems((current) => current.filter((item) => item.id !== id));

      if (editingGearId === id) {
        handleCancelForm();
      }

      toast.update(toastId, {
        type: "success",
        title: "Sprzęt został usunięty.",
        description: "Element zniknął z Twojego ekwipunku.",
        duration: 4500,
      });
    } catch {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się usunąć sprzętu.",
        description: "Wystąpił problem z połączeniem. Spróbuj ponownie.",
        duration: 6000,
      });
    }
  }

  return (
    <div className="pb-28 md:pb-0">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Mój ekwipunek
          </h1>

          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500 sm:text-sm sm:leading-6">
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

            openCreateForm();
          }}
          className="rounded-2xl bg-blue-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:text-sm xl:w-auto"
        >
          {isFormOpen ? "Zamknij formularz" : "+ Dodaj sprzęt"}
        </button>
      </div>

      <section className="mb-6 -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4">
        <StatCard label="Elementy sprzętu" value={String(totalQuantity)} />

        <StatCard
          label="Szacowana wartość"
          value={totalValue > 0 ? `${totalValue.toFixed(0)} zł` : "Brak"}
        />

        <StatCard label="Na wyprawę" value={String(defaultItems)} />

        <StatCard label="Do sprawdzenia" value={String(toCheckItems)} />
      </section>

      {isFormOpen && (
        <>
          <section className="mb-6 hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:block">
            <GearForm
              form={form}
              editingGearId={editingGearId}
              isLoading={isLoading}
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
                    Ekwipunek
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    {editingGearId ? "Edytuj sprzęt" : "Dodaj sprzęt"}
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
                <GearForm
                  form={form}
                  editingGearId={editingGearId}
                  isLoading={isLoading}
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
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_220px_220px] xl:items-center">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Szukaj sprzętu..."
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
            className={`grid gap-3 xl:col-span-3 xl:grid xl:grid-cols-3 ${
              areMobileFiltersOpen ? "grid" : "hidden xl:grid"
            }`}
          >
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
        </div>
      </section>

      {filteredGear.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredGear.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    {getCategoryLabel(item.category)}
                  </p>

                  <h2 className="mt-2 break-words text-xl font-bold text-slate-950">
                    {item.name}
                  </h2>

                  {(item.brand || item.model) && (
                    <p className="mt-1 break-words text-sm text-slate-500">
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

              <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
                <button
                  type="button"
                  onClick={() => handleStartEdit(item)}
                  className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 sm:py-2.5"
                >
                  Edytuj
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
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
            🎒
          </div>

          <p className="mt-5 text-xl font-bold text-slate-950">
            Brak sprzętu do wyświetlenia
          </p>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Dodaj pierwszy element ekwipunku, żeby szybciej przygotowywać
            checklisty wypraw.
          </p>

          <button
            type="button"
            onClick={openCreateForm}
            className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
          >
            + Dodaj pierwszy sprzęt
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
        onClick={openCreateForm}
        className="fixed bottom-24 right-4 z-[900] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-3xl font-light leading-none text-white shadow-xl transition hover:bg-blue-700 md:hidden"
        aria-label="Dodaj sprzęt"
      >
        +
      </button>
    </div>
  );
}

function GearForm({
  form,
  editingGearId,
  isLoading,
  onSubmit,
  onCancel,
  onFieldChange,
  isMobile = false,
}: {
  form: GearFormState;
  editingGearId: string | null;
  isLoading: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onFieldChange: <K extends keyof GearFormState>(
    field: K,
    value: GearFormState[K]
  ) => void;
  isMobile?: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {!isMobile && (
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            {editingGearId ? "Edytuj sprzęt" : "Dodaj sprzęt"}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Uzupełnij podstawowe informacje o sprzęcie. Pola marki, modelu,
            ceny i daty są opcjonalne.
          </p>
        </div>
      )}

      <FormGroup
        title="Podstawowe"
        description="Nazwa, ilość i kategoria sprzętu."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Nazwa sprzętu"
            value={form.name}
            onChange={(value) => onFieldChange("name", value)}
            placeholder="np. Shimano Catana 3000"
            required
          />

          <Input
            label="Ilość"
            value={form.quantity}
            onChange={(value) => onFieldChange("quantity", value)}
            placeholder="np. 5"
            type="number"
            required
          />

          <Select
            label="Kategoria"
            value={form.category}
            onChange={(value) => onFieldChange("category", value)}
            options={categories}
          />
        </div>
      </FormGroup>

      <FormGroup title="Szczegóły" description="Marka, model i metoda łowienia.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Marka"
            value={form.brand}
            onChange={(value) => onFieldChange("brand", value)}
            placeholder="np. Shimano"
          />

          <Input
            label="Model"
            value={form.model}
            onChange={(value) => onFieldChange("model", value)}
            placeholder="np. Catana 3000"
          />

          <Select
            label="Metoda"
            value={form.fishingMethod}
            onChange={(value) => onFieldChange("fishingMethod", value)}
            options={fishingMethods}
          />
        </div>
      </FormGroup>

      <FormGroup title="Stan i wartość" description="Stan, status i cena sprzętu.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Select
            label="Stan"
            value={form.condition}
            onChange={(value) => onFieldChange("condition", value)}
            options={conditions}
          />

          <Select
            label="Status"
            value={form.status}
            onChange={(value) => onFieldChange("status", value)}
            options={statuses}
          />

          <Input
            label="Cena za sztukę"
            value={form.price}
            onChange={(value) => onFieldChange("price", value)}
            placeholder="np. 249"
            type="number"
          />

          <Input
            label="Data zakupu"
            value={form.purchaseDate}
            onChange={(value) => onFieldChange("purchaseDate", value)}
            type="date"
          />
        </div>
      </FormGroup>

      <FormGroup title="Notatka" description="Dodaj własne informacje o sprzęcie.">
        <textarea
          value={form.note}
          onChange={(event) => onFieldChange("note", event.target.value)}
          rows={4}
          placeholder="np. Do lekkiego spinningu, używany z plecionką 0.10."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />

        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(event) =>
              onFieldChange("isDefault", event.target.checked)
            }
            className="h-4 w-4 rounded border-slate-300 accent-blue-600"
          />

          <span className="text-sm font-semibold text-slate-700">
            Najczęściej zabieram na wyprawę
          </span>
        </label>
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
            : editingGearId
              ? "Zapisz zmiany"
              : "Dodaj sprzęt"}
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
    <div className="min-w-[185px] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:min-w-0 md:p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-3xl">
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
        min={type === "number" ? 1 : undefined}
        step={type === "number" ? "0.01" : undefined}
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

function ConditionBadge({ condition }: { condition: string }) {
  if (condition === "new" || condition === "very_good") {
    return (
      <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        {getConditionLabel(condition)}
      </span>
    );
  }

  if (condition === "to_check") {
    return (
      <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
        Do sprawdzenia
      </span>
    );
  }

  if (condition === "damaged") {
    return (
      <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
        Uszkodzony
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
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