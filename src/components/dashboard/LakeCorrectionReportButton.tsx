"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

type LakeCorrectionReportButtonProps = {
  lakeSlug: string;
};

type ApiResponse = {
  message?: string;
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

async function readApiResponse(response: Response) {
  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return {};
  }
}

export function LakeCorrectionReportButton({
  lakeSlug,
}: LakeCorrectionReportButtonProps) {
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("location");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [isLoading, setIsLoading] = useState(false);

  function closeModal() {
    if (isLoading) {
      return;
    }

    setIsOpen(false);
    setMessage("");
    setMessageType("info");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedDescription = description.trim();

    if (trimmedDescription.length < 10) {
      const validationMessage =
        "Opisz problem trochę dokładniej. Wpisz minimum 10 znaków.";

      setMessage(validationMessage);
      setMessageType("error");

      toast.error({
        title: "Opis jest zbyt krótki.",
        description: validationMessage,
      });

      return;
    }

    setIsLoading(true);
    setMessage("");
    setMessageType("info");

    const toastId = toast.loading({
      title: "Wysyłanie zgłoszenia...",
      description: "Przekazujemy poprawkę do administratora.",
    });

    try {
      const response = await fetch(`/api/lakes/${lakeSlug}/corrections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          description: trimmedDescription,
        }),
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        const errorMessage =
          data.message || "Nie udało się wysłać zgłoszenia.";

        setMessage(errorMessage);
        setMessageType("error");

        toast.update(toastId, {
          type: "error",
          title: "Nie udało się wysłać zgłoszenia.",
          description: errorMessage,
          duration: 6000,
        });

        return;
      }

      const successMessage =
        "Dziękujemy. Zgłoszenie zostało wysłane do administratora.";

      setMessage(successMessage);
      setMessageType("success");
      setDescription("");

      toast.update(toastId, {
        type: "success",
        title: "Zgłoszenie poprawki zostało wysłane.",
        description: "Dziękujemy za pomoc w aktualizacji bazy łowisk.",
        duration: 4500,
      });

      window.setTimeout(() => {
        setIsOpen(false);
        setMessage("");
        setMessageType("info");
      }, 1600);
    } catch {
      const errorMessage =
        "Wystąpił problem z połączeniem. Spróbuj ponownie za chwilę.";

      setMessage(errorMessage);
      setMessageType("error");

      toast.update(toastId, {
        type: "error",
        title: "Nie udało się wysłać zgłoszenia.",
        description: errorMessage,
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
                onClick={closeModal}
                disabled={isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Zamknij okno"
              >
                ×
              </button>
            </div>

            {message && (
              <div
                className={`mt-5 rounded-2xl p-4 text-sm font-semibold ${
                  messageType === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : messageType === "error"
                      ? "bg-red-50 text-red-700"
                      : "bg-blue-50 text-blue-700"
                }`}
              >
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
                  disabled={isLoading}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                  disabled={isLoading}
                  placeholder="Np. cennik jest nieaktualny, aktualna opłata za dzień wynosi 50 zł..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                />
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