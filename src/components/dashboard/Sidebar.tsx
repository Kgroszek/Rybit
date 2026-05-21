"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
};

type SidebarProps = {
  isAdmin?: boolean;
  pendingSubmissionsCount?: number;
  pendingCorrectionsCount?: number;
  pendingCatchReportsCount?: number;
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
    icon: <PlusIcon />,
  },
  {
    label: "Moje wyprawy",
    href: "/wyprawy",
    icon: <TripIcon />,
  },
  {
    label: "Checklisty",
    href: "/checklisty",
    icon: <ChecklistIcon />,
  },
  {
    label: "Moje połowy",
    href: "/polowy",
    icon: <FishIcon />,
  },
  {
    label: "Mój ekwipunek",
    href: "/ekwipunek",
    icon: <BackpackIcon />,
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
  pendingSubmissionsCount = 0,
  pendingCorrectionsCount = 0,
  pendingCatchReportsCount = 0,
}: SidebarProps) {
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
          <LogoutIcon />
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

function DashboardIcon() {
  return (
    <IconBase>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </IconBase>
  );
}

function MapIcon() {
  return (
    <IconBase>
      <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
      <path d="M9 3v15" />
      <path d="M15 6v15" />
    </IconBase>
  );
}

function PlusIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </IconBase>
  );
}

function TripIcon() {
  return (
    <IconBase>
      <path d="M6 21V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14" />
      <path d="M9 5V3h6v2" />
      <path d="M6 11h12" />
      <path d="M9 21v-3" />
      <path d="M15 21v-3" />
    </IconBase>
  );
}

function ChecklistIcon() {
  return (
    <IconBase>
      <path d="M9 6h11" />
      <path d="M9 12h11" />
      <path d="M9 18h11" />
      <path d="m4 6 1 1 2-2" />
      <path d="m4 12 1 1 2-2" />
      <path d="m4 18 1 1 2-2" />
    </IconBase>
  );
}

function FishIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12s3.5-5 9-5c3.2 0 5.2 1.2 7 3 1 .9 2 2 2 2s-1 1.1-2 2c-1.8 1.8-3.8 3-7 3-5.5 0-9-5-9-5Z" />
      <path d="M3 12 1.5 10.5" />
      <path d="M3 12 1.5 13.5" />
      <circle cx="15.5" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
      <path d="M8 12h.01" />
    </svg>
  );
}

function BackpackIcon() {
  return (
    <IconBase>
      <path d="M8 7V6a4 4 0 0 1 8 0v1" />
      <rect x="5" y="7" width="14" height="14" rx="3" />
      <path d="M8 13h8" />
      <path d="M9 17h6" />
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



function SettingsIcon() {
  return (
    <IconBase>
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.04a2.1 2.1 0 0 1-2.97 2.97l-.04-.04a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.66V21a2.1 2.1 0 0 1-4.2 0v-.06a1.8 1.8 0 0 0-1.1-1.66 1.8 1.8 0 0 0-1.98.36l-.04.04a2.1 2.1 0 0 1-2.97-2.97l.04-.04A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.66-1.1H3a2.1 2.1 0 0 1 0-4.2h.06A1.8 1.8 0 0 0 4.72 8.6a1.8 1.8 0 0 0-.36-1.98l-.04-.04a2.1 2.1 0 0 1 2.97-2.97l.04.04a1.8 1.8 0 0 0 1.98.36A1.8 1.8 0 0 0 10.4 2.4V2a2.1 2.1 0 0 1 4.2 0v.06a1.8 1.8 0 0 0 1.1 1.66 1.8 1.8 0 0 0 1.98-.36l.04-.04a2.1 2.1 0 0 1 2.97 2.97l-.04.04a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.66 1.1H21a2.1 2.1 0 0 1 0 4.2h-.06A1.8 1.8 0 0 0 19.4 15Z" />
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