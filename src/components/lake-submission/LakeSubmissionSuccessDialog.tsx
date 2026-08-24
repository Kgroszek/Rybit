"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createPortal,
} from "react-dom";

import {
  Button,
} from "@/components/ui/Button";

export function LakeSubmissionSuccessDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [
    mounted,
    setMounted,
  ] = useState(false);

  const dialogRef =
    useRef<HTMLDivElement | null>(
      null
    );

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

    document.body.style.overflow =
      "hidden";

    const frame =
      window.requestAnimationFrame(
        () =>
          dialogRef.current
            ?.querySelector<HTMLButtonElement>(
              "[data-autofocus]"
            )
            ?.focus()
      );

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
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
    };
  }, [open, onClose]);

  if (
    !mounted ||
    !open
  ) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[1600] flex items-end justify-center bg-navy-950/75 px-0 backdrop-blur-[4px] sm:items-center sm:p-6"
      onMouseDown={
        onClose
      }
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lake-submission-success-title"
        className="w-[420px] max-w-[calc(100vw-32px)] rounded-modal border border-border bg-surface p-6 shadow-float"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-panel border border-success-border bg-success-subtle font-display text-xl font-black text-success-foreground">
          ✓
        </div>

        <h2
          id="lake-submission-success-title"
          className="mt-5 text-center font-display text-2xl font-extrabold tracking-[-0.03em] text-text"
        >
          Zgłoszenie zostało wysłane
        </h2>

        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-6 text-text-secondary">
          Dziękujemy za pomoc w rozwijaniu bazy Rybio. Zgłoszenie trafiło do weryfikacji administratora i pojawi się publicznie dopiero po akceptacji.
        </p>

        <Button
          type="button"
          data-autofocus
          fullWidth
          className="mt-6"
          onClick={onClose}
        >
          Rozumiem
        </Button>
      </div>
    </div>,
    document.body
  );
}
