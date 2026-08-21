"use client";

import { useEffect, useMemo, useState } from "react";

import { SearchIcon } from "@/components/icons/SearchIcon";
import { CloseIcon } from "@/components/icons/CloseIcon";
import type { LakeOption } from "@/components/trips/types";
import {
  formatLakeOption,
  normalizeSearchText,
} from "@/components/trips/utils";
import { Input } from "@/components/ui/Input";
import { TripFieldLabel } from "@/components/trips/forms/TripFormField";

export function TripLakeSelect({
  lakes,
  value,
  onChange,
}: {
  lakes: LakeOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedLake =
    lakes.find((lake) => lake.id === value) ?? null;

  const [query, setQuery] = useState(() =>
    selectedLake ? formatLakeOption(selectedLake) : ""
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const currentLake =
      lakes.find((lake) => lake.id === value) ?? null;

    setQuery(currentLake ? formatLakeOption(currentLake) : "");
  }, [lakes, value]);

  const filteredLakes = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);

    if (!normalizedQuery) {
      return lakes.slice(0, 12);
    }

    return lakes
      .filter((lake) =>
        normalizeSearchText(
          `${lake.name} ${lake.city} ${lake.voivodeship}`
        ).includes(normalizedQuery)
      )
      .slice(0, 12);
  }, [lakes, query]);

  function handleInputChange(nextValue: string) {
    setQuery(nextValue);
    setIsOpen(true);

    if (value) {
      onChange("");
    }
  }

  function selectLake(lake: LakeOption) {
    onChange(lake.id);
    setQuery(formatLakeOption(lake));
    setIsOpen(false);
  }

  return (
    <div
      className="grid min-w-0"
      style={{ rowGap: "10px" }}
    >
      <TripFieldLabel>Łowisko</TripFieldLabel>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <Input
          value={query}
          onChange={(event) =>
            handleInputChange(event.target.value)
          }
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 140);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder="Nazwa łowiska, miasto lub województwo..."
          autoComplete="off"
          className="h-12 pl-10 pr-11 text-[15px]"
        />

        {(query || value) && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange("");
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-muted transition hover:bg-surface-muted hover:text-text"
            aria-label="Wyczyść wybrane łowisko"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        )}

        {isOpen && (
          <div className="absolute inset-x-0 top-[54px] z-[1500] max-h-72 overflow-y-auto rounded-control border border-border bg-surface p-1.5 shadow-float">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange("");
                setQuery("");
                setIsOpen(false);
              }}
              className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-semibold text-text-secondary transition hover:bg-surface-muted"
            >
              Bez przypisanego łowiska
            </button>

            {filteredLakes.map((lake) => (
              <button
                key={lake.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectLake(lake)}
                className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-primary-50"
              >
                <span className="block text-sm font-bold text-text">
                  {lake.name}
                </span>

                <span className="mt-1 block text-xs text-text-muted">
                  {[lake.city, lake.voivodeship]
                    .filter(Boolean)
                    .join(" • ")}
                </span>
              </button>
            ))}

            {filteredLakes.length === 0 && (
              <div className="px-3 py-5 text-center text-sm text-text-muted">
                Brak pasujących łowisk.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
