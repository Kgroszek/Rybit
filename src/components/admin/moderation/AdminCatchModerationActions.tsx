"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AdminDecisionDialog } from "@/components/admin/moderation/AdminDecisionDialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

type Decision = "approve" | "reject";

export function AdminCatchModerationActions({
  catchId,
  fishName,
}: {
  catchId: string;
  fishName: string;
}) {
  const router = useRouter();
  const toast = useToast();

  const [decision, setDecision] = useState<Decision | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submitDecision() {
    if (!decision) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/admin/catches/${catchId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: decision,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Nie udało się zmienić statusu połowu."
        );
      }

      toast.success({
        title:
          decision === "approve"
            ? "Połów zatwierdzony."
            : "Połów odrzucony.",
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
          size="sm"
          onClick={() => setDecision("approve")}
        >
          Zatwierdź połów
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
        title={`Zatwierdzić połów „${fishName}”?`}
        description="Po zatwierdzeniu wynik może zostać uwzględniony w rankingu Rybio."
        confirmLabel="Zatwierdź połów"
        isLoading={isLoading}
        onConfirm={submitDecision}
      />

      <AdminDecisionDialog
        open={decision === "reject"}
        onClose={() => setDecision(null)}
        title={`Odrzucić połów „${fishName}”?`}
        description="Połów nie zostanie dopuszczony do rankingu."
        confirmLabel="Odrzuć połów"
        tone="danger"
        isLoading={isLoading}
        onConfirm={submitDecision}
      />
    </>
  );
}
