"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { MoreIcon } from "@/components/icons/MoreIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";

export function CatchActionsMenu({
  catchId,
  onDelete,
}: {
  catchId: string;
  onDelete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-11 w-11 items-center justify-center rounded-control border border-border bg-surface text-text-secondary transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        aria-label="Więcej akcji"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <MoreIcon className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute bottom-full right-0 z-40 mb-2 w-52 overflow-hidden rounded-control border border-border bg-surface p-1.5 shadow-card-hover"
        >
          <Link
            href={`/polowy/${catchId}`}
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold text-text transition hover:bg-surface-muted"
          >
            Otwórz szczegóły
          </Link>

          <div className="my-1 border-t border-border" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className="flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold text-danger transition hover:bg-danger-subtle"
          >
            <TrashIcon className="h-4 w-4" />
            Usuń połów
          </button>
        </div>
      )}
    </div>
  );
}
