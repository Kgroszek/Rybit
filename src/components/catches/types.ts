export type FishingCatch = {
  id: string;
  userId: string;
  userName?: string | null;
  fishName: string;
  weight: number | null;
  length: number | null;
  method: string;
  bait: string | null;
  caughtAt: string;
  lakeId: string | null;
  lakeName: string | null;
  tripId: string | null;
  tripTitle: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  note: string | null;
  isPublic: boolean;
  rankingStatus: string;
  catchScore?: number | null;
  catchScoreTier?: string | null;
  catchScoreSource?: string | null;
  catchScoreVersion?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type LakeOption = {
  id: string;
  name: string;
  city: string;
  voivodeship: string;
};

export type TripOption = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  lakeId: string | null;
  tripType: string;
  status: string;
};

export type CatchFormState = {
  fishName: string;
  customFishName: string;
  weight: string;
  length: string;
  method: string;
  bait: string;
  caughtAt: string;
  lakeId: string;
  tripId: string;
  note: string;
  isPublic: boolean;
};

export type CatchFormMode = "quick" | "full";
export type CatchFieldChange = <K extends keyof CatchFormState>(field: K, value: CatchFormState[K]) => void;
export type CatchViewMode = "grid" | "list";

export type CatchFilterState = {
  search: string;
  method: string;
  species: string;
  status: string;
  lakeId: string;
  tripId: string;
  fromDate: string;
  toDate: string;
};

export type CatchDetailsMode = "authenticated" | "public";

export type CatchDetailsData = {
  id: string;
  userId: string;
  userName: string | null;
  fishName: string;
  weight: number | null;
  length: number | null;
  method: string;
  bait: string | null;
  caughtAt: string;
  lakeId: string | null;
  lakeName: string | null;
  lakeSlug: string | null;
  tripId: string | null;
  tripTitle: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  note: string | null;
  isPublic: boolean;
  rankingStatus: string;
  catchScore: number | null;
  catchScoreTier: string | null;
  catchScoreSource: string | null;
  catchScoreVersion: number | null;
  createdAt: string;
  updatedAt: string;
};
