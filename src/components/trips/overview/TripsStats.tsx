import { Card } from "@/components/ui/Card";
import type { TripCounts } from "@/components/trips/types";
import { cn } from "@/lib/cn";

export function TripsStats({
  counts,
  pendingInvitations,
}: {
  counts: TripCounts;
  pendingInvitations: number;
}) {
  const items = [
    {
      label: "Nadchodzące",
      value: counts.upcoming,
      description:
        counts.active > 0
          ? `${counts.active} ${counts.active === 1 ? "wyprawa" : "wyprawy"} w trakcie`
          : "zaplanowane wyjazdy",
    },
    {
      label: "W trakcie",
      value: counts.active,
      description: "aktualnie prowadzone",
    },
    {
      label: "Do spakowania",
      value: counts.thingsToPack,
      description: "ważne rzeczy i sprzęt",
      attention: counts.thingsToPack > 0,
    },
    {
      label: "Współdzielone",
      value: counts.shared,
      description:
        pendingInvitations > 0
          ? `${pendingInvitations} ${pendingInvitations === 1 ? "zaproszenie oczekuje" : "zaproszenia oczekują"}`
          : "wspólne wyprawy",
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              "min-w-0 px-5 py-5 sm:px-6",
              index % 2 === 1 && "border-l border-border lg:border-l",
              index >= 2 && "border-t border-border lg:border-t-0",
              index === 2 && "lg:border-l",
              index === 3 && "lg:border-l"
            )}
          >
            <p className="text-xs font-bold text-text-muted">
              {item.label}
            </p>

            <p
              className={cn(
                "mt-2 font-display text-2xl font-extrabold tracking-[-0.025em] sm:text-3xl",
                item.attention ? "text-warning-foreground" : "text-text"
              )}
            >
              {item.value}
            </p>

            <p
              className={cn(
                "mt-1 text-xs leading-5",
                item.attention
                  ? "text-warning-foreground"
                  : "text-text-muted"
              )}
            >
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
