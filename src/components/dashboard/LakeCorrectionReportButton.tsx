"use client";

import { useState } from "react";

type LakeCorrectionReportButtonProps = {
  lakeSlug: string;
};

const correctionCategories = [
  { label: "Błędny adres / lokalizacja", value: "location" },
  { label: "Nieaktualny cennik", value: "price" },
  { label: "Nieaktualny regulamin", value: "rules" },
  { label: "Błędne dane kontaktowe", value: "contact" },
  { label: "Błędne udogodnienia", value: "amenities" },
  { label: "Błędne informacje o rybach", value: "fish" },
  { label: "Łowisko już nie działa", value: "closed" },
  { label: "Inny problem", value: "other" },
];

export function LakeCorrectionReportButton({
  lakeSlug,
}: LakeCorrectionReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("location");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");

    const response = await fetch(`/api/lakes/${lakeSlug}/corrections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category,
        description,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Nie udało się wysłać zgłoszenia.");
      setIsLoading(false);
      return;
    }

    setMessage("Dziękujemy. Zgłoszenie zostało wysłane do administratora.");
    setDescription("");
    setIsLoading(false);

    setTimeout(() => {
      setIsOpen(false);
      setMessage("");
    }, 1600);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-4 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
      >
        Zgłoś poprawkę do łowiska
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Zgłoś poprawkę
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Opisz, co jest nieaktualne lub błędne. Informacja trafi tylko
                  do administratora.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-500 transition hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            {message && (
              <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-700">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Czego dotyczy problem?
                </label>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  {correctionCategories.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Opisz poprawkę
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={6}
                  required
                  placeholder="Np. cennik jest nieaktualny, aktualna opłata za dzień wynosi 50 zł..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Anuluj
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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