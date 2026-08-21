import Link from "next/link";

import { AlertIcon } from "@/components/icons/AlertIcon";
import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";

type DashboardStats = {
  occupiedSpots: number;
  totalSpots: number;
  arrivalsToday: number;
  departuresToday: number;
  pendingCount: number;
};

type UpcomingReservation = {
  id: string;
  scope: string;
  type: string;
  status: string;
  title: string | null;
  startsAt: Date;
  peopleCount: number;
  customerName: string | null;
  organizerName: string | null;
  spot: {
    id: string;
    name: string;
  } | null;
};

type SpotSnapshot = {
  id: string;
  name: string;
  maxPeople: number;
  isOccupied: boolean;
  currentLabel: string | null;
};

type OwnerLakeDashboardOverviewProps = {
  lakeSlug: string;
  stats: DashboardStats;
  upcomingReservations: UpcomingReservation[];
  spots: SpotSnapshot[];
  canManageReservations: boolean;
  canManageSpots: boolean;
};

export function OwnerLakeDashboardOverview({
  lakeSlug,
  stats,
  upcomingReservations,
  spots,
  canManageReservations,
  canManageSpots,
}: OwnerLakeDashboardOverviewProps) {
  const reservationsHref = `/moje-lowiska/${lakeSlug}/rezerwacje`;

  return (
    <div className="space-y-6 lg:space-y-7">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Zajęte teraz"
          value={`${stats.occupiedSpots}/${stats.totalSpots}`}
          description="aktywnie zajęte stanowiska"
          tone="primary"
        />
        <StatCard
          label="Przyjazdy dzisiaj"
          value={String(stats.arrivalsToday)}
          description="rezerwacje rozpoczynające się dziś"
          tone="success"
        />
        <StatCard
          label="Wyjazdy dzisiaj"
          value={String(stats.departuresToday)}
          description="rezerwacje kończące się dziś"
          tone="neutral"
        />
        <StatCard
          label="Do potwierdzenia"
          value={String(stats.pendingCount)}
          description="rezerwacje wymagające decyzji"
          tone={stats.pendingCount > 0 ? "warning" : "neutral"}
        />
      </section>

      {stats.pendingCount > 0 && canManageReservations && (
        <Card className="border-warning-border bg-warning-subtle shadow-none">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-warning shadow-sm">
                <AlertIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-base font-extrabold text-warning-foreground sm:text-lg">
                  {formatPendingTitle(stats.pendingCount)}
                </h2>
                <p className="mt-1 text-sm leading-6 text-warning-foreground/80">
                  Sprawdź oczekujące zgłoszenia i zdecyduj, czy potwierdzić termin.
                </p>
              </div>
            </div>

            <ButtonLink href={reservationsHref} variant="outline" size="sm">
              Przejrzyj rezerwacje
              <ArrowSmallRightIcon className="h-4 w-4" />
            </ButtonLink>
          </div>
        </Card>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)]">
        <Card className="overflow-hidden">
          <div className="p-5 sm:p-6">
            <SectionHeader
              eyebrow="Najbliższe 7 dni"
              title="Nadchodzące rezerwacje"
              action={
                canManageReservations ? (
                  <Link
                    href={reservationsHref}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-primary-hover"
                  >
                    Kalendarz
                    <ArrowSmallRightIcon className="h-4 w-4" />
                  </Link>
                ) : null
              }
            />

            {upcomingReservations.length > 0 ? (
              <div className="mt-5 divide-y divide-border">
                {upcomingReservations.map((reservation) => (
                  <ReservationRow
                    key={reservation.id}
                    href={`${reservationsHref}?reservationId=${reservation.id}`}
                    reservation={reservation}
                    interactive={canManageReservations}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                className="mt-5 min-h-48 bg-surface-muted"
                title="Brak nadchodzących rezerwacji"
                description="W najbliższych siedmiu dniach nie ma nowych rezerwacji rozpoczynających pobyt."
                action={
                  canManageReservations ? (
                    <ButtonLink href={`${reservationsHref}?new=1`} variant="secondary" size="sm">
                      Dodaj rezerwację
                    </ButtonLink>
                  ) : null
                }
              />
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-5 sm:p-6">
            <SectionHeader
              eyebrow="Stan w tej chwili"
              title="Stanowiska"
              action={
                canManageSpots ? (
                  <Link
                    href={`/moje-lowiska/${lakeSlug}/stanowiska`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-primary-hover"
                  >
                    Zarządzaj
                    <ArrowSmallRightIcon className="h-4 w-4" />
                  </Link>
                ) : null
              }
            />

            {spots.length > 0 ? (
              <div className="mt-5 divide-y divide-border">
                {spots.slice(0, 10).map((spot) => (
                  <SpotRow
                    key={spot.id}
                    spot={spot}
                    href={canManageReservations ? reservationsHref : undefined}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                className="mt-5 min-h-48 bg-surface-muted"
                title="Brak stanowisk"
                description="Dodaj stanowiska, aby rozdzielać rezerwacje na konkretne miejsca."
                action={
                  canManageSpots ? (
                    <ButtonLink
                      href={`/moje-lowiska/${lakeSlug}/stanowiska`}
                      variant="secondary"
                      size="sm"
                    >
                      Dodaj stanowiska
                    </ButtonLink>
                  ) : null
                }
              />
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  tone: "primary" | "success" | "warning" | "neutral";
}) {
  const dotClassName = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    neutral: "bg-text-muted",
  }[tone];

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-muted">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold tracking-[-0.04em] text-text">
            {value}
          </p>
        </div>
        <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", dotClassName)} />
      </div>
      <p className="mt-1.5 text-xs font-medium leading-5 text-text-secondary">
        {description}
      </p>
    </Card>
  );
}

function ReservationRow({
  href,
  reservation,
  interactive,
}: {
  href: string;
  reservation: UpcomingReservation;
  interactive: boolean;
}) {
  const content = (
    <>
      <div className="w-[76px] shrink-0">
        <p className="text-sm font-extrabold text-text">
          {formatShortDate(reservation.startsAt)}
        </p>
        <p className="mt-0.5 text-xs font-bold text-text-muted">
          {formatTime(reservation.startsAt)}
        </p>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-bold text-text">
            {getReservationTitle(reservation)}
          </p>
          <ReservationStatusBadge status={reservation.status} />
        </div>
        <p className="mt-1 truncate text-xs font-medium text-text-secondary">
          {reservation.scope === "lake"
            ? "Całe łowisko"
            : reservation.spot?.name || "Stanowisko"}
          {reservation.peopleCount > 0 ? ` · ${reservation.peopleCount} os.` : ""}
        </p>
      </div>

      {interactive && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-text-muted transition-colors group-hover:bg-primary-100 group-hover:text-primary">
          <ArrowSmallRightIcon className="h-4 w-4" />
        </span>
      )}
    </>
  );

  if (!interactive) {
    return <div className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">{content}</div>;
  }

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0"
    >
      {content}
    </Link>
  );
}

function SpotRow({
  spot,
  href,
}: {
  spot: SpotSnapshot;
  href?: string;
}) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-text">{spot.name}</p>
        <p className="mt-1 truncate text-xs font-medium text-text-secondary">
          {spot.isOccupied
            ? spot.currentLabel || "Aktualnie zajęte"
            : `do ${spot.maxPeople} os.`}
        </p>
      </div>

      <Badge variant={spot.isOccupied ? "primary" : "success"}>
        {spot.isOccupied ? "Zajęte" : "Wolne"}
      </Badge>
    </>
  );

  if (!href) {
    return <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">{content}</div>;
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
    >
      {content}
    </Link>
  );
}

function ReservationStatusBadge({ status }: { status: string }) {
  if (status === "pending") {
    return <Badge variant="warning">Do potwierdzenia</Badge>;
  }

  if (status === "cancelled") {
    return <Badge variant="danger">Anulowana</Badge>;
  }

  if (status === "no_show") {
    return <Badge variant="warning">Nie przyjechał</Badge>;
  }

  if (status === "completed") {
    return <Badge variant="neutral">Zakończona</Badge>;
  }

  return <Badge variant="success">Potwierdzona</Badge>;
}

function formatPendingTitle(count: number) {
  if (count === 1) return "1 rezerwacja wymaga decyzji";

  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  if (!(lastTwoDigits >= 12 && lastTwoDigits <= 14) && lastDigit >= 2 && lastDigit <= 4) {
    return `${count} rezerwacje wymagają decyzji`;
  }

  return `${count} rezerwacji wymaga decyzji`;
}

function getReservationTitle(reservation: {
  scope: string;
  type: string;
  title: string | null;
  customerName: string | null;
  organizerName: string | null;
}) {
  if (reservation.title) return reservation.title;

  if (reservation.scope === "lake") {
    if (reservation.type === "competition") return "Zawody wędkarskie";
    if (reservation.type === "maintenance") return "Blokada techniczna";
    return reservation.organizerName || "Rezerwacja całego łowiska";
  }

  return reservation.customerName || "Rezerwacja";
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
