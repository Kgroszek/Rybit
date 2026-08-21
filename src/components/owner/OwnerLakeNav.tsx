"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { CardsIcon } from "@/components/icons/CardsIcon";
import { DashboardIcon } from "@/components/icons/DashboardIcon";
import { FormIcon } from "@/components/icons/FormIcon";
import { MarkerIcon } from "@/components/icons/MarkerIcon";
import { SettingsIcon } from "@/components/icons/SettingsIcon";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type OwnerLakeNavProps = {
  slug: string;
  lakeName: string;
  canEditLake?: boolean;
  canManageSpots?: boolean;
  canManageReservations?: boolean;
};

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

type NavItem = {
  label: string;
  href: string;
  icon: IconComponent;
  enabled: boolean;
  isActive: (pathname: string) => boolean;
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
  const reservationsBase = `${base}/rezerwacje`;
  const isReservationSettings = pathname === `${reservationsBase}/ustawienia`;
  const isReservationsContext = pathname.startsWith(reservationsBase);

  const items: NavItem[] = [
    {
      label: "Pulpit",
      href: base,
      icon: DashboardIcon,
      enabled: true,
      isActive: (value) => value === base,
    },
    {
      label: "Rezerwacje",
      href: reservationsBase,
      icon: CalendarIcon,
      enabled: canManageReservations,
      isActive: (value) => value.startsWith(reservationsBase),
    },
    {
      label: "Stanowiska",
      href: `${base}/stanowiska`,
      icon: MarkerIcon,
      enabled: canManageSpots,
      isActive: (value) => value.startsWith(`${base}/stanowiska`),
    },
    {
      label: "Profil łowiska",
      href: `${base}/edytuj`,
      icon: FormIcon,
      enabled: canEditLake,
      isActive: (value) =>
        value.startsWith(`${base}/edytuj`) || value.startsWith(`${base}/zdjecia`),
    },
    {
      label: "Strona WWW",
      href: `${base}/strona`,
      icon: CardsIcon,
      enabled: canEditLake,
      isActive: (value) => value.startsWith(`${base}/strona`),
    },
  ];

  return (
    <section className="mb-7 overflow-hidden rounded-panel border border-border bg-surface shadow-card">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
            Panel właściciela
          </p>
          <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="truncate font-display text-lg font-extrabold tracking-[-0.025em] text-text sm:text-xl">
              {lakeName}
            </h2>
            <Link
              href="/moje-lowiska?select=1"
              className="text-xs font-bold text-text-muted transition-colors hover:text-primary"
            >
              Zmień łowisko
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isReservationsContext && canManageReservations && (
            <ButtonLink
              href={
                isReservationSettings
                  ? reservationsBase
                  : `${reservationsBase}/ustawienia`
              }
              variant="ghost"
              size="sm"
            >
              <SettingsIcon className="h-4 w-4" />
              {isReservationSettings ? "Wróć do kalendarza" : "Ustawienia rezerwacji"}
            </ButtonLink>
          )}

          <ButtonLink
            href={`/lowiska-w-polsce/${slug}`}
            variant="outline"
            size="sm"
          >
            Profil publiczny
          </ButtonLink>
        </div>
      </div>

      <div className="border-t border-border px-2 sm:px-3">
        <nav
          aria-label="Nawigacja panelu łowiska"
          className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const active = item.isActive(pathname);
            const Icon = item.icon;

            if (!item.enabled) {
              return (
                <span
                  key={item.label}
                  aria-disabled="true"
                  className="inline-flex min-h-10 shrink-0 cursor-not-allowed items-center gap-2 rounded-control px-3.5 text-sm font-bold text-text-muted/45"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-control px-3.5 text-sm font-bold transition-colors",
                  active
                    ? "bg-primary-100 text-primary-800"
                    : "text-text-secondary hover:bg-surface-muted hover:text-text"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active ? "text-primary" : "text-text-muted"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
