"use client";

import type { FishingCatch } from "@/components/catches/types";
import { Button } from "@/components/ui/Button";
import { CloseIcon } from "@/components/icons/CloseIcon";

export function CatchDeleteDialog({
  fishingCatch,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  fishingCatch: FishingCatch | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!fishingCatch) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-[2px]" onMouseDown={() => !isDeleting && onCancel()}>
      <div className="w-full max-w-md rounded-modal border border-border bg-surface p-5 shadow-2xl sm:p-6" onMouseDown={(event) => event.stopPropagation()} role="alertdialog" aria-modal="true" aria-labelledby="delete-catch-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-danger">Usuwanie połowu</p>
            <h2 id="delete-catch-title" className="mt-2 font-display text-xl font-bold text-text">Usunąć {fishingCatch.fishName}?</h2>
          </div>
          <button type="button" onClick={onCancel} disabled={isDeleting} className="flex h-9 w-9 items-center justify-center rounded-control bg-surface-muted text-text-secondary transition hover:bg-surface-hover disabled:opacity-50" aria-label="Zamknij">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-4 text-sm leading-6 text-text-secondary">Połów oraz powiązane zdjęcie zostaną usunięte z dziennika. Tej operacji nie można cofnąć.</p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isDeleting}>Anuluj</Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} isLoading={isDeleting} loadingLabel="Usuwanie…">Usuń połów</Button>
        </div>
      </div>
    </div>
  );
}
