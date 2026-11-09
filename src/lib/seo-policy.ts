
const PRIVATE_NOINDEX_EXACT_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

const PRIVATE_NOINDEX_PREFIXES = [
  "/admin",
  "/dashboard",
  "/checklisty",
  "/ekwipunek",
  "/wyprawy",
  "/dev",
  "/profil",
  "/ustawienia",
  "/lowiska",
  "/pogoda",
  "/moje-lowiska",
  "/powiadomienia",
  "/site-runtime",
] as const;

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function shouldNoIndexPath(pathname: string) {
  if (PRIVATE_NOINDEX_EXACT_PATHS.has(pathname)) {
    return true;
  }

  if (
    PRIVATE_NOINDEX_PREFIXES.some((prefix) =>
      matchesPrefix(pathname, prefix)
    )
  ) {
    return true;
  }

  
  if (
    pathname === "/polowy" ||
    (pathname.startsWith("/polowy/") &&
      !matchesPrefix(pathname, "/polowy/publiczne"))
  ) {
    return true;
  }

  if (matchesPrefix(pathname, "/blog/szukaj")) {
    return true;
  }

  return false;
}
