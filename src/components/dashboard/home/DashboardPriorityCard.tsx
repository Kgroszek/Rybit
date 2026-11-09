import { AlertIcon } from "@/components/icons/AlertIcon";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { CheckListIcon } from "@/components/icons/CheckListIcon";
import { MarkerIcon } from "@/components/icons/MarkerIcon";
import { UsersIcon } from "@/components/icons/UsersIcon";
import type {
  PreparationSummary,
  PriorityCardData,
  PriorityTone,
} from "@/components/dashboard/home/types";
import { formatTripDateRange } from "@/components/dashboard/home/utils";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const toneClassNames: Record<
  PriorityTone,
  {
    accent: string;
    badge:
      | "primary"
      | "success"
      | "warning"
      | "neutral";
  }
> = {
  info: {
    accent: "bg-primary",
    badge: "primary",
  },
  success: {
    accent: "bg-success",
    badge: "success",
  },
  warning: {
    accent: "bg-warning",
    badge: "warning",
  },
  neutral: {
    accent: "bg-border-strong",
    badge: "neutral",
  },
};

export function DashboardPriorityCard({
  card,
}: {
  card: PriorityCardData;
}) {
  const tone =
    toneClassNames[card.tone];

  return (
    <Card className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1.5",
          tone.accent
        )}
        style={{
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
        }}
      />

      <div className="grid gap-6 p-5 pl-6 sm:p-6 sm:pl-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:p-7 lg:pl-8">
        <div className="min-w-0 max-w-4xl">
          <Badge variant={tone.badge}>
            {card.eyebrow}
          </Badge>

          <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight tracking-[-0.035em] text-text sm:text-3xl">
            {card.title}
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary sm:text-base">
            {card.description}
          </p>

          {card.trip && (
            <div className="mt-5 flex flex-wrap gap-2">
              {card.trip.lakeName && (
                <MetaPill>
                  <MarkerIcon className="h-4 w-4" />
                  {card.trip.lakeName}
                </MetaPill>
              )}

              <MetaPill>
                <CalendarIcon className="h-4 w-4" />
                {formatTripDateRange(
                  card.trip.startsAt,
                  card.trip.endsAt
                )}
              </MetaPill>

              <MetaPill>
                <UsersIcon className="h-4 w-4" />
                {card.trip.members.length +
                  1}{" "}
                os.
              </MetaPill>
            </div>
          )}

          {card.preparation && (
            <PreparationBlock
              preparation={
                card.preparation
              }
            />
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <ButtonLink
            href={card.href}
            variant="primary"
          >
            {card.cta}
          </ButtonLink>

          {card.secondaryHref &&
            card.secondaryCta && (
              <ButtonLink
                href={
                  card.secondaryHref
                }
                variant="outline"
              >
                {card.secondaryCta}
              </ButtonLink>
            )}
        </div>
      </div>
    </Card>
  );
}

function MetaPill({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-bold text-text-secondary">
      {children}
    </span>
  );
}

function PreparationBlock({
  preparation,
}: {
  preparation: PreparationSummary;
}) {
  return (
    <div className="mt-6 max-w-2xl rounded-card border border-border bg-surface-muted p-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-text-muted">
            Przygotowanie
          </p>

          <p className="mt-1 text-sm font-bold text-text">
            {preparation.percent}%
            gotowe
          </p>
        </div>

        <span className="font-display text-2xl font-extrabold tabular-nums text-primary">
          {preparation.percent}%
        </span>
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-surface-strong"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={
          preparation.percent
        }
        aria-label="Postęp przygotowania wyprawy"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{
            width: `${preparation.percent}%`,
          }}
        />
      </div>

      {preparation.messages.length >
      0 ? (
        <div className="mt-4 space-y-2">
          {preparation.messages
            .slice(0, 2)
            .map((message) => (
              <div
                key={message}
                className="flex items-start gap-2 rounded-xl bg-[#FFF7ED] px-3 py-2 text-xs font-semibold leading-5 text-[#B45309]"
              >
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" />
                <span>{message}</span>
              </div>
            ))}
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#ECFDF5] px-3 py-2 text-xs font-semibold leading-5 text-[#047857]">
          <CheckListIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
          <span>
            Wszystkie dodane elementy
            przygotowania są gotowe.
          </span>
        </div>
      )}
    </div>
  );
}
