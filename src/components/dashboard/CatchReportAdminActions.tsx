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

  async function handleAction(action: "dismiss" | "hide") {
    const confirmed = confirm(
      action === "hide"
        ? "Czy na pewno chcesz ukryć ten połów z rankingu?"
        : "Czy na pewno chcesz odrzucić to zgłoszenie?"
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

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

    const data = await response.json();

    setIsLoading(false);

    if (!response.ok) {
      alert(data.message || "Nie udało się obsłużyć zgłoszenia.");
      return;
    }

    router.refresh();
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

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleAction("dismiss")}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Odrzuć zgłoszenie
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleAction("hide")}
          className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Zapisywanie..." : "Ukryj połów z rankingu"}
        </button>
      </div>
    </div>
  );
}