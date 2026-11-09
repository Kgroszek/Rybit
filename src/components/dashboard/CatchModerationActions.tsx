"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CatchModerationActionsProps = {
  catchId: string;
  fishName: string;
};

type ModerationAction = "approve" | "reject";

export function CatchModerationActions({
  catchId,
  fishName,
}: CatchModerationActionsProps) {
  const router = useRouter();

  const [pendingAction, setPendingAction] =
    useState<ModerationAction | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  async function handleAction(action: ModerationAction) {
    const confirmationMessage =
      action === "approve"
        ? `Czy na pewno chcesz zatwierdzić połów „${fishName}” i dodać go do rankingu?`
        : `Czy na pewno chcesz odrzucić połów „${fishName}”?`;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setPendingAction(action);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/admin/catches/${catchId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
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

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się zmienić statusu połowu."
      );
    } finally {
      setPendingAction(null);
    }
  }

  const isLoading = pendingAction !== null;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => handleAction("approve")}
          disabled={isLoading}
          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "approve"
            ? "Zatwierdzanie..."
            : "Zatwierdź połów"}
        </button>

        <button
          type="button"
          onClick={() => handleAction("reject")}
          disabled={isLoading}
          className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "reject"
            ? "Odrzucanie..."
            : "Odrzuć połów"}
        </button>
      </div>

      {errorMessage && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </p>
      )}
    </div>
  );
}