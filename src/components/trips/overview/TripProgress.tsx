import { cn } from "@/lib/cn";

export function TripProgress({
  value,
  label = "Przygotowanie",
  compact = false,
}: {
  value: number;
  label?: string;
  compact?: boolean;
}) {
  const safeValue = Math.min(Math.max(Math.round(value), 0), 100);

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between gap-4">
        <p
          className={cn(
            "font-bold text-text-secondary",
            compact ? "text-xs" : "text-sm"
          )}
        >
          {label}
        </p>

        <span
          className={cn(
            "shrink-0 font-extrabold text-primary-700",
            compact ? "text-xs" : "text-sm"
          )}
        >
          {safeValue}%
        </span>
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-full bg-surface-strong",
          compact ? "h-2" : "h-2.5"
        )}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
