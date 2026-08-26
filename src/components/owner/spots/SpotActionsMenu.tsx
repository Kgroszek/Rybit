"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
} from "react";

import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { MoreIcon } from "@/components/icons/MoreIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import type { SpotDto } from "@/components/owner/spots/types";
import { cn } from "@/lib/cn";

export function SpotActionsMenu({
  lakeSlug,
  spot,
  open,
  busy,
  isFirst,
  isLast,
  onOpenChange,
  onEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  lakeSlug: string;
  spot: SpotDto;
  open: boolean;
  busy: boolean;
  isFirst: boolean;
  isLast: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const rootRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleOutsideClick(
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

    document.addEventListener(
      "click",
      handleOutsideClick
    );
    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "click",
        handleOutsideClick
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
        onClick={() =>
          onOpenChange(!open)
        }
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50"
        aria-label={`Akcje stanowiska ${spot.name}`}
      >
        <MoreIcon
          size={18}
          className="h-[18px] w-[18px]"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-control border border-border bg-surface p-1.5 shadow-float"
        >
          <MenuButton
            icon={
              <PencilIcon className="h-4 w-4" />
            }
            label="Edytuj stanowisko"
            onClick={() => {
              onOpenChange(false);
              onEdit();
            }}
          />

          <Link
            href={`/moje-lowiska/${lakeSlug}/rezerwacje?new=1&spotId=${encodeURIComponent(
              spot.id
            )}`}
            role="menuitem"
            onClick={() =>
              onOpenChange(false)
            }
            className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-text-secondary transition hover:bg-surface-muted hover:text-text"
          >
            <CalendarIcon className="h-4 w-4 shrink-0" />
            Dodaj rezerwację
          </Link>

          <div className="my-1 h-px bg-border" />

          <MenuButton
            icon={
              <ArrowSmallRightIcon className="h-4 w-4 -rotate-90" />
            }
            label="Przesuń wyżej"
            disabled={isFirst}
            onClick={() => {
              onOpenChange(false);
              onMoveUp();
            }}
          />

          <MenuButton
            icon={
              <ArrowSmallRightIcon className="h-4 w-4 rotate-90" />
            }
            label="Przesuń niżej"
            disabled={isLast}
            onClick={() => {
              onOpenChange(false);
              onMoveDown();
            }}
          />

          <div className="my-1 h-px bg-border" />

          <MenuButton
            icon={
              <TrashIcon className="h-4 w-4" />
            }
            label={
              spot.reservationsCount > 0
                ? "Wyłącz stanowisko"
                : "Usuń stanowisko"
            }
            danger
            onClick={() => {
              onOpenChange(false);
              onDelete();
            }}
          />
        </div>
      )}
    </div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  disabled = false,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold transition",
        danger
          ? "text-danger-foreground hover:bg-danger-subtle"
          : "text-text-secondary hover:bg-surface-muted hover:text-text",
        disabled &&
          "cursor-not-allowed opacity-40"
      )}
    >
      <span className="shrink-0">
        {icon}
      </span>
      {label}
    </button>
  );
}
