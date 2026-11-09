import { resolveStoredCatchScore } from "@/lib/catch-score";
import { cn } from "@/lib/cn";
import type { FishingCatch } from "@/components/catches/types";

type CatchScoreBadgeProps = {
  fishingCatch: Pick<
    FishingCatch,
    | "fishName"
    | "weight"
    | "length"
    | "catchScore"
    | "catchScoreTier"
    | "catchScoreSource"
    | "catchScoreVersion"
  >;
  size?: "sm" | "md" | "lg";
  showTier?: boolean;
  className?: string;
};

const tierClassNames: Record<string, string> = {
  starter: "border-border bg-surface-muted text-text-secondary",
  solid: "border-primary-200 bg-primary-100 text-primary-800",
  good: "border-aqua-200 bg-aqua-50 text-aqua-700",
  great: "border-success-border bg-success-subtle text-success-foreground",
  trophy: "border-warning-border bg-warning-subtle text-warning-foreground",
  legendary: "border-navy-800 bg-navy-950 text-white",
};

const sizeClassNames = {
  sm: "min-h-9 min-w-9 px-2.5 text-xs",
  md: "min-h-12 min-w-12 px-3 text-sm",
  lg: "min-h-16 min-w-16 px-4 text-xl",
};

export function CatchScoreBadge({
  fishingCatch,
  size = "md",
  showTier = false,
  className,
}: CatchScoreBadgeProps) {
  const score = resolveStoredCatchScore({
    ...fishingCatch,
    catchScoreVersion: fishingCatch.catchScoreVersion ?? null,
  });
  const tier = score.tier ?? "starter";

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-control border font-bold shadow-sm",
        tierClassNames[tier] ?? tierClassNames.starter,
        sizeClassNames[size],
        className
      )}
      aria-label={`Rybio Score ${score.score ?? "brak"} na 100, ${score.tierLabel}`}
    >
      <span className="font-display font-extrabold leading-none">
        {score.score ?? "—"}
      </span>
      {showTier && (
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-75">
          {score.tierLabel}
        </span>
      )}
    </div>
  );
}
