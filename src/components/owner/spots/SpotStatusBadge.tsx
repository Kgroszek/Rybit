import { Badge } from "@/components/ui/Badge";
import type { SpotDto } from "@/components/owner/spots/types";

export function SpotStatusBadge({
  spot,
}: {
  spot: SpotDto;
}) {
  if (spot.isOccupiedNow) {
    return (
      <Badge variant="primary">
        Zajęte teraz
      </Badge>
    );
  }

  if (spot.isActive) {
    return (
      <Badge variant="success">
        Aktywne
      </Badge>
    );
  }

  return (
    <Badge variant="neutral">
      Nieaktywne
    </Badge>
  );
}
