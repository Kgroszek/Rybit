export type TripMemberDto = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string | null;
  role: string;
  status: string;
  invitedByUserId: string;
  acceptedAt: string | null;
  createdAt: string;
};

export type TripLakeDto = {
  id: string;
  name: string;
  slug: string;
  city: string;
  voivodeship: string;
  lat: number;
  lng: number;
  images: {
    url: string;
  }[];
} | null;

export type TripChecklistItemDto = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string | null;
  isPacked: boolean;
  isImportant: boolean;
  source: string;
  gearId: string | null;
  note: string | null;
};

export type TripChecklistDto = {
  id: string;
  title: string;
  status: string;
  items: TripChecklistItemDto[];
} | null;

export type FishingTrip = {
  id: string;
  userId: string;

  title: string;
  lakeId: string | null;
  lakeName: string | null;
  lake: TripLakeDto;
  lakeImage: string | null;

  tripType: string;
  status: string;
  startsAt: string;
  endsAt: string | null;

  peopleCount: number;
  note: string | null;

  checklistId: string | null;
  checklist: TripChecklistDto;

  summary: string | null;
  summaryRating: number | null;
  weatherSummary: string | null;
  completedAt: string | null;

  isSummaryPublic: boolean;
  shareToken: string | null;

  members: TripMemberDto[];
  gearItems: {
    id: string;
    isRequired: boolean;
    isPacked: boolean;
  }[];

  _count: {
    notes: number;
    costs: number;
    media: number;
    catches: number;
    reminders: number;
  };

  isOwner: boolean;
  accessRole: string;
  canEdit: boolean;
  canManageMembers: boolean;
  canDelete: boolean;

  acceptedMembersCount: number;
  pendingMembersCount: number;
  participantsCount: number;

  checklistItemsCount: number;
  packedChecklistItemsCount: number;
  requiredChecklistItemsCount: number;
  packedRequiredChecklistItemsCount: number;

  requiredGearItemsCount: number;
  packedRequiredGearItemsCount: number;

  checklistProgress: number;
  requiredChecklistProgress: number;
  requiredGearProgress: number;
  detailsProgress: number;
  preparationProgress: number;
  preparationWarnings: string[];

  createdAt: string;
  updatedAt: string;
};

export type LakeOption = {
  id: string;
  name: string;
  city: string;
  voivodeship: string;
};

export type TripInvitation = {
  id: string;
  role: string;
  trip: {
    id: string;
    title: string;
    lakeName: string | null;
    startsAt: string;
  };
};

export type TripsPageProps = {
  initialTrips: FishingTrip[];
  lakes: LakeOption[];
  initialLakeId?: string | null;
  initialLakeName?: string | null;
  pendingInvitations?: TripInvitation[];
};

export type TripFormState = {
  title: string;
  lakeId: string;
  tripType: string;
  status: string;
  startsAt: string;
  endsAt: string;
  peopleCount: string;
  note: string;
  createChecklist: boolean;
};

export type TripTab = "upcoming" | "active" | "finished" | "all";
export type TripSort = "nearest" | "farthest" | "newest" | "name";
export type TripsViewMode = "trips" | "calendar";
export type TripPhase = "upcoming" | "active" | "finished" | "cancelled";

export type TripCounts = {
  upcoming: number;
  active: number;
  finished: number;
  shared: number;
  thingsToPack: number;
};
