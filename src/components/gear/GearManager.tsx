"use client";

import {
  useMemo,
  useState,
} from "react";

import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { HookIcon } from "@/components/icons/HookIcon";
import { GearDeleteDialog } from "@/components/gear/GearDeleteDialog";
import { GearDesktopTable } from "@/components/gear/GearDesktopTable";
import { GearFormDialog } from "@/components/gear/GearFormDialog";
import { GearMobileList } from "@/components/gear/GearMobileList";
import { GearStats } from "@/components/gear/GearStats";
import { GearToolbar } from "@/components/gear/GearToolbar";
import type {
  FishingGearDto,
  GearFormState,
  GearManagerProps,
  GearScopeFilter,
  GearSort,
} from "@/components/gear/types";
import {
  EMPTY_GEAR_FORM,
  formFromGear,
  formatGearCurrency,
  gearNeedsAttention,
  gearTotalValue,
} from "@/components/gear/gear-utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/ToastProvider";

export function GearManager({
  initialGear,
}: GearManagerProps) {
  const toast = useToast();

  const [gearItems, setGearItems] =
    useState<FishingGearDto[]>(
      initialGear
    );

  const [form, setForm] =
    useState<GearFormState | null>(
      null
    );

  const [
    editingItem,
    setEditingItem,
  ] =
    useState<FishingGearDto | null>(
      null
    );

  const [
    deleteItem,
    setDeleteItem,
  ] =
    useState<FishingGearDto | null>(
      null
    );

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(null);

  const [
    openMenuId,
    setOpenMenuId,
  ] = useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [scope, setScope] =
    useState<GearScopeFilter>("all");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const [
    methodFilter,
    setMethodFilter,
  ] = useState("all");

  const [
    conditionFilter,
    setConditionFilter,
  ] = useState("all");

  const [sort, setSort] =
    useState<GearSort>("newest");

  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(false);

  const filteredGear = useMemo(
    () => {
      const query = search
        .trim()
        .toLocaleLowerCase(
          "pl-PL"
        );

      const next =
        gearItems.filter(
          (item) => {
            const matchesSearch =
              !query ||
              [
                item.name,
                item.brand,
                item.model,
                item.note,
              ]
                .filter(Boolean)
                .some((value) =>
                  String(value)
                    .toLocaleLowerCase(
                      "pl-PL"
                    )
                    .includes(query)
                );

            const matchesScope =
              scope === "all" ||
              (scope === "trip" &&
                item.isDefault) ||
              (scope ===
                "attention" &&
                gearNeedsAttention(
                  item
                )) ||
              (scope ===
                "inactive" &&
                item.status ===
                  "inactive");

            const matchesCategory =
              categoryFilter ===
                "all" ||
              item.category ===
                categoryFilter;

            const matchesMethod =
              methodFilter ===
                "all" ||
              item.fishingMethod ===
                methodFilter;

            const matchesCondition =
              conditionFilter ===
                "all" ||
              item.condition ===
                conditionFilter;

            return (
              matchesSearch &&
              matchesScope &&
              matchesCategory &&
              matchesMethod &&
              matchesCondition
            );
          }
        );

      return [...next].sort(
        (a, b) => {
          if (sort === "name") {
            return a.name.localeCompare(
              b.name,
              "pl"
            );
          }

          if (
            sort === "value_desc"
          ) {
            return (
              gearTotalValue(b) -
              gearTotalValue(a)
            );
          }

          if (
            sort === "value_asc"
          ) {
            return (
              gearTotalValue(a) -
              gearTotalValue(b)
            );
          }

          return (
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
          );
        }
      );
    },
    [
      gearItems,
      search,
      scope,
      categoryFilter,
      methodFilter,
      conditionFilter,
      sort,
    ]
  );

  const totalQuantity =
    gearItems.reduce(
      (sum, item) =>
        sum +
        (item.quantity || 1),
      0
    );

  const tripItems =
    gearItems.filter(
      (item) => item.isDefault
    );

  const tripQuantity =
    tripItems.reduce(
      (sum, item) =>
        sum +
        (item.quantity || 1),
      0
    );

  const totalValue =
    gearItems.reduce(
      (sum, item) =>
        sum + gearTotalValue(item),
      0
    );

  const attentionCount =
    gearItems.filter(
      gearNeedsAttention
    ).length;

  function openCreate() {
    setOpenMenuId(null);
    setEditingItem(null);
    setForm({
      ...EMPTY_GEAR_FORM,
    });
  }

  function openEdit(
    item: FishingGearDto
  ) {
    setOpenMenuId(null);
    setEditingItem(item);
    setForm(
      formFromGear(item)
    );
  }

  function closeForm() {
    setForm(null);
    setEditingItem(null);
  }

  function handleSaved(
    saved: FishingGearDto
  ) {
    setGearItems((current) => {
      const exists =
        current.some(
          (item) =>
            item.id === saved.id
        );

      if (exists) {
        return current.map(
          (item) =>
            item.id === saved.id
              ? saved
              : item
        );
      }

      return [saved, ...current];
    });

    closeForm();
  }

  function clearDetailedFilters() {
    setCategoryFilter("all");
    setMethodFilter("all");
    setConditionFilter("all");
  }

  async function confirmDelete() {
    if (!deleteItem) {
      return;
    }

    const item = deleteItem;

    setDeletingId(item.id);

    try {
      const response = await fetch(
        `/api/gear/${encodeURIComponent(
          item.id
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Nie udało się usunąć sprzętu."
        );
      }

      setGearItems((current) =>
        current.filter(
          (entry) =>
            entry.id !== item.id
        )
      );

      setDeleteItem(null);

      if (
        editingItem?.id ===
        item.id
      ) {
        closeForm();
      }

      toast.success({
        title:
          "Sprzęt został usunięty.",
        description:
          "Element zniknął z Twojego katalogu ekwipunku.",
      });
    } catch (error) {
      toast.error({
        title:
          "Nie udało się usunąć sprzętu.",
        description:
          error instanceof Error
            ? error.message
            : "Spróbuj ponownie za chwilę.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  const hasAnyFilters =
    Boolean(search.trim()) ||
    scope !== "all" ||
    categoryFilter !== "all" ||
    methodFilter !== "all" ||
    conditionFilter !== "all";

  function clearAllFilters() {
    setSearch("");
    setScope("all");
    clearDetailedFilters();
  }

  return (
    <div className="space-y-8 pb-6 lg:space-y-9">
      <PageHeader
        eyebrow="Sprzęt i przygotowanie"
        title="Mój ekwipunek"
        description="Zarządzaj sprzętem, kontroluj jego stan i oznaczaj elementy, które najczęściej zabierasz na wyprawy."
        actions={
          <Button
            type="button"
            onClick={openCreate}
          >
            <AddCircleIcon className="h-4 w-4" />
            Dodaj sprzęt
          </Button>
        }
      />

      <GearStats
        positions={
          gearItems.length
        }
        totalQuantity={
          totalQuantity
        }
        tripPositions={
          tripItems.length
        }
        tripQuantity={
          tripQuantity
        }
        totalValue={
          totalValue > 0
            ? formatGearCurrency(
                totalValue
              )
            : "Brak"
        }
        attention={
          attentionCount
        }
      />

      <Card className="overflow-visible">
        <div className="border-b border-border px-4 py-5 sm:px-5">
          <h2 className="font-display text-xl font-extrabold tracking-[-0.025em] text-text">
            Katalog sprzętu
          </h2>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-text-secondary">
            Wyszukuj, filtruj i szybko sprawdzaj stan wyposażenia przed kolejną wyprawą.
          </p>
        </div>

        <GearToolbar
          search={search}
          scope={scope}
          category={
            categoryFilter
          }
          method={methodFilter}
          condition={
            conditionFilter
          }
          sort={sort}
          filtersOpen={
            filtersOpen
          }
          onSearch={setSearch}
          onScope={setScope}
          onCategory={
            setCategoryFilter
          }
          onMethod={
            setMethodFilter
          }
          onCondition={
            setConditionFilter
          }
          onSort={setSort}
          onFiltersOpen={
            setFiltersOpen
          }
          onClearDetailedFilters={
            clearDetailedFilters
          }
        />

        {filteredGear.length >
        0 ? (
          <>
            <GearDesktopTable
              items={filteredGear}
              openMenuId={
                openMenuId
              }
              deletingId={
                deletingId
              }
              onOpenMenuChange={
                setOpenMenuId
              }
              onEdit={openEdit}
              onDelete={
                setDeleteItem
              }
            />

            <GearMobileList
              items={filteredGear}
              openMenuId={
                openMenuId
              }
              deletingId={
                deletingId
              }
              onOpenMenuChange={
                setOpenMenuId
              }
              onEdit={openEdit}
              onDelete={
                setDeleteItem
              }
            />
          </>
        ) : (
          <div className="p-4 sm:p-5">
            <EmptyState
              icon={
                <HookIcon className="h-5 w-5" />
              }
              title={
                gearItems.length === 0
                  ? "Twój ekwipunek jest pusty"
                  : "Brak pasującego sprzętu"
              }
              description={
                gearItems.length === 0
                  ? "Dodaj pierwszy element sprzętu. Z czasem zbudujesz katalog, który ułatwi przygotowanie każdej wyprawy."
                  : "Zmień wyszukiwaną frazę lub wybrane filtry."
              }
              action={
                gearItems.length ===
                0 ? (
                  <Button
                    type="button"
                    onClick={
                      openCreate
                    }
                  >
                    <AddCircleIcon className="h-4 w-4" />
                    Dodaj pierwszy sprzęt
                  </Button>
                ) : hasAnyFilters ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      clearAllFilters
                    }
                  >
                    Wyczyść filtry
                  </Button>
                ) : undefined
              }
              className="min-h-64"
            />
          </div>
        )}
      </Card>

      {form && (
        <GearFormDialog
          form={form}
          editingItem={
            editingItem
          }
          onChange={setForm}
          onClose={closeForm}
          onSaved={handleSaved}
        />
      )}

      <GearDeleteDialog
        item={deleteItem}
        busy={
          deletingId ===
          deleteItem?.id
        }
        onClose={() =>
          setDeleteItem(null)
        }
        onConfirm={() =>
          void confirmDelete()
        }
      />
    </div>
  );
}
