"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AdminDecisionDialog } from "@/components/admin/moderation/AdminDecisionDialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

type Decision = "resolved" | "rejected";

export function AdminCorrectionActions({
  reportId,
  lakeName,
}: {
  reportId: string;
  lakeName: string;
}) {
  const router = useRouter();
  const toast = useToast();

  const [decision, setDecision] = useState<Decision | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submitDecision(note: string) {
    if (!decision) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/admin/lake-correction-reports/${reportId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: decision,
            adminNote: note || null,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Nie udało się zmienić statusu."
        );
      }

      toast.success({
        title:
          decision === "resolved"
            ? "Poprawka oznaczona jako rozwiązana."
            : "Zgłoszenie odrzucone.",
        description: lakeName,
      });

      setDecision(null);
      router.refresh();
    } catch (error) {
      toast.error({
        title: "Nie udało się zapisać decyzji.",
        description:
          error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => setDecision("resolved")}
        >
          Oznacz jako rozwiązane
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-danger-foreground hover:border-danger-border hover:bg-danger-subtle hover:text-danger-foreground"
          onClick={() => setDecision("rejected")}
        >
          Odrzuć
        </Button>
      </div>

      <AdminDecisionDialog
        open={decision === "resolved"}
        onClose={() => setDecision(null)}
        title={`Zamknąć poprawkę dla „${lakeName}”?`}
        description="Zgłoszenie zostanie oznaczone jako rozwiązane."
        confirmLabel="Oznacz jako rozwiązane"
        noteLabel="Notatka administratora"
        notePlaceholder="Np. dane zostały poprawione zgodnie ze zgłoszeniem..."
        isLoading={isLoading}
        onConfirm={submitDecision}
      />

      <AdminDecisionDialog
        open={decision === "rejected"}
        onClose={() => setDecision(null)}
        title={`Odrzucić poprawkę dla „${lakeName}”?`}
        description="Zgłoszenie zostanie zamknięte bez oznaczenia jako rozwiązane."
        confirmLabel="Odrzuć zgłoszenie"
        tone="danger"
        noteLabel="Powód / notatka administratora"
        notePlaceholder="Np. zgłoszenie nie zostało potwierdzone..."
        isLoading={isLoading}
        onConfirm={submitDecision}
      />
    </>
  );
}
