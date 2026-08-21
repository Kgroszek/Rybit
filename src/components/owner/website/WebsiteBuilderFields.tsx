"use client";

import {
  useState,
  type ReactNode,
} from "react";

import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";
import {
  getRybioSectionItems,
  getSectionVariants,
  moveArrayItem,
} from "@/components/owner/website/website-builder-utils";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";

export function BuilderFieldLabel({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <span className="text-xs font-bold text-text-secondary">
        {children}
      </span>

      {hint && (
        <span className="text-[10px] font-semibold text-text-muted">
          {hint}
        </span>
      )}
    </div>
  );
}

export function BuilderInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
}) {
  return (
    <label
      className="grid min-w-0"
      style={{ rowGap: "10px" }}
    >
      <BuilderFieldLabel>
        {label}
      </BuilderFieldLabel>

      <Input
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11"
      />
    </label>
  );
}

export function BuilderTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <label
      className="grid min-w-0"
      style={{ rowGap: "10px" }}
    >
      <BuilderFieldLabel
        hint={
          maxLength
            ? `${value.length}/${maxLength}`
            : undefined
        }
      >
        {label}
      </BuilderFieldLabel>

      <Textarea
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="min-h-28 resize-y"
      />
    </label>
  );
}

export function BuilderSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label
      className="grid min-w-0"
      style={{ rowGap: "10px" }}
    >
      <BuilderFieldLabel>
        {label}
      </BuilderFieldLabel>

      <Select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        {children}
      </Select>
    </label>
  );
}

export function BuilderColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const safeValue =
    /^#[0-9a-fA-F]{6}$/.test(value)
      ? value
      : "#000000";

  return (
    <label
      className="grid min-w-0"
      style={{ rowGap: "10px" }}
    >
      <BuilderFieldLabel>
        {label}
      </BuilderFieldLabel>

      <div className="flex h-11 items-center gap-2 rounded-control border border-border-strong bg-surface px-2.5 shadow-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary-100">
        <input
          type="color"
          value={safeValue}
          onChange={(event) =>
            onChange(
              event.target.value.toUpperCase()
            )
          }
          className="h-7 w-8 cursor-pointer border-0 bg-transparent p-0"
          aria-label={label}
        />

        <input
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="min-w-0 flex-1 bg-transparent text-xs font-extrabold uppercase text-text outline-none"
        />
      </div>
    </label>
  );
}

export function BuilderImageField({
  label,
  url,
  uploading,
  onUpload,
  onRemove,
}: {
  label: string;
  url: string;
  uploading: boolean;
  onUpload: () => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <BuilderFieldLabel>
        {label}
      </BuilderFieldLabel>

      {url ? (
        <div className="mt-2.5 overflow-hidden rounded-card border border-border bg-surface">
          <img
            src={url}
            alt=""
            className="aspect-[16/9] w-full bg-surface-muted object-cover"
          />

          <div className="grid grid-cols-2 gap-2 p-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={onUpload}
            >
              {uploading
                ? "Wysyłanie…"
                : "Zmień"}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onRemove}
              className="text-danger-foreground hover:bg-danger-subtle hover:text-danger-foreground"
            >
              Usuń
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={onUpload}
          className="mt-2.5 flex min-h-28 w-full flex-col items-center justify-center rounded-card border border-dashed border-border-strong bg-surface-muted px-4 py-5 text-center transition hover:border-primary-300 hover:bg-primary-50 disabled:opacity-50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-primary shadow-sm">
            <AddCircleIcon className="h-4 w-4" />
          </span>

          <span className="mt-2.5 text-xs font-bold text-text">
            {uploading
              ? "Wysyłanie…"
              : "Wybierz zdjęcie"}
          </span>

          <span className="mt-1 text-[10px] leading-4 text-text-muted">
            JPG, PNG, WEBP lub AVIF · do 8 MB
          </span>
        </button>
      )}
    </div>
  );
}

export function BuilderVariantField({
  section,
  onChange,
}: {
  section: LakeWebsiteSection;
  onChange: (
    patch: Partial<LakeWebsiteSection>
  ) => void;
}) {
  const variants =
    getSectionVariants(section.type);

  if (variants.length < 2) {
    return null;
  }

  return (
    <BuilderSelect
      label="Układ sekcji"
      value={section.variant}
      onChange={(variant) =>
        onChange({ variant })
      }
    >
      {variants.map(
        ([value, label]) => (
          <option
            key={value}
            value={value}
          >
            {label}
          </option>
        )
      )}
    </BuilderSelect>
  );
}

export function BuilderGalleryEditor({
  images,
  uploading,
  onChange,
  onUpload,
}: {
  images: string[];
  uploading: boolean;
  onChange: (images: string[]) => void;
  onUpload: () => Promise<string>;
}) {
  const [
    draggingIndex,
    setDraggingIndex,
  ] = useState<number | null>(null);

  async function handleAdd() {
    try {
      const url = await onUpload();

      onChange(
        [...images, url].slice(0, 20)
      );
    } catch {
      // Komunikat obsługuje kontroler buildera.
    }
  }

  return (
    <div>
      <BuilderFieldLabel
        hint={`${images.length}/20`}
      >
        Zdjęcia galerii
      </BuilderFieldLabel>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            draggable
            onDragStart={() =>
              setDraggingIndex(index)
            }
            onDragEnd={() =>
              setDraggingIndex(null)
            }
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={() => {
              if (
                draggingIndex !== null
              ) {
                onChange(
                  moveArrayItem(
                    images,
                    draggingIndex,
                    index
                  )
                );
              }

              setDraggingIndex(null);
            }}
            className={cn(
              "group relative overflow-hidden rounded-control border bg-surface-muted",
              draggingIndex === index
                ? "border-primary-300 opacity-50"
                : "border-border"
            )}
          >
            <img
              src={url}
              alt=""
              className="h-28 w-full object-cover"
            />

            <span className="absolute left-2 top-2 rounded-lg bg-navy-950/70 px-2 py-1 text-[9px] font-black text-white backdrop-blur">
              {String(index + 1).padStart(
                2,
                "0"
              )}
            </span>

            <button
              type="button"
              onClick={() =>
                onChange(
                  images.filter(
                    (_, current) =>
                      current !== index
                  )
                )
              }
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-surface/95 text-danger-foreground shadow-sm transition hover:bg-danger-subtle"
              aria-label="Usuń zdjęcie"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>

            <div className="absolute inset-x-2 bottom-2 grid grid-cols-2 gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                disabled={index === 0}
                onClick={() =>
                  onChange(
                    moveArrayItem(
                      images,
                      index,
                      index - 1
                    )
                  )
                }
                className="flex h-8 items-center justify-center rounded-lg bg-surface/95 text-text-secondary shadow-sm disabled:opacity-30"
                aria-label="Przesuń zdjęcie wcześniej"
              >
                <ArrowSmallRightIcon className="h-3.5 w-3.5 rotate-180" />
              </button>

              <button
                type="button"
                disabled={
                  index ===
                  images.length - 1
                }
                onClick={() =>
                  onChange(
                    moveArrayItem(
                      images,
                      index,
                      index + 1
                    )
                  )
                }
                className="flex h-8 items-center justify-center rounded-lg bg-surface/95 text-text-secondary shadow-sm disabled:opacity-30"
                aria-label="Przesuń zdjęcie później"
              >
                <ArrowSmallRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {images.length < 20 && (
          <button
            type="button"
            disabled={uploading}
            onClick={() =>
              void handleAdd()
            }
            className="flex h-28 flex-col items-center justify-center rounded-control border border-dashed border-border-strong bg-surface-muted text-center transition hover:border-primary-300 hover:bg-primary-50 disabled:opacity-50"
          >
            <AddCircleIcon className="h-4 w-4 text-primary" />
            <span className="mt-2 text-xs font-bold text-text-secondary">
              Dodaj zdjęcie
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export function BuilderDataSourceEditor({
  section,
  lake,
  onChange,
}: {
  section: LakeWebsiteSection;
  lake: PublicLakeWebsiteData["lake"];
  onChange: (
    patch: Partial<LakeWebsiteSection>
  ) => void;
}) {
  const rybioItems =
    getRybioSectionItems(
      section.type,
      lake
    );

  const custom =
    section.dataSource === "custom";

  const items = custom
    ? section.items || []
    : rybioItems;

  function enableCustom(
    source = rybioItems
  ) {
    onChange({
      dataSource: "custom",
      items: [...source],
    });
  }

  function useRybio() {
    onChange({
      dataSource: "rybio",
      items: undefined,
    });
  }

  function updateItem(
    index: number,
    value: string
  ) {
    const next = [...items];
    next[index] = value;

    onChange({
      dataSource: "custom",
      items: next,
    });
  }

  return (
    <div className="rounded-card border border-border bg-surface-muted p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold text-text">
            Źródło danych
          </p>
          <p className="mt-1 text-[11px] leading-5 text-text-muted">
            {custom
              ? "Ta sekcja ma własną kopię danych, niezależną od profilu Rybio."
              : "Ta sekcja automatycznie korzysta z aktualnych danych profilu łowiska."}
          </p>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em]",
            custom
              ? "bg-navy-950 text-white"
              : "bg-primary-100 text-primary-700"
          )}
        >
          {custom
            ? "Własne"
            : "Rybio"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={useRybio}
          className={cn(
            "min-h-10 rounded-xl px-3 text-xs font-bold transition",
            !custom
              ? "bg-primary text-white"
              : "border border-border bg-surface text-text-secondary hover:bg-primary-50"
          )}
        >
          Dane z Rybio
        </button>

        <button
          type="button"
          onClick={() =>
            enableCustom()
          }
          className={cn(
            "min-h-10 rounded-xl px-3 text-xs font-bold transition",
            custom
              ? "bg-navy-950 text-white"
              : "border border-border bg-surface text-text-secondary hover:bg-surface-hover"
          )}
        >
          Własne dane
        </button>
      </div>

      {!custom ? (
        <div className="mt-4 space-y-2">
          {items.length > 0 ? (
            items
              .slice(0, 8)
              .map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex items-start gap-2 rounded-xl border border-border bg-surface px-3 py-2.5"
                >
                  <span className="mt-0.5 text-[9px] font-black tabular-nums text-text-muted">
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  <span className="text-[11px] leading-5 text-text-secondary">
                    {item}
                  </span>
                </div>
              ))
          ) : (
            <p className="rounded-xl border border-border bg-surface px-3 py-4 text-center text-[11px] text-text-muted">
              Brak danych w profilu łowiska.
            </p>
          )}

          {items.length > 8 && (
            <p className="text-center text-[10px] font-semibold text-text-muted">
              + {items.length - 8} kolejnych pozycji
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            fullWidth
            onClick={() =>
              enableCustom()
            }
          >
            Skopiuj i edytuj niezależnie
          </Button>
        </div>
      ) : (
        <div className="mt-4">
          <div className="space-y-2">
            {items.map(
              (item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_auto] items-start gap-2"
                >
                  <Textarea
                    value={item}
                    rows={
                      section.type ===
                      "fish"
                        ? 1
                        : 2
                    }
                    onChange={(event) =>
                      updateItem(
                        index,
                        event.target.value
                      )
                    }
                    className="min-h-10 text-xs"
                    placeholder={
                      section.type ===
                      "fish"
                        ? "Nazwa gatunku"
                        : section.type ===
                            "priceList"
                          ? "Pozycja cennika"
                          : "Punkt regulaminu"
                    }
                  />

                  <div className="grid gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() =>
                        onChange({
                          items:
                            moveArrayItem(
                              items,
                              index,
                              index - 1
                            ),
                        })
                      }
                      className="flex h-7 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-muted disabled:opacity-30"
                      aria-label="Przesuń wyżej"
                    >
                      <ArrowSmallRightIcon className="h-3 w-3 -rotate-90" />
                    </button>

                    <button
                      type="button"
                      disabled={
                        index ===
                        items.length - 1
                      }
                      onClick={() =>
                        onChange({
                          items:
                            moveArrayItem(
                              items,
                              index,
                              index + 1
                            ),
                        })
                      }
                      className="flex h-7 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-muted disabled:opacity-30"
                      aria-label="Przesuń niżej"
                    >
                      <ArrowSmallRightIcon className="h-3 w-3 rotate-90" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          items:
                            items.filter(
                              (
                                _,
                                current
                              ) =>
                                current !==
                                index
                            ),
                        })
                      }
                      className="flex h-7 w-8 items-center justify-center rounded-lg bg-danger-subtle text-danger-foreground"
                      aria-label="Usuń pozycję"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            fullWidth
            className="mt-3"
            onClick={() =>
              onChange({
                dataSource: "custom",
                items: [...items, ""],
              })
            }
          >
            <AddCircleIcon className="h-4 w-4" />
            Dodaj pozycję
          </Button>

          <button
            type="button"
            onClick={() =>
              enableCustom(rybioItems)
            }
            className="mt-3 w-full text-center text-[10px] font-bold text-text-muted hover:text-primary-700"
          >
            Pobierz ponownie aktualne dane z Rybio
          </button>
        </div>
      )}
    </div>
  );
}
