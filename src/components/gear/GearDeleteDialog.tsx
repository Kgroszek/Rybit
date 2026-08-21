"use client";

import type {
  FishingGearDto,
} from "@/components/gear/types";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

export function GearDeleteDialog({
  item,
  busy,
  onClose,
  onConfirm,
}: {
  item: FishingGearDto | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!item) {
    return null;
  }

  return (
    <Dialog
      onClose={onClose}
      eyebrow="Usunięcie sprzętu"
      title={`Usunąć „${item.name}”?`}
      description="Element zniknie z Twojego katalogu ekwipunku."
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
            loadingLabel="Usuwanie…"
            onClick={onConfirm}
            className="h-12 min-h-12 sm:min-w-40"
          >
            Usuń sprzęt
          </Button>
        </div>
      }
    >
      <div className="rounded-card border border-danger-border bg-danger-subtle p-5">
        <p className="text-sm font-bold text-danger-foreground">
          Tej operacji nie można cofnąć
        </p>

        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Sprzęt zostanie usunięty z katalogu. Jeżeli był wcześniej dodany do wypraw, istniejące wpisy w tych wyprawach pozostaną zachowane.
        </p>
      </div>
    </Dialog>
  );
}
