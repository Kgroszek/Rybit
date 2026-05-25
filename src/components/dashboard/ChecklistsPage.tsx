"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

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
  initialSelectedChecklistId?: string | null;
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

type ApiResponse = {
  message?: string;
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

async function readApiResponse(response: Response) {
  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return {};
  }
}

export function ChecklistsPage({
  initialChecklists,
  gearItems,
  initialSelectedChecklistId = null,
}: ChecklistsPageProps) {
  const router = useRouter();
  const toast = useToast();

  const initialActiveChecklistExists = initialChecklists.some(
    (checklist) => checklist.id === initialSelectedChecklistId
  );

  const [checklists, setChecklists] =
    useState<TripChecklist[]>(initialChecklists);

  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(
    initialActiveChecklistExists
      ? initialSelectedChecklistId
      : initialChecklists[0]?.id ?? null
  );

  const [checklistForm, setChecklistForm] =
    useState<ChecklistFormState>(initialChecklistForm);

  const [itemForm, setItemForm] = useState<ItemFormState>(initialItemForm);
  const [selectedGearId, setSelectedGearId] = useState("");

  const [isChecklistFormOpen, setIsChecklistFormOpen] = useState(
    initialChecklists.length === 0
  );
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [areMobileActionsOpen, setAreMobileActionsOpen] = useState(false);

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

  const missingItemsCount = Math.max(allItemsCount - packedItemsCount, 0);

  const progress =
    allItemsCount > 0 ? Math.round((packedItemsCount / allItemsCount) * 100) : 0;

  const allChecklistsItemsCount = checklists.reduce(
    (sum, checklist) => sum + checklist.items.length,
    0
  );

  const allPackedItemsCount = checklists.reduce((sum, checklist) => {
    return sum + checklist.items.filter((item) => item.isPacked).length;
  }, 0);

  const activeChecklist =
    checklists.find((checklist) => checklist.status !== "finished") ??
    checklists[0] ??
    null;

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

  function openCreateChecklistForm() {
    setChecklistForm(initialChecklistForm);
    setIsChecklistFormOpen(true);
  }

  function closeChecklistForm() {
    if (isLoading) {
      return;
    }

    setChecklistForm(initialChecklistForm);
    setIsChecklistFormOpen(false);
  }

  function openItemForm() {
    if (!selectedChecklist) {
      toast.error({
        title: "Najpierw utwórz checklistę.",
        description: "Dopiero potem możesz dodawać rzeczy do spakowania.",
      });

      return;
    }

    setItemForm(initialItemForm);
    setIsItemFormOpen(true);
  }

  function closeItemForm() {
    if (isLoading) {
      return;
    }

    setItemForm(initialItemForm);
    setIsItemFormOpen(false);
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

    if (!checklistForm.title.trim()) {
      toast.error({
        title: "Podaj nazwę checklisty.",
        description: "Nazwa jest wymagana, żeby utworzyć checklistę.",
      });

      return;
    }

    setIsLoading(true);

    const toastId = toast.loading({
      title: "Tworzenie checklisty...",
      description: "Przygotowujemy nową listę do wyprawy.",
    });

    try {
      const response = await fetch("/api/checklists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checklistForm),
      });

      const data = (await response.json()) as TripChecklist & ApiResponse;

      if (!response.ok) {
        toast.update(toastId, {
          type: "error",
          title: "Nie udało się utworzyć checklisty.",
          description: data.message || "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });

        setIsLoading(false);
        return;
      }

      setChecklists((current) => [data, ...current]);
      setSelectedChecklistId(data.id);
      setChecklistForm(initialChecklistForm);
      setIsChecklistFormOpen(false);

      toast.update(toastId, {
        type: "success",
        title: "Checklista została utworzona.",
        description: "Możesz teraz dodać rzeczy do spakowania.",
        duration: 4500,
      });

      router.refresh();
    } catch {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się utworzyć checklisty.",
        description: "Wystąpił problem z połączeniem. Spróbuj ponownie.",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteChecklist(checklistId: string) {
    const confirmed = confirm("Czy na pewno chcesz usunąć tę checklistę?");

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading({
      title: "Usuwanie checklisty...",
      description: "Usuwamy listę z Twoich checklist.",
    });

    try {
      const response = await fetch(`/api/checklists/${checklistId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await readApiResponse(response);

        toast.update(toastId, {
          type: "error",
          title: "Nie udało się usunąć checklisty.",
          description: data.message || "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });

        return;
      }

      const nextChecklists = checklists.filter(
        (checklist) => checklist.id !== checklistId
      );

      setChecklists(nextChecklists);
      setSelectedChecklistId(nextChecklists[0]?.id ?? null);

      toast.update(toastId, {
        type: "success",
        title: "Checklista została usunięta.",
        description: "Lista zniknęła z Twoich checklist.",
        duration: 4500,
      });

      router.refresh();
    } catch {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się usunąć checklisty.",
        description: "Wystąpił problem z połączeniem. Spróbuj ponownie.",
        duration: 6000,
      });
    }
  }

  async function handleStatusChange(status: string) {
    if (!selectedChecklist) {
      return;
    }

    try {
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

      const data = (await response.json()) as TripChecklist & ApiResponse;

      if (!response.ok) {
        toast.error({
          title: "Nie udało się zmienić statusu.",
          description: data.message || "Spróbuj ponownie za chwilę.",
        });

        return;
      }

      updateChecklistInState(data);

      toast.success({
        title: "Status checklisty został zmieniony.",
        description: `Nowy status: ${getChecklistStatusLabel(status)}.`,
      });

      router.refresh();
    } catch {
      toast.error({
        title: "Nie udało się zmienić statusu.",
        description: "Wystąpił problem z połączeniem. Spróbuj ponownie.",
      });
    }
  }

  async function handleAddManualItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedChecklist) {
      toast.error({
        title: "Najpierw utwórz checklistę.",
        description: "Dopiero potem możesz dodawać elementy.",
      });

      return;
    }

    if (!itemForm.name.trim()) {
      toast.error({
        title: "Podaj nazwę elementu.",
        description: "Wpisz rzecz, którą chcesz dodać do checklisty.",
      });

      return;
    }

    const quantity = Number(itemForm.quantity);

    if (!Number.isFinite(quantity) || quantity < 1) {
      toast.error({
        title: "Podaj poprawną ilość.",
        description: "Ilość musi być liczbą większą lub równą 1.",
      });

      return;
    }

    setIsLoading(true);

    const toastId = toast.loading({
      title: "Dodawanie elementu...",
      description: "Dodajemy rzecz do checklisty.",
    });

    try {
      const response = await fetch(
        `/api/checklists/${selectedChecklist.id}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...itemForm,
            source: "manual",
          }),
        }
      );

      const data = (await response.json()) as ChecklistItem & ApiResponse;

      if (!response.ok) {
        toast.update(toastId, {
          type: "error",
          title: "Nie udało się dodać elementu.",
          description: data.message || "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });

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
      setIsItemFormOpen(false);

      toast.update(toastId, {
        type: "success",
        title: "Element został dodany.",
        description: "Rzecz pojawiła się na Twojej checkliście.",
        duration: 3500,
      });

      router.refresh();
    } catch {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się dodać elementu.",
        description: "Wystąpił problem z połączeniem. Spróbuj ponownie.",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTogglePacked(item: ChecklistItem) {
    try {
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

      const data = (await response.json()) as ChecklistItem & ApiResponse;

      if (!response.ok) {
        toast.error({
          title: "Nie udało się zaktualizować elementu.",
          description: data.message || "Spróbuj ponownie za chwilę.",
        });

        return;
      }

      updateItemInState(data);
      router.refresh();
    } catch {
      toast.error({
        title: "Nie udało się zaktualizować elementu.",
        description: "Wystąpił problem z połączeniem. Spróbuj ponownie.",
      });
    }
  }

  async function handleToggleImportant(item: ChecklistItem) {
    try {
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

      const data = (await response.json()) as ChecklistItem & ApiResponse;

      if (!response.ok) {
        toast.error({
          title: "Nie udało się zaktualizować priorytetu.",
          description: data.message || "Spróbuj ponownie za chwilę.",
        });

        return;
      }

      updateItemInState(data);
      router.refresh();
    } catch {
      toast.error({
        title: "Nie udało się zaktualizować priorytetu.",
        description: "Wystąpił problem z połączeniem. Spróbuj ponownie.",
      });
    }
  }

  async function handleDeleteItem(itemId: string) {
    const confirmed = confirm("Usunąć ten element z checklisty?");

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading({
      title: "Usuwanie elementu...",
      description: "Usuwamy rzecz z checklisty.",
    });

    try {
      const response = await fetch(`/api/checklists/items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await readApiResponse(response);

        toast.update(toastId, {
          type: "error",
          title: "Nie udało się usunąć elementu.",
          description: data.message || "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });

        return;
      }

      setChecklists((current) =>
        current.map((checklist) => ({
          ...checklist,
          items: checklist.items.filter((item) => item.id !== itemId),
        }))
      );

      toast.update(toastId, {
        type: "success",
        title: "Element został usunięty.",
        description: "Rzecz zniknęła z checklisty.",
        duration: 3500,
      });

      router.refresh();
    } catch {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się usunąć elementu.",
        description: "Wystąpił problem z połączeniem. Spróbuj ponownie.",
        duration: 6000,
      });
    }
  }

  async function handleAddDefaultGear() {
    if (!selectedChecklist) {
      toast.error({
        title: "Najpierw utwórz checklistę.",
        description: "Dopiero potem możesz dodać domyślny sprzęt.",
      });

      return;
    }

    const toastId = toast.loading({
      title: "Dodawanie domyślnego sprzętu...",
      description: "Dodajemy sprzęt oznaczony jako zabierany na wyprawę.",
    });

    try {
      const response = await fetch(
        `/api/checklists/${selectedChecklist.id}/add-default-gear`,
        {
          method: "POST",
        }
      );

      const data = (await response.json()) as TripChecklist & ApiResponse;

      if (!response.ok) {
        toast.update(toastId, {
          type: "error",
          title: "Nie udało się dodać sprzętu.",
          description: data.message || "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });

        return;
      }

      updateChecklistInState(data);

      toast.update(toastId, {
        type: "success",
        title: "Domyślny sprzęt został dodany.",
        description: "Elementy pojawiły się na checkliście.",
        duration: 4500,
      });

      router.refresh();
    } catch {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się dodać sprzętu.",
        description: "Wystąpił problem z połączeniem. Spróbuj ponownie.",
        duration: 6000,
      });
    }
  }

  async function handleAddSelectedGear() {
    if (!selectedChecklist) {
      toast.error({
        title: "Najpierw utwórz checklistę.",
        description: "Dopiero potem możesz dodawać sprzęt.",
      });

      return;
    }

    const selectedGear = gearItems.find((item) => item.id === selectedGearId);

    if (!selectedGear) {
      toast.error({
        title: "Wybierz sprzęt z listy.",
        description: "Najpierw wybierz element ekwipunku.",
      });

      return;
    }

    const toastId = toast.loading({
      title: "Dodawanie sprzętu...",
      description: "Dodajemy wybrany element do checklisty.",
    });

    try {
      const response = await fetch(
        `/api/checklists/${selectedChecklist.id}/items`,
        {
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
        }
      );

      const data = (await response.json()) as ChecklistItem & ApiResponse;

      if (!response.ok) {
        toast.update(toastId, {
          type: "error",
          title: "Nie udało się dodać sprzętu.",
          description: data.message || "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });

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

      toast.update(toastId, {
        type: "success",
        title: "Sprzęt został dodany.",
        description: "Element pojawił się na checkliście.",
        duration: 3500,
      });

      router.refresh();
    } catch {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się dodać sprzętu.",
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
            Checklisty wypraw
          </h1>

          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500 sm:text-sm sm:leading-6">
            Przygotuj sprzęt, zanęty, dokumenty i akcesoria przed wyjazdem.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateChecklistForm}
          className="rounded-2xl bg-blue-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:text-sm"
        >
          + Nowa checklista
        </button>
      </div>

      <section className="mb-6 -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4">
        <StatCard label="Checklisty" value={String(checklists.length)} />
        <StatCard label="Wszystkie rzeczy" value={String(allChecklistsItemsCount)} />
        <StatCard label="Spakowane" value={String(allPackedItemsCount)} />
        <StatCard
          label="W wybranej brakuje"
          value={selectedChecklist ? String(missingItemsCount) : "Brak"}
        />
      </section>

      {activeChecklist && (
        <section className="mb-6 rounded-3xl border border-blue-100 bg-blue-50 p-5 shadow-sm md:hidden">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Aktywna checklista
          </p>

          <h2 className="mt-2 text-xl font-black text-slate-950">
            {activeChecklist.title}
          </h2>

          <p className="mt-1 text-sm font-semibold text-slate-600">
            {activeChecklist.items.filter((item) => item.isPacked).length} /{" "}
            {activeChecklist.items.length} rzeczy gotowe
          </p>

          <button
            type="button"
            onClick={() => setSelectedChecklistId(activeChecklist.id)}
            className="mt-4 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Otwórz checklistę
          </button>
        </section>
      )}

      {isChecklistFormOpen && (
        <>
          <section className="mb-6 hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:block">
            <ChecklistForm
              form={checklistForm}
              isLoading={isLoading}
              onSubmit={handleCreateChecklist}
              onCancel={closeChecklistForm}
              onFieldChange={updateChecklistForm}
            />
          </section>

          <MobileSheet
            title="Nowa checklista"
            eyebrow="Checklisty"
            isOpen={isChecklistFormOpen}
            onClose={closeChecklistForm}
          >
            <ChecklistForm
              form={checklistForm}
              isLoading={isLoading}
              onSubmit={handleCreateChecklist}
              onCancel={closeChecklistForm}
              onFieldChange={updateChecklistForm}
              isMobile
            />
          </MobileSheet>
        </>
      )}

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold text-slate-950">Moje checklisty</h2>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                {checklists.length}
              </span>
            </div>

            <div className="mt-4 md:hidden">
              {checklists.length > 0 ? (
                <select
                  value={selectedChecklistId || ""}
                  onChange={(event) => setSelectedChecklistId(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500"
                >
                  {checklists.map((checklist) => (
                    <option key={checklist.id} value={checklist.id}>
                      {checklist.title}
                    </option>
                  ))}
                </select>
              ) : (
                <EmptyState
                  title="Brak checklist"
                  description="Utwórz pierwszą checklistę przed wyprawą."
                >
                  <button
                    type="button"
                    onClick={openCreateChecklistForm}
                    className="mt-4 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    + Utwórz checklistę
                  </button>
                </EmptyState>
              )}
            </div>

            <div className="mt-4 hidden space-y-2 md:block">
              {checklists.length > 0 ? (
                checklists.map((checklist) => {
                  const checklistPackedItems = checklist.items.filter(
                    (item) => item.isPacked
                  ).length;

                  const checklistProgress =
                    checklist.items.length > 0
                      ? Math.round(
                          (checklistPackedItems / checklist.items.length) * 100
                        )
                      : 0;

                  return (
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
                        <span>
                          {checklistPackedItems}/{checklist.items.length}
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{ width: `${checklistProgress}%` }}
                        />
                      </div>
                    </button>
                  );
                })
              ) : (
                <EmptyState
                  title="Brak checklist"
                  description="Utwórz pierwszą checklistę przed wyprawą."
                />
              )}
            </div>
          </section>

          {selectedChecklist && (
            <section className="hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:block">
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
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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

                <div className="mt-6 -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0">
                  <StatCard
                    label="Spakowane"
                    value={`${packedItemsCount}/${allItemsCount}`}
                  />
                  <StatCard label="Brakuje" value={String(missingItemsCount)} />
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

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={openItemForm}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    + Dodaj rzecz
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAreMobileActionsOpen((current) => !current)
                    }
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:hidden"
                  >
                    {areMobileActionsOpen ? "Ukryj akcje" : "Pokaż szybkie akcje"}
                  </button>
                </div>

                {areMobileActionsOpen && (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 md:hidden">
                    <div className="grid gap-3">
                      <button
                        type="button"
                        onClick={handleAddDefaultGear}
                        className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Dodaj domyślny sprzęt
                      </button>

                      <select
                        value={selectedGearId}
                        onChange={(event) =>
                          setSelectedGearId(event.target.value)
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none"
                      >
                        <option value="">Wybierz sprzęt z ekwipunku</option>

                        {gearItems.map((gear) => (
                          <option key={gear.id} value={gear.id}>
                            {gear.name} x{gear.quantity || 1}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleAddSelectedGear}
                        className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        Dodaj wybrany sprzęt
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteChecklist(selectedChecklist.id)
                        }
                        className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Usuń checklistę
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <section className="hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:block">
                <ItemForm
                  form={itemForm}
                  isLoading={isLoading}
                  onSubmit={handleAddManualItem}
                  onFieldChange={updateItemForm}
                />
              </section>

              {isItemFormOpen && (
                <MobileSheet
                  title="Dodaj rzecz"
                  eyebrow="Checklista"
                  isOpen={isItemFormOpen}
                  onClose={closeItemForm}
                >
                  <ItemForm
                    form={itemForm}
                    isLoading={isLoading}
                    onSubmit={handleAddManualItem}
                    onCancel={closeItemForm}
                    onFieldChange={updateItemForm}
                    isMobile
                  />
                </MobileSheet>
              )}

              <section className="space-y-5">
                {selectedChecklist.items.length > 0 ? (
                  groupedItems.map((group) => (
                    <div
                      key={group.value}
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl font-bold text-slate-950">
                          {group.label}
                        </h2>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                          {group.items.length}
                        </span>
                      </div>

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
                  <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                      ✓
                    </div>

                    <p className="mt-5 text-xl font-bold text-slate-950">
                      Brak elementów
                    </p>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Dodaj pierwszą rzecz ręcznie albo użyj sprzętu z
                      ekwipunku.
                    </p>

                    <button
                      type="button"
                      onClick={openItemForm}
                      className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                    >
                      + Dodaj pierwszą rzecz
                    </button>
                  </section>
                )}
              </section>
            </>
          ) : (
            <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                🧾
              </div>

              <p className="mt-5 text-xl font-bold text-slate-950">
                Nie masz jeszcze checklisty
              </p>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Utwórz checklistę wyprawy, żeby szybciej przygotować sprzęt,
                przynęty i rzeczy do zabrania.
              </p>

              <button
                type="button"
                onClick={openCreateChecklistForm}
                className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
              >
                + Utwórz checklistę
              </button>
            </section>
          )}
        </main>
      </div>

      {selectedChecklist && (
        <button
          type="button"
          onClick={openItemForm}
          className="fixed bottom-24 right-4 z-[900] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-3xl font-light leading-none text-white shadow-xl transition hover:bg-blue-700 md:hidden"
          aria-label="Dodaj rzecz do checklisty"
        >
          +
        </button>
      )}
    </div>
  );
}

function ChecklistForm({
  form,
  isLoading,
  onSubmit,
  onCancel,
  onFieldChange,
  isMobile = false,
}: {
  form: ChecklistFormState;
  isLoading: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onFieldChange: <K extends keyof ChecklistFormState>(
    field: K,
    value: ChecklistFormState[K]
  ) => void;
  isMobile?: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {!isMobile && (
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Nowa checklista
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Utwórz listę rzeczy do spakowania przed wyprawą.
          </p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Input
          label="Nazwa checklisty"
          value={form.title}
          onChange={(value) => onFieldChange("title", value)}
          placeholder="np. Method feeder — Jezioro Ukiel"
          required
        />

        <Select
          label="Typ wyprawy"
          value={form.tripType}
          onChange={(value) => onFieldChange("tripType", value)}
          options={tripTypes}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Notatka
        </label>

        <textarea
          value={form.note}
          onChange={(event) => onFieldChange("note", event.target.value)}
          rows={3}
          placeholder="np. Nocka na stanowisku 4, zabrać dodatkową latarkę."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      </div>

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
          {isLoading ? "Tworzenie..." : "Utwórz checklistę"}
        </button>
      </div>
    </form>
  );
}

function ItemForm({
  form,
  isLoading,
  onSubmit,
  onCancel,
  onFieldChange,
  isMobile = false,
}: {
  form: ItemFormState;
  isLoading: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
  onFieldChange: <K extends keyof ItemFormState>(
    field: K,
    value: ItemFormState[K]
  ) => void;
  isMobile?: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {!isMobile && (
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Dodaj element ręcznie
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Dopisz pojedynczą rzecz do wybranej checklisty.
          </p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Input
          label="Nazwa elementu"
          value={form.name}
          onChange={(value) => onFieldChange("name", value)}
          placeholder="np. Pellet 2 mm"
          required
        />

        <Select
          label="Kategoria"
          value={form.category}
          onChange={(value) => onFieldChange("category", value)}
          options={itemCategories}
        />

        <Input
          label="Ilość"
          value={form.quantity}
          onChange={(value) => onFieldChange("quantity", value)}
          placeholder="np. 2"
          type="number"
          required
        />

        <Input
          label="Jednostka"
          value={form.unit}
          onChange={(value) => onFieldChange("unit", value)}
          placeholder="np. szt. / kg / op."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Notatka
        </label>

        <textarea
          value={form.note}
          onChange={(event) => onFieldChange("note", event.target.value)}
          rows={3}
          placeholder="np. Koniecznie zapakować do bocznej kieszeni."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-4">
        <input
          type="checkbox"
          checked={form.isImportant}
          onChange={(event) =>
            onFieldChange("isImportant", event.target.checked)
          }
          className="h-4 w-4 rounded border-slate-300 accent-blue-600"
        />

        <span className="text-sm font-semibold text-slate-700">
          Oznacz jako priorytetowe
        </span>
      </label>

      <div
        className={`flex gap-3 ${
          isMobile
            ? "sticky bottom-0 -mx-5 border-t border-slate-100 bg-white px-5 py-4"
            : "justify-end"
        }`}
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            Anuluj
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
        >
          {isLoading ? "Dodawanie..." : "Dodaj element"}
        </button>
      </div>
    </form>
  );
}

function MobileSheet({
  title,
  eyebrow,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end bg-slate-950/60 p-0 md:hidden"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full overflow-hidden rounded-t-[2rem] bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
              {eyebrow}
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-600 transition hover:bg-slate-200"
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(88vh-73px)] overflow-y-auto px-5 py-5">
          {children}
        </div>
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
            className="mt-1 h-5 w-5 rounded border-slate-300 accent-blue-600"
          />

          <div>
            <p
              className={`font-bold ${
                item.isPacked
                  ? "text-emerald-800 line-through"
                  : "text-slate-950"
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

        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
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
    <div className="min-w-[170px] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:min-w-0 md:p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>

      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
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
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 text-center">
      <p className="font-bold text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      {children}
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

function getChecklistStatusLabel(value: string) {
  return checklistStatuses.find((item) => item.value === value)?.label || value;
}