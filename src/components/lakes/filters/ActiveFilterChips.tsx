"use client";

import { CloseIcon } from "@/components/icons/CloseIcon";
import {
  AMENITY_OPTIONS,
  FISHING_TYPE_OPTIONS,
  OWNER_TYPE_OPTIONS,
} from "@/components/lakes/constants";
import type { LakeExplorerFilters } from "@/lib/lake-explorer-types";

type ActiveFilter = {
  key: string;
  label: string;
  onRemove: () => void;
};

export function ActiveFilterChips({
  filters,
  onChange,
  onClear,
}: {
  filters: LakeExplorerFilters;
  onChange: (
    next: LakeExplorerFilters
  ) => void;
  onClear: () => void;
}) {
  const items: ActiveFilter[] = [];

  if (filters.ownerType !== "all") {
    items.push({
      key: "owner",
      label:
        OWNER_TYPE_OPTIONS.find(
          (item) =>
            item.value ===
            filters.ownerType
        )?.label ?? filters.ownerType,
      onRemove: () =>
        onChange({
          ...filters,
          ownerType: "all",
        }),
    });
  }

  if (
    filters.fishingType !== "all"
  ) {
    items.push({
      key: "fishing",
      label:
        FISHING_TYPE_OPTIONS.find(
          (item) =>
            item.value ===
            filters.fishingType
        )?.label ??
        filters.fishingType,
      onRemove: () =>
        onChange({
          ...filters,
          fishingType: "all",
        }),
    });
  }

  if (filters.voivodeship !== "all") {
    items.push({
      key: "voivodeship",
      label: filters.voivodeship,
      onRemove: () =>
        onChange({
          ...filters,
          voivodeship: "all",
        }),
    });
  }

  if (filters.fish !== "all") {
    items.push({
      key: "fish",
      label: filters.fish,
      onRemove: () =>
        onChange({
          ...filters,
          fish: "all",
        }),
    });
  }

  for (const amenity of filters.amenities) {
    const label =
      AMENITY_OPTIONS.find(
        (item) =>
          item.key === amenity
      )?.label ?? amenity;

    items.push({
      key: `amenity-${amenity}`,
      label,
      onRemove: () =>
        onChange({
          ...filters,
          amenities:
            filters.amenities.filter(
              (item) =>
                item !== amenity
            ),
        }),
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3 sm:px-5">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={item.onRemove}
          className="group inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-800 transition-colors hover:border-primary-300 hover:bg-primary-100"
          aria-label={`Usuń filtr: ${item.label}`}
        >
          <span className="truncate">
            {item.label}
          </span>
          <CloseIcon className="h-3.5 w-3.5 shrink-0 text-primary-600" />
        </button>
      ))}

      <button
        type="button"
        onClick={onClear}
        className="ml-1 text-xs font-semibold text-text-secondary transition-colors hover:text-primary"
      >
        Wyczyść wszystko
      </button>
    </div>
  );
}
