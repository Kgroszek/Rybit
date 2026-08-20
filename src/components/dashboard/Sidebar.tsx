"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { ExitIcon } from "@/components/icons/ExitIcon";
import { NavigationIcon } from "@/components/dashboard/NavigationIcon";
import {
  ACCOUNT_NAVIGATION,
  ADMIN_NAVIGATION,
  DISCOVER_NAVIGATION,
  OWNER_NAVIGATION,
  PRIMARY_NAVIGATION,
  isNavigationActive,
  type AdminBadgeKey,
  type NavigationItem,
} from "@/components/dashboard/navigation";
import { cn } from "@/lib/cn";

type SidebarProps = {
  isAdmin?: boolean;
  isOwner?: boolean;
  pendingSubmissionsCount?: number;
  pendingCorrectionsCount?: number;
  pendingCatchReportsCount?: number;
  pendingOwnerClaimsCount?: number;
};

type BadgeCounts = Record<AdminBadgeKey, number>;

export function Sidebar({
  isAdmin = false,
  isOwner = false,
  pendingSubmissionsCount = 0,
  pendingCorrectionsCount = 0,
  pendingCatchReportsCount = 0,
  pendingOwnerClaimsCount = 0,
}: SidebarProps) {
  const pathname = usePathname();

  const badgeCounts: BadgeCounts = {
    pendingSubmissionsCount,
    pendingCorrectionsCount,
    pendingCatchReportsCount,
    pendingOwnerClaimsCount,
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 overflow-y-auto border-r border-border bg-surface px-4 py-5 lg:flex lg:flex-col">
      <Link
        href="/dashboard"
        className="mb-6 flex items-center px-2 py-1"
        aria-label="Rybio — dashboard"
      >
        <img
          src="/logos/logo-rybioo.svg"
          alt="Rybio"
          className="h-10 w-auto object-contain"
        />
      </Link>

      <SidebarGroup>
        {PRIMARY_NAVIGATION.map((item) => (
          <SidebarLink
            key={item.id}
            item={item}
            pathname={pathname}
          />
        ))}
      </SidebarGroup>

      <SidebarGroup title="Więcej" separated>
        {DISCOVER_NAVIGATION.map((item) => (
          <SidebarLink
            key={item.id}
            item={item}
            pathname={pathname}
          />
        ))}
      </SidebarGroup>

      {isOwner && (
        <SidebarGroup title="Właściciel" separated>
          {OWNER_NAVIGATION.map((item) => (
            <SidebarLink
              key={item.id}
              item={item}
              pathname={pathname}
            />
          ))}
        </SidebarGroup>
      )}

      <SidebarGroup title="Moje konto" separated>
        {ACCOUNT_NAVIGATION.map((item) => (
          <SidebarLink
            key={item.id}
            item={item}
            pathname={pathname}
          />
        ))}
      </SidebarGroup>

      {isAdmin && (
        <SidebarGroup title="Admin" separated>
          {ADMIN_NAVIGATION.map((item) => (
            <SidebarLink
              key={item.id}
              item={item}
              pathname={pathname}
              badge={
                item.badgeKey
                  ? badgeCounts[item.badgeKey]
                  : undefined
              }
            />
          ))}
        </SidebarGroup>
      )}

      <div className="mt-auto border-t border-border pt-4">
        <LogoutButton className="flex min-h-11 w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-sm font-semibold text-danger-foreground transition-colors hover:bg-danger-subtle">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-danger-subtle text-danger">
            <ExitIcon className="h-5 w-5" />
          </span>
          Wyloguj
        </LogoutButton>
      </div>
    </aside>
  );
}

function SidebarGroup({
  title,
  separated = false,
  children,
}: {
  title?: string;
  separated?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        separated && "mt-5 border-t border-border pt-5"
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
  const active = isNavigationActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
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
        <NavigationIcon icon={item.icon} className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1 truncate">
        {item.label}
      </span>

      {badge !== undefined && badge > 0 && (
        <span className="flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
