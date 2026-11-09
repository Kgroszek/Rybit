export type SpotDto = {
  id: string;
  name: string;
  description: string | null;
  maxPeople: number;
  isActive: boolean;
  sortOrder: number;
  reservationsCount: number;
  isOccupiedNow: boolean;
  nextReservation: {
    id: string;
    startsAt: string;
    endsAt: string;
    customerName: string | null;
    title: string | null;
  } | null;
};

export type SpotFormState = {
  id: string | null;
  name: string;
  description: string;
  maxPeople: string;
  isActive: boolean;
};

export type SpotFilter =
  | "all"
  | "active"
  | "inactive";

export type OwnerSpotsManagerProps = {
  lakeSlug: string;
  lakeName: string;
  spots: SpotDto[];
  canManage: boolean;
};
