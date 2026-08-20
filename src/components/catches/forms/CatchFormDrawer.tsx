"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
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
import { formatDateTime } from "@/components/catches/utils";
import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { Button } from "@/components/ui/Button";

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
  onSwitchToFull: () => void;
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
  onSwitchToFull,
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

  // `mode` pozostaje kontrolowany przez CatchesManager. Lokalny tryb służy tylko
  // do bezpiecznego powrotu Full -> Quick bez wymagania zmiany publicznego API
  // managera. Przy każdym nowym otwarciu synchronizujemy go z propsem.
  const [visibleMode, setVisibleMode] = useState<CatchFormMode>(mode);

  onCloseRef.current = onClose;
  isLoadingRef.current = isLoading;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setVisibleMode(mode);
  }, [editingCatch?.id, isOpen, mode]);

  const isQuick = visibleMode === "quick" && !editingCatch;
  const canReturnToQuick = !editingCatch && visibleMode === "full";

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
      ).filter((element) => {
        return (
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true"
        );
      });

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

      const firstField =
        contentRef.current?.querySelector<HTMLElement>(
          'select:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled])'
        );

      firstField?.focus({
        preventScroll: true,
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [editingCatch?.id, isOpen, visibleMode]);

  if (!isOpen) {
    return null;
  }

  const title = editingCatch
    ? "Edytuj połów"
    : isQuick
      ? "Dodaj połów"
      : "Pełny formularz";

  const description = editingCatch
    ? "Zaktualizuj dane, zdjęcie i ustawienia widoczności połowu."
    : isQuick
      ? "Zapisz najważniejsze informacje. Szczegóły możesz uzupełnić później."
      : "Uzupełnij wszystkie dane połowu w jednym uporządkowanym formularzu.";

  function switchToFull() {
    setVisibleMode("full");
    onSwitchToFull();
  }

  function switchToQuick() {
    setVisibleMode("quick");
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center overflow-hidden bg-navy-950/70 backdrop-blur-[3px] sm:items-center sm:p-8"
      onMouseDown={() => {
        if (!isLoading) {
          onClose();
        }
      }}
    >
      <form
        ref={dialogRef}
        onSubmit={onSubmit}
        className="catch-form-dialog flex min-h-0 w-full flex-col overflow-hidden rounded-t-modal border-border bg-surface shadow-float sm:w-auto sm:rounded-modal sm:border"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        role="dialog"
      >
        <header className="flex shrink-0 items-start justify-between gap-6 border-b border-border px-5 py-5 sm:px-8 sm:py-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary sm:text-[11px]">
              {isQuick ? "Szybki zapis" : "Dziennik połowów"}
            </p>

            <h2
              id={titleId}
              className="mt-1.5 font-display text-xl font-extrabold tracking-[-0.02em] text-text sm:text-2xl"
            >
              {title}
            </h2>

            <p
              id={descriptionId}
              className="mt-2 max-w-2xl text-xs leading-5 text-text-secondary sm:text-sm sm:leading-6"
            >
              {description}
            </p>

            {isQuick && form.caughtAt && (
              <p className="mt-3 text-xs font-semibold text-text-muted">
                {formatDateTime(form.caughtAt)}
                <span className="mx-1.5 text-border-strong">·</span>
                data ustawiona automatycznie
              </p>
            )}

            {canReturnToQuick && (
              <button
                type="button"
                onClick={switchToQuick}
                disabled={isLoading}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg py-1 text-xs font-bold text-primary transition hover:text-primary-hover disabled:opacity-50 sm:text-sm"
              >
                <ArrowSmallRightIcon className="h-4 w-4 rotate-180" />
                Wróć do szybkiego formularza
              </button>
            )}
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
        </header>

        <div
          ref={contentRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 [scrollbar-gutter:stable] sm:px-8 sm:py-8"
        >
          {isQuick ? (
            <QuickCatchForm
              form={form}
              selectedImage={selectedImage}
              lakes={lakes}
              trips={trips}
              autoTripId={autoTripId}
              isLoading={isLoading}
              onSwitchToFull={switchToFull}
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

        <footer className="shrink-0 border-t border-border bg-surface px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto sm:min-w-32"
            >
              Anuluj
            </Button>

            <Button
              type="submit"
              isLoading={isLoading}
              loadingLabel="Zapisywanie…"
              className="w-full sm:w-auto sm:min-w-40"
            >
              {editingCatch ? "Zapisz zmiany" : "Zapisz połów"}
            </Button>
          </div>
        </footer>
      </form>

      <style jsx>{`
        .catch-form-dialog {
          height: min(90dvh, 760px);
        }

        @media (min-width: 640px) {
          .catch-form-dialog {
            width: min(840px, calc(100vw - 64px));
            height: min(760px, calc(100dvh - 64px));
          }
        }
      `}</style>
    </div>
  );
}
