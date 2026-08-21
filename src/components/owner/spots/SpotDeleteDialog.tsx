"use client";

import { OwnerDialog } from "@/components/owner/shared/OwnerDialog";
import type { SpotDto } from "@/components/owner/spots/types";
import { Button } from "@/components/ui/Button";

export function SpotDeleteDialog({
  spot,
  busy,
  onClose,
  onConfirm,
}: {
  spot: SpotDto;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const hasHistory =
    spot.reservationsCount > 0;

  return (
    <OwnerDialog
      onClose={onClose}
      eyebrow={
        hasHistory
          ? "Wyłączenie stanowiska"
          : "Usunięcie stanowiska"
      }
      title={spot.name}
      description={
        hasHistory
          ? "To stanowisko ma historię rezerwacji, dlatego nie zostanie fizycznie usunięte."
          : "Ta operacja trwale usunie stanowisko z łowiska."
      }
      busy={busy}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={onClose}
            className="h-12 min-h-12 sm:min-w-28"
          >
            Wróć
          </Button>

          <Button
            type="button"
            variant="danger"
            isLoading={busy}
            loadingLabel={
              hasHistory
                ? "Wyłączanie…"
                : "Usuwanie…"
            }
            onClick={onConfirm}
            className="h-12 min-h-12 sm:min-w-40"
          >
            {hasHistory
              ? "Wyłącz stanowisko"
              : "Usuń stanowisko"}
          </Button>
        </div>
      }
    >
      <div className="rounded-card border border-danger-border bg-danger-subtle px-5 py-5">
        <p className="text-sm font-bold text-danger-foreground">
          {hasHistory
            ? "Historia zostanie zachowana"
            : "Tej operacji nie można cofnąć"}
        </p>

        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {hasHistory
            ? `Stanowisko ma ${spot.reservationsCount} ${
                spot.reservationsCount === 1
                  ? "rezerwację"
                  : "rezerwacji"
              } w historii. Po potwierdzeniu zostanie oznaczone jako nieaktywne i przestanie być dostępne dla nowych rezerwacji.`
            : "Stanowisko nie ma historii rezerwacji, więc może zostać bezpiecznie usunięte z bazy danych."}
        </p>
      </div>
    </OwnerDialog>
  );
}
