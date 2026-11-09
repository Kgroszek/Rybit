"use client";

import { useEffect, useState } from "react";

import type {
  CatchFilterState,
  CatchViewMode,
  FishingCatch,
  LakeOption,
  TripOption,
} from "@/components/catches/types";
import { CATCH_METHODS, CATCH_STATUS_OPTIONS } from "@/components/catches/constants";
import { countActiveCatchFilters } from "@/components/catches/utils";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function CatchesToolbar({
  catches,
  filters,
  lakes,
  trips,
  viewMode,
  onFiltersChange,
  onViewModeChange,
  onClearFilters,
}: {
  catches: FishingCatch[];
  filters: CatchFilterState;
  lakes: LakeOption[];
  trips: TripOption[];
  viewMode: CatchViewMode;
  onFiltersChange: (filters: CatchFilterState) => void;
  onViewModeChange: (viewMode: CatchViewMode) => void;
  onClearFilters: () => void;
}) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const activeFiltersCount = countActiveCatchFilters(filters);
  const species = Array.from(new Set(catches.map((item) => item.fishName))).sort((a, b) => a.localeCompare(b, "pl"));

  useEffect(() => {
    if (!isFilterDialogOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsFilterDialogOpen(false);
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isFilterDialogOpen]);

  function patch<K extends keyof CatchFilterState>(field: K, value: CatchFilterState[K]) {
    onFiltersChange({ ...filters, [field]: value });
  }

  return (
    <>
      <section className="rounded-card border border-border bg-surface p-3 shadow-card sm:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={filters.search}
              onChange={(event) => patch("search", event.target.value)}
              placeholder="Szukaj po gatunku, łowisku, wyprawie lub przynęcie..."
              className="pl-10"
            />
          </div>

          <div className="hidden min-w-[190px] lg:block">
            <FilterSelect
              value={filters.method}
              onChange={(value) => patch("method", value)}
              options={[
                { label: "Wszystkie metody", value: "all" },
                ...CATCH_METHODS.map((item) => ({ ...item })),
              ]}
            />
          </div>

          <div className="hidden min-w-[180px] lg:block">
            <FilterSelect
              value={filters.status}
              onChange={(value) => patch("status", value)}
              options={CATCH_STATUS_OPTIONS.map((item) => ({ ...item }))}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)} className="flex-1 xl:flex-none">
              Filtry{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
            </Button>

            {(activeFiltersCount > 0 || filters.search) && (
              <Button variant="ghost" onClick={onClearFilters} className="hidden sm:inline-flex">
                Wyczyść
              </Button>
            )}

            <div className="flex h-11 rounded-control bg-surface-muted p-1">
              <button
                type="button"
                onClick={() => onViewModeChange("grid")}
                className={`rounded-xl px-3 text-xs font-bold transition ${viewMode === "grid" ? "bg-surface text-primary shadow-sm" : "text-text-muted hover:text-text"}`}
              >
                Kafelki
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("list")}
                className={`rounded-xl px-3 text-xs font-bold transition ${viewMode === "list" ? "bg-surface text-primary shadow-sm" : "text-text-muted hover:text-text"}`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </section>

      {isFilterDialogOpen && (
        <div className="fixed inset-0 z-[1250] flex items-end bg-navy-950/55 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-5" onMouseDown={() => setIsFilterDialogOpen(false)}>
          <div
            className="max-h-[90dvh] w-full overflow-hidden rounded-t-[28px] bg-surface shadow-2xl sm:max-w-2xl sm:rounded-modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Filtry połowów"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-display text-xl font-bold text-text">Filtry połowów</h2>
                <p className="mt-1 text-sm text-text-secondary">Zawęź dziennik do interesujących Cię wpisów.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterDialogOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-control bg-surface-muted text-text-secondary transition hover:bg-surface-hover hover:text-text"
                aria-label="Zamknij filtry"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(90dvh-150px)] overflow-y-auto px-5 py-5 sm:px-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <LabeledSelect label="Metoda" value={filters.method} onChange={(value) => patch("method", value)} options={[{ label: "Wszystkie metody", value: "all" }, ...CATCH_METHODS.map((item) => ({ ...item }))]} />
                <LabeledSelect label="Gatunek" value={filters.species} onChange={(value) => patch("species", value)} options={[{ label: "Wszystkie gatunki", value: "all" }, ...species.map((value) => ({ label: value, value }))]} />
                <LabeledSelect label="Status" value={filters.status} onChange={(value) => patch("status", value)} options={CATCH_STATUS_OPTIONS.map((item) => ({ ...item }))} />
                <LabeledSelect label="Łowisko" value={filters.lakeId} onChange={(value) => patch("lakeId", value)} options={[{ label: "Wszystkie łowiska", value: "all" }, ...lakes.map((lake) => ({ label: `${lake.name} — ${lake.city}`, value: lake.id }))]} />
                <LabeledSelect label="Wyprawa" value={filters.tripId} onChange={(value) => patch("tripId", value)} options={[{ label: "Wszystkie wyprawy", value: "all" }, ...trips.map((trip) => ({ label: trip.title, value: trip.id }))]} />
                <div />
                <LabeledDate label="Od daty" value={filters.fromDate} onChange={(value) => patch("fromDate", value)} />
                <LabeledDate label="Do daty" value={filters.toDate} onChange={(value) => patch("toDate", value)} />
              </div>
            </div>

            <div className="flex gap-3 border-t border-border px-5 py-4 sm:px-6">
              <Button variant="outline" className="flex-1" onClick={onClearFilters}>Wyczyść</Button>
              <Button className="flex-1" onClick={() => setIsFilterDialogOpen(false)}>Pokaż wyniki</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-control border border-border-strong bg-surface px-3.5 text-sm font-semibold text-text outline-none transition hover:border-primary-200 focus:border-primary focus:ring-4 focus:ring-primary-100">
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}

function LabeledSelect({ label, ...props }: { label: string; value: string; onChange: (value: string) => void; options: { label: string; value: string }[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-text-secondary">{label}</span>
      <FilterSelect {...props} />
    </label>
  );
}

function LabeledDate({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-text-secondary">{label}</span>
      <Input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
