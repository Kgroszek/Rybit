"use client";

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";
import type {
  ReactNode,
} from "react";

import {
  LogoutButton,
} from "@/components/auth/LogoutButton";
import {
  ExitIcon,
} from "@/components/icons/ExitIcon";
import {
  NavigationIcon,
} from "@/components/dashboard/NavigationIcon";
import {
  ACCOUNT_NAVIGATION,
  ADMIN_NAVIGATION_GROUPS,
  DISCOVER_NAVIGATION,
  OWNER_NAVIGATION,
  PRIMARY_NAVIGATION,
  isNavigationActive,
  type AdminBadgeKey,
  type NavigationItem,
} from "@/components/dashboard/navigation";
import {
  cn,
} from "@/lib/cn";

type SidebarProps = {
  isAdmin?: boolean;
  isOwner?: boolean;
  pendingSubmissionsCount?: number;
  pendingCorrectionsCount?: number;
  pendingCatchReportsCount?: number;
  pendingOwnerClaimsCount?: number;
};

type BadgeCounts =
  Record<
    AdminBadgeKey,
    number
  >;

export function Sidebar({
  isAdmin = false,
  isOwner = false,
  pendingSubmissionsCount = 0,
  pendingCorrectionsCount = 0,
  pendingCatchReportsCount = 0,
  pendingOwnerClaimsCount = 0,
}: SidebarProps) {
  const pathname =
    usePathname();

  const badgeCounts: BadgeCounts =
    {
      pendingSubmissionsCount,
      pendingCorrectionsCount,
      pendingCatchReportsCount,
      pendingOwnerClaimsCount,
    };

  const adminMode =
    isAdmin &&
    pathname.startsWith(
      "/admin"
    );

  if (adminMode) {
    return (
      <AdminSidebar
        pathname={pathname}
        badgeCounts={
          badgeCounts
        }
      />
    );
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 overflow-y-auto border-r border-border bg-surface px-4 py-5 lg:flex lg:flex-col">
      <div className="mb-6">
        <BrandLink
          href="/dashboard"
        />
      </div>

      <SidebarGroup>
        {PRIMARY_NAVIGATION.map(
          (item) => (
            <SidebarLink
              key={item.id}
              item={item}
              pathname={
                pathname
              }
            />
          )
        )}
      </SidebarGroup>

      <SidebarGroup
        title="Więcej"
        separated
      >
        {DISCOVER_NAVIGATION.map(
          (item) => (
            <SidebarLink
              key={item.id}
              item={item}
              pathname={
                pathname
              }
            />
          )
        )}
      </SidebarGroup>

      {isOwner && (
        <SidebarGroup
          title="Właściciel"
          separated
        >
          {OWNER_NAVIGATION.map(
            (item) => (
              <SidebarLink
                key={
                  item.id
                }
                item={item}
                pathname={
                  pathname
                }
              />
            )
          )}
        </SidebarGroup>
      )}

      <SidebarGroup
        title="Moje konto"
        separated
      >
        {ACCOUNT_NAVIGATION.map(
          (item) => (
            <SidebarLink
              key={item.id}
              item={item}
              pathname={
                pathname
              }
            />
          )
        )}
      </SidebarGroup>

      {isAdmin && (
        <SidebarGroup
          title="Admin"
          separated
        >
          <SidebarLink
            item={{
              id: "admin",
              label:
                "Panel admina",
              href: "/admin",
              icon:
                "dashboard",
            }}
            pathname={pathname}
          />
        </SidebarGroup>
      )}

      <SidebarLogout />
    </aside>
  );
}

function AdminSidebar({
  pathname,
  badgeCounts,
}: {
  pathname: string;
  badgeCounts: BadgeCounts;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 overflow-y-auto border-r border-border bg-surface px-4 py-5 lg:flex lg:flex-col">
      <div className="mb-6">
        <BrandLink href="/admin" />

        <div className="mx-2 mt-3 flex items-center justify-between rounded-control border border-navy-800 bg-navy-950 px-3 py-2.5 text-white">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-aqua-200">
              Tryb
            </p>

            <p className="mt-0.5 text-sm font-extrabold">
              Administrator
            </p>
          </div>

          <span className="h-2.5 w-2.5 rounded-full bg-aqua-500" />
        </div>
      </div>

      {ADMIN_NAVIGATION_GROUPS.map(
        (
          group,
          index
        ) => (
          <SidebarGroup
            key={
              group.title ??
              index
            }
            title={
              group.title
            }
            separated={
              index > 0
            }
          >
            {group.items.map(
              (item) => (
                <SidebarLink
                  key={
                    item.id
                  }
                  item={item}
                  pathname={
                    pathname
                  }
                  badge={
                    item.badgeKey
                      ? badgeCounts[
                          item
                            .badgeKey
                        ]
                      : undefined
                  }
                />
              )
            )}
          </SidebarGroup>
        )
      )}

      <div className="mt-5 border-t border-border pt-5">
        <Link
          href="/dashboard"
          className="group flex min-h-11 w-full items-center gap-3 rounded-control px-3 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-text-muted transition-colors group-hover:bg-surface group-hover:text-primary">
            <NavigationIcon
              icon="dashboard"
              className="h-5 w-5"
            />
          </span>

          Wróć do aplikacji
        </Link>
      </div>

      <SidebarLogout />
    </aside>
  );
}

function BrandLink({
  href,
}: {
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center px-2 py-1"
      aria-label="Rybio"
    >
      <img
        src="/logos/logo-rybioo.svg"
        alt="Rybio"
        className="h-10 w-auto object-contain"
      />
    </Link>
  );
}

function SidebarLogout() {
  return (
    <div className="mt-auto border-t border-border pt-4">
      <LogoutButton className="flex min-h-11 w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-sm font-semibold text-danger-foreground transition-colors hover:bg-danger-subtle">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-danger-subtle text-danger">
          <ExitIcon className="h-5 w-5" />
        </span>

        Wyloguj
      </LogoutButton>
    </div>
  );
}

function SidebarGroup({
  title,
  separated = false,
  children,
}: {
  title?: string;
  separated?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        separated &&
          "mt-5 border-t border-border pt-5"
      )}
    >
      {title && (
        <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.15em] text-text-muted">
          {title}
        </p>
      )}

      <nav className="space-y-1">
        {children}
      </nav>
    </div>
  );
}

function SidebarLink({
  item,
  pathname,
  badge,
}: {
  item: NavigationItem;
  pathname: string;
  badge?: number;
}) {
  const active =
    isNavigationActive(
      pathname,
      item.href
    );

  return (
    <Link
      href={item.href}
      aria-current={
        active
          ? "page"
          : undefined
      }
      className={cn(
        "group flex min-h-11 w-full items-center gap-3 rounded-control px-3 py-2.5 text-sm font-semibold transition-colors",
        active
          ? "bg-primary-100 text-primary-800"
          : "text-text-secondary hover:bg-surface-muted hover:text-text"
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors",
          active
            ? "bg-surface text-primary"
            : "text-text-muted group-hover:bg-surface group-hover:text-primary"
        )}
      >
        <NavigationIcon
          icon={item.icon}
          className="h-5 w-5"
        />
      </span>

      <span className="min-w-0 flex-1 truncate">
        {item.label}
      </span>

      {badge !==
        undefined &&
        badge > 0 && (
          <span className="flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">
            {badge > 99
              ? "99+"
              : badge}
          </span>
        )}
    </Link>
  );
}
