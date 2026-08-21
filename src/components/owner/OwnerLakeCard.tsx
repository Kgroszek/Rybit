import Link from "next/link";

import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type OwnerLakeCardProps = {
  lake: {
    name: string;
    slug: string;
    city: string;
    voivodeship: string;
    ownerType: string;
    imageUrl: string | null;
    activeSpotsCount: number;
    pendingReservationsCount: number;
  };
};

export function OwnerLakeCard({ lake }: OwnerLakeCardProps) {
  const hasPending = lake.pendingReservationsCount > 0;

  return (
    <Link
      href={`/moje-lowiska/${lake.slug}`}
      className="group block rounded-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--rybio-focus-ring)]"
    >
      <Card variant="interactive" className="h-full overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden bg-surface-muted">
          {lake.imageUrl ? (
            <img
              src={lake.imageUrl}
              alt={`${lake.name} – zdjęcie łowiska`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_15%_10%,rgba(47,91,167,0.20),transparent_36%),radial-gradient(circle_at_88%_90%,rgba(32,166,164,0.14),transparent_38%),linear-gradient(145deg,var(--rybio-blue-50),var(--rybio-surface-muted))]" />
          )}

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-950/55 to-transparent" />

          <div className="absolute left-4 top-4">
            <Badge variant={lake.ownerType === "commercial" ? "success" : "primary"}>
              {lake.ownerType === "commercial" ? "Komercyjne" : "PZW"}
            </Badge>
          </div>
        </div>

        <div className="flex h-full flex-col p-5 sm:p-6">
          <div className="min-w-0">
            <h2 className="truncate font-display text-xl font-extrabold tracking-[-0.025em] text-text">
              {lake.name}
            </h2>
            <p className="mt-1.5 truncate text-sm font-medium text-text-secondary">
              {lake.city} · woj. {lake.voivodeship}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Metric label="Stanowiska" value={String(lake.activeSpotsCount)} />
            <Metric
              label="Do działania"
              value={String(lake.pendingReservationsCount)}
              highlighted={hasPending}
            />
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-bold text-primary">
              Otwórz panel
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <ArrowSmallRightIcon className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function Metric({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={
        highlighted
          ? "rounded-control border border-warning-border bg-warning-subtle px-3.5 py-3"
          : "rounded-control border border-border bg-surface-muted px-3.5 py-3"
      }
    >
      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-text-muted">
        {label}
      </p>
      <p
        className={
          highlighted
            ? "mt-1 font-display text-xl font-extrabold text-warning-foreground"
            : "mt-1 font-display text-xl font-extrabold text-text"
        }
      >
        {value}
      </p>
    </div>
  );
}
