"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

type MobileBottomNavProps = {
  isAdmin?: boolean;
  isOwner?: boolean;
  pendingSubmissionsCount?: number;
  pendingCorrectionsCount?: number;
  pendingCatchReportsCount?: number;
  pendingOwnerClaimsCount?: number;
};

type MenuItem = {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: number;
};

export function MobileBottomNav({
  isAdmin = false,
  isOwner = false,
  pendingSubmissionsCount = 0,
  pendingCorrectionsCount = 0,
  pendingCatchReportsCount = 0,
  pendingOwnerClaimsCount = 0,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const totalAdminPendingCount =
    pendingSubmissionsCount +
    pendingCorrectionsCount +
    pendingCatchReportsCount +
    pendingOwnerClaimsCount;

  useEffect(() => {
    function isFormField(element: Element | null) {
      return (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
      );
    }

    function handleFocusIn(event: FocusEvent) {
      if (isFormField(event.target as Element)) {
        setIsKeyboardOpen(true);
      }
    }

    function handleFocusOut() {
      window.setTimeout(() => {
        if (!isFormField(document.activeElement)) {
          setIsKeyboardOpen(false);
        }
      }, 120);
    }

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const mainItems: MenuItem[] = [
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

  const ownerItems: MenuItem[] = [
    {
      label: "Moje łowiska",
      href: "/moje-lowiska",
      icon: <MapIcon />,
    },
  ];

  const accountItems: MenuItem[] = [
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

  const adminItems: MenuItem[] = [
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

  const bottomItems: MenuItem[] = [
    {
      label: "Start",
      href: "/dashboard",
      icon: <DashboardIcon />,
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
  ];

  function closeMenu() {
    setIsMenuOpen(false);
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    await supabase.auth.signOut();

    setIsLoggingOut(false);
    setIsMenuOpen(false);

    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {isMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-slate-950/40 backdrop-blur-sm lg:hidden">
          <div className="absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  Menu
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Rybio
                </h2>
              </div>

              <button
                type="button"
                onClick={closeMenu}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl font-black text-slate-700"
                aria-label="Zamknij menu"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 pb-20">
              <MobileMenuGroup title="Aplikacja">
                {mainItems.map((item) => (
                  <MobileMenuLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onClick={closeMenu}
                  />
                ))}
              </MobileMenuGroup>

              {isOwner && (
                <MobileMenuGroup title="Właściciel">
                  {ownerItems.map((item) => (
                    <MobileMenuLink
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      onClick={closeMenu}
                    />
                  ))}
                </MobileMenuGroup>
              )}

              <MobileMenuGroup title="Moje konto">
                {accountItems.map((item) => (
                  <MobileMenuLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onClick={closeMenu}
                  />
                ))}

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex h-5 w-5 items-center justify-center">
                    <LogoutIcon />
                  </span>

                  <span className="flex-1 text-left">
                    {isLoggingOut ? "Wylogowywanie..." : "Wyloguj się"}
                  </span>
                </button>
              </MobileMenuGroup>

              {isAdmin && (
                <MobileMenuGroup title="Admin">
                  {adminItems.map((item) => (
                    <MobileMenuLink
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      onClick={closeMenu}
                    />
                  ))}
                </MobileMenuGroup>
              )}
            </div>
          </div>
        </div>
      )}

      <nav
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white px-3 pt-2 shadow-lg transition-all duration-200 lg:hidden ${
          isKeyboardOpen
            ? "pointer-events-none translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        } pb-[max(0.75rem,env(safe-area-inset-bottom))]`}
      >
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {bottomItems.map((item) => (
            <BottomNavLink key={item.href} item={item} pathname={pathname} />
          ))}

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="relative flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
          >
            <MenuIcon />

            <span>Menu</span>

            {isAdmin && totalAdminPendingCount > 0 && (
              <span className="absolute right-2 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                {totalAdminPendingCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </>
  );
}

function BottomNavLink({
  item,
  pathname,
}: {
  item: MenuItem;
  pathname: string;
}) {
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-bold transition ${
        isActive
          ? "bg-blue-50 text-blue-600"
          : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      {item.icon}
      <span>{item.label}</span>
    </Link>
  );
}

function MobileMenuGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <p className="mb-3 px-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {title}
      </p>

      <div className="grid gap-2">{children}</div>
    </section>
  );
}

function MobileMenuLink({
  item,
  pathname,
  onClick,
}: {
  item: MenuItem;
  pathname: string;
  onClick: () => void;
}) {
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
        isActive
          ? "bg-blue-50 text-blue-600"
          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center">
        {item.icon}
      </span>

      <span className="flex-1">{item.label}</span>

      {item.badge !== undefined && item.badge > 0 && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-black text-white">
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

function LogoutIcon() {
  return (
    <IconBase>
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
      <path d="M13 21h6a2 2 0 0 0 2-2" />
    </IconBase>
  );
}

function MenuIcon() {
  return (
    <IconBase>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </IconBase>
  );
}