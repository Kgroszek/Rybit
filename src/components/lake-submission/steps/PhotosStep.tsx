"use client";

import {
  useRef,
  useState,
  type DragEvent,
} from "react";

import {
  AddCircleIcon,
} from "@/components/icons/AddCircleIcon";
import {
  TrashIcon,
} from "@/components/icons/TrashIcon";
import {
  Button,
} from "@/components/ui/Button";
import {
  cn,
} from "@/lib/cn";
import {
  formatLakeSubmissionFileSize,
  MAX_LAKE_SUBMISSION_IMAGES,
} from "@/lib/lake-submission/lake-submission-images";
import type {
  LakeSubmissionImagePreview,
} from "@/lib/lake-submission/lake-submission-types";

export function PhotosStep({
  imagePreviews,
  isLoading,
  isProcessingImages,
  onFilesSelected,
  onRemoveImage,
  onClearImages,
}: {
  imagePreviews:
    LakeSubmissionImagePreview[];
  isLoading: boolean;
  isProcessingImages: boolean;
  onFilesSelected: (
    files: File[]
  ) => void;
  onRemoveImage: (
    index: number
  ) => void;
  onClearImages: () => void;
}) {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [dragging, setDragging] =
    useState(false);

  const disabled =
    isLoading ||
    isProcessingImages;

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setDragging(false);

    if (disabled) {
      return;
    }

    onFilesSelected(
      Array.from(
        event.dataTransfer.files
      )
    );
  }

  return (
    <div>
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) {
            setDragging(true);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDragLeave={(event) => {
          if (
            event.currentTarget ===
            event.target
          ) {
            setDragging(false);
          }
        }}
        onDrop={handleDrop}
        className={cn(
          "rounded-panel border border-dashed px-5 py-9 text-center transition sm:px-8 sm:py-12",
          dragging
            ? "border-primary bg-primary-50"
            : "border-border-strong bg-surface-muted",
          disabled &&
            "opacity-60"
        )}
      >
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-control border border-primary-200 bg-surface text-primary-700 shadow-sm">
          <AddCircleIcon className="h-5 w-5" />
        </div>

        <h3 className="mt-4 font-display text-lg font-extrabold tracking-[-0.025em] text-text">
          Dodaj zdjęcia łowiska
        </h3>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-text-secondary">
          Przeciągnij pliki tutaj lub wybierz je z urządzenia. Zdjęcia zostaną automatycznie zmniejszone i skompresowane przed wysłaniem.
        </p>

        <p className="mt-2 text-xs leading-5 text-text-muted">
          JPG, PNG i WEBP · maks.{" "}
          {
            MAX_LAKE_SUBMISSION_IMAGES
          }{" "}
          zdjęć · maks. 5 MB po kompresji
        </p>

        <p className="mt-1 text-xs leading-5 text-text-muted">
          HEIC / HEIF nie jest obsługiwany.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple
          disabled={disabled}
          className="hidden"
          onChange={(event) => {
            onFilesSelected(
              Array.from(
                event.target.files ??
                  []
              )
            );

            event.currentTarget.value =
              "";
          }}
        />

        <Button
          type="button"
          variant="outline"
          className="mt-5"
          disabled={disabled}
          onClick={() =>
            inputRef.current?.click()
          }
        >
          {isProcessingImages
            ? "Przygotowywanie zdjęć…"
            : "Wybierz zdjęcia"}
        </Button>
      </div>

      {isProcessingImages && (
        <div className="mt-4 rounded-control border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-800">
          Przygotowuję i kompresuję zdjęcia. Poczekaj chwilę przed przejściem dalej.
        </div>
      )}

      {imagePreviews.length >
        0 && (
        <div className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-extrabold text-text">
                Dodane zdjęcia
              </p>

              <p className="mt-1 text-xs text-text-muted">
                {
                  imagePreviews.length
                }
                /
                {
                  MAX_LAKE_SUBMISSION_IMAGES
                }
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="text-danger-foreground hover:bg-danger-subtle hover:text-danger-foreground"
              onClick={
                onClearImages
              }
            >
              Usuń wszystkie
            </Button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {imagePreviews.map(
              (
                imagePreview,
                index
              ) => (
                <article
                  key={`${imagePreview.file.name}-${imagePreview.file.lastModified}-${index}`}
                  className="group overflow-hidden rounded-card border border-border bg-surface shadow-sm"
                >
                  <div className="relative">
                    <img
                      src={
                        imagePreview.url
                      }
                      alt={
                        imagePreview.file.name
                      }
                      className="aspect-[4/3] w-full object-cover"
                    />

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        onRemoveImage(
                          index
                        )
                      }
                      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-surface/92 text-danger-foreground shadow-sm backdrop-blur transition hover:bg-danger-subtle disabled:opacity-50"
                      aria-label={`Usuń zdjęcie ${imagePreview.file.name}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-3">
                    <p className="truncate text-xs font-bold text-text-secondary">
                      {
                        imagePreview.file.name
                      }
                    </p>

                    <p className="mt-1 text-[10px] font-semibold text-text-muted">
                      {formatLakeSubmissionFileSize(
                        imagePreview.file.size
                      )}
                    </p>
                  </div>
                </article>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
