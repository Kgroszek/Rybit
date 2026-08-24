"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AdminDecisionDialog } from "@/components/admin/moderation/AdminDecisionDialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

type Decision = "dismiss" | "hide";

export function AdminCatchReportActions({
  reportId,
  fishName,
}: {
  reportId: string;
  fishName: string;
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
        `/api/admin/catch-reports/${reportId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: decision,
            adminNote: note || null,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Nie udało się obsłużyć zgłoszenia."
        );
      }

      toast.success({
        title:
          decision === "hide"
            ? "Połów ukryty z rankingu."
            : "Zgłoszenie odrzucone.",
        description: fishName,
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
          variant="outline"
          size="sm"
          onClick={() => setDecision("dismiss")}
        >
          Odrzuć zgłoszenie
        </Button>

        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => setDecision("hide")}
        >
          Ukryj połów
        </Button>
      </div>

      <AdminDecisionDialog
        open={decision === "dismiss"}
        onClose={() => setDecision(null)}
        title={`Odrzucić zgłoszenie dotyczące „${fishName}”?`}
        description="Połów pozostanie widoczny, a zgłoszenie zostanie zamknięte."
        confirmLabel="Odrzuć zgłoszenie"
        noteLabel="Notatka administratora"
        notePlaceholder="Np. wynik został sprawdzony i wygląda poprawnie..."
        isLoading={isLoading}
        onConfirm={submitDecision}
      />

      <AdminDecisionDialog
        open={decision === "hide"}
        onClose={() => setDecision(null)}
        title={`Ukryć połów „${fishName}” z rankingu?`}
        description="To działanie usunie połów z publicznego rankingu."
        confirmLabel="Ukryj połów"
        tone="danger"
        noteLabel="Powód / notatka administratora"
        notePlaceholder="Np. zdjęcie nie potwierdza wyniku..."
        isLoading={isLoading}
        onConfirm={submitDecision}
      />
    </>
  );
}
