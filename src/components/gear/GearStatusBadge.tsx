import { Badge } from "@/components/ui/Badge";
import {
  getGearConditionLabel,
  getGearStatusLabel,
} from "@/lib/gear/gear-options";

export function GearConditionBadge({
  condition,
}: {
  condition: string;
}) {
  if (
    condition === "new" ||
    condition === "very_good"
  ) {
    return (
      <Badge variant="success">
        {getGearConditionLabel(
          condition
        )}
      </Badge>
    );
  }

  if (
    condition === "to_check"
  ) {
    return (
      <Badge variant="warning">
        Do sprawdzenia
      </Badge>
    );
  }

  if (
    condition === "damaged"
  ) {
    return (
      <Badge variant="danger">
        Uszkodzony
      </Badge>
    );
  }

  return (
    <Badge variant="primary">
      {getGearConditionLabel(
        condition
      )}
    </Badge>
  );
}

export function GearUsageStatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "active") {
    return (
      <Badge variant="success">
        Aktywny
      </Badge>
    );
  }

  if (
    status === "to_check" ||
    status === "repair"
  ) {
    return (
      <Badge variant="warning">
        {getGearStatusLabel(status)}
      </Badge>
    );
  }

  return (
    <Badge variant="neutral">
      {getGearStatusLabel(status)}
    </Badge>
  );
}
