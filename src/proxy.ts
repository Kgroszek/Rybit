import { NextRequest, NextResponse } from "next/server";

const RESERVED_HOSTS = new Set(["www"]);

export function proxy(request: NextRequest) {
  const hostname = getHostname(request);
  const subdomain = getSubdomain(hostname);

  if (!subdomain || RESERVED_HOSTS.has(subdomain)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  // Zapobiega ponownemu rewrite wewnętrznej ścieżki.
  if (url.pathname.startsWith("/site-runtime/")) {
    return NextResponse.next();
  }

  url.pathname = `/site-runtime/${subdomain}${url.pathname}`;

  return NextResponse.rewrite(url);
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
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
