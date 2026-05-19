"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CatchReportAdminActionsProps = {
  reportId: string;
};

export function CatchReportAdminActions({
  reportId,
}: CatchReportAdminActionsProps) {
  const router = useRouter();

  const [adminNote, setAdminNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<"dismiss" | "hide" | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleAction(action: "dismiss" | "hide") {
    setIsLoading(true);
    setCurrentAction(action);
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await fetch(`/api/admin/catch-reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          adminNote: adminNote.trim() || null,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(data?.message || "Nie udało się obsłużyć zgłoszenia.");
        setIsSuccess(false);
        return;
      }

      setMessage(
        action === "hide"
          ? "Połów został ukryty z rankingu."
          : "Zgłoszenie zostało odrzucone."
      );
      setIsSuccess(true);
      setAdminNote("");

      router.refresh();
    } catch {
      setMessage("Wystąpił błąd połączenia. Spróbuj ponownie.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  }

  return (
    <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Notatka admina opcjonalnie
      </label>

      <textarea
        value={adminNote}
        onChange={(event) => setAdminNote(event.target.value)}
        rows={3}
        placeholder="Np. wynik wygląda poprawnie / zdjęcie nie potwierdza połowu..."
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />

      {message && (
        <div
          className={`mt-4 rounded-2xl p-4 text-sm font-semibold ${
            isSuccess
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleAction("dismiss")}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading && currentAction === "dismiss"
            ? "Odrzucanie..."
            : "Odrzuć zgłoszenie"}
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleAction("hide")}
          className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading && currentAction === "hide"
            ? "Ukrywanie..."
            : "Ukryj połów z rankingu"}
        </button>
      </div>
    </div>
  );
}