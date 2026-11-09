"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  LogoutButton,
} from "@/components/auth/LogoutButton";
import {
  AddCircleIcon,
} from "@/components/icons/AddCircleIcon";
import {
  ExitIcon,
} from "@/components/icons/ExitIcon";
import {
  NavigationIcon,
} from "@/components/dashboard/NavigationIcon";
import {
  ACCOUNT_NAVIGATION,
  ADMIN_MOBILE_NAVIGATION,
  ADMIN_NAVIGATION_GROUPS,
  DISCOVER_NAVIGATION,
  MOBILE_PRIMARY_NAVIGATION,
  OWNER_NAVIGATION,
  PRIMARY_NAVIGATION,
  isNavigationActive,
  type AdminBadgeKey,
  type NavigationItem,
} from "@/components/dashboard/navigation";
import {
  cn,
} from "@/lib/cn";
import {
  createClient,
} from "@/lib/supabase/client";

type MobileBottomNavProps = {
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

export function MobileBottomNav({
  isAdmin = false,
  isOwner = false,
  pendingSubmissionsCount = 0,
  pendingCorrectionsCount = 0,
  pendingCatchReportsCount = 0,
  pendingOwnerClaimsCount = 0,
}: MobileBottomNavProps) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const supabase =
    createClient();

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false);

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  const [
    isKeyboardOpen,
    setIsKeyboardOpen,
  ] = useState(false);

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

  const totalAdminPendingCount =
    Object.values(
      badgeCounts
    ).reduce(
      (sum, value) =>
        sum + value,
      0
    );

  useEffect(() => {
    function isFormField(
      element:
        | Element
        | null
    ) {
      return (
        element instanceof
          HTMLInputElement ||
        element instanceof
          HTMLTextAreaElement ||
        element instanceof
          HTMLSelectElement
      );
    }

    function handleFocusIn(
      event: FocusEvent
    ) {
      if (
        isFormField(
          event.target as Element
        )
      ) {
        setIsKeyboardOpen(
          true
        );
      }
    }

    function handleFocusOut() {
      window.setTimeout(
        () => {
          if (
            !isFormField(
              document.activeElement
            )
          ) {
            setIsKeyboardOpen(
              false
            );
          }
        },
        120
      );
    }

    window.addEventListener(
      "focusin",
      handleFocusIn
    );
    window.addEventListener(
      "focusout",
      handleFocusOut
    );

    return () => {
      window.removeEventListener(
        "focusin",
        handleFocusIn
      );
      window.removeEventListener(
        "focusout",
        handleFocusOut
      );
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setIsMenuOpen(
          false
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isMenuOpen]);

  async function handleLogout() {
    setIsLoggingOut(true);

    await supabase.auth.signOut();

    setIsLoggingOut(false);
    setIsMenuOpen(false);

    router.push("/login");
    router.refresh();
  }

  const primaryItems =
    adminMode
      ? ADMIN_MOBILE_NAVIGATION
      : MOBILE_PRIMARY_NAVIGATION;

  return (
    <>
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-navy-950/35 backdrop-blur-sm lg:hidden"
          onMouseDown={() =>
            setIsMenuOpen(
              false
            )
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={
              adminMode
                ? "Menu administratora Rybio"
                : "Menu Rybio"
            }
            className="absolute inset-x-0 bottom-0 max-h-[84vh] overflow-y-auto rounded-t-modal border-t border-border bg-surface px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-float sm:px-5"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
                  {adminMode
                    ? "Panel administratora"
                    : "Menu"}
                </p>

                <h2 className="mt-1 font-display text-2xl font-extrabold text-text">
                  {adminMode
                    ? "Rybio Admin"
                    : "Rybio"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsMenuOpen(
                    false
                  )
                }
                className="flex h-11 w-11 items-center justify-center rounded-control border border-border bg-surface-muted text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
                aria-label="Zamknij menu"
              >
                <AddCircleIcon className="h-5 w-5 rotate-45" />
              </button>
            </div>

            {adminMode ? (
              <AdminMobileMenu
                pathname={
                  pathname
                }
                badgeCounts={
                  badgeCounts
                }
                onNavigate={() =>
                  setIsMenuOpen(
                    false
                  )
                }
                isLoggingOut={
                  isLoggingOut
                }
                onLogout={
                  handleLogout
                }
              />
            ) : (
              <ApplicationMobileMenu
                pathname={
                  pathname
                }
                isOwner={
                  isOwner
                }
                isAdmin={
                  isAdmin
                }
                badgeCounts={
                  badgeCounts
                }
                isLoggingOut={
                  isLoggingOut
                }
                onNavigate={() =>
                  setIsMenuOpen(
                    false
                  )
                }
                onLogout={
                  handleLogout
                }
              />
            )}
          </div>
        </div>
      )}

      <nav
        aria-label={
          adminMode
            ? "Nawigacja administratora"
            : "Główna nawigacja mobilna"
        }
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 px-2 pt-2 backdrop-blur-xl transition-[transform,opacity] duration-200 lg:hidden",
          "pb-[max(0.65rem,env(safe-area-inset-bottom))]",
          isKeyboardOpen
            ? "pointer-events-none translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        )}
      >
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {primaryItems.map(
            (item) => (
              <BottomNavLink
                key={item.id}
                item={item}
                pathname={
                  pathname
                }
                badge={
                  adminMode &&
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

          <button
            type="button"
            onClick={() =>
              setIsMenuOpen(true)
            }
            className="relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-control px-1.5 py-1.5 text-[11px] font-semibold text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl">
              <NavigationIcon
                icon="menu"
                className="h-5 w-5"
              />
            </span>

            <span>Menu</span>

            {isAdmin &&
              totalAdminPendingCount >
                0 && (
                <span className="absolute right-1.5 top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {totalAdminPendingCount >
                  99
                    ? "99+"
                    : totalAdminPendingCount}
                </span>
              )}
          </button>
        </div>
      </nav>
    </>
  );
}

function AdminMobileMenu({
  pathname,
  badgeCounts,
  onNavigate,
  isLoggingOut,
  onLogout,
}: {
  pathname: string;
  badgeCounts: BadgeCounts;
  onNavigate: () => void;
  isLoggingOut: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="space-y-6 pb-8">
      {ADMIN_NAVIGATION_GROUPS.map(
        (group) => (
          <MobileMenuGroup
            key={
              group.title
            }
            title={
              group.title ??
              "Admin"
            }
          >
            {group.items.map(
              (item) => (
                <MobileMenuLink
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
                  onClick={
                    onNavigate
                  }
                />
              )
            )}
          </MobileMenuGroup>
        )
      )}

      <MobileMenuGroup title="Aplikacja">
        <MobileMenuLink
          item={{
            id:
              "admin-back-app",
            label:
              "Wróć do aplikacji",
            href:
              "/dashboard",
            icon:
              "dashboard",
          }}
          pathname={
            pathname
          }
          onClick={
            onNavigate
          }
        />

        <LogoutMenuButton
          isLoggingOut={
            isLoggingOut
          }
          onLogout={onLogout}
        />
      </MobileMenuGroup>
    </div>
  );
}

function ApplicationMobileMenu({
  pathname,
  isOwner,
  isAdmin,
  badgeCounts,
  isLoggingOut,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  isOwner: boolean;
  isAdmin: boolean;
  badgeCounts: BadgeCounts;
  isLoggingOut: boolean;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="space-y-6 pb-8">
      <MobileMenuGroup title="Aplikacja">
        {PRIMARY_NAVIGATION.map(
          (item) => (
            <MobileMenuLink
              key={item.id}
              item={item}
              pathname={
                pathname
              }
              onClick={
                onNavigate
              }
            />
          )
        )}
      </MobileMenuGroup>

      <MobileMenuGroup title="Więcej">
        {DISCOVER_NAVIGATION.map(
          (item) => (
            <MobileMenuLink
              key={item.id}
              item={item}
              pathname={
                pathname
              }
              onClick={
                onNavigate
              }
            />
          )
        )}
      </MobileMenuGroup>

      {isOwner && (
        <MobileMenuGroup title="Właściciel">
          {OWNER_NAVIGATION.map(
            (item) => (
              <MobileMenuLink
                key={
                  item.id
                }
                item={item}
                pathname={
                  pathname
                }
                onClick={
                  onNavigate
                }
              />
            )
          )}
        </MobileMenuGroup>
      )}

      <MobileMenuGroup title="Moje konto">
        {ACCOUNT_NAVIGATION.map(
          (item) => (
            <MobileMenuLink
              key={item.id}
              item={item}
              pathname={
                pathname
              }
              onClick={
                onNavigate
              }
            />
          )
        )}

        <LogoutMenuButton
          isLoggingOut={
            isLoggingOut
          }
          onLogout={onLogout}
        />
      </MobileMenuGroup>

      {isAdmin && (
        <MobileMenuGroup title="Admin">
          {ADMIN_NAVIGATION_GROUPS.flatMap(
            (group) =>
              group.items
          ).map((item) => (
            <MobileMenuLink
              key={item.id}
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
              onClick={
                onNavigate
              }
            />
          ))}
        </MobileMenuGroup>
      )}
    </div>
  );
}

function LogoutMenuButton({
  isLoggingOut,
  onLogout,
}: {
  isLoggingOut: boolean;
  onLogout: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={isLoggingOut}
      className="mt-2 flex min-h-12 w-full items-center gap-3 rounded-control bg-danger-subtle px-3.5 py-3 text-sm font-semibold text-danger-foreground transition-colors hover:bg-danger-border disabled:pointer-events-none disabled:opacity-60"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-danger">
        <ExitIcon className="h-5 w-5" />
      </span>

      <span className="flex-1 text-left">
        {isLoggingOut
          ? "Wylogowywanie…"
          : "Wyloguj się"}
      </span>
    </button>
  );
}

function BottomNavLink({
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
        "group relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-control px-1.5 py-1.5 text-[11px] font-semibold transition-colors",
        active
          ? "text-primary-700"
          : "text-text-muted hover:bg-surface-muted hover:text-text"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
          item.emphasized
            ? "bg-primary text-white shadow-[0_3px_8px_rgba(47,91,167,0.18)]"
            : active
              ? "bg-primary-100 text-primary"
              : "group-hover:bg-surface"
        )}
      >
        <NavigationIcon
          icon={item.icon}
          className="h-5 w-5"
        />
      </span>

      <span className="max-w-full truncate">
        {item.label}
      </span>

      {badge !==
        undefined &&
        badge > 0 && (
          <span className="absolute right-1 top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
            {badge > 99
              ? "99+"
              : badge}
          </span>
        )}
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
      <p className="mb-2 px-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-text-muted">
        {title}
      </p>

      <div className="grid gap-1">
        {children}
      </div>
    </section>
  );
}

function MobileMenuLink({
  item,
  pathname,
  badge,
  onClick,
}: {
  item: NavigationItem;
  pathname: string;
  badge?: number;
  onClick: () => void;
}) {
  const active =
    isNavigationActive(
      pathname,
      item.href
    );

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={
        active
          ? "page"
          : undefined
      }
      className={cn(
        "flex min-h-12 items-center gap-3 rounded-control px-3 py-2.5 text-sm font-semibold transition-colors",
        active
          ? "bg-primary-100 text-primary-800"
          : "text-text-secondary hover:bg-surface-muted hover:text-text"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          active
            ? "bg-surface text-primary"
            : "bg-surface-muted text-text-muted"
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
          <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">
            {badge > 99
              ? "99+"
              : badge}
          </span>
        )}
    </Link>
  );
}
