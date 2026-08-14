"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { BackpackIcon } from "@/components/icons/BackpackIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { MapIcon } from "@/components/icons/MapIcon";
import { HookIcon } from "@/components/icons/HookIcon";
import { DashboardIcon } from "@/components/icons/DashboardIcon";
import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { SettingsIcon } from "@/components/icons/SettingsIcon";
import { UserIcon } from "@/components/icons/UserIcon";
import { ExitIcon } from "@/components/icons/ExitIcon";

type MenuItem = {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: number;
};

type SidebarProps = {
  isAdmin?: boolean;
  isOwner?: boolean;
  pendingSubmissionsCount?: number;
  pendingCorrectionsCount?: number;
  pendingCatchReportsCount?: number;
  pendingOwnerClaimsCount?: number;
};

const mainMenuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <DashboardIcon />,
  },
  {
    label: "Łowiska",
    href: "/lowiska",
    icon: <MapIcon />,
  },
  {
    label: "Zgłoś łowisko",
    href: "/lowiska/zglos",
    icon: <AddCircleIcon />,
  },
  {
    label: "Moje wyprawy",
    href: "/wyprawy",
    icon: <BackpackIcon />,
  },
  {
    label: "Moje połowy",
    href: "/polowy",
    icon: <FishIcon />,
  },
  {
    label: "Mój ekwipunek",
    href: "/ekwipunek",
    icon: <HookIcon />,
  },
];

const accountMenuItems: MenuItem[] = [
  {
    label: "Profil",
    href: "/profil",
    icon: <UserIcon />,
  },
  {
    label: "Ustawienia",
    href: "/ustawienia",
    icon: <SettingsIcon />,
  },
];

export function Sidebar({
  isAdmin = false,
  isOwner = false,
  pendingSubmissionsCount = 0,
  pendingCorrectionsCount = 0,
  pendingCatchReportsCount = 0,
  pendingOwnerClaimsCount = 0,
}: SidebarProps) {
  const ownerMenuItems: MenuItem[] = [
    {
      label: "Moje łowiska",
      href: "/moje-lowiska",
      icon: <MapIcon />,
    },
  ];

  const adminMenuItems: MenuItem[] = [
    {
      label: "Panel admina",
      href: "/admin",
      icon: <DashboardIcon />,
    },
    {
      label: "Zgłoszenia łowisk",
      href: "/admin/zgloszenia-lowisk",
      icon: <NotificationIcon />,
      badge: pendingSubmissionsCount,
    },
    {
      label: "Zgłoszenia właścicieli",
      href: "/admin/zgloszenia-wlascicieli",
      icon: <UsersIcon />,
      badge: pendingOwnerClaimsCount,
    },
    {
      label: "Zgłoszone poprawki",
      href: "/admin/poprawki-lowisk",
      icon: <ReportIcon />,
      badge: pendingCorrectionsCount,
    },
    {
      label: "Zgłoszenia połowów",
      href: "/admin/zgloszenia-polowow",
      icon: <CatchReportsIcon />,
      badge: pendingCatchReportsCount,
    },
    {
      label: "Użytkownicy",
      href: "/admin/uzytkownicy",
      icon: <UsersIcon />,
    },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-6 lg:flex lg:flex-col">
      <Link href="/dashboard" className="mb-10 flex items-center gap-3">
        <div className="flex items-center justify-center overflow-hidden">
          <img
            src="/logos/logo-rybioo.svg"
            alt="Rybio"
            className="h-10 w-auto object-contain"
          />
        </div>
      </Link>

      <nav className="space-y-1">
        {mainMenuItems.map((item) => (
          <SidebarButton key={item.href} item={item} />
        ))}
      </nav>

      {isOwner && (
        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="mb-3 px-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Właściciel
          </p>

          <nav className="space-y-1">
            {ownerMenuItems.map((item) => (
              <SidebarButton key={item.href} item={item} />
            ))}
          </nav>
        </div>
      )}

      <div className="mt-8 border-t border-slate-200 pt-6">
        <p className="mb-3 px-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
          Moje konto
        </p>

        <nav className="space-y-1">
          {accountMenuItems.map((item) => (
            <SidebarButton key={item.href} item={item} />
          ))}
        </nav>
      </div>

      {isAdmin && (
        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="mb-3 px-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Admin
          </p>

          <nav className="space-y-1">
            {adminMenuItems.map((item) => (
              <SidebarButton key={item.href} item={item} />
            ))}
          </nav>
        </div>
      )}

      <div className="mt-auto pt-6">
        <LogoutButton className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50">
          <ExitIcon className="h-5 w-5 transition-colors"/>
          Wyloguj
        </LogoutButton>
      </div>
    </aside>
  );
}

function SidebarButton({ item }: { item: MenuItem }) {
  const pathname = usePathname();

  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
        isActive
          ? "bg-blue-50 text-blue-600"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center">
        {item.icon}
      </span>

      <span className="flex-1">{item.label}</span>

      {item.badge !== undefined && item.badge > 0 && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function IconBase({ children }: { children: ReactNode }) {
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




function UsersIcon() {
  return (
    <IconBase>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  );
}

function NotificationIcon() {
  return (
    <IconBase>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </IconBase>
  );
}

function ReportIcon() {
  return (
    <IconBase>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </IconBase>
  );
}

function CatchReportsIcon() {
  return (
    <IconBase>
      <path d="M4 5h16" />
      <path d="M4 12h10" />
      <path d="M4 19h7" />
      <path d="M17 14l3 3" />
      <path d="M20 14l-3 3" />
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