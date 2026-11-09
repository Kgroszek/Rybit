"use client";

import {
  useEffect,
  useState,
} from "react";

import { CloseIcon } from "@/components/icons/CloseIcon";
import {
  AMENITY_OPTIONS,
  FISHING_TYPE_OPTIONS,
  OWNER_TYPE_OPTIONS,
} from "@/components/lakes/constants";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/cn";
import type {
  LakeExplorerFilters,
} from "@/lib/lake-explorer-types";
import type { LakeFilterOptions } from "@/lib/lakes";

export function LakesFilterDialog({
  open,
  filters,
  filterOptions,
  onClose,
  onApply,
}: {
  open: boolean;
  filters: LakeExplorerFilters;
  filterOptions: LakeFilterOptions;
  onClose: () => void;
  onApply: (
    filters: LakeExplorerFilters
  ) => void;
}) {
  const [draft, setDraft] =
    useState(filters);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraft(filters);

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [filters, onClose, open]);

  if (!open) {
    return null;
  }

  function toggleAmenity(
    key: string
  ) {
    setDraft((current) => ({
      ...current,
      amenities:
        current.amenities.includes(key)
          ? current.amenities.filter(
              (item) => item !== key
            )
          : [
              ...current.amenities,
              key,
            ],
    }));
  }

  function clearDraft() {
    setDraft((current) => ({
      ...current,
      ownerType: "all",
      fishingType: "all",
      voivodeship: "all",
      fish: "all",
      amenities: [],
    }));
  }

  return (
    <div
      className="fixed inset-0 z-[10050] bg-navy-950/35 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lake-filters-title"
        className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-hidden rounded-t-modal border-t border-border bg-surface shadow-float sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[min(680px,calc(100vw-40px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-modal sm:border"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-primary">
              Wyszukiwanie
            </p>
            <h2
              id="lake-filters-title"
              className="mt-1 font-display text-xl font-extrabold text-text"
            >
              Filtry łowisk
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-control border border-border bg-surface-muted text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
            aria-label="Zamknij filtry"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(88dvh-142px)] overflow-y-auto px-5 py-5 sm:max-h-[70dvh] sm:px-6 sm:py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FilterSelect
              label="Rodzaj łowiska"
              value={draft.ownerType}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  ownerType: value,
                }))
              }
              options={OWNER_TYPE_OPTIONS}
            />

            <FilterSelect
              label="Typ łowiska"
              value={
                draft.fishingType
              }
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  fishingType: value,
                }))
              }
              options={
                FISHING_TYPE_OPTIONS
              }
            />

            <FilterSelect
              label="Województwo"
              value={
                draft.voivodeship
              }
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  voivodeship: value,
                }))
              }
              options={[
                {
                  value: "all",
                  label:
                    "Wszystkie województwa",
                },
                ...filterOptions.voivodeships.map(
                  (item) => ({
                    value: item,
                    label: item,
                  })
                ),
              ]}
            />

            <FilterSelect
              label="Gatunek ryby"
              value={draft.fish}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  fish: value,
                }))
              }
              options={[
                {
                  value: "all",
                  label:
                    "Wszystkie gatunki",
                },
                ...filterOptions.fishOptions.map(
                  (item) => ({
                    value: item,
                    label: item,
                  })
                ),
              ]}
            />
          </div>

          <div className="mt-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-text">
                  Udogodnienia
                </p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Możesz zaznaczyć kilka
                  opcji jednocześnie.
                </p>
              </div>

              {draft.amenities.length >
                0 && (
                <span className="rounded-full bg-primary-100 px-2.5 py-1 text-[11px] font-bold text-primary-800">
                  {
                    draft.amenities
                      .length
                  }{" "}
                  wybr.
                </span>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AMENITY_OPTIONS.map(
                (amenity) => {
                  const active =
                    draft.amenities.includes(
                      amenity.key
                    );

                  return (
                    <button
                      key={amenity.key}
                      type="button"
                      aria-pressed={
                        active
                      }
                      onClick={() =>
                        toggleAmenity(
                          amenity.key
                        )
                      }
                      className={cn(
                        "min-h-10 rounded-control border px-3 py-2 text-left text-xs font-semibold transition-colors",
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-surface-muted text-text-secondary hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
                      )}
                    >
                      {amenity.label}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface px-5 py-4 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            onClick={clearDraft}
          >
            Wyczyść
          </Button>

          <Button
            type="button"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Zastosuj filtry
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{
    value: string;
    label: string;
  }>;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold text-text-secondary">
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
