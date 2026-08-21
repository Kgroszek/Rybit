import { Badge } from "@/components/ui/Badge";
import type { TripPhase } from "@/components/trips/types";

export function TripPhaseBadge({ phase }: { phase: TripPhase }) {
  const variants = {
    upcoming: "primary",
    active: "warning",
    finished: "success",
    cancelled: "danger",
  } as const;

  const labels: Record<TripPhase, string> = {
    upcoming: "Nadchodząca",
    active: "W trakcie",
    finished: "Zakończona",
    cancelled: "Anulowana",
  };

  return (
    <Badge variant={variants[phase]} size="md">
      {labels[phase]}
    </Badge>
  );
}
