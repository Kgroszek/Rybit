"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";

export type AdminDecisionTone = "primary" | "danger";

export function AdminDecisionDialog({
  open,
  onClose,
  eyebrow = "Decyzja administratora",
  title,
  description,
  confirmLabel,
  tone = "primary",
  noteLabel,
  notePlaceholder,
  initialNote = "",
  isLoading = false,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  description?: string;
  confirmLabel: string;
  tone?: AdminDecisionTone;
  noteLabel?: string;
  notePlaceholder?: string;
  initialNote?: string;
  isLoading?: boolean;
  onConfirm: (note: string) => Promise<void> | void;
}) {
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    if (open) {
      setNote(initialNote);
    }
  }, [open, initialNote]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      eyebrow={eyebrow}
      title={title}
      description={description}
      busy={isLoading}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={isLoading}
            onClick={onClose}
          >
            Anuluj
          </Button>

          <Button
            type="button"
            variant={tone === "danger" ? "danger" : "primary"}
            isLoading={isLoading}
            loadingLabel="Zapisywanie…"
            onClick={() => void onConfirm(note.trim())}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {noteLabel ? (
        <label className="grid gap-2.5">
          <span className="text-sm font-bold text-text-secondary">
            {noteLabel}
          </span>

          <Textarea
            data-autofocus
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            maxLength={1000}
            placeholder={notePlaceholder}
          />

          <span className="text-xs leading-5 text-text-muted">
            Opcjonalnie. Notatka pomaga zachować kontekst decyzji.
          </span>
        </label>
      ) : (
        <div
          data-autofocus
          tabIndex={-1}
          className="rounded-control border border-border bg-surface-muted px-4 py-3 text-sm leading-6 text-text-secondary outline-none"
        >
          Sprawdź informacje jeszcze raz przed zatwierdzeniem tej operacji.
        </div>
      )}
    </Dialog>
  );
}
