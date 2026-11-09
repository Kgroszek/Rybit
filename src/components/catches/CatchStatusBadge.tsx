import { Badge } from "@/components/ui/Badge";
import type { FishingCatch } from "@/components/catches/types";
import { getCatchStatusKey } from "@/components/catches/utils";

export function CatchStatusBadge({
  fishingCatch,
}: {
  fishingCatch: FishingCatch;
}) {
  const status = getCatchStatusKey(fishingCatch);

  if (status === "private") {
    return <Badge variant="neutral">Prywatny</Badge>;
  }

  if (status === "approved") {
    return <Badge variant="success">W rankingu</Badge>;
  }

  if (status === "rejected") {
    return <Badge variant="danger">Odrzucony</Badge>;
  }

  return <Badge variant="warning">Weryfikacja</Badge>;
}
