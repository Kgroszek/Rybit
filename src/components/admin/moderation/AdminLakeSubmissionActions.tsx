"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AdminDecisionDialog } from "@/components/admin/moderation/AdminDecisionDialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

type Decision = "approve" | "reject";

export function AdminLakeSubmissionActions({
  submissionId,
  submissionName,
}: {
  submissionId: string;
  submissionName: string;
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
        `/api/admin/lake-submissions/${submissionId}/${decision}`,
        {
          method: "POST",
          headers:
            decision === "reject"
              ? {
                  "Content-Type": "application/json",
                }
              : undefined,
          body:
            decision === "reject"
              ? JSON.stringify({
                  adminNote: note || null,
                })
              : undefined,
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Nie udało się zapisać decyzji."
        );
      }

      toast.success({
        title:
          decision === "approve"
            ? "Łowisko zaakceptowane."
            : "Zgłoszenie odrzucone.",
        description: submissionName,
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
          onClick={() => setDecision("approve")}
        >
          Akceptuj
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-danger-foreground hover:border-danger-border hover:bg-danger-subtle hover:text-danger-foreground"
          onClick={() => setDecision("reject")}
        >
          Odrzuć
        </Button>
      </div>

      <AdminDecisionDialog
        open={decision === "approve"}
        onClose={() => setDecision(null)}
        title={`Zaakceptować „${submissionName}”?`}
        description="Po akceptacji łowisko zostanie dodane do publicznej bazy Rybio."
        confirmLabel="Akceptuj łowisko"
        isLoading={isLoading}
        onConfirm={submitDecision}
      />

      <AdminDecisionDialog
        open={decision === "reject"}
        onClose={() => setDecision(null)}
        title={`Odrzucić „${submissionName}”?`}
        description="Zgłoszenie nie zostanie dodane do publicznej bazy."
        confirmLabel="Odrzuć zgłoszenie"
        tone="danger"
        noteLabel="Powód / notatka administratora"
        notePlaceholder="Np. brak możliwości potwierdzenia danych..."
        isLoading={isLoading}
        onConfirm={submitDecision}
      />
    </>
  );
}
