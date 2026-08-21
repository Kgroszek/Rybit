"use client";

import {
  useEffect,
  useId,
  useRef,
} from "react";
import type { FormEvent, ReactNode } from "react";

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
import { formatDateTime } from "@/components/catches/utils";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type CatchFormDrawerProps = {
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
  onModeChange: (mode: CatchFormMode) => void;
  onFieldChange: CatchFieldChange;
  onImageChange: (file: File | null) => void;
};

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

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
  onModeChange,
  onFieldChange,
  onImageChange,
}: CatchFormDrawerProps) {
  const titleId = useId();
  const descriptionId = useId();

  const dialogRef = useRef<HTMLFormElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const isLoadingRef = useRef(isLoading);

  onCloseRef.current = onClose;
  isLoadingRef.current = isLoading;

  const isQuick = mode === "quick" && !editingCatch;
  const canChangeMode = !editingCatch;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      if (event.key === "Escape") {
        if (!isLoadingRef.current) {
          event.preventDefault();
          onCloseRef.current();
        }
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true"
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      window.requestAnimationFrame(() => {
        previousActiveElementRef.current?.focus();
      });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      contentRef.current?.scrollTo({
        top: 0,
        behavior: "auto",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [editingCatch?.id, isOpen, mode]);

  if (!isOpen) {
    return null;
  }

  const title = editingCatch ? "Edytuj połów" : "Dodaj połów";

  const description = editingCatch
    ? "Zaktualizuj dane, zdjęcie i ustawienia widoczności połowu."
    : isQuick
      ? "Zapisz najważniejsze informacje w kilkadziesiąt sekund."
      : "Uzupełnij wszystkie szczegóły połowu w jednym miejscu.";

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center overflow-hidden backdrop-blur-[4px] sm:items-center sm:p-6 lg:p-8"
      style={{
        backgroundColor: "rgba(13, 30, 51, 0.78)",
      }}
      onMouseDown={() => {
        if (!isLoading) {
          onClose();
        }
      }}
    >
      <form
        ref={dialogRef}
        onSubmit={onSubmit}
        className="catch-form-dialog flex min-h-0 w-full flex-col overflow-hidden rounded-t-modal border-border bg-surface shadow-float sm:rounded-modal sm:border"
        onMouseDown={(event) => event.stopPropagation()}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        role="dialog"
      >
        <header className="shrink-0 border-b border-border bg-surface px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                Dziennik połowów
              </p>

              <h2
                id={titleId}
                className="mt-1.5 font-display text-2xl font-extrabold tracking-[-0.025em] text-text"
              >
                {title}
              </h2>

              <p
                id={descriptionId}
                className="mt-2 max-w-xl text-sm leading-6 text-text-secondary"
              >
                {description}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-muted text-text-secondary transition hover:bg-surface-hover hover:text-text disabled:opacity-50"
              aria-label="Zamknij formularz"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {canChangeMode && (
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div
                className="grid w-full grid-cols-2 gap-1.5 rounded-control bg-surface-muted p-1.5 sm:w-auto"
                role="tablist"
                aria-label="Tryb formularza połowu"
              >
                <ModeButton
                  isActive={mode === "quick"}
                  onClick={() => onModeChange("quick")}
                  disabled={isLoading}
                >
                  Szybki zapis
                </ModeButton>

                <ModeButton
                  isActive={mode === "full"}
                  onClick={() => onModeChange("full")}
                  disabled={isLoading}
                >
                  Pełny formularz
                </ModeButton>
              </div>

              {form.caughtAt && (
                <p className="shrink-0 text-xs font-semibold text-text-muted">
                  Data połowu: {formatDateTime(form.caughtAt)}
                </p>
              )}
            </div>
          )}
        </header>

        <div
          ref={contentRef}
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-7 [scrollbar-gutter:stable] sm:px-8 sm:py-8"
        >
          {isQuick ? (
            <QuickCatchForm
              form={form}
              selectedImage={selectedImage}
              lakes={lakes}
              trips={trips}
              autoTripId={autoTripId}
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
              onFieldChange={onFieldChange}
              onImageChange={onImageChange}
            />
          )}
        </div>

        <footer className="shrink-0 border-t border-border bg-surface px-5 py-4 shadow-[0_-8px_24px_rgba(13,30,51,0.035)] sm:px-8 sm:py-5">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isLoading}
              className="h-12 min-h-12 w-full sm:w-auto sm:min-w-36"
            >
              Anuluj
            </Button>

            <Button
              type="submit"
              size="md"
              isLoading={isLoading}
              loadingLabel="Zapisywanie…"
              className="h-12 min-h-12 w-full sm:w-auto sm:min-w-44"
            >
              {editingCatch
                ? "Zapisz zmiany"
                : isQuick
                  ? "Zapisz szybki połów"
                  : "Zapisz połów"}
            </Button>
          </div>
        </footer>
      </form>

      <style jsx>{`
        .catch-form-dialog {
          height: min(90dvh, 780px);
        }

        @media (min-width: 640px) and (max-width: 1279px) {
          .catch-form-dialog {
            width: min(820px, calc(100vw - 48px));
            height: min(820px, calc(100dvh - 48px));
          }
        }

        @media (min-width: 1280px) {
          .catch-form-dialog {
            width: min(880px, 50vw);
            height: min(820px, calc(100dvh - 64px));
          }
        }
      `}</style>
    </div>
  );
}

function ModeButton({
  isActive,
  onClick,
  disabled,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-11 min-h-11 whitespace-nowrap rounded-xl px-5 text-sm font-bold leading-none transition-[background-color,color,box-shadow] sm:min-w-[158px]",
        isActive
          ? "bg-surface text-primary shadow-[0_1px_3px_rgba(13,30,51,0.10)]"
          : "text-text-secondary hover:text-text",
        disabled && "opacity-50"
      )}
    >
      {children}
    </button>
  );
}
