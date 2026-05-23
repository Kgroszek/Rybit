"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

type CatchReportButtonProps = {
  catchId: string;
};

type ApiResponse = {
  message?: string;
};

async function readApiResponse(response: Response) {
  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return {};
  }
}

export function CatchReportButton({ catchId }: CatchReportButtonProps) {
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function closeModal() {
    if (isLoading) {
      return;
    }

    setIsOpen(false);
    setReason("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      toast.error({
        title: "Wpisz uzasadnienie zgłoszenia.",
        description: "Bez uzasadnienia zgłoszenie nie zostanie wysłane.",
      });

      return;
    }

    if (trimmedReason.length < 10) {
      toast.error({
        title: "Uzasadnienie jest zbyt krótkie.",
        description: "Wpisz minimum 10 znaków i opisz, co jest podejrzane.",
      });

      return;
    }

    setIsLoading(true);

    const toastId = toast.loading({
      title: "Wysyłanie zgłoszenia...",
      description: "Przekazujemy zgłoszenie połowu do administratora.",
    });

    try {
      const response = await fetch(`/api/catches/${catchId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: trimmedReason,
        }),
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        const errorMessage =
          data.message || "Nie udało się wysłać zgłoszenia.";

        toast.update(toastId, {
          type: "error",
          title: "Nie udało się zgłosić połowu.",
          description: errorMessage,
          duration: 6000,
        });

        return;
      }

      toast.update(toastId, {
        type: "success",
        title: "Zgłoszenie zostało wysłane.",
        description:
          data.message ||
          "Dziękujemy. Administrator sprawdzi ten połów w rankingu.",
        duration: 4500,
      });

      setReason("");
      setIsOpen(false);
    } catch {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się zgłosić połowu.",
        description: "Wystąpił problem z połączeniem. Spróbuj ponownie.",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
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
          onClick={closeModal}
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
                onClick={closeModal}
                disabled={isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
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
                  required
                  disabled={isLoading}
                  placeholder="Np. zdjęcie nie przedstawia tej ryby, wynik wygląda na błędny, połów jest podejrzany..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs font-semibold text-slate-400">
                  Minimum 10 znaków. Aktualnie: {reason.trim().length}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoading}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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