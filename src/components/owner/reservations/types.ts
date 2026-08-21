export type OwnerSpotOption = {
  id: string;
  name: string;
  maxPeople: number;
};

export type OwnerReservationItem = {
  id: string;
  spotId: string | null;
  scope: string;
  type: string;
  status: string;
  title: string | null;
  startsAt: string;
  endsAt: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  organizerName: string | null;
  organizerPhone: string | null;
  organizerEmail: string | null;
  peopleCount: number;
  note: string | null;
  internalNote: string | null;
  isPublicEvent: boolean;
  spot: {
    id: string;
    name: string;
  } | null;
};

export type BookingTimes = {
  defaultStartTime: string;
  defaultEndTime: string;
  fullDayStartTime: string;
  fullDayEndTime: string;
  dayStartTime: string;
  dayEndTime: string;
  nightStartTime: string;
  nightEndTime: string;
};

export type ReservationScope = "spot" | "lake";

export type ReservationFormState = {
  id: string | null;
  scope: ReservationScope;
  type: string;
  status: string;
  spotId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  peopleCount: string;
  note: string;
  internalNote: string;
  isPublicEvent: boolean;
};

export type OwnerReservationsManagerProps = {
  lakeSlug: string;
  lakeName: string;
  from: string;
  days: number;
  activeNow: number;
  pendingCount: number;
  spots: OwnerSpotOption[];
  settings: BookingTimes;
  reservations: OwnerReservationItem[];
  initialNew?: boolean;
  initialSpotId?: string | null;
  initialReservationId?: string | null;
};
