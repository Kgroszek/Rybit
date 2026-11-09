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
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export type DialogSize =
  | "sm"
  | "md"
  | "lg";

export type DialogProps = {
  open?: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  description?: string;
  headerMeta?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  busy?: boolean;
  size?: DialogSize;
  closeLabel?: string;
};

export function Dialog({
  open = true,
  onClose,
  eyebrow,
  title,
  description,
  headerMeta,
  children,
  footer,
  busy = false,
  size = "md",
  closeLabel = "Zamknij",
}: DialogProps) {
  const [mounted, setMounted] =
    useState(false);

  const titleId = useId();
  const descriptionId = useId();

  const dialogRef =
    useRef<HTMLDivElement | null>(null);

  const previousActiveRef =
    useRef<HTMLElement | null>(null);

  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);

  onCloseRef.current = onClose;
  busyRef.current = busy;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousActiveRef.current =
      document.activeElement instanceof
      HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      const dialog =
        dialogRef.current;

      if (!dialog) {
        return;
      }

      if (event.key === "Escape") {
        if (!busyRef.current) {
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
          !element.hasAttribute(
            "disabled"
          ) &&
          element.getAttribute(
            "aria-hidden"
          ) !== "true"
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last =
        focusable[
          focusable.length - 1
        ];

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

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    const frame =
      window.requestAnimationFrame(
        () => {
          const autofocus =
            dialogRef.current?.querySelector<HTMLElement>(
              "[data-autofocus]"
            );

          const first =
            autofocus ||
            dialogRef.current?.querySelector<HTMLElement>(
              FOCUSABLE_SELECTOR
            );

          first?.focus({
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
        () => {
          previousActiveRef.current?.focus();
        }
      );
    };
  }, [open]);

  if (!mounted || !open) {
    return null;
  }

  const maxWidth =
    size === "sm"
      ? "sm:max-w-[620px]"
      : size === "lg"
        ? "sm:max-w-[920px]"
        : "sm:max-w-[720px]";

  const maxHeight =
    size === "lg"
      ? "min(92dvh, 900px)"
      : "min(90dvh, 820px)";

  return createPortal(
    <div
      className="fixed inset-0 z-[1400] flex items-end justify-center overflow-hidden bg-navy-950/80 backdrop-blur-[4px] sm:items-center sm:p-6"
      onMouseDown={() => {
        if (!busyRef.current) {
          onCloseRef.current();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={
          description
            ? descriptionId
            : undefined
        }
        className={cn(
          "flex min-h-0 w-full flex-col overflow-hidden rounded-t-modal border-border bg-surface shadow-float sm:rounded-modal sm:border",
          maxWidth
        )}
        style={{
          height: maxHeight,
        }}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header className="shrink-0 border-b border-border bg-surface px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              {(eyebrow ||
                headerMeta) && (
                <div className="flex flex-wrap items-center gap-2">
                  {eyebrow && (
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                      {eyebrow}
                    </p>
                  )}

                  {headerMeta}
                </div>
              )}

              <h2
                id={titleId}
                className={cn(
                  "break-words font-display text-2xl font-extrabold tracking-[-0.03em] text-text sm:text-3xl",
                  (eyebrow ||
                    headerMeta) &&
                    "mt-2"
                )}
              >
                {title}
              </h2>

              {description && (
                <p
                  id={descriptionId}
                  className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary"
                >
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                onCloseRef.current()
              }
              disabled={busy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-muted text-text-secondary transition hover:bg-surface-hover hover:text-text disabled:opacity-50"
              aria-label={closeLabel}
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-7 [overflow-anchor:none] [scrollbar-gutter:stable] sm:px-7 sm:py-8">
          {children}
        </div>

        {footer && (
          <footer className="shrink-0 border-t border-border bg-surface px-5 py-4 shadow-[0_-8px_24px_rgba(13,30,51,0.035)] sm:px-7 sm:py-5">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
}
