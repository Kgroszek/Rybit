import type { ReactNode } from "react";
import Link from "next/link";

import {
  cn,
} from "@/lib/cn";

function buildHref(
  pathname: string,
  params: Record<
    string,
    string | undefined
  >,
  page: number
) {
  const search =
    new URLSearchParams();

  for (
    const [key, value] of
    Object.entries(params)
  ) {
    if (
      value &&
      key !== "page"
    ) {
      search.set(key, value);
    }
  }

  if (page > 1) {
    search.set(
      "page",
      String(page)
    );
  }

  const query =
    search.toString();

  return query
    ? `${pathname}?${query}`
    : pathname;
}

export function AdminPagination({
  pathname,
  page,
  totalPages,
  params = {},
}: {
  pathname: string;
  page: number;
  totalPages: number;
  params?: Record<
    string,
    string | undefined
  >;
}) {
  if (
    totalPages <= 1
  ) {
    return null;
  }

  return (
    <nav
      aria-label="Paginacja"
      className="flex flex-col gap-3 rounded-card border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs font-semibold text-text-muted">
        Strona {page} z{" "}
        {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <PaginationLink
          href={buildHref(
            pathname,
            params,
            Math.max(
              1,
              page - 1
            )
          )}
          disabled={page <= 1}
        >
          Poprzednia
        </PaginationLink>

        <PaginationLink
          href={buildHref(
            pathname,
            params,
            Math.min(
              totalPages,
              page + 1
            )
          )}
          disabled={
            page >= totalPages
          }
        >
          Następna
        </PaginationLink>
      </div>
    </nav>
  );
}

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-disabled={disabled}
      tabIndex={
        disabled ? -1 : undefined
      }
      className={cn(
        "inline-flex min-h-9 items-center justify-center rounded-xl border px-3.5 py-2 text-xs font-bold transition",
        disabled
          ? "pointer-events-none border-border bg-surface-muted text-text-muted opacity-60"
          : "border-border-strong bg-surface text-text-secondary hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
      )}
    >
      {children}
    </Link>
  );
}
