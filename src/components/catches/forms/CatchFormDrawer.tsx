"use client";

import { useEffect, useRef } from "react";
import type { FormEvent } from "react";

import { FullCatchForm } from "@/components/catches/forms/FullCatchForm";
import { QuickCatchForm } from "@/components/catches/forms/QuickCatchForm";
import type {
  CatchFieldChange,
  CatchFormMode,
  CatchFormState,
  FishingCatch,
  LakeOption,
  TripOption,
} from "@/components/catches/types";
import { CloseIcon } from "@/components/icons/CloseIcon";

export function CatchFormDrawer({
  isOpen,
  mode,
  form,
  editingCatch,
  selectedImage,
  lakes,
  trips,
  autoTripId,
  isLoading,
  onSubmit,
  onClose,
  onSwitchToFull,
  onFieldChange,
  onImageChange,
}: {
  isOpen: boolean;
  mode: CatchFormMode;
  form: CatchFormState;
  editingCatch: FishingCatch | null;
  selectedImage: File | null;
  lakes: LakeOption[];
  trips: TripOption[];
  autoTripId: string | null;
  isLoading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  onSwitchToFull: () => void;
  onFieldChange: CatchFieldChange;
  onImageChange: (file: File | null) => void;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isLoading, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const frame = window.requestAnimationFrame(() => {
      contentRef.current?.scrollTo({ top: 0, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [editingCatch?.id, isOpen, mode]);

  if (!isOpen) return null;

  const isQuick = mode === "quick" && !editingCatch;

  return (
    <div
      className="fixed inset-0 z-[1200] overflow-y-auto bg-navy-950/55 backdrop-blur-[2px]"
      onMouseDown={() => {
        if (!isLoading) onClose();
      }}
    >
      <div className="flex min-h-full items-end justify-center sm:items-center sm:p-6">
        <section
          className="catch-form-dialog flex min-h-0 w-full flex-col overflow-hidden rounded-t-modal border-border bg-surface shadow-float sm:rounded-modal sm:border"
          onMouseDown={(event) => event.stopPropagation()}
          aria-modal="true"
          role="dialog"
          aria-label={
            editingCatch
              ? "Edytuj połów"
              : isQuick
                ? "Szybki połów"
                : "Pełny formularz połowu"
          }
        >
          <div className="flex shrink-0 items-start justify-between gap-5 border-b border-border px-5 py-3.5 sm:px-6 sm:py-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary sm:text-[11px]">
                {isQuick ? "Szybki zapis" : "Dziennik połowów"}
              </p>

              <h2 className="mt-1 font-display text-lg font-bold text-text sm:text-xl">
                {editingCatch
                  ? "Edytuj połów"
                  : isQuick
                    ? "Dodaj połów"
                    : "Pełny formularz"}
              </h2>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-text-secondary sm:text-sm">
                {editingCatch
                  ? "Zaktualizuj dane zapisanego połowu."
                  : isQuick
                    ? "Zapisz najważniejsze dane. Resztę możesz uzupełnić później."
                    : "Uzupełnij szczegóły połowu, zdjęcie i ustawienia rankingu."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-surface-muted text-text-secondary transition hover:bg-surface-hover hover:text-text disabled:opacity-50 sm:h-10 sm:w-10"
              aria-label="Zamknij formularz"
            >
              <CloseIcon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </button>
          </div>

          <div
            ref={contentRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 [scrollbar-gutter:stable] sm:px-6 sm:py-5"
          >
            {isQuick ? (
              <QuickCatchForm
                form={form}
                selectedImage={selectedImage}
                lakes={lakes}
                trips={trips}
                autoTripId={autoTripId}
                isLoading={isLoading}
                onSubmit={onSubmit}
                onCancel={onClose}
                onSwitchToFull={onSwitchToFull}
                onFieldChange={onFieldChange}
                onImageChange={onImageChange}
              />
            ) : (
              <FullCatchForm
                form={form}
                editingCatch={editingCatch}
                selectedImage={selectedImage}
                lakes={lakes}
                trips={trips}
                isLoading={isLoading}
                onSubmit={onSubmit}
                onCancel={onClose}
                onFieldChange={onFieldChange}
                onImageChange={onImageChange}
              />
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        .catch-form-dialog {
          max-height: 92dvh;
        }

        @media (min-width: 640px) {
          .catch-form-dialog {
            width: min(740px, calc(100vw - 48px));
            height: min(760px, calc(100dvh - 48px));
            max-height: calc(100dvh - 48px);
          }
        }
      `}</style>
    </div>
  );
}
