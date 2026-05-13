"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ChecklistItem = {
  id: string;
  checklistId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string | null;
  isPacked: boolean;
  isImportant: boolean;
  source: string;
  gearId: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

type TripChecklist = {
  id: string;
  userId: string;
  title: string;
  tripType: string;
  status: string;
  note: string | null;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
};

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

type ChecklistsPageProps = {
  initialChecklists: TripChecklist[];
  gearItems: FishingGear[];
};

type ChecklistFormState = {
  title: string;
  tripType: string;
  note: string;
};

type ItemFormState = {
  name: string;
  category: string;
  quantity: string;
  unit: string;
  note: string;
  isImportant: boolean;
};

const initialChecklistForm: ChecklistFormState = {
  title: "",
  tripType: "custom",
  note: "",
};

const initialItemForm: ItemFormState = {
  name: "",
  category: "gear",
  quantity: "1",
  unit: "szt.",
  note: "",
  isImportant: false,
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

const itemCategories = [
  { label: "Sprzęt", value: "gear" },
  { label: "Zanęty i przynęty", value: "bait" },
  { label: "Akcesoria", value: "accessories" },
  { label: "Dokumenty", value: "documents" },
  { label: "Jedzenie i rzeczy osobiste", value: "personal" },
  { label: "Inne", value: "other" },
];

const checklistStatuses = [
  { label: "W przygotowaniu", value: "preparing" },
  { label: "Gotowa", value: "ready" },
  { label: "Zakończona", value: "finished" },
];

export function ChecklistsPage({
  initialChecklists,
  gearItems,
}: ChecklistsPageProps) {
  const router = useRouter();

  const [checklists, setChecklists] =
    useState<TripChecklist[]>(initialChecklists);

  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(
    initialChecklists[0]?.id ?? null
  );

  const [checklistForm, setChecklistForm] =
    useState<ChecklistFormState>(initialChecklistForm);

  const [itemForm, setItemForm] = useState<ItemFormState>(initialItemForm);
  const [selectedGearId, setSelectedGearId] = useState("");

  const [isChecklistFormOpen, setIsChecklistFormOpen] = useState(
    initialChecklists.length === 0
  );

  const [isLoading, setIsLoading] = useState(false);

  const selectedChecklist = useMemo(() => {
    return (
      checklists.find((checklist) => checklist.id === selectedChecklistId) ??
      null
    );
  }, [checklists, selectedChecklistId]);

  const packedItemsCount = selectedChecklist
    ? selectedChecklist.items.filter((item) => item.isPacked).length
    : 0;

  const allItemsCount = selectedChecklist?.items.length ?? 0;

  const importantItemsCount = selectedChecklist
    ? selectedChecklist.items.filter((item) => item.isImportant).length
    : 0;

  const progress =
    allItemsCount > 0 ? Math.round((packedItemsCount / allItemsCount) * 100) : 0;

  const groupedItems = useMemo(() => {
    if (!selectedChecklist) {
      return [];
    }

    return itemCategories
      .map((category) => ({
        ...category,
        items: selectedChecklist.items.filter(
          (item) => item.category === category.value
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [selectedChecklist]);

  function updateChecklistForm<K extends keyof ChecklistFormState>(
    field: K,
    value: ChecklistFormState[K]
  ) {
    setChecklistForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateItemForm<K extends keyof ItemFormState>(
    field: K,
    value: ItemFormState[K]
  ) {
    setItemForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateChecklistInState(updatedChecklist: TripChecklist) {
    setChecklists((current) =>
      current.map((checklist) =>
        checklist.id === updatedChecklist.id ? updatedChecklist : checklist
      )
    );
  }

  function updateItemInState(updatedItem: ChecklistItem) {
    setChecklists((current) =>
      current.map((checklist) => {
        if (checklist.id !== updatedItem.checklistId) {
          return checklist;
        }

        return {
          ...checklist,
          items: checklist.items.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          ),
        };
      })
    );
  }

  async function handleCreateChecklist(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);

    const response = await fetch("/api/checklists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checklistForm),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Nie udało się utworzyć checklisty.");
      setIsLoading(false);
      return;
    }

    setChecklists((current) => [data, ...current]);
    setSelectedChecklistId(data.id);
    setChecklistForm(initialChecklistForm);
    setIsChecklistFormOpen(false);
    setIsLoading(false);
    router.refresh();
  }

  async function handleDeleteChecklist(checklistId: string) {
    const confirmed = confirm("Czy na pewno chcesz usunąć tę checklistę?");

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/checklists/${checklistId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.message || "Nie udało się usunąć checklisty.");
      return;
    }

    const nextChecklists = checklists.filter(
      (checklist) => checklist.id !== checklistId
    );

    setChecklists(nextChecklists);
    setSelectedChecklistId(nextChecklists[0]?.id ?? null);
    router.refresh();
  }

  async function handleStatusChange(status: string) {
    if (!selectedChecklist) {
      return;
    }

    const response = await fetch(`/api/checklists/${selectedChecklist.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: selectedChecklist.title,
        tripType: selectedChecklist.tripType,
        status,
        note: selectedChecklist.note,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Nie udało się zmienić statusu.");
      return;
    }

    updateChecklistInState(data);
    router.refresh();
  }

  async function handleAddManualItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedChecklist) {
      alert("Najpierw utwórz checklistę.");
      return;
    }

    setIsLoading(true);

    const response = await fetch(`/api/checklists/${selectedChecklist.id}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...itemForm,
        source: "manual",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Nie udało się dodać elementu.");
      setIsLoading(false);
      return;
    }

    setChecklists((current) =>
      current.map((checklist) => {
        if (checklist.id !== selectedChecklist.id) {
          return checklist;
        }

        return {
          ...checklist,
          items: [...checklist.items, data],
        };
      })
    );

    setItemForm(initialItemForm);
    setIsLoading(false);
    router.refresh();
  }

  async function handleTogglePacked(item: ChecklistItem) {
    const response = await fetch(`/api/checklists/items/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        isPacked: !item.isPacked,
        isImportant: item.isImportant,
        note: item.note,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Nie udało się zaktualizować elementu.");
      return;
    }

    updateItemInState(data);
    router.refresh();
  }

  async function handleToggleImportant(item: ChecklistItem) {
    const response = await fetch(`/api/checklists/items/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        isPacked: item.isPacked,
        isImportant: !item.isImportant,
        note: item.note,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Nie udało się zaktualizować elementu.");
      return;
    }

    updateItemInState(data);
    router.refresh();
  }

  async function handleDeleteItem(itemId: string) {
    const confirmed = confirm("Usunąć ten element z checklisty?");

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/checklists/items/${itemId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.message || "Nie udało się usunąć elementu.");
      return;
    }

    setChecklists((current) =>
      current.map((checklist) => ({
        ...checklist,
        items: checklist.items.filter((item) => item.id !== itemId),
      }))
    );

    router.refresh();
  }

  async function handleAddDefaultGear() {
    if (!selectedChecklist) {
      alert("Najpierw utwórz checklistę.");
      return;
    }

    const response = await fetch(
      `/api/checklists/${selectedChecklist.id}/add-default-gear`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Nie udało się dodać domyślnego sprzętu.");
      return;
    }

    updateChecklistInState(data);
    router.refresh();
  }

  async function handleAddSelectedGear() {
    if (!selectedChecklist) {
      alert("Najpierw utwórz checklistę.");
      return;
    }

    const selectedGear = gearItems.find((item) => item.id === selectedGearId);

    if (!selectedGear) {
      alert("Wybierz sprzęt z listy.");
      return;
    }

    const response = await fetch(`/api/checklists/${selectedChecklist.id}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: selectedGear.name,
        category: "gear",
        quantity: selectedGear.quantity || 1,
        unit: "szt.",
        source: "gear",
        gearId: selectedGear.id,
        note: selectedGear.note,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Nie udało się dodać sprzętu.");
      return;
    }

    setChecklists((current) =>
      current.map((checklist) => {
        if (checklist.id !== selectedChecklist.id) {
          return checklist;
        }

        return {
          ...checklist,
          items: [...checklist.items, data],
        };
      })
    );

    setSelectedGearId("");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Checklisty wypraw
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Przygotuj sprzęt, zanęty, dokumenty i akcesoria przed wyjazdem.
            Korzystaj z własnego ekwipunku i odhaczaj rzeczy spakowane.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsChecklistFormOpen((current) => !current)}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          {isChecklistFormOpen ? "Zamknij formularz" : "+ Nowa checklista"}
        </button>
      </div>

      {isChecklistFormOpen && (
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Nowa checklista
          </h2>

          <form onSubmit={handleCreateChecklist} className="mt-5 space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <Input
                label="Nazwa checklisty"
                value={checklistForm.title}
                onChange={(value) => updateChecklistForm("title", value)}
                placeholder="np. Method feeder — Jezioro Ukiel"
                required
              />

              <Select
                label="Typ wyprawy"
                value={checklistForm.tripType}
                onChange={(value) => updateChecklistForm("tripType", value)}
                options={tripTypes}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Notatka
              </label>

              <textarea
                value={checklistForm.note}
                onChange={(event) =>
                  updateChecklistForm("note", event.target.value)
                }
                rows={3}
                placeholder="np. Nocka na stanowisku 4, zabrać dodatkową latarkę."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setChecklistForm(initialChecklistForm);
                  setIsChecklistFormOpen(false);
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
                {isLoading ? "Tworzenie..." : "Utwórz checklistę"}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-950">Moje checklisty</h2>

            <div className="mt-4 space-y-2">
              {checklists.length > 0 ? (
                checklists.map((checklist) => (
                  <button
                    key={checklist.id}
                    type="button"
                    onClick={() => setSelectedChecklistId(checklist.id)}
                    className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                      selectedChecklistId === checklist.id
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <p className="font-bold">{checklist.title}</p>

                    <div className="mt-2 flex items-center justify-between gap-3 text-xs font-semibold">
                      <span>{getTripTypeLabel(checklist.tripType)}</span>
                      <span>{checklist.items.length} rzeczy</span>
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState
                  title="Brak checklist"
                  description="Utwórz pierwszą checklistę przed wyprawą."
                />
              )}
            </div>
          </section>

          {selectedChecklist && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-950">Szybkie akcje</h2>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={handleAddDefaultGear}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Dodaj domyślny sprzęt
                </button>

                <div className="rounded-2xl bg-slate-50 p-3">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Dodaj z ekwipunku
                  </label>

                  <select
                    value={selectedGearId}
                    onChange={(event) => setSelectedGearId(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                  >
                    <option value="">Wybierz sprzęt</option>
                    {gearItems.map((gear) => (
                      <option key={gear.id} value={gear.id}>
                        {gear.name} x{gear.quantity || 1}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddSelectedGear}
                    className="mt-3 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                  >
                    Dodaj wybrany sprzęt
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteChecklist(selectedChecklist.id)}
                  className="w-full rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Usuń checklistę
                </button>
              </div>
            </section>
          )}
        </aside>

        <main className="space-y-6">
          {selectedChecklist ? (
            <>
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <StatusBadge status={selectedChecklist.status} />

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {getTripTypeLabel(selectedChecklist.tripType)}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-950">
                      {selectedChecklist.title}
                    </h2>

                    {selectedChecklist.note && (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {selectedChecklist.note}
                      </p>
                    )}
                  </div>

                  <select
                    value={selectedChecklist.status}
                    onChange={(event) => handleStatusChange(event.target.value)}
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500"
                  >
                    {checklistStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <StatCard
                    label="Spakowane"
                    value={`${packedItemsCount}/${allItemsCount}`}
                  />
                  <StatCard
                    label="Brakuje"
                    value={String(allItemsCount - packedItemsCount)}
                  />
                  <StatCard
                    label="Priorytetowe"
                    value={String(importantItemsCount)}
                  />
                  <StatCard label="Gotowość" value={`${progress}%`} />
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-950">
                  Dodaj element ręcznie
                </h2>

                <form onSubmit={handleAddManualItem} className="mt-5 space-y-5">
                  <div className="grid gap-5 lg:grid-cols-2">
                    <Input
                      label="Nazwa elementu"
                      value={itemForm.name}
                      onChange={(value) => updateItemForm("name", value)}
                      placeholder="np. Pellet 2 mm"
                      required
                    />

                    <Select
                      label="Kategoria"
                      value={itemForm.category}
                      onChange={(value) => updateItemForm("category", value)}
                      options={itemCategories}
                    />

                    <Input
                      label="Ilość"
                      value={itemForm.quantity}
                      onChange={(value) => updateItemForm("quantity", value)}
                      placeholder="np. 2"
                      type="number"
                      required
                    />

                    <Input
                      label="Jednostka"
                      value={itemForm.unit}
                      onChange={(value) => updateItemForm("unit", value)}
                      placeholder="np. szt. / kg / op."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Notatka
                    </label>

                    <textarea
                      value={itemForm.note}
                      onChange={(event) =>
                        updateItemForm("note", event.target.value)
                      }
                      rows={3}
                      placeholder="np. Koniecznie zapakować do bocznej kieszeni."
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <input
                      type="checkbox"
                      checked={itemForm.isImportant}
                      onChange={(event) =>
                        updateItemForm("isImportant", event.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />

                    <span className="text-sm font-semibold text-slate-700">
                      Oznacz jako priorytetowe
                    </span>
                  </label>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? "Dodawanie..." : "Dodaj element"}
                    </button>
                  </div>
                </form>
              </section>

              <section className="space-y-5">
                {selectedChecklist.items.length > 0 ? (
                  groupedItems.map((group) => (
                    <div
                      key={group.value}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <h2 className="text-xl font-bold text-slate-950">
                        {group.label}
                      </h2>

                      <div className="mt-5 space-y-3">
                        {group.items.map((item) => (
                          <ChecklistItemRow
                            key={item.id}
                            item={item}
                            onTogglePacked={() => handleTogglePacked(item)}
                            onToggleImportant={() =>
                              handleToggleImportant(item)
                            }
                            onDelete={() => handleDeleteItem(item.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <p className="text-xl font-bold text-slate-950">
                      Brak elementów
                    </p>

                    <p className="mt-2 text-slate-500">
                      Dodaj element ręcznie albo użyj sprzętu z ekwipunku.
                    </p>
                  </section>
                )}
              </section>
            </>
          ) : (
            <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-xl font-bold text-slate-950">
                Wybierz lub utwórz checklistę
              </p>

              <p className="mt-2 text-slate-500">
                Po utworzeniu checklisty możesz dodawać elementy i odhaczać
                rzeczy spakowane na wyprawę.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function ChecklistItemRow({
  item,
  onTogglePacked,
  onToggleImportant,
  onDelete,
}: {
  item: ChecklistItem;
  onTogglePacked: () => void;
  onToggleImportant: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        item.isPacked
          ? "border-emerald-100 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={item.isPacked}
            onChange={onTogglePacked}
            className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600"
          />

          <div>
            <p
              className={`font-bold ${
                item.isPacked ? "text-emerald-800 line-through" : "text-slate-950"
              }`}
            >
              {item.name}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                Ilość: {item.quantity} {item.unit || ""}
              </span>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                {item.source === "gear" ? "Z ekwipunku" : "Ręcznie"}
              </span>

              {item.isImportant && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  Priorytet
                </span>
              )}
            </div>

            {item.note && (
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item.note}
              </p>
            )}
          </div>
        </label>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onToggleImportant}
            className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-amber-600 transition hover:bg-amber-50"
          >
            {item.isImportant ? "Usuń priorytet" : "Priorytet"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
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

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 text-center">
      <p className="font-bold text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "ready") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        Gotowa
      </span>
    );
  }

  if (status === "finished") {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
        Zakończona
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
      W przygotowaniu
    </span>
  );
}

function getTripTypeLabel(value: string) {
  return tripTypes.find((item) => item.value === value)?.label || value;
}