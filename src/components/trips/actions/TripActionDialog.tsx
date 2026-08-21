"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { cn } from "@/lib/cn";

const FOCUSABLE = [
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function TripActionDialog({ open, onClose, title, description, children, footer, size = "md", busy = false }: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
  busy?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);
  onCloseRef.current = onClose;
  busyRef.current = busy;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (event.key === "Escape") {
        if (!busyRef.current) {
          event.preventDefault();
          onCloseRef.current();
        }
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
      );
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const frame = window.requestAnimationFrame(() => {
      const autofocus = dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]");
      const first = autofocus || dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => previousFocusRef.current?.focus());
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1400] flex items-end justify-center overflow-hidden bg-navy-950/80 backdrop-blur-[4px] sm:items-center sm:p-6"
      onMouseDown={() => { if (!busy) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onMouseDown={(event) => event.stopPropagation()}
        className={cn(
          "flex min-h-0 w-full flex-col overflow-hidden rounded-t-modal border-border bg-surface shadow-float sm:rounded-modal sm:border",
          size === "lg" ? "sm:max-w-[960px]" : "sm:max-w-[720px]"
        )}
        style={{ height: size === "lg" ? "min(90dvh, 860px)" : "min(88dvh, 760px)" }}
      >
        <header className="shrink-0 border-b border-border bg-surface px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Centrum wyprawy</p>
              <h2 id={titleId} className="mt-1.5 font-display text-2xl font-extrabold tracking-[-0.025em] text-text">{title}</h2>
              {description && <p id={descriptionId} className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Zamknij okno"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-muted text-text-secondary transition hover:bg-surface-hover hover:text-text disabled:opacity-50"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-6 [scrollbar-gutter:stable] sm:px-7 sm:py-7">{children}</div>

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
