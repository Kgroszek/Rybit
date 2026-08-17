"use client";

import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import Link from "next/link";
import { BellIcon } from "@/components/icons/BellIcon";
import { BellRingIcon } from "@/components/icons/BellRingIcon";

type TopbarProps = {
  userName?: string | null;
  userEmail?: string | null;
  userRoleLabel?: string;
};

const profileMenuItems = [
  {
    label: "Profil",
    href: "/profil",
    icon: <UserIcon />,
  },
  {
    label: "Historia połowów",
    href: "/historia-polowow",
    icon: <HistoryIcon />,
  },
  {
    label: "Ustawienia",
    href: "/ustawienia",
    icon: <SettingsIcon />,
  },
];

export function Topbar({
  userName,
  userEmail,
  userRoleLabel = "Wędkarz",
}: TopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const displayName = userName || getNameFromEmail(userEmail) || "Użytkownik";
  const displayEmail = userEmail || "Brak adresu e-mail";
  const initials = getInitials(displayName);

  useEffect(() => {
    let isMounted = true;

    async function loadUnreadNotificationsCount() {
      try {
        const response = await fetch("/api/notifications/unread-count", {
          cache: "no-store",
        });

        if (!response.ok) {
          if (isMounted) {
            setUnreadNotificationsCount(0);
          }
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
        if (isMounted) {
          setUnreadNotificationsCount(0);
        }
      }
    }

    function handleNotificationsUpdated() {
      void loadUnreadNotificationsCount();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadUnreadNotificationsCount();
      }
    }

    void loadUnreadNotificationsCount();

    window.addEventListener("focus", handleNotificationsUpdated);
    window.addEventListener(
      "notifications:updated",
      handleNotificationsUpdated
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleNotificationsUpdated);
      window.removeEventListener(
        "notifications:updated",
        handleNotificationsUpdated
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <header className="mb-6 grid gap-4 lg:mb-8 xl:grid-cols-[1fr_minmax(320px,520px)_auto] xl:items-center">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Cześć, {displayName}!
        </h1>

        <p className="mt-1 text-slate-500">
          Gotowy na kolejną wędkarską wyprawę?
        </p>
      </div>

      <div className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          placeholder="Szukaj łowiska, ryby, lokalizacji..."
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/lowiska/zglos"
          className="order-3 flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 sm:order-none sm:w-auto"
        >
          + Zgłoś łowisko
        </Link>

        <Link
          href="/powiadomienia"
          className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition ${
            unreadNotificationsCount > 0
              ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950"
          }`}
          aria-label={
            unreadNotificationsCount > 0
              ? `Powiadomienia: ${unreadNotificationsCount} nowych`
              : "Powiadomienia"
          }
        >
          {unreadNotificationsCount > 0 ? (
            <BellRingIcon className="h-5 w-5" />
          ) : (
            <BellIcon className="h-5 w-5" />
          )}

          {unreadNotificationsCount > 0 && (
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

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-2 pl-2 pr-4 shadow-sm transition hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 text-sm font-bold text-white">
              {initials}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-32 truncate text-sm font-bold text-slate-900">
                {displayName}
              </p>
              <p className="text-xs text-slate-500">{userRoleLabel}</p>
            </div>

            <ChevronDownIcon />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-14 z-[800] w-64 rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-3">
                <p className="truncate text-sm font-bold text-slate-900">
                  {displayName}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {displayEmail}
                </p>
              </div>

              <div className="py-2">
                {profileMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    <span className="flex h-5 w-5 items-center justify-center">
                      {item.icon}
                    </span>

                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-2">
                <LogoutButton className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50">
                  <LogoutIcon />
                  Wyloguj
                </LogoutButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function getNameFromEmail(email?: string | null) {
  if (!email) {
    return null;
  }

  const namePart = email.split("@")[0];

  return namePart
    .split(/[._-]/)
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function IconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function UserIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </IconBase>
  );
}

function HistoryIcon() {
  return (
    <IconBase>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  );
}

function SettingsIcon() {
  return (
    <IconBase>
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.04a2.1 2.1 0 0 1-2.97 2.97l-.04-.04a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.66V21a2.1 2.1 0 0 1-4.2 0v-.06a1.8 1.8 0 0 0-1.1-1.66 1.8 1.8 0 0 0-1.98.36l-.04.04a2.1 2.1 0 0 1-2.97-2.97l.04-.04A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.66-1.1H3a2.1 2.1 0 0 1 0-4.2h.06A1.8 1.8 0 0 0 4.72 8.6a1.8 1.8 0 0 0-.36-1.98l-.04-.04a2.1 2.1 0 0 1 2.97-2.97l.04.04a1.8 1.8 0 0 0 1.98.36A1.8 1.8 0 0 0 10.4 2.4V2a2.1 2.1 0 0 1 4.2 0v.06a1.8 1.8 0 0 0 1.1 1.66 1.8 1.8 0 0 0 1.98-.36l.04-.04a2.1 2.1 0 0 1 2.97 2.97l-.04.04a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.66 1.1H21a2.1 2.1 0 0 1 0 4.2h-.06A1.8 1.8 0 0 0 19.4 15Z" />
    </IconBase>
  );
}

function LogoutIcon() {
  return (
    <IconBase>
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 3v18" />
    </IconBase>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}