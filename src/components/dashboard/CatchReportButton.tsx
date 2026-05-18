"use client";

import { useState } from "react";

type CatchReportButtonProps = {
  catchId: string;
};

export function CatchReportButton({ catchId }: CatchReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      alert("Wpisz uzasadnienie zgłoszenia.");
      return;
    }

    if (trimmedReason.length < 10) {
      alert("Uzasadnienie powinno mieć minimum 10 znaków.");
      return;
    }

    setIsLoading(true);

    const response = await fetch(`/api/catches/${catchId}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: trimmedReason,
      }),
    });

    const data = await response.json();

    setIsLoading(false);

    if (!response.ok) {
      alert(data.message || "Nie udało się wysłać zgłoszenia.");
      return;
    }

    alert(data.message || "Zgłoszenie zostało wysłane.");
    setReason("");
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
      >
        Zgłoś połów
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/70 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Zgłoś połów
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Opisz, dlaczego zgłaszasz ten połów. Bez uzasadnienia
                  zgłoszenie nie zostanie wysłane.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 transition hover:bg-slate-200"
                aria-label="Zamknij"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Uzasadnienie zgłoszenia
                </label>

                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={5}
                  placeholder="Np. zdjęcie nie przedstawia tej ryby, wynik wygląda na błędny, połów jest podejrzany..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Anuluj
                </button>

                <button
                  type="submit"
                  disabled={isLoading || reason.trim().length < 10}
                  className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Wysyłanie..." : "Wyślij zgłoszenie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}