export type NavigationIconKey =
  | "dashboard"
  | "map"
  | "trip"
  | "catch"
  | "gear"
  | "blog"
  | "add"
  | "profile"
  | "settings"
  | "bell"
  | "users"
  | "alert"
  | "menu";

export type AdminBadgeKey =
  | "pendingSubmissionsCount"
  | "pendingCorrectionsCount"
  | "pendingCatchReportsCount"
  | "pendingOwnerClaimsCount";

export type NavigationItem = {
  id: string;
  label: string;
  href: string;
  icon: NavigationIconKey;
  badgeKey?: AdminBadgeKey;
  emphasized?: boolean;
};


export const PRIMARY_NAVIGATION: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
  },
  {
    id: "lakes",
    label: "Łowiska",
    href: "/lowiska",
    icon: "map",
  },
  {
    id: "trips",
    label: "Centrum wypraw",
    href: "/wyprawy",
    icon: "trip",
  },
  {
    id: "catches",
    label: "Moje połowy",
    href: "/polowy",
    icon: "catch",
  },
  {
    id: "gear",
    label: "Mój ekwipunek",
    href: "/ekwipunek",
    icon: "gear",
  },
];


export const DISCOVER_NAVIGATION: NavigationItem[] = [
  {
    id: "blog",
    label: "Blog",
    href: "/blog",
    icon: "blog",
  },
  {
    id: "submit-lake",
    label: "Zgłoś łowisko",
    href: "/lowiska/zglos",
    icon: "add",
  },
];


export const OWNER_NAVIGATION: NavigationItem[] = [
  {
    id: "owner-lakes",
    label: "Moje łowiska",
    href: "/moje-lowiska",
    icon: "map",
  },
];

export const ACCOUNT_NAVIGATION: NavigationItem[] = [
  {
    id: "profile",
    label: "Profil",
    href: "/profil",
    icon: "profile",
  },
  {
    id: "settings",
    label: "Ustawienia",
    href: "/ustawienia",
    icon: "settings",
  },
];

export const ADMIN_NAVIGATION: NavigationItem[] = [
  {
    id: "admin",
    label: "Panel admina",
    href: "/admin",
    icon: "dashboard",
  },
  {
    id: "admin-blog",
    label: "Zarządzaj blogiem",
    href: "/admin/blog",
    icon: "blog",
  },
  {
    id: "admin-lake-submissions",
    label: "Zgłoszenia łowisk",
    href: "/admin/zgloszenia-lowisk",
    icon: "bell",
    badgeKey: "pendingSubmissionsCount",
  },
  {
    id: "admin-owner-claims",
    label: "Zgłoszenia właścicieli",
    href: "/admin/zgloszenia-wlascicieli",
    icon: "users",
    badgeKey: "pendingOwnerClaimsCount",
  },
  {
    id: "admin-corrections",
    label: "Zgłoszone poprawki",
    href: "/admin/poprawki-lowisk",
    icon: "alert",
    badgeKey: "pendingCorrectionsCount",
  },
  {
    id: "admin-catch-reports",
    label: "Zgłoszenia połowów",
    href: "/admin/zgloszenia-polowow",
    icon: "catch",
    badgeKey: "pendingCatchReportsCount",
  },
  {
    id: "admin-users",
    label: "Użytkownicy",
    href: "/admin/uzytkownicy",
    icon: "users",
  },
];

export const MOBILE_PRIMARY_NAVIGATION: NavigationItem[] = [
  {
    id: "mobile-dashboard",
    label: "Start",
    href: "/dashboard",
    icon: "dashboard",
  },
  {
    id: "mobile-lakes",
    label: "Łowiska",
    href: "/lowiska",
    icon: "map",
  },
  {
    id: "mobile-catches",
    label: "Połów",
    href: "/polowy?new=1",
    icon: "catch",
    emphasized: true,
  },
  {
    id: "mobile-trips",
    label: "Wyprawy",
    href: "/wyprawy",
    icon: "trip",
  },
];


export function isNavigationActive(
  pathname: string,
  href: string
) {
  const hrefPath = href.split("?")[0];

  if (hrefPath === "/dashboard") {
    return pathname === "/dashboard";
  }

  if (hrefPath === "/admin") {
    return pathname === "/admin";
  }

  if (hrefPath === "/lowiska") {
    return (
      pathname === "/lowiska" ||
      (pathname.startsWith("/lowiska/") &&
        !pathname.startsWith("/lowiska/zglos"))
    );
  }

  return (
    pathname === hrefPath ||
    pathname.startsWith(`${hrefPath}/`)
  );
}