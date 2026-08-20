"use client";

import { useEffect, useMemo, useState } from "react";

import type { LakeOption } from "@/components/catches/types";
import { normalizeSearchText } from "@/components/catches/utils";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import { FieldLabel } from "@/components/catches/forms/FormField";

export function LakeSearchSelect({
  lakes,
  value,
  onChange,
}: {
  lakes: LakeOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedLake = lakes.find((lake) => lake.id === value) ?? null;
  const [query, setQuery] = useState(selectedLake ? formatLakeLabel(selectedLake) : "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const currentLake = lakes.find((lake) => lake.id === value) ?? null;
    setQuery(currentLake ? formatLakeLabel(currentLake) : "");
  }, [lakes, value]);

  const filteredLakes = useMemo(() => {
    const normalized = normalizeSearchText(query);

    if (!normalized) {
      return lakes.slice(0, 12);
    }

    return lakes
      .filter((lake) =>
        normalizeSearchText(`${lake.name} ${lake.city} ${lake.voivodeship}`).includes(normalized)
      )
      .slice(0, 12);
  }, [lakes, query]);

  function clear() {
    onChange("");
    setQuery("");
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <FieldLabel>Łowisko</FieldLabel>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            if (value) onChange("");
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 150)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsOpen(false);
          }}
          placeholder="Nazwa łowiska, miasto lub województwo..."
          autoComplete="off"
          className="h-11 w-full rounded-control border border-border-strong bg-surface pl-10 pr-11 text-sm font-semibold text-text shadow-sm outline-none transition placeholder:font-normal placeholder:text-text-muted hover:border-primary-200 focus:border-primary focus:ring-4 focus:ring-primary-100"
        />

        {(query || value) && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={clear}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-text-muted transition hover:bg-surface-muted hover:text-text"
            aria-label="Wyczyść wybrane łowisko"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[72px] z-[1500] max-h-80 overflow-y-auto rounded-control border border-border bg-surface p-1.5 shadow-card-hover">
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={clear}
            className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-text-secondary transition hover:bg-surface-muted"
          >
            Bez przypisanego łowiska
          </button>

          <div className="my-1 border-t border-border" />

          {filteredLakes.length > 0 ? (
            filteredLakes.map((lake) => {
              const isSelected = lake.id === value;
              return (
                <button
                  key={lake.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(lake.id);
                    setQuery(formatLakeLabel(lake));
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-left transition ${
                    isSelected ? "bg-primary-100" : "hover:bg-surface-muted"
                  }`}
                >
                  <span className="min-w-0">
                    <span className={`block truncate text-sm font-bold ${isSelected ? "text-primary-800" : "text-text"}`}>
                      {lake.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-text-muted">
                      {lake.city}, woj. {lake.voivodeship}
                    </span>
                  </span>
                  {isSelected && (
                    <span className="shrink-0 text-[11px] font-bold text-primary">Wybrane</span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-bold text-text">Nie znaleziono łowiska</p>
              <p className="mt-1 text-xs leading-5 text-text-muted">Spróbuj krótszej nazwy albo miejscowości.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatLakeLabel(lake: LakeOption) {
  return `${lake.name} — ${lake.city}`;
}
