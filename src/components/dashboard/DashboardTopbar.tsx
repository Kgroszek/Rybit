"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import { BellIcon } from "@/components/icons/BellIcon";
import { BellRingIcon } from "@/components/icons/BellRingIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import { buttonClassName } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

type DashboardTopbarProps = {
  userName?: string | null;
  userEmail?: string | null;
};

export function DashboardTopbar({
  userName,
  userEmail,
}: DashboardTopbarProps) {
  const pathname = usePathname();

  const [
    unreadNotificationsCount,
    setUnreadNotificationsCount,
  ] = useState(0);

  const displayName =
    userName || "Wędkarz";

  const initials = getInitials(
    displayName ||
      userEmail ||
      "R"
  );

  const isLakesExplorer =
    pathname === "/lowiska";

  useEffect(() => {
    let isMounted = true;

    async function loadCount() {
      try {
        const response = await fetch(
          "/api/notifications/unread-count",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data =
          (await response.json()) as {
            count?: number;
            unreadCount?: number;
          };

        const nextCount = Number(
          data.count ??
            data.unreadCount ??
            0
        );

        if (isMounted) {
          setUnreadNotificationsCount(
            Number.isFinite(nextCount)
              ? Math.max(
                  0,
                  nextCount
                )
              : 0
          );
        }
      } catch {
        // Licznik nie blokuje dashboardu.
      }
    }

    function refresh() {
      void loadCount();
    }

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        void loadCount();
      }
    }

    void loadCount();

    window.addEventListener(
      "focus",
      refresh
    );

    window.addEventListener(
      "notifications:updated",
      refresh
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      isMounted = false;

      window.removeEventListener(
        "focus",
        refresh
      );

      window.removeEventListener(
        "notifications:updated",
        refresh
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  const hasUnread =
    unreadNotificationsCount > 0;

  return (
    <header
      className={cn(
        "hidden lg:block",
        isLakesExplorer
          ? "mb-4"
          : "mb-6"
      )}
    >
      <div className="flex min-h-11 items-center gap-4">
        {!isLakesExplorer && (
          <form
            action="/lowiska"
            className="w-full max-w-[520px]"
            role="search"
          >
            <label
              htmlFor="dashboard-search"
              className="sr-only"
            >
              Szukaj łowiska, ryby lub
              lokalizacji
            </label>

            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />

              <Input
                id="dashboard-search"
                name="q"
                type="search"
                placeholder="Szukaj łowiska, ryby, lokalizacji..."
                className="h-11 pl-10"
              />
            </div>
          </form>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/polowy?new=1"
            className={buttonClassName({
              variant: "primary",
              size: "md",
              className: "h-11",
            })}
          >
            <FishIcon className="h-5 w-5 -scale-x-100" />
            Dodaj połów
          </Link>

          <Link
            href="/powiadomienia"
            aria-label={
              hasUnread
                ? `Powiadomienia: ${unreadNotificationsCount} nieprzeczytanych`
                : "Powiadomienia"
            }
            className={cn(
              buttonClassName({
                variant: hasUnread
                  ? "secondary"
                  : "outline",
                size: "md",
              }),
              "relative h-11 w-11 px-0"
            )}
          >
            {hasUnread ? (
              <BellRingIcon className="h-5 w-5" />
            ) : (
              <BellIcon className="h-5 w-5" />
            )}

            {hasUnread && (
              <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold leading-none text-white ring-2 ring-background">
                {unreadNotificationsCount >
                99
                  ? "99+"
                  : unreadNotificationsCount}
              </span>
            )}
          </Link>

          <Link
            href="/profil"
            className="hidden h-11 items-center gap-3 rounded-control border border-border bg-surface px-2.5 transition-colors hover:bg-surface-muted xl:flex"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aqua-500 text-xs font-bold text-white">
              {initials}
            </span>

            <span className="min-w-0">
              <span className="block max-w-[120px] truncate text-sm font-semibold text-text">
                {displayName}
              </span>

              <span className="block text-[11px] font-medium text-text-muted">
                Wędkarz
              </span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function getInitials(
  value: string
) {
  const parts = value
    .trim()
    .split(" ")
    .filter(Boolean);

  if (parts.length === 0) {
    return "R";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
