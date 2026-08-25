import { NextRequest, NextResponse } from "next/server";

import { shouldNoIndexPath } from "@/lib/seo-policy";
import { updateSession } from "@/lib/supabase/middleware";

const RESERVED_HOSTS = new Set(["www"]);

const SESSION_PATH_PREFIXES = [
  "/dashboard",
  "/profil",
  "/ustawienia",
  "/lowiska",
  "/polowy",
  "/wyprawy",
  "/checklisty",
  "/pogoda",
  "/ekwipunek",
  "/moje-lowiska",
  "/powiadomienia",
  "/admin",
];

const AUTH_PATH_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

function matchesPathPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function shouldRefreshSession(pathname: string) {
  return (
    SESSION_PATH_PREFIXES.some((prefix) =>
      matchesPathPrefix(pathname, prefix)
    ) ||
    AUTH_PATH_PREFIXES.some((prefix) =>
      matchesPathPrefix(pathname, prefix)
    )
  );
}

function applySeoHeaders(response: NextResponse, pathname: string) {
  if (shouldNoIndexPath(pathname)) {
    response.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive"
    );
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const hostname = getHostname(request);
  const subdomain = getSubdomain(hostname);
  const url = request.nextUrl.clone();

 
  if (url.pathname.startsWith("/site-runtime/")) {
    return applySeoHeaders(NextResponse.next(), url.pathname);
  }

  
  if (subdomain && !RESERVED_HOSTS.has(subdomain)) {
    url.pathname = `/site-runtime/${subdomain}${url.pathname}`;

    return NextResponse.rewrite(url);
  }


  if (shouldRefreshSession(url.pathname)) {
    const response = await updateSession(request);

    return applySeoHeaders(response, url.pathname);
  }

  return applySeoHeaders(NextResponse.next(), url.pathname);
}

function getHostname(request: NextRequest) {
  const host = request.headers.get("host");
  const forwardedHost = request.headers.get("x-forwarded-host");

  const rawHost =
    process.env.NODE_ENV === "development"
      ? host || forwardedHost || request.nextUrl.host
      : forwardedHost || host || request.nextUrl.host;

  return rawHost
    .split(",")[0]
    .trim()
    .toLowerCase()
    .split(":")[0];
}

function getSubdomain(hostname: string) {
  if (!hostname) {
    return null;
  }

  if (hostname.endsWith(".localhost")) {
    const value = hostname.slice(0, -".localhost".length);

    return value && !value.includes(".") ? value : null;
  }

  const rootDomain = (
    process.env.ROOT_DOMAIN ||
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    "rybio.pl"
  )
    .trim()
    .toLowerCase();

  if (
    hostname === rootDomain ||
    hostname === `www.${rootDomain}`
  ) {
    return null;
  }

  const suffix = `.${rootDomain}`;

  if (!hostname.endsWith(suffix)) {
    return null;
  }

  const value = hostname.slice(0, -suffix.length);

  if (!value || value.includes(".")) {
    return null;
  }

  return value;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|txt|xml|json|woff|woff2|ttf|otf)$).*)",
  ],
};
