"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type OwnerLakeNavProps = {
  slug: string;
  lakeName: string;
  canEditLake?: boolean;
  canManageSpots?: boolean;
  canManageReservations?: boolean;
};

type NavItem = {
  label: string;
  href: string;
  match: (pathname: string) => boolean;
  icon: "home" | "calendar" | "add" | "spots" | "website" | "settings";
  enabled: boolean;
};

export function OwnerLakeNav({
  slug,
  lakeName,
  canEditLake = true,
  canManageSpots = true,
  canManageReservations = true,
}: OwnerLakeNavProps) {
  const pathname = usePathname();
  const base = `/moje-lowiska/${slug}`;

  const items: NavItem[] = [
    {
      label: "Pulpit",
      href: base,
      match: (value) => value === base,
      icon: "home",
      enabled: true,
    },
    {
      label: "Rezerwacje",
      href: `${base}/rezerwacje`,
      match: (value) => value.startsWith(`${base}/rezerwacje`) && !value.endsWith("/ustawienia"),
      icon: "calendar",
      enabled: canManageReservations,
    },
    {
      label: "Stanowiska",
      href: `${base}/stanowiska`,
      match: (value) => value.startsWith(`${base}/stanowiska`),
      icon: "spots",
      enabled: canManageSpots,
    },
    {
      label: "Strona WWW",
      href: `${base}/strona`,
      match: (value) => value.startsWith(`${base}/strona`),
      icon: "website",
      enabled: canEditLake,
    },
    {
      label: "Ustawienia",
      href: canManageReservations
        ? `${base}/rezerwacje/ustawienia`
        : `${base}/edytuj`,
      match: (value) =>
        value.endsWith("/rezerwacje/ustawienia") || value.endsWith("/edytuj"),
      icon: "settings",
      enabled: canManageReservations || canEditLake,
    },
  ];

  return (
    <>
      <div className="mb-6 rounded-[26px] bg-white p-3 shadow-sm ring-1 ring-slate-200/80">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 px-2 py-1">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">
              Panel łowiska
            </p>
            <div className="mt-1 flex min-w-0 items-center gap-2">
              <h2 className="truncate text-lg font-black text-slate-950">
                {lakeName}
              </h2>
              <Link
                href="/moje-lowiska?select=1"
                className="shrink-0 text-xs font-black text-slate-400 transition hover:text-blue-600"
              >
                Zmień
              </Link>
            </div>
          </div>

          <nav className="hidden flex-wrap items-center gap-1 lg:flex">
            {items.map((item) => {
              const active = item.match(pathname);

              if (!item.enabled) {
                return (
                  <span
                    key={item.label}
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-slate-300"
                  >
                    <OwnerNavIcon name={item.icon} />
                    {item.label}
                  </span>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-colors ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <OwnerNavIcon name={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <nav className={`fixed inset-x-3 bottom-3 z-[1050] grid ${
        canManageReservations ? "grid-cols-6" : "grid-cols-5"
      } rounded-[24px] bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl lg:hidden`}>
        {items.slice(0, 2).map((item) => {
          const active = item.match(pathname);

          if (!item.enabled) {
            return (
              <span
                key={item.label}
                className="flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-black text-slate-600"
              >
                <OwnerNavIcon name={item.icon} />
                <span className="truncate">{item.icon === "website" ? "WWW" : item.label}</span>
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-black transition-colors ${
                active ? "bg-white text-slate-950" : "text-slate-300"
              }`}
            >
              <OwnerNavIcon name={item.icon} />
              <span className="truncate">{item.icon === "website" ? "WWW" : item.label}</span>
            </Link>
          );
        })}

        {canManageReservations && (
          <Link
            href={`${base}/rezerwacje?new=1`}
            className="mx-auto flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-950/30 ring-4 ring-slate-950"
            aria-label="Nowa rezerwacja"
          >
            <OwnerNavIcon name="add" />
          </Link>
        )}

        {items.slice(2).map((item) => {
          const active = item.match(pathname);

          if (!item.enabled) {
            return (
              <span
                key={item.label}
                className="flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-black text-slate-600"
              >
                <OwnerNavIcon name={item.icon} />
                <span className="truncate">{item.icon === "website" ? "WWW" : item.label}</span>
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-black transition-colors ${
                active ? "bg-white text-slate-950" : "text-slate-300"
              }`}
            >
              <OwnerNavIcon name={item.icon} />
              <span className="truncate">{item.icon === "website" ? "WWW" : item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function OwnerNavIcon({ name }: { name: NavItem["icon"] }) {
  const className = "h-4 w-4";

  if (name === "add") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "spots") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="M5 7h14M5 12h14M5 17h14M8 4v16M16 4v16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "website") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <rect
          x="3.5"
          y="4.5"
          width="17"
          height="15"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M4 8.5h16M7 6.5h.01M10 6.5h.01"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M8 13h8M8 16h5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M19 12a7 7 0 0 0-.08-1l2-1.55-2-3.46-2.43.98A7.2 7.2 0 0 0 14.8 6L14.5 3h-5l-.3 3a7.2 7.2 0 0 0-1.69.97l-2.43-.98-2 3.46L5.08 11a7.2 7.2 0 0 0 0 2l-2 1.55 2 3.46 2.43-.98A7.2 7.2 0 0 0 9.2 18l.3 3h5l.3-3a7.2 7.2 0 0 0 1.69-.97l2.43.98 2-3.46L18.92 13c.05-.33.08-.66.08-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
