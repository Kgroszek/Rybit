export type DashboardTrip = {
  id: string;
  userId: string;
  title: string;
  lakeName: string | null;
  startsAt: Date;
  endsAt: Date | null;
  tripType: string;
  status: string;
  checklist: {
    items: {
      isPacked: boolean;
      isImportant: boolean;
    }[];
  } | null;
  gearItems: {
    isPacked: boolean;
    isRequired: boolean;
  }[];
  members: {
    id: string;
  }[];
};

export type PreparationSummary = {
  percent: number;
  checklistTotal: number;
  checklistPacked: number;
  checklistRemaining: number;
  importantChecklistRemaining: number;
  gearTotal: number;
  gearPacked: number;
  gearRemaining: number;
  requiredGearRemaining: number;
  messages: string[];
};

export type PriorityTone =
  | "info"
  | "success"
  | "warning"
  | "neutral";

export type PriorityCardData = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  secondaryHref?: string;
  secondaryCta?: string;
  tone: PriorityTone;
  trip?: DashboardTrip | null;
  preparation?: PreparationSummary | null;
};

export type DashboardTaskIcon =
  | "users"
  | "fish"
  | "checklist"
  | "backpack"
  | "calendar"
  | "summary";

export type DashboardTask = {
  key: string;
  href: string;
  icon: DashboardTaskIcon;
  title: string;
  description: string;
  badge?: string;
};

export type DashboardStats = {
  catches: number;
  species: number;
  trips: number;
  favourites: number;
};

export type DashboardRecentCatch = {
  id: string;
  fishName: string;
  weight: number | null;
  length: number | null;
  method: string;
  bait: string | null;
  lakeName: string | null;
  tripTitle: string | null;
  caughtAt: string;
};

export type PendingInvitation = {
  id: string;
  userName: string;
  role: string;
  createdAt: Date;
  trip: {
    id: string;
    title: string;
    lakeName: string | null;
    startsAt: Date;
    endsAt: Date | null;
    tripType: string;
  };
};

export type RecentFinishedTrip = {
  id: string;
  title: string;
  lakeName: string | null;
  startsAt: Date;
  endsAt: Date | null;
  _count: {
    catches: number;
    media: number;
    costs: number;
  };
};
