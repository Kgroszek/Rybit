"use client";

import {
  useEffect,
  useId,
  useRef,
  type FormEvent,
} from "react";

import { CloseIcon } from "@/components/icons/CloseIcon";
import { TripForm } from "@/components/trips/forms/TripForm";
import type {
  LakeOption,
  TripFormState,
} from "@/components/trips/types";
import { Button } from "@/components/ui/Button";

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function TripFormDialog({
  isOpen,
  isEditing,
  isLoading,
  form,
  lakes,
  onClose,
  onSubmit,
  onFieldChange,
}: {
  isOpen: boolean;
  isEditing: boolean;
  isLoading: boolean;
  form: TripFormState;
  lakes: LakeOption[];
  onClose: () => void;
  onSubmit: () => void;
  onFieldChange: <K extends keyof TripFormState>(
    field: K,
    value: TripFormState[K]
  ) => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLFormElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const isLoadingRef = useRef(isLoading);

  onCloseRef.current = onClose;
  isLoadingRef.current = isLoading;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousActiveRef.current =
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
        dialog.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR
        )
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

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    const frame = window.requestAnimationFrame(() => {
      const firstFocusable =
        dialogRef.current?.querySelector<HTMLElement>(
          FOCUSABLE_SELECTOR
        );
      firstFocusable?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
      document.body.style.overflow = previousOverflow;

      window.requestAnimationFrame(() => {
        previousActiveRef.current?.focus();
      });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    contentRef.current?.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [isEditing, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center overflow-hidden bg-navy-950/80 backdrop-blur-[4px] sm:items-center sm:p-6 lg:p-8"
      onMouseDown={() => {
        if (!isLoading) {
          onClose();
        }
      }}
    >
      <form
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="trip-form-dialog flex min-h-0 w-full flex-col overflow-hidden rounded-t-modal border-border bg-surface shadow-float sm:rounded-modal sm:border"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <header className="shrink-0 border-b border-border bg-surface px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                Centrum wypraw
              </p>

              <h2
                id={titleId}
                className="mt-1.5 font-display text-2xl font-extrabold tracking-[-0.025em] text-text"
              >
                {isEditing
                  ? "Edytuj wyprawę"
                  : "Zaplanuj wyprawę"}
              </h2>

              <p
                id={descriptionId}
                className="mt-2 max-w-xl text-sm leading-6 text-text-secondary"
              >
                Uzupełnij najważniejsze informacje. Uczestników,
                koszty i pozostałe dane dodasz później w centrum
                konkretnej wyprawy.
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
        </header>

        <div
          ref={contentRef}
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-7 [scrollbar-gutter:stable] sm:px-8 sm:py-8"
        >
          <TripForm
            form={form}
            lakes={lakes}
            onFieldChange={onFieldChange}
          />
        </div>

        <footer className="shrink-0 border-t border-border bg-surface px-5 py-4 shadow-[0_-8px_24px_rgba(13,30,51,0.035)] sm:px-8 sm:py-5">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="h-12 min-h-12 w-full sm:w-auto sm:min-w-32"
            >
              Anuluj
            </Button>

            <Button
              type="submit"
              isLoading={isLoading}
              loadingLabel="Zapisywanie…"
              className="h-12 min-h-12 w-full sm:w-auto sm:min-w-44"
            >
              {isEditing
                ? "Zapisz zmiany"
                : "Zaplanuj wyprawę"}
            </Button>
          </div>
        </footer>
      </form>

      <style jsx>{`
        .trip-form-dialog {
          height: min(90dvh, 800px);
        }

        @media (min-width: 640px) and (max-width: 1279px) {
          .trip-form-dialog {
            width: min(860px, calc(100vw - 48px));
            height: min(820px, calc(100dvh - 48px));
          }
        }

        @media (min-width: 1280px) {
          .trip-form-dialog {
            width: min(900px, 50vw);
            height: min(820px, calc(100dvh - 64px));
          }
        }
      `}</style>
    </div>
  );
}
