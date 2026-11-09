"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NotificationsActions } from "@/components/dashboard/NotificationsActions";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  href: string | null;
  type: string;
  isRead: boolean;
  createdAt: string;
};

type NotificationsListProps = {
  notifications: NotificationItem[];
  unreadCount: number;
};

export function NotificationsList({
  notifications,
  unreadCount,
}: NotificationsListProps) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const unreadNotifications = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead);
  }, [notifications]);

  const selectedUnreadIds = useMemo(() => {
    return selectedIds.filter((id) =>
      unreadNotifications.some((notification) => notification.id === id)
    );
  }, [selectedIds, unreadNotifications]);

  const areAllSelected =
    notifications.length > 0 && selectedIds.length === notifications.length;

  function toggleNotification(notificationId: string) {
    setMessage("");

    setSelectedIds((current) => {
      if (current.includes(notificationId)) {
        return current.filter((id) => id !== notificationId);
      }

      return [...current, notificationId];
    });
  }

  function toggleAll() {
    setMessage("");

    if (areAllSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(notifications.map((notification) => notification.id));
  }

  async function markSelectedAsRead() {
    setMessage("");
    setIsSuccess(false);

    if (selectedUnreadIds.length === 0) {
      setMessage("Zaznacz przynajmniej jedno nieprzeczytane powiadomienie.");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationIds: selectedUnreadIds,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(data?.message || "Nie udało się oznaczyć powiadomień.");
        setIsSuccess(false);
        return;
      }

      setMessage("Zaznaczone powiadomienia zostały oznaczone jako przeczytane.");
      setIsSuccess(true);
      setSelectedIds([]);
      window.dispatchEvent(new Event("notifications:updated"));
      router.refresh();
    } catch {
      setMessage("Wystąpił błąd połączenia. Spróbuj ponownie.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function markAllAsRead() {
    setMessage("");
    setIsSuccess(false);

    if (unreadCount === 0) {
      setMessage("Nie masz nieprzeczytanych powiadomień.");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(data?.message || "Nie udało się oznaczyć powiadomień.");
        setIsSuccess(false);
        return;
      }

      setMessage("Wszystkie powiadomienia zostały oznaczone jako przeczytane.");
      setIsSuccess(true);
      setSelectedIds([]);
      window.dispatchEvent(new Event("notifications:updated"));
      router.refresh();
    } catch {
      setMessage("Wystąpił błąd połączenia. Spróbuj ponownie.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Powiadomienia
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Tutaj znajdziesz informacje dotyczące Twoich zgłoszeń, poprawek i
            aktywności w aplikacji.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
            Nieprzeczytane: {unreadCount}
          </div>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={isLoading || unreadCount === 0}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Oznacz wszystkie jako przeczytane
            </button>
          )}
        </div>
      </div>

      {notifications.length > 0 && (
        <section className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={areAllSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />

              {areAllSelected ? "Odznacz wszystkie" : "Zaznacz wszystkie"}
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="text-sm font-semibold text-slate-500">
                Zaznaczone: {selectedIds.length}
              </p>

              <button
                type="button"
                onClick={markSelectedAsRead}
                disabled={isLoading || selectedUnreadIds.length === 0}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Oznacz zaznaczone jako przeczytane
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`mt-4 rounded-2xl p-4 text-sm font-semibold ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </section>
      )}

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-3xl border p-5 shadow-sm ${
                notification.isRead
                  ? "border-slate-200 bg-white"
                  : "border-blue-100 bg-blue-50"
              }`}
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex min-w-0 flex-1 gap-4">
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(notification.id)}
                      onChange={() => toggleNotification(notification.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      aria-label={`Zaznacz powiadomienie: ${notification.title}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          notification.isRead
                            ? "bg-slate-100 text-slate-500"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {notification.isRead ? "Przeczytane" : "Nowe"}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {getNotificationTypeLabel(notification.type)}
                      </span>
                    </div>

                    <h2 className="break-words text-xl font-bold text-slate-950">
                      {notification.title}
                    </h2>

                    <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>

                    <p className="mt-4 text-xs font-semibold text-slate-400">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row xl:flex-col">
                  {notification.href && (
                    <Link
                      href={notification.href}
                      className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      Zobacz szczegóły
                    </Link>
                  )}

                  <NotificationsActions
                    notificationId={notification.id}
                    isRead={notification.isRead}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xl font-bold text-slate-950">Brak powiadomień</p>

          <p className="mt-2 text-slate-500">
            Gdy pojawią się nowe informacje, zobaczysz je tutaj.
          </p>
        </section>
      )}
    </div>
  );
}

function getNotificationTypeLabel(type: string) {
  if (type === "lake_submission_rejected") return "Zgłoszenie łowiska";
  if (type === "lake_submission_approved") return "Zgłoszenie łowiska";
  if (type === "correction_report") return "Poprawka łowiska";
  if (type === "lake_correction_report") return "Poprawka łowiska";
  if (type === "catch_report") return "Zgłoszenie połowu";
  if (type === "achievement") return "Osiągnięcie";

  return "Powiadomienie";
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}