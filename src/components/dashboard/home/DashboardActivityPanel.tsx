import Link from "next/link";

import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import type { DashboardStats } from "@/components/dashboard/home/types";
import { Card } from "@/components/ui/Card";

type StatItem = {
  label: string;
  value: number;
  href: string;
};

export function DashboardActivityPanel({ stats }: { stats: DashboardStats }) {
  const items: StatItem[] = [
    { label: "Połowy", value: stats.catches, href: "/polowy" },
    { label: "Gatunki", value: stats.species, href: "/polowy" },
    { label: "Wyprawy", value: stats.trips, href: "/wyprawy" },
    { label: "Ulubione", value: stats.favourites, href: "/lowiska" },
  ];

  return (
    <Card variant="dark" className="p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-end">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-aqua-300">
            Twoje Rybio
          </p>
          <h2 className="mt-2 font-display text-xl font-extrabold tracking-[-0.03em] text-white sm:text-2xl">
            Twoja aktywność
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-white/10 bg-white/10 sm:grid-cols-4">
          {items.map((item) => (
            <Stat key={item.label} {...item} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value, href }: StatItem) {
  return (
    <Link
      href={href}
      className="group min-h-20 bg-navy-950/45 p-4 transition-colors hover:bg-white/[0.08]"
    >
      <p className="font-display text-2xl font-extrabold tabular-nums tracking-[-0.04em] text-white sm:text-3xl">
        {value}
      </p>
      <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-text-on-dark-muted">
        <span>{label}</span>
        <ArrowSmallRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
