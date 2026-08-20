"use client";

import { SearchIcon } from "@/components/icons/SearchIcon";
import {
  FISHING_TYPE_OPTIONS,
  OWNER_TYPE_OPTIONS,
} from "@/components/lakes/constants";
import { ActiveFilterChips } from "@/components/lakes/filters/ActiveFilterChips";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { LakeExplorerFilters } from "@/lib/lake-explorer-types";
import type { LakeFilterOptions } from "@/lib/lakes";

function countActiveFilters(
  filters: LakeExplorerFilters
) {
  return (
    Number(
      filters.ownerType !== "all"
    ) +
    Number(
      filters.fishingType !== "all"
    ) +
    Number(
      filters.voivodeship !== "all"
    ) +
    Number(filters.fish !== "all") +
    filters.amenities.length
  );
}

export function LakesExplorerToolbar({
  filters,
  filterOptions,
  onChange,
  onOpenFilters,
  onClearFilters,
}: {
  filters: LakeExplorerFilters;
  filterOptions: LakeFilterOptions;
  onChange: (
    filters: LakeExplorerFilters
  ) => void;
  onOpenFilters: () => void;
  onClearFilters: () => void;
}) {
  const activeCount =
    countActiveFilters(filters);

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-5 lg:grid-cols-[minmax(260px,1.4fr)_150px_170px_180px_auto] lg:items-end">
        <label className="min-w-0">
          <span className="sr-only">
            Szukaj łowiska
          </span>

          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
            <Input
              type="search"
              value={filters.search}
              onChange={(event) =>
                onChange({
                  ...filters,
                  search:
                    event.target.value,
                })
              }
              placeholder="Szukaj łowiska, miasta lub ryby..."
              className="pl-10"
            />
          </div>
        </label>

        <QuickSelect
          label="Rodzaj"
          value={filters.ownerType}
          options={OWNER_TYPE_OPTIONS}
          onChange={(value) =>
            onChange({
              ...filters,
              ownerType: value,
            })
          }
          className="hidden lg:block"
        />

        <QuickSelect
          label="Typ łowiska"
          value={
            filters.fishingType
          }
          options={
            FISHING_TYPE_OPTIONS
          }
          onChange={(value) =>
            onChange({
              ...filters,
              fishingType: value,
            })
          }
          className="hidden lg:block"
        />

        <QuickSelect
          label="Gatunek"
          value={filters.fish}
          options={[
            {
              value: "all",
              label: "Wszystkie",
            },
            ...filterOptions.fishOptions.map(
              (item) => ({
                value: item,
                label: item,
              })
            ),
          ]}
          onChange={(value) =>
            onChange({
              ...filters,
              fish: value,
            })
          }
          className="hidden lg:block"
        />

        <Button
          type="button"
          variant={
            activeCount > 0
              ? "secondary"
              : "outline"
          }
          onClick={onOpenFilters}
          className="w-full sm:w-auto"
        >
          Filtry
          {activeCount > 0 && (
            <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      <ActiveFilterChips
        filters={filters}
        onChange={onChange}
        onClear={onClearFilters}
      />
    </div>
  );
}

function QuickSelect({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: ReadonlyArray<{
    value: string;
    label: string;
  }>;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-text-muted">
        {label}
      </span>

      <Select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </Select>
    </label>
  );
}
