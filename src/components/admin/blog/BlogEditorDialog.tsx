"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { CloseIcon } from "@/components/icons/CloseIcon";
import { cn } from "@/lib/cn";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function BlogEditorDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  busy = false,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  busy?: boolean;
  size?:
    | "sm"
    | "md"
    | "lg"
    | "preview";
}) {
  const [mounted, setMounted] =
    useState(false);

  const titleId = useId();

  const dialogRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const closeRef =
    useRef(onClose);

  const busyRef =
    useRef(busy);

  closeRef.current = onClose;
  busyRef.current = busy;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    const previousActive =
      document.activeElement instanceof
      HTMLElement
        ? document.activeElement
        : null;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape" &&
        !busyRef.current
      ) {
        event.preventDefault();
        closeRef.current();
        return;
      }

      if (
        event.key !== "Tab"
      ) {
        return;
      }

      const root =
        dialogRef.current;

      if (!root) {
        return;
      }

      const focusable =
        Array.from(
          root.querySelectorAll<HTMLElement>(
            FOCUSABLE_SELECTOR
          )
        );

      if (
        focusable.length === 0
      ) {
        event.preventDefault();
        return;
      }

      const first =
        focusable[0];

      const last =
        focusable[
          focusable.length - 1
        ];

      if (
        event.shiftKey &&
        document.activeElement ===
          first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement ===
          last
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    const frame =
      window.requestAnimationFrame(
        () => {
          dialogRef.current
            ?.querySelector<HTMLElement>(
              "[data-autofocus], button, input, select, textarea, a[href]"
            )
            ?.focus({
              preventScroll: true,
            });
        }
      );

    return () => {
      window.cancelAnimationFrame(
        frame
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;

      window.requestAnimationFrame(
        () =>
          previousActive?.focus()
      );
    };
  }, [open]);

  if (
    !mounted ||
    !open
  ) {
    return null;
  }

  const width =
    size === "sm"
      ? "sm:max-w-[560px]"
      : size === "lg"
        ? "sm:max-w-[900px]"
        : size === "preview"
          ? "sm:max-w-[calc(100vw-48px)]"
          : "sm:max-w-[700px]";

  return createPortal(
    <div
      className="fixed inset-0 z-[1600] flex items-end justify-center bg-navy-950/80 backdrop-blur-[4px] sm:items-center sm:p-6"
      onMouseDown={() => {
        if (!busyRef.current) {
          closeRef.current();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          titleId
        }
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className={cn(
          "flex max-h-[94dvh] min-h-0 w-full flex-col overflow-hidden rounded-t-modal border-border bg-surface shadow-float sm:rounded-modal sm:border",
          width,
          size === "preview" &&
            "h-[92dvh]"
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-5 border-b border-border px-5 py-5 sm:px-6">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-display text-xl font-extrabold tracking-[-0.025em] text-text sm:text-2xl"
            >
              {title}
            </h2>

            {description && (
              <p className="mt-1.5 text-sm leading-6 text-text-secondary">
                {
                  description
                }
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              closeRef.current()
            }
            disabled={busy}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-muted text-text-secondary transition hover:bg-surface-hover hover:text-text disabled:opacity-50"
            aria-label="Zamknij"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {footer && (
          <footer className="shrink-0 border-t border-border px-5 py-4 sm:px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
}
