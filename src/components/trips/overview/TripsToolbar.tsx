"use client";

import type { ReactNode } from "react";

import { SearchIcon } from "@/components/icons/SearchIcon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TRIP_TABS, TRIP_TYPES } from "@/components/trips/constants";
import type {
  TripSort,
  TripTab,
  TripsViewMode,
} from "@/components/trips/types";
import { cn } from "@/lib/cn";

type TripsToolbarProps = {
  activeTab: TripTab;
  search: string;
  typeFilter: string;
  ownershipFilter: string;
  sort: TripSort;
  viewMode: TripsViewMode;
  areFiltersOpen: boolean;
  activeFiltersCount: number;
  onTabChange: (tab: TripTab) => void;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onOwnershipFilterChange: (value: string) => void;
  onSortChange: (value: TripSort) => void;
  onViewModeChange: (value: TripsViewMode) => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
};

export function TripsToolbar({
  activeTab,
  search,
  typeFilter,
  ownershipFilter,
  sort,
  viewMode,
  areFiltersOpen,
  activeFiltersCount,
  onTabChange,
  onSearchChange,
  onTypeFilterChange,
  onOwnershipFilterChange,
  onSortChange,
  onViewModeChange,
  onToggleFilters,
  onClearFilters,
}: TripsToolbarProps) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <div className="flex gap-1.5 overflow-x-auto rounded-control bg-surface-muted p-1.5">
          {TRIP_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "min-h-10 shrink-0 rounded-xl px-4 text-sm font-bold transition-[background-color,color,box-shadow]",
                activeTab === tab.value
                  ? "bg-surface text-primary-700 shadow-[0_1px_3px_rgba(13,30,51,0.08)]"
                  : "text-text-secondary hover:text-text"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Szukaj po nazwie wyprawy, łowisku lub notatce..."
              className="h-12 pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={areFiltersOpen ? "secondary" : "outline"}
              onClick={onToggleFilters}
              className="h-12 flex-1 xl:flex-none"
            >
              Filtry
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-white">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            <ViewSwitcher
              value={viewMode}
              onChange={onViewModeChange}
            />
          </div>
        </div>

        {areFiltersOpen && (
          <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2 xl:grid-cols-[220px_220px_220px_auto] xl:items-end">
            <FilterField label="Typ wyprawy">
              <Select
                value={typeFilter}
                onChange={(event) =>
                  onTypeFilterChange(event.target.value)
                }
                className="h-12"
              >
                <option value="all">Wszystkie typy</option>
                {TRIP_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FilterField>

            <FilterField label="Dostęp">
              <Select
                value={ownershipFilter}
                onChange={(event) =>
                  onOwnershipFilterChange(event.target.value)
                }
                className="h-12"
              >
                <option value="all">Wszystkie wyprawy</option>
                <option value="owned">Moje wyprawy</option>
                <option value="shared">Współdzielone</option>
              </Select>
            </FilterField>

            <FilterField label="Sortowanie">
              <Select
                value={sort}
                onChange={(event) =>
                  onSortChange(event.target.value as TripSort)
                }
                className="h-12"
              >
                <option value="nearest">Najbliższe</option>
                <option value="farthest">Najdalsze</option>
                <option value="newest">Ostatnio dodane</option>
                <option value="name">Nazwa A–Z</option>
              </Select>
            </FilterField>

            <Button
              type="button"
              variant="ghost"
              onClick={onClearFilters}
              disabled={activeFiltersCount === 0}
              className="h-12 xl:justify-self-end"
            >
              Wyczyść filtry
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-xs font-bold text-text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}

function ViewSwitcher({
  value,
  onChange,
}: {
  value: TripsViewMode;
  onChange: (value: TripsViewMode) => void;
}) {
  return (
    <div
      className="grid min-w-[190px] grid-cols-2 rounded-control bg-surface-muted p-1"
      role="tablist"
      aria-label="Widok wypraw"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "trips"}
        onClick={() => onChange("trips")}
        className={cn(
          "h-10 whitespace-nowrap rounded-xl px-3 text-xs font-bold transition",
          value === "trips"
            ? "bg-surface text-primary-700 shadow-[0_1px_3px_rgba(13,30,51,0.08)]"
            : "text-text-secondary"
        )}
      >
        Wyprawy
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={value === "calendar"}
        onClick={() => onChange("calendar")}
        className={cn(
          "h-10 whitespace-nowrap rounded-xl px-3 text-xs font-bold transition",
          value === "calendar"
            ? "bg-surface text-primary-700 shadow-[0_1px_3px_rgba(13,30,51,0.08)]"
            : "text-text-secondary"
        )}
      >
        Kalendarz
      </button>
    </div>
  );
}
