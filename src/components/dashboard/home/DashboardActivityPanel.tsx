import Link from "next/link";

import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import type { DashboardStats } from "@/components/dashboard/home/types";
import { Card } from "@/components/ui/Card";

type StatItem = {
  label: string;
  value: number;
  href?: string;
};

export function DashboardActivityPanel({
  stats,
}: {
  stats: DashboardStats;
}) {
  const items: StatItem[] = [
    {
      label: "Połowy",
      value: stats.catches,
      href: "/polowy",
    },
    {
      label: "Gatunki",
      value: stats.species,
    },
    {
      label: "Wyprawy",
      value: stats.trips,
      href: "/wyprawy",
    },
    {
      label: "Ulubione",
      value: stats.favourites,
      href: "/lowiska",
    },
  ];

  return (
    <Card
      variant="dark"
      className="p-5 sm:p-6 lg:p-7"
    >
      <div className="relative">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-aqua-300">
          Twoje Rybio
        </p>

        <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-white">
          Twoja aktywność w skrócie
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#DCE8F3]">
          Najważniejsze liczby z Twojego
          dziennika i wypraw.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-white/10 bg-white/10 sm:grid-cols-4">
          {items.map((item) => (
            <Stat
              key={item.label}
              {...item}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  href,
}: StatItem) {
  const content = (
    <>
      <p className="font-display text-3xl font-extrabold tabular-nums tracking-[-0.04em] text-white">
        {value}
      </p>

      <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#DCE8F3]">
        <span>{label}</span>

        {href && (
          <ArrowSmallRightIcon className="h-3.5 w-3.5" />
        )}
      </div>
    </>
  );

  const className =
    "min-h-24 bg-navy-950/55 p-4 transition-colors hover:bg-white/[0.08] sm:p-5";

  if (href) {
    return (
      <Link
        href={href}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}
