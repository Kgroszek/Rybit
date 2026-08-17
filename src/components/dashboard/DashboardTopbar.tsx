"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BellIcon } from "@/components/icons/BellIcon";
import { BellRingIcon } from "@/components/icons/BellRingIcon";

type DashboardTopbarProps = {
  userName?: string | null;
  userEmail?: string | null;
};

export function DashboardTopbar({
  userName,
  userEmail,
}: DashboardTopbarProps) {
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const displayName = userName || "Wędkarz";
  const initials = getInitials(displayName || userEmail || "R");

  useEffect(() => {
    let isMounted = true;

    async function loadUnreadNotificationsCount() {
      try {
        const response = await fetch("/api/notifications/unread-count", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          count?: number;
          unreadCount?: number;
        };

        const nextCount = Number(data.count ?? data.unreadCount ?? 0);

        if (isMounted) {
          setUnreadNotificationsCount(
            Number.isFinite(nextCount) ? Math.max(0, nextCount) : 0
          );
        }
      } catch {
        // Nie blokujemy topbara, jeśli licznik chwilowo nie może się pobrać.
      }
    }

    function refreshNotificationsCount() {
      void loadUnreadNotificationsCount();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadUnreadNotificationsCount();
      }
    }

    void loadUnreadNotificationsCount();

    window.addEventListener("focus", refreshNotificationsCount);
    window.addEventListener(
      "notifications:updated",
      refreshNotificationsCount
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", refreshNotificationsCount);
      window.removeEventListener(
        "notifications:updated",
        refreshNotificationsCount
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const hasUnreadNotifications = unreadNotificationsCount > 0;

  return (
    <header className="mb-6 hidden border-b border-slate-200 bg-slate-50/90 py-4 backdrop-blur lg:block lg:border-b-0 lg:bg-transparent lg:py-0">
      <div className="relative min-h-12">
        <form
          action="/lowiska"
          className="w-full xl:absolute xl:left-1/2 xl:top-0 xl:w-[520px] xl:-translate-x-1/2"
        >
          <input
            name="search"
            type="search"
            placeholder="Szukaj łowiska, ryby, lokalizacji..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          />
        </form>

        <div className="mt-3 flex min-w-0 items-center gap-2 xl:absolute xl:right-0 xl:top-0 xl:mt-0 xl:justify-end">
          <Link
            href="/lowiska/zglos"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 sm:flex-none"
          >
            + Zgłoś łowisko
          </Link>

          <Link
            href="/powiadomienia"
            className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition ${
              hasUnreadNotifications
                ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600"
            }`}
            aria-label={
              hasUnreadNotifications
                ? `Powiadomienia: ${unreadNotificationsCount} nieprzeczytanych`
                : "Powiadomienia"
            }
          >
            {hasUnreadNotifications ? (
              <BellRingIcon className="h-5 w-5" />
            ) : (
              <BellIcon className="h-5 w-5" />
            )}

            {hasUnreadNotifications && (
              <span
                className="
                  absolute -right-1.5 -top-1.5
                  flex min-h-5 min-w-5 items-center justify-center
                  rounded-full bg-red-500 px-1.5
                  text-[10px] font-bold leading-none text-white
                  shadow-sm ring-2 ring-white
                "
              >
                {unreadNotificationsCount > 99
                  ? "99+"
                  : unreadNotificationsCount}
              </span>
            )}
          </Link>

          <Link
            href="/profil"
            className="hidden h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 transition hover:bg-slate-50 sm:flex"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white">
              {initials}
            </span>

            <span className="min-w-0">
              <span className="block max-w-[140px] truncate text-sm font-bold text-slate-950">
                {displayName}
              </span>

              <span className="block text-xs font-medium text-slate-400">
                Wędkarz
              </span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function getInitials(value: string) {
  const parts = value.trim().split(" ").filter(Boolean);

  if (parts.length === 0) {
    return "R";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}