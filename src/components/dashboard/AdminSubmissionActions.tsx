"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminSubmissionActionsProps = {
  submissionId: string;
};

export function AdminSubmissionActions({
  submissionId,
}: AdminSubmissionActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleApprove() {
    const confirmed = confirm("Czy na pewno chcesz zaakceptować to łowisko?");

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    const response = await fetch(
      `/api/admin/lake-submissions/${submissionId}/approve`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      const data = await response.json();
      alert(data.message || "Nie udało się zaakceptować zgłoszenia.");
      setIsLoading(false);
      return;
    }

    router.refresh();
  }

  async function handleReject() {
    const adminNote = prompt(
      "Podaj opcjonalny powód odrzucenia zgłoszenia:"
    );

    const confirmed = confirm("Czy na pewno chcesz odrzucić to zgłoszenie?");

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    const response = await fetch(
      `/api/admin/lake-submissions/${submissionId}/reject`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminNote,
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      alert(data.message || "Nie udało się odrzucić zgłoszenia.");
      setIsLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex shrink-0 flex-col gap-3 sm:flex-row xl:flex-col">
      <button
        type="button"
        onClick={handleApprove}
        disabled={isLoading}
        className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Przetwarzanie..." : "Akceptuj"}
      </button>

      <button
        type="button"
        onClick={handleReject}
        disabled={isLoading}
        className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Odrzuć
      </button>
    </div>
  );
}