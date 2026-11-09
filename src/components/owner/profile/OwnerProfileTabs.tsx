"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CardsIcon } from "@/components/icons/CardsIcon";
import { FormIcon } from "@/components/icons/FormIcon";
import { cn } from "@/lib/cn";

export function OwnerProfileTabs({
  slug,
}: {
  slug: string;
}) {
  const pathname = usePathname();
  const base = `/moje-lowiska/${slug}`;

  const items = [
    {
      label: "Informacje",
      href: `${base}/edytuj`,
      icon: FormIcon,
      active: pathname.startsWith(
        `${base}/edytuj`
      ),
    },
    {
      label: "Zdjęcia",
      href: `${base}/zdjecia`,
      icon: CardsIcon,
      active: pathname.startsWith(
        `${base}/zdjecia`
      ),
    },
  ];

  return (
    <nav
      aria-label="Sekcje profilu łowiska"
      className="mb-6 flex w-full gap-1.5 overflow-x-auto rounded-control border border-border bg-surface p-1.5 shadow-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-fit"
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={
              item.active ? "page" : undefined
            }
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition",
              item.active
                ? "bg-primary-100 text-primary-800"
                : "text-text-secondary hover:bg-surface-muted hover:text-text"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4",
                item.active
                  ? "text-primary"
                  : "text-text-muted"
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
