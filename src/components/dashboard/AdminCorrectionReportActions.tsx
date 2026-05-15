"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminCorrectionReportActionsProps = {
  reportId: string;
};

export function AdminCorrectionReportActions({
  reportId,
}: AdminCorrectionReportActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function updateStatus(status: "resolved" | "rejected") {
    const adminNote = prompt(
      status === "resolved"
        ? "Dodaj opcjonalną notatkę do rozwiązania:"
        : "Podaj opcjonalny powód odrzucenia:"
    );

    const confirmed = confirm(
      status === "resolved"
        ? "Czy oznaczyć zgłoszenie jako rozwiązane?"
        : "Czy odrzucić to zgłoszenie?"
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    const response = await fetch(`/api/admin/lake-correction-reports/${reportId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        adminNote,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Nie udało się zmienić statusu.");
      setIsLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex shrink-0 flex-col gap-3 sm:flex-row xl:flex-col">
      <button
        type="button"
        onClick={() => updateStatus("resolved")}
        disabled={isLoading}
        className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Zapisywanie..." : "Rozwiązane"}
      </button>

      <button
        type="button"
        onClick={() => updateStatus("rejected")}
        disabled={isLoading}
        className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Odrzuć
      </button>
    </div>
  );
}