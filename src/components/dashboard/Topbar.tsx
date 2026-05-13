"use client";

import { useState } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import Link from "next/link";

const profileMenuItems = [
  {
    label: "Profil",
    icon: <UserIcon />,
  },
  {
    label: "Historia połowów",
    icon: <HistoryIcon />,
  },
  {
    label: "Ustawienia",
    icon: <SettingsIcon />,
  },
];

export function Topbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="mb-8 grid gap-4 xl:grid-cols-[1fr_minmax(320px,520px)_auto] xl:items-center">
      {/* LEFT */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cześć, Piotr!</h1>

        <p className="mt-1 text-slate-500">
          Gotowy na kolejną wędkarską wyprawę?
        </p>
      </div>

      {/* CENTER SEARCH */}
      <div className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          placeholder="Szukaj łowiska, ryby, lokalizacji..."
        />
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-3">
       <Link
          href="/lowiska/zglos"
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Zgłoś nowe łowisko
        </Link>

        <button
          type="button"
          className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
          aria-label="Powiadomienia"
        >
          <BellIcon />

          <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-2 pl-2 pr-4 shadow-sm transition hover:bg-slate-50"
          >
            <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-emerald-400" />

            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold text-slate-900">Piotr Nowak</p>
              <p className="text-xs text-slate-500">Wędkarz</p>
            </div>

            <ChevronDownIcon />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-14 z-[800] w-64 rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-3">
                <p className="text-sm font-bold text-slate-900">Piotr Nowak</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  piotr@example.com
                </p>
              </div>

              <div className="py-2">
                {profileMenuItems.map((item) => (
                  <button
                    key={item.label}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    <span className="flex h-5 w-5 items-center justify-center">
                      {item.icon}
                    </span>

                    {item.label}
                  </button>
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

function BellIcon() {
  return (
    <IconBase>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </IconBase>
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