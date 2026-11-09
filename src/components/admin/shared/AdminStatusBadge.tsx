import {
  Badge,
} from "@/components/ui/Badge";
import {
  getAdminStatusMeta,
} from "@/lib/admin/admin-status";

export function AdminStatusBadge({
  status,
}: {
  status:
    | string
    | null
    | undefined;
}) {
  const meta =
    getAdminStatusMeta(status);

  return (
    <Badge
      variant={meta.variant}
      size="sm"
    >
      {meta.label}
    </Badge>
  );
}
