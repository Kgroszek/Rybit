"use client";

import {
  useEffect,
  useId,
  useState,
} from "react";

import { FieldLabel } from "@/components/catches/forms/FormField";
import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { cn } from "@/lib/cn";

export function CatchPhotoField({
  selectedImage,
  existingImageUrl,
  onImageChange,
  optional = true,
  compact = false,
  showLabel = true,
}: {
  selectedImage: File | null;
  existingImageUrl?: string | null;
  onImageChange: (file: File | null) => void;
  optional?: boolean;
  compact?: boolean;
  showLabel?: boolean;
}) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage]);

  const visibleImage =
    previewUrl ??
    existingImageUrl ??
    null;

  return (
    <div>
      {showLabel && (
        <FieldLabel>
          Zdjęcie połowu
          {optional ? " (opcjonalnie)" : ""}
        </FieldLabel>
      )}

      <div className="relative overflow-hidden rounded-control border border-dashed border-border-strong bg-surface-muted">
        {visibleImage ? (
          <div
            className={cn(
              "relative w-full overflow-hidden bg-surface-muted",
              compact
                ? "h-32 sm:h-36"
                : "aspect-[16/9] max-h-64"
            )}
          >
            <img
              src={visibleImage}
              alt="Podgląd zdjęcia połowu"
              className="h-full w-full object-cover"
            />

            {selectedImage && (
              <button
                type="button"
                onClick={() => onImageChange(null)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/95 text-text-secondary shadow-card transition hover:bg-surface hover:text-text"
                aria-label="Usuń wybrane zdjęcie"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <label
            htmlFor={inputId}
            className={cn(
              "cursor-pointer transition hover:bg-primary-50/45",
              compact
                ? "flex min-h-28 items-center gap-4 px-5 py-5 text-left"
                : "flex min-h-44 flex-col items-center justify-center px-6 py-8 text-center"
            )}
          >
            <span
              className={cn(
                "flex shrink-0 items-center justify-center bg-primary-100 text-primary",
                compact
                  ? "h-11 w-11 rounded-xl"
                  : "h-12 w-12 rounded-2xl"
              )}
            >
              <AddCircleIcon
                className={
                  compact
                    ? "h-5 w-5"
                    : "h-6 w-6"
                }
              />
            </span>

            <span
              className={cn(
                compact
                  ? "min-w-0"
                  : "mt-4"
              )}
            >
              <span className="block text-sm font-bold text-text">
                Dodaj zdjęcie
              </span>

              <span
                className={cn(
                  "block text-xs leading-5 text-text-muted",
                  compact
                    ? "mt-1"
                    : "mt-1 max-w-sm"
                )}
              >
                {compact
                  ? "Wybierz zdjęcie z urządzenia lub zrób je telefonem."
                  : "Wybierz zdjęcie z urządzenia. Na telefonie możesz skorzystać z aparatu."}
              </span>
            </span>
          </label>
        )}

        <input
          id={inputId}
          type="file"
          accept="image/*"
          capture={compact ? "environment" : undefined}
          onChange={(event) => {
            onImageChange(
              event.target.files?.[0] ??
                null
            );
          }}
          className="sr-only"
        />
      </div>

      {visibleImage && (
        <label
          htmlFor={inputId}
          className="mt-2.5 inline-flex cursor-pointer text-xs font-bold text-primary transition hover:text-primary-hover"
        >
          {selectedImage
            ? "Wybierz inne zdjęcie"
            : "Zmień zdjęcie"}
        </label>
      )}

      {selectedImage && !compact && (
        <p className="mt-2 text-xs text-text-muted">
          {selectedImage.name} · zdjęcie zostanie zapisane jako WebP.
        </p>
      )}
    </div>
  );
}
