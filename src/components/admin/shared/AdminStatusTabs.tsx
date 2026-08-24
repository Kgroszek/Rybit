import Link from "next/link";

import { cn } from "@/lib/cn";

export type AdminTabItem = {
  value: string;
  label: string;
  count?: number;
};

function buildTabHref({
  pathname,
  paramName,
  value,
  params,
}: {
  pathname: string;
  paramName: string;
  value: string;
  params: Record<string, string | undefined>;
}) {
  const search = new URLSearchParams();

  for (const [key, currentValue] of Object.entries(params)) {
    if (
      currentValue &&
      key !== paramName &&
      key !== "page"
    ) {
      search.set(key, currentValue);
    }
  }

  search.set(paramName, value);

  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function AdminStatusTabs({
  pathname,
  paramName,
  activeValue,
  items,
  params = {},
}: {
  pathname: string;
  paramName: string;
  activeValue: string;
  items: AdminTabItem[];
  params?: Record<string, string | undefined>;
}) {
  return (
    <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <nav
        className="inline-flex min-w-full gap-1 rounded-control bg-surface-muted p-1 sm:min-w-0"
        aria-label="Filtr statusu"
      >
        {items.map((item) => {
          const active = activeValue === item.value;

          return (
            <Link
              key={item.value}
              href={buildTabHref({
                pathname,
                paramName,
                value: item.value,
                params,
              })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition",
                active
                  ? "bg-surface text-primary-700 shadow-sm"
                  : "text-text-muted hover:text-text"
              )}
            >
              <span>{item.label}</span>

              {item.count !== undefined && (
                <span
                  className={cn(
                    "inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black",
                    active
                      ? "bg-primary-100 text-primary-700"
                      : "bg-surface-strong text-text-muted"
                  )}
                >
                  {item.count > 99 ? "99+" : item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
