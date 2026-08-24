import type { UserAchievementView } from "@/lib/achievements";
import type { UserFishRecord } from "@/lib/fish-records";
import type { UserRankingBadge } from "@/lib/ranking-badges";

export type ProfileOverviewCounts = {
  favourites: number;
  ratings: number;
  submissions: number;
  catches: number;
  publicCatches: number;
};

export type ProfileFavourite = {
  id: string;
  lake: {
    name: string;
    slug: string;
    fish: string;
    rating: number;
  };
};

export type ProfileRating = {
  id: string;
  value: number;
  updatedAt: Date;
  lake: {
    name: string;
    slug: string;
  };
};

export type ProfileSubmission = {
  id: string;
  name: string;
  city: string;
  voivodeship: string;
  ownerType: string | null;
  status: string;
  adminNote: string | null;
  createdAt: Date;
};

export type ProfileOverviewData = {
  counts: ProfileOverviewCounts;
  favourites: ProfileFavourite[];
  ratings: ProfileRating[];
  submissions: ProfileSubmission[];
};

export type ProfileProgressData = {
  achievements: UserAchievementView[];
  rankingBadges: UserRankingBadge[];
  fishRecords: UserFishRecord[];
};

export type ProfileIdentity = {
  displayName: string;
  email: string;
  createdAt: Date;
};
