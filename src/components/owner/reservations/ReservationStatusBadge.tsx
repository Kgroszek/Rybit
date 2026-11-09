import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import {
  RESERVATION_STATUS_LABELS,
} from "@/components/owner/reservations/reservation-utils";

export function ReservationStatusBadge({
  status,
  size = "sm",
}: {
  status: string;
  size?: "sm" | "md";
}) {
  const normalized =
    status === "paid" ? "confirmed" : status;

  const variant =
    normalized === "pending"
      ? "warning"
      : normalized === "confirmed"
        ? "success"
        : normalized === "cancelled"
          ? "danger"
          : "neutral";

  return (
    <Badge
      variant={variant}
      size={size}
      className={cn(
        normalized === "no_show" &&
          "border-warning-border bg-warning-subtle text-warning-foreground"
      )}
    >
      {RESERVATION_STATUS_LABELS[normalized] ??
        normalized}
    </Badge>
  );
}

export function reservationBarClassName(
  status: string
) {
  const normalized =
    status === "paid" ? "confirmed" : status;

  if (normalized === "pending") {
    return "border-warning-border bg-warning text-white";
  }

  if (normalized === "confirmed") {
    return "border-success-border bg-success text-white";
  }

  if (normalized === "cancelled") {
    return "border-danger-border bg-danger text-white";
  }

  if (normalized === "no_show") {
    return "border-warning-border bg-warning-hover text-white";
  }

  return "border-border-strong bg-text-muted text-white";
}
