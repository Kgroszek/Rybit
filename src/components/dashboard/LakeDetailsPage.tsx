import { LakeDetailsView } from "@/components/lakes/details/LakeDetailsView";
import type { RecommendedLake } from "@/components/lakes/details/types";
import type { LakeDto } from "@/lib/lakes";

type LakeDetailsPageProps = {
  lake: LakeDto;
  recommendedLakes?: RecommendedLake[];
  isAdmin?: boolean;
};

/**
 * Wrapper kompatybilności dla widoku po zalogowaniu.
 * Właściwy UI znajduje się w jednym wspólnym LakeDetailsView.
 */
export function LakeDetailsPage({
  lake,
  recommendedLakes = [],
  isAdmin = false,
}: LakeDetailsPageProps) {
  return (
    <LakeDetailsView
      lake={lake}
      mode="authenticated"
      recommendedLakes={recommendedLakes}
      isAdmin={isAdmin}
    />
  );
}
