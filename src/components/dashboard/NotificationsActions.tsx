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

  async function markAsRead() {
    setIsLoading(true);

    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: "PATCH",
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Nie udało się oznaczyć powiadomienia.");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    router.refresh();
  }

  if (isRead) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={markAsRead}
      disabled={isLoading}
      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? "Zapisywanie..." : "Oznacz jako przeczytane"}
    </button>
  );
}