"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const mainMenuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <DashboardIcon />,
  },
  {
    label: "Łowiska",
    href: "/lowiska",
    icon: <MapIcon />,
  },
  {
    label: "Dodaj łowisko",
    href: "/lowiska/dodaj",
    icon: <PlusIcon />,
  },
  {
    label: "Moje wyprawy",
    href: "/wyprawy",
    icon: <TripIcon />,
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

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-6 lg:flex lg:flex-col">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
          R
        </div>

        <div>
          <p className="text-2xl font-bold tracking-tight">Rybit</p>
          <p className="text-sm text-slate-500">Panel wędkarza</p>
        </div>
      </div>

      <nav className="space-y-1">
        {mainMenuItems.map((item) => (
          <SidebarButton key={item.label} item={item} />
        ))}
      </nav>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <p className="mb-3 px-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
          Moje konto
        </p>

        <nav className="space-y-1">
          {accountMenuItems.map((item) => (
            <SidebarButton key={item.label} item={item} />
          ))}
        </nav>
      </div>

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

      <span>{item.label}</span>
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

function FishIcon() {
  return (
    <IconBase>
      <path d="M16.5 10.5c2.5 0 4.5 1.5 4.5 1.5s-2 1.5-4.5 1.5c-2.8 0-5.2-2-7.5-4.5C6.5 11 4 12 3 12c1 0 3.5 1 6 3.5 2.3-2.5 4.7-5 7.5-5Z" />
      <circle cx="14" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </IconBase>
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