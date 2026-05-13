"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileMenuItems = [
  {
    label: "Start",
    href: "/",
    icon: <HomeIcon />,
  },
  {
    label: "Łowiska",
    href: "/lowiska",
    icon: <MapIcon />,
  },
  {
    label: "Zgłoś",
    href: "/lowiska/zglos",
    icon: <PlusIcon />,
  },
  {
    label: "Sprzęt",
    href: "/ekwipunek",
    icon: <BackpackIcon />,
  },
  {
    label: "Profil",
    href: "/profil",
    icon: <UserIcon />,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[900] border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {mobileMenuItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-semibold transition ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="mb-1 flex h-5 w-5 items-center justify-center">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
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

function HomeIcon() {
  return (
    <IconBase>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
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