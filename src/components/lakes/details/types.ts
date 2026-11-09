import type { LakeDto } from "@/lib/lakes";
import type { NearbyLakeDto } from "@/lib/lake-details";

export type LakeDetailsMode = "public" | "authenticated";

export type RecommendedLake = NearbyLakeDto;

export type LakeDetailsCommonProps = {
  lake: LakeDto;
  mode: LakeDetailsMode;
  recommendedLakes?: RecommendedLake[];
  isAdmin?: boolean;
};
