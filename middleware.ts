import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_PATH_PREFIXES = [
  "/dashboard",
  "/profil",
  "/ustawienia",
  "/lowiska",
  "/polowy",
  "/wyprawy",
  "/pogoda",
  "/ekwipunek",
  "/admin",
];

const AUTH_PATH_PREFIXES = ["/login", "/register"];

function shouldRefreshSession(pathname: string) {
  return (
    PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    AUTH_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!shouldRefreshSession(pathname)) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|json)$).*)",
  ],
};