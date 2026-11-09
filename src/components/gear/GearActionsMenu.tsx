"use client";

import {
  useEffect,
  useRef,
} from "react";

import type {
  FishingGearDto,
} from "@/components/gear/types";
import { MoreIcon } from "@/components/icons/MoreIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";

export function GearActionsMenu({
  item,
  open,
  disabled,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  item: FishingGearDto;
  open: boolean;
  disabled: boolean;
  onOpenChange: (
    open: boolean
  ) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const rootRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClick(
      event: MouseEvent
    ) {
      if (
        rootRef.current &&
        !rootRef.current.contains(
          event.target as Node
        )
      ) {
        onOpenChange(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    // Używamy `click`, a nie `mousedown`.
    // Widok desktopowy i mobilny są jednocześnie obecne w DOM
    // (jeden z nich jest tylko ukryty przez CSS) i współdzielą openMenuId.
    // Przy `mousedown` ukryta instancja mogła zamknąć menu zanim
    // `onClick` widocznej pozycji „Edytuj” / „Usuń” został wywołany.
    document.addEventListener(
      "click",
      handleClick
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onOpenChange]);

  return (
    <div
      ref={rootRef}
      className="relative"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onOpenChange(!open)
        }
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50"
        aria-label={`Akcje dla ${item.name}`}
      >
        <MoreIcon className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-control border border-border bg-surface p-1.5 shadow-float"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onOpenChange(false);
              onEdit();
            }}
            className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-text-secondary transition hover:bg-surface-muted hover:text-text"
          >
            <PencilIcon className="h-4 w-4" />
            Edytuj sprzęt
          </button>

          <div className="my-1 h-px bg-border" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onOpenChange(false);
              onDelete();
            }}
            className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-danger-foreground transition hover:bg-danger-subtle"
          >
            <TrashIcon className="h-4 w-4" />
            Usuń sprzęt
          </button>
        </div>
      )}
    </div>
  );
}
