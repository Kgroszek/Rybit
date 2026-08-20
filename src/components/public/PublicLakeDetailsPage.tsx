import { LakeDetailsView } from "@/components/lakes/details/LakeDetailsView";
import type { RecommendedLake } from "@/components/lakes/details/types";
import type { LakeDto } from "@/lib/lakes";

type PublicLakeDetailsPageProps = {
  lake: LakeDto;
  recommendedLakes?: RecommendedLake[];
};

/**
 * Wrapper kompatybilności dla publicznego profilu łowiska.
 * Publiczny i zalogowany widok korzystają z tej samej struktury UI.
 */
export function PublicLakeDetailsPage({
  lake,
  recommendedLakes = [],
}: PublicLakeDetailsPageProps) {
  return (
    <LakeDetailsView
      lake={lake}
      mode="public"
      recommendedLakes={recommendedLakes}
    />
  );
}
