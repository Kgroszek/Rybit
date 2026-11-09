"use client";

import { SearchIcon } from "@/components/icons/SearchIcon";
import type {
  GearScopeFilter,
  GearSort,
} from "@/components/gear/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/cn";
import {
  GEAR_CATEGORIES,
  GEAR_CONDITIONS,
  GEAR_FISHING_METHODS,
  getGearCategoryLabel,
  getGearConditionLabel,
  getGearMethodLabel,
} from "@/lib/gear/gear-options";

const SCOPES: Array<{
  value: GearScopeFilter;
  label: string;
}> = [
  {
    value: "all",
    label: "Wszystkie",
  },
  {
    value: "trip",
    label: "Na wyprawę",
  },
  {
    value: "attention",
    label: "Do uwagi",
  },
  {
    value: "inactive",
    label: "Nieużywane",
  },
];

export function GearToolbar({
  search,
  scope,
  category,
  method,
  condition,
  sort,
  filtersOpen,
  onSearch,
  onScope,
  onCategory,
  onMethod,
  onCondition,
  onSort,
  onFiltersOpen,
  onClearDetailedFilters,
}: {
  search: string;
  scope: GearScopeFilter;
  category: string;
  method: string;
  condition: string;
  sort: GearSort;
  filtersOpen: boolean;
  onSearch: (value: string) => void;
  onScope: (
    value: GearScopeFilter
  ) => void;
  onCategory: (value: string) => void;
  onMethod: (value: string) => void;
  onCondition: (value: string) => void;
  onSort: (value: GearSort) => void;
  onFiltersOpen: (
    open: boolean
  ) => void;
  onClearDetailedFilters: () => void;
}) {
  const activeDetailed =
    Number(category !== "all") +
    Number(method !== "all") +
    Number(condition !== "all");

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

          <Input
            value={search}
            onChange={(event) =>
              onSearch(
                event.target.value
              )
            }
            placeholder="Szukaj po nazwie, marce, modelu lub notatce..."
            className="pl-10"
            aria-label="Szukaj sprzętu"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onFiltersOpen(
                !filtersOpen
              )
            }
          >
            Filtry
            {activeDetailed > 0 && (
              <span className="rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-black text-primary-700">
                {activeDetailed}
              </span>
            )}
          </Button>

          <Select
            value={sort}
            onChange={(event) =>
              onSort(
                event.target
                  .value as GearSort
              )
            }
            className="h-9 w-[150px] text-xs font-bold"
            aria-label="Sortuj sprzęt"
          >
            <option value="newest">
              Najnowsze
            </option>
            <option value="name">
              Nazwa A–Z
            </option>
            <option value="value_desc">
              Wartość ↓
            </option>
            <option value="value_asc">
              Wartość ↑
            </option>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto border-b border-border px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-5">
        <div className="flex min-w-max gap-1.5 rounded-control bg-surface-muted p-1.5">
          {SCOPES.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={
                scope === item.value
              }
              onClick={() =>
                onScope(item.value)
              }
              className={cn(
                "h-9 whitespace-nowrap rounded-xl px-3.5 text-xs font-bold transition",
                scope === item.value
                  ? "bg-surface text-primary-700 shadow-[0_1px_3px_rgba(13,30,51,0.08)]"
                  : "text-text-secondary hover:text-text"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filtersOpen && (
        <div className="border-b border-border bg-surface-muted/55 px-4 py-4 sm:px-5">
          <div className="grid gap-3 md:grid-cols-3">
            <Select
              value={category}
              onChange={(event) =>
                onCategory(
                  event.target.value
                )
              }
              aria-label="Filtruj po kategorii"
            >
              <option value="all">
                Wszystkie kategorie
              </option>

              {GEAR_CATEGORIES.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </Select>

            <Select
              value={method}
              onChange={(event) =>
                onMethod(
                  event.target.value
                )
              }
              aria-label="Filtruj po metodzie"
            >
              <option value="all">
                Wszystkie metody
              </option>

              {GEAR_FISHING_METHODS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </Select>

            <Select
              value={condition}
              onChange={(event) =>
                onCondition(
                  event.target.value
                )
              }
              aria-label="Filtruj po stanie"
            >
              <option value="all">
                Wszystkie stany
              </option>

              {GEAR_CONDITIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </Select>
          </div>

          {activeDetailed > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {category !== "all" && (
                <FilterChip
                  label={`Kategoria: ${getGearCategoryLabel(
                    category
                  )}`}
                  onClear={() =>
                    onCategory("all")
                  }
                />
              )}

              {method !== "all" && (
                <FilterChip
                  label={`Metoda: ${getGearMethodLabel(
                    method
                  )}`}
                  onClear={() =>
                    onMethod("all")
                  }
                />
              )}

              {condition !== "all" && (
                <FilterChip
                  label={`Stan: ${getGearConditionLabel(
                    condition
                  )}`}
                  onClear={() =>
                    onCondition("all")
                  }
                />
              )}

              <button
                type="button"
                onClick={
                  onClearDetailedFilters
                }
                className="px-2 py-1 text-xs font-bold text-primary-700 hover:text-primary-900"
              >
                Wyczyść filtry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex min-h-8 items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 text-xs font-bold text-primary-700 transition hover:bg-primary-100"
    >
      {label}
      <span aria-hidden="true">×</span>
    </button>
  );
}
