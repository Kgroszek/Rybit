"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import { SpotDeleteDialog } from "@/components/owner/spots/SpotDeleteDialog";
import { SpotDialog } from "@/components/owner/spots/SpotDialog";
import { SpotsDesktopTable } from "@/components/owner/spots/SpotsDesktopTable";
import { SpotsMobileList } from "@/components/owner/spots/SpotsMobileList";
import { SpotsStats } from "@/components/owner/spots/SpotsStats";
import {
  EMPTY_SPOT_FORM,
  formFromSpot,
} from "@/components/owner/spots/spot-utils";
import type {
  OwnerSpotsManagerProps,
  SpotDto,
  SpotFilter,
  SpotFormState,
} from "@/components/owner/spots/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/cn";

export function OwnerSpotsManager({
  lakeSlug,
  lakeName,
  spots,
  canManage,
}: OwnerSpotsManagerProps) {
  const router = useRouter();
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [filter, setFilter] =
    useState<SpotFilter>("all");
  const [form, setForm] =
    useState<SpotFormState | null>(null);
  const [deleteSpot, setDeleteSpot] =
    useState<SpotDto | null>(null);
  const [actionId, setActionId] =
    useState<string | null>(null);
  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  const visibleSpots = useMemo(() => {
    const normalized = query
      .trim()
      .toLocaleLowerCase("pl-PL");

    return spots.filter((spot) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active"
          ? spot.isActive
          : !spot.isActive);

      if (!matchesFilter) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return `${spot.name} ${
        spot.description || ""
      }`
        .toLocaleLowerCase("pl-PL")
        .includes(normalized);
    });
  }, [filter, query, spots]);

  const activeCount = useMemo(
    () =>
      spots.filter(
        (spot) => spot.isActive
      ).length,
    [spots]
  );

  const occupiedCount = useMemo(
    () =>
      spots.filter(
        (spot) =>
          spot.isActive &&
          spot.isOccupiedNow
      ).length,
    [spots]
  );

  const freeCount = Math.max(
    0,
    activeCount - occupiedCount
  );

  function openNew() {
    setOpenMenuId(null);
    setForm({
      ...EMPTY_SPOT_FORM,
    });
  }

  function openEdit(spot: SpotDto) {
    setOpenMenuId(null);
    setForm(formFromSpot(spot));
  }

  function closeEditor() {
    setForm(null);
  }

  function handleSaved() {
    setForm(null);
    router.refresh();
  }

  async function moveSpot(
    spot: SpotDto,
    action: "moveUp" | "moveDown"
  ) {
    if (!canManage) {
      return;
    }

    setActionId(spot.id);
    setOpenMenuId(null);

    try {
      const response = await fetch(
        `/api/owner/lakes/${encodeURIComponent(
          lakeSlug
        )}/spots/${encodeURIComponent(
          spot.id
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action,
          }),
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
            "Nie udało się zmienić kolejności."
        );
      }

      toast.success({
        title:
          "Kolejność stanowisk została zmieniona.",
      });

      router.refresh();
    } catch (error) {
      toast.error({
        title:
          "Nie udało się zmienić kolejności.",
        description:
          error instanceof Error
            ? error.message
            : "Spróbuj ponownie.",
      });
    } finally {
      setActionId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteSpot || !canManage) {
      return;
    }

    const spot = deleteSpot;
    setActionId(spot.id);

    try {
      const response = await fetch(
        `/api/owner/lakes/${encodeURIComponent(
          lakeSlug
        )}/spots/${encodeURIComponent(
          spot.id
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as {
        message?: string;
        deactivated?: boolean;
      } | null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Nie udało się usunąć stanowiska."
        );
      }

      setDeleteSpot(null);

      toast.success({
        title: data?.deactivated
          ? "Stanowisko zostało wyłączone."
          : "Stanowisko zostało usunięte.",
        description: data?.deactivated
          ? "Historia rezerwacji została zachowana."
          : undefined,
      });

      router.refresh();
    } catch (error) {
      toast.error({
        title:
          "Nie udało się wykonać operacji.",
        description:
          error instanceof Error
            ? error.message
            : "Spróbuj ponownie.",
      });
    } finally {
      setActionId(null);
    }
  }

  const filterCounts = {
    all: spots.length,
    active: activeCount,
    inactive: spots.length - activeCount,
  };

  return (
    <div className="space-y-6 lg:space-y-7">
      <PageHeader
        eyebrow="Organizacja łowiska"
        title="Stanowiska"
        description="Zarządzaj kolejnością, pojemnością i dostępnością miejsc. Te dane są automatycznie wykorzystywane w kalendarzu rezerwacji."
        actions={
          canManage ? (
            <Button
              type="button"
              onClick={openNew}
            >
              <AddCircleIcon className="h-4 w-4" />
              Dodaj stanowisko
            </Button>
          ) : undefined
        }
      />

      <SpotsStats
        total={spots.length}
        active={activeCount}
        occupied={occupiedCount}
        free={freeCount}
      />

      <Card className="overflow-visible">
        <div className="flex flex-col gap-5 border-b border-border px-4 py-5 sm:px-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-xl font-extrabold tracking-[-0.025em] text-text">
              Lista stanowisk
            </h2>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-text-secondary">
              Kolejność na tej liście odpowiada kolejności stanowisk w kalendarzu rezerwacji.
            </p>
          </div>

          <Link
            href={`/moje-lowiska/${lakeSlug}/rezerwacje`}
            className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-3.5 py-2 text-xs font-bold text-text transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            <CalendarIcon className="h-4 w-4" />
            Otwórz kalendarz
          </Link>
        </div>

        <div className="border-b border-border px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

              <Input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Szukaj stanowiska..."
                className="pl-10"
                aria-label="Szukaj stanowiska"
              />
            </div>

            <div
              className="grid grid-cols-3 gap-1.5 rounded-control bg-surface-muted p-1.5"
              aria-label="Filtr stanowisk"
            >
              <FilterButton
                active={filter === "all"}
                label="Wszystkie"
                count={filterCounts.all}
                onClick={() =>
                  setFilter("all")
                }
              />

              <FilterButton
                active={
                  filter === "active"
                }
                label="Aktywne"
                count={filterCounts.active}
                onClick={() =>
                  setFilter("active")
                }
              />

              <FilterButton
                active={
                  filter === "inactive"
                }
                label="Nieaktywne"
                count={filterCounts.inactive}
                onClick={() =>
                  setFilter("inactive")
                }
              />
            </div>
          </div>
        </div>

        {visibleSpots.length > 0 ? (
          <>
            <SpotsDesktopTable
              lakeSlug={lakeSlug}
              allSpots={spots}
              spots={visibleSpots}
              canManage={canManage}
              actionId={actionId}
              openMenuId={openMenuId}
              onOpenMenuChange={
                setOpenMenuId
              }
              onEdit={openEdit}
              onMoveUp={(spot) =>
                void moveSpot(
                  spot,
                  "moveUp"
                )
              }
              onMoveDown={(spot) =>
                void moveSpot(
                  spot,
                  "moveDown"
                )
              }
              onDelete={setDeleteSpot}
            />

            <SpotsMobileList
              lakeSlug={lakeSlug}
              allSpots={spots}
              spots={visibleSpots}
              canManage={canManage}
              actionId={actionId}
              openMenuId={openMenuId}
              onOpenMenuChange={
                setOpenMenuId
              }
              onEdit={openEdit}
              onMoveUp={(spot) =>
                void moveSpot(
                  spot,
                  "moveUp"
                )
              }
              onMoveDown={(spot) =>
                void moveSpot(
                  spot,
                  "moveDown"
                )
              }
              onDelete={setDeleteSpot}
            />
          </>
        ) : (
          <div className="p-4 sm:p-5">
            <EmptyState
              title={
                spots.length === 0
                  ? "Nie masz jeszcze stanowisk"
                  : "Brak pasujących stanowisk"
              }
              description={
                spots.length === 0
                  ? "Dodaj pierwsze stanowisko. Po zapisaniu automatycznie pojawi się w kalendarzu rezerwacji."
                  : "Zmień wyszukiwaną frazę lub wybrany filtr."
              }
              action={
                canManage &&
                spots.length === 0 ? (
                  <Button
                    type="button"
                    onClick={openNew}
                  >
                    <AddCircleIcon className="h-4 w-4" />
                    Dodaj stanowisko
                  </Button>
                ) : undefined
              }
              className="min-h-56"
            />
          </div>
        )}
      </Card>

      {form && (
        <SpotDialog
          lakeSlug={lakeSlug}
          lakeName={lakeName}
          form={form}
          onChange={setForm}
          onClose={closeEditor}
          onSaved={handleSaved}
        />
      )}

      {deleteSpot && (
        <SpotDeleteDialog
          spot={deleteSpot}
          busy={
            actionId === deleteSpot.id
          }
          onClose={() =>
            setDeleteSpot(null)
          }
          onConfirm={() =>
            void confirmDelete()
          }
        />
      )}
    </div>
  );
}

function FilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-xs font-bold transition",
        active
          ? "bg-surface text-primary-700 shadow-[0_1px_3px_rgba(13,30,51,0.08)]"
          : "text-text-secondary hover:text-text"
      )}
    >
      {label}

      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-black",
          active
            ? "bg-primary-100 text-primary-700"
            : "bg-surface-strong text-text-muted"
        )}
      >
        {count}
      </span>
    </button>
  );
}
