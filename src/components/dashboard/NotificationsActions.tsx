"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type NotificationsActionsProps = {
  notificationId: string;
  isRead: boolean;
};

export function NotificationsActions({
  notificationId,
  isRead,
}: NotificationsActionsProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function markAsRead() {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(data?.message || "Nie udało się oznaczyć powiadomienia.");
        return;
      }

      router.refresh();
    } catch {
      setMessage("Wystąpił błąd połączenia. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isRead) {
    return null;
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={markAsRead}
        disabled={isLoading}
        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Zapisywanie..." : "Oznacz jako przeczytane"}
      </button>

      {message && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </p>
      )}
    </div>
  );
}