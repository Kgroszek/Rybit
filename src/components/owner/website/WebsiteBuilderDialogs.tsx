"use client";

import { OwnerDialog } from "@/components/owner/shared/OwnerDialog";
import { Button } from "@/components/ui/Button";
import {
  getLakeWebsiteSectionLabel,
  type LakeWebsiteSection,
} from "@/lib/lake-website-sections";

export function DeleteWebsiteSectionDialog({
  section,
  onClose,
  onConfirm,
}: {
  section: LakeWebsiteSection | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!section) {
    return null;
  }

  return (
    <OwnerDialog
      onClose={onClose}
      eyebrow="Usunięcie sekcji"
      title={`Usunąć sekcję „${getLakeWebsiteSectionLabel(
        section.type
      )}”?`}
      description="Sekcja zniknie z edytowanej wersji strony. Zmiana stanie się publiczna dopiero po zapisaniu."
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-12 min-h-12 sm:min-w-28"
          >
            Wróć
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            className="h-12 min-h-12 sm:min-w-40"
          >
            Usuń sekcję
          </Button>
        </div>
      }
    >
      <div className="rounded-card border border-danger-border bg-danger-subtle p-5">
        <p className="text-sm font-bold text-danger-foreground">
          Treść tej sekcji zostanie usunięta z bieżącej wersji roboczej.
        </p>

        <p className="mt-2 text-xs leading-5 text-text-secondary">
          Jeżeli opuścisz edytor bez zapisywania, ostatnia zapisana lub opublikowana wersja pozostanie bez zmian.
        </p>
      </div>
    </OwnerDialog>
  );
}

export function LeaveWebsiteBuilderDialog({
  open,
  onClose,
  onLeave,
}: {
  open: boolean;
  onClose: () => void;
  onLeave: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <OwnerDialog
      onClose={onClose}
      eyebrow="Niezapisane zmiany"
      title="Opuścić edytor?"
      description="Masz zmiany, które nie zostały jeszcze zapisane."
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-12 min-h-12 sm:min-w-28"
          >
            Zostań
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={onLeave}
            className="h-12 min-h-12 sm:min-w-44"
          >
            Opuść bez zapisywania
          </Button>
        </div>
      }
    >
      <div className="rounded-card border border-warning-border bg-warning-subtle p-5">
        <p className="text-sm font-bold text-warning-foreground">
          Ostatnio zapisana wersja strony nie zostanie zmieniona.
        </p>
      </div>
    </OwnerDialog>
  );
}

export function UnpublishWebsiteDialog({
  open,
  busy,
  onClose,
  onConfirm,
}: {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <OwnerDialog
      onClose={onClose}
      eyebrow="Cofnięcie publikacji"
      title="Ukryć stronę publiczną?"
      description="Strona przestanie być dostępna pod publiczną subdomeną, ale cała konfiguracja zostanie zachowana jako szkic."
      busy={busy}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={onClose}
            className="h-12 min-h-12 sm:min-w-28"
          >
            Anuluj
          </Button>

          <Button
            type="button"
            variant="danger"
            isLoading={busy}
            loadingLabel="Wyłączanie…"
            onClick={onConfirm}
            className="h-12 min-h-12 sm:min-w-40"
          >
            Cofnij publikację
          </Button>
        </div>
      }
    >
      <div className="rounded-card border border-warning-border bg-warning-subtle p-5">
        <p className="text-sm font-bold text-warning-foreground">
          To nie usuwa strony.
        </p>

        <p className="mt-2 text-xs leading-5 text-text-secondary">
          W każdej chwili możesz ponownie otworzyć edytor i opublikować ją ponownie.
        </p>
      </div>
    </OwnerDialog>
  );
}
