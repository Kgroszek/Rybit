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

export type NavigationGroup = {
  title?: string;
  items: NavigationItem[];
};

export const PRIMARY_NAVIGATION: NavigationItem[] =
  [
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

export const DISCOVER_NAVIGATION: NavigationItem[] =
  [
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

export const OWNER_NAVIGATION: NavigationItem[] =
  [
    {
      id: "owner-lakes",
      label: "Moje łowiska",
      href: "/moje-lowiska",
      icon: "map",
    },
  ];

export const ACCOUNT_NAVIGATION: NavigationItem[] =
  [
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

const ADMIN_OVERVIEW: NavigationItem =
  {
    id: "admin",
    label: "Przegląd",
    href: "/admin",
    icon: "dashboard",
  };

const ADMIN_LAKE_SUBMISSIONS: NavigationItem =
  {
    id:
      "admin-lake-submissions",
    label:
      "Zgłoszenia łowisk",
    href:
      "/admin/zgloszenia-lowisk",
    icon: "bell",
    badgeKey:
      "pendingSubmissionsCount",
  };

const ADMIN_OWNER_CLAIMS: NavigationItem =
  {
    id:
      "admin-owner-claims",
    label:
      "Zgłoszenia właścicieli",
    href:
      "/admin/zgloszenia-wlascicieli",
    icon: "users",
    badgeKey:
      "pendingOwnerClaimsCount",
  };

const ADMIN_CORRECTIONS: NavigationItem =
  {
    id: "admin-corrections",
    label:
      "Poprawki łowisk",
    href:
      "/admin/poprawki-lowisk",
    icon: "alert",
    badgeKey:
      "pendingCorrectionsCount",
  };

const ADMIN_CATCHES: NavigationItem =
  {
    id:
      "admin-catch-reports",
    label:
      "Moderacja połowów",
    href:
      "/admin/zgloszenia-polowow",
    icon: "catch",
    badgeKey:
      "pendingCatchReportsCount",
  };

const ADMIN_LAKES: NavigationItem =
  {
    id: "admin-lakes",
    label: "Łowiska",
    href: "/admin/lowiska",
    icon: "map",
  };

const ADMIN_BLOG: NavigationItem =
  {
    id: "admin-blog",
    label: "Blog",
    href: "/admin/blog",
    icon: "blog",
  };

const ADMIN_USERS: NavigationItem =
  {
    id: "admin-users",
    label: "Użytkownicy",
    href:
      "/admin/uzytkownicy",
    icon: "users",
  };

export const ADMIN_NAVIGATION: NavigationItem[] =
  [
    ADMIN_OVERVIEW,
    ADMIN_LAKE_SUBMISSIONS,
    ADMIN_OWNER_CLAIMS,
    ADMIN_CORRECTIONS,
    ADMIN_CATCHES,
    ADMIN_LAKES,
    ADMIN_BLOG,
    ADMIN_USERS,
  ];

export const ADMIN_NAVIGATION_GROUPS: NavigationGroup[] =
  [
    {
      title: "Przegląd",
      items: [
        ADMIN_OVERVIEW,
      ],
    },
    {
      title: "Moderacja",
      items: [
        ADMIN_LAKE_SUBMISSIONS,
        ADMIN_OWNER_CLAIMS,
        ADMIN_CORRECTIONS,
        ADMIN_CATCHES,
      ],
    },
    {
      title: "Treść",
      items: [
        ADMIN_LAKES,
        ADMIN_BLOG,
      ],
    },
    {
      title: "System",
      items: [
        ADMIN_USERS,
      ],
    },
  ];

export const MOBILE_PRIMARY_NAVIGATION: NavigationItem[] =
  [
    {
      id:
        "mobile-dashboard",
      label: "Start",
      href: "/dashboard",
      icon: "dashboard",
    },
    {
      id:
        "mobile-lakes",
      label: "Łowiska",
      href: "/lowiska",
      icon: "map",
    },
    {
      id:
        "mobile-catches",
      label: "Połów",
      href: "/polowy?new=1",
      icon: "catch",
      emphasized: true,
    },
    {
      id:
        "mobile-trips",
      label: "Wyprawy",
      href: "/wyprawy",
      icon: "trip",
    },
  ];

export const ADMIN_MOBILE_NAVIGATION: NavigationItem[] =
  [
    {
      ...ADMIN_OVERVIEW,
      id: "mobile-admin-overview",
      label: "Admin",
    },
    {
      ...ADMIN_LAKE_SUBMISSIONS,
      id: "mobile-admin-submissions",
      label: "Zgłoszenia",
    },
    {
      ...ADMIN_LAKES,
      id: "mobile-admin-lakes",
      label: "Łowiska",
    },
    {
      ...ADMIN_USERS,
      id: "mobile-admin-users",
      label: "Użytkownicy",
    },
  ];

export function isNavigationActive(
  pathname: string,
  href: string
) {
  const hrefPath =
    href.split("?")[0];

  if (
    hrefPath ===
    "/dashboard"
  ) {
    return (
      pathname ===
      "/dashboard"
    );
  }

  if (hrefPath === "/admin") {
    return pathname === "/admin";
  }

  if (
    hrefPath === "/lowiska"
  ) {
    return (
      pathname === "/lowiska" ||
      (pathname.startsWith(
        "/lowiska/"
      ) &&
        !pathname.startsWith(
          "/lowiska/zglos"
        ))
    );
  }

  return (
    pathname === hrefPath ||
    pathname.startsWith(
      `${hrefPath}/`
    )
  );
}
