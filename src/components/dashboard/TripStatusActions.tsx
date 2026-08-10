"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/ui/ToastProvider";

export function TripStatusActions({
  tripId,
  status,
  canEdit,
}: {
  tripId: string;
  status: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  if (!canEdit) return null;

  async function run(action: "finish" | "cancel" | "restore") {
    const question =
      action === "finish"
        ? "Oznaczyć wyprawę jako zakończoną?"
        : action === "cancel"
          ? "Anulować tę wyprawę?"
          : "Przywrócić wyprawę do planowanych?";

    if (!window.confirm(question)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        toast.error({
          title: "Nie udało się zmienić statusu.",
          description: data.message || "Spróbuj ponownie.",
        });
        return;
      }

      toast.success({ title: "Status wyprawy został zmieniony." });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-200 [&::-webkit-details-marker]:hidden">
        Status •••
      </summary>
      <div className="absolute right-0 top-11 z-40 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
        {status !== "finished" && (
          <button type="button" disabled={loading} onClick={() => run("finish")} className="w-full rounded-xl px-3 py-2 text-left text-xs font-black text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
            Zakończ wcześniej
          </button>
        )}
        {status !== "cancelled" && (
          <button type="button" disabled={loading} onClick={() => run("cancel")} className="w-full rounded-xl px-3 py-2 text-left text-xs font-black text-red-600 hover:bg-red-50 disabled:opacity-50">
            Anuluj wyprawę
          </button>
        )}
        {(status === "finished" || status === "cancelled") && (
          <button type="button" disabled={loading} onClick={() => run("restore")} className="w-full rounded-xl px-3 py-2 text-left text-xs font-black text-blue-700 hover:bg-blue-50 disabled:opacity-50">
            Przywróć do planowanych
          </button>
        )}
      </div>
    </details>
  );
}
