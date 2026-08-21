import { CatchesManager } from "@/components/catches/management/CatchesManager";
import type { FishingCatch, LakeOption, TripOption } from "@/components/catches/types";

export function CatchesPage({
  initialCatches,
  lakes,
  trips,
  initialTripId = null,
  initialCreateOpen = false,
  initialEditCatchId = null,
}: {
  initialCatches: FishingCatch[];
  lakes: LakeOption[];
  trips: TripOption[];
  initialTripId?: string | null;
  initialCreateOpen?: boolean;
  initialEditCatchId?: string | null;
}) {
  return (
    <CatchesManager
      initialCatches={initialCatches}
      lakes={lakes}
      trips={trips}
      initialTripId={initialTripId}
      initialCreateOpen={initialCreateOpen}
      initialEditCatchId={initialEditCatchId}
    />
  );
}
