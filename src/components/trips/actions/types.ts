import type { ReactNode } from "react";
import type { ChecklistTemplateItem } from "@/lib/trips/checklist-templates";

export type TripActionType = "checklist" | "gear" | "note" | "cost" | "media" | "catch";

export type TripActionBaseProps = {
  tripId: string;
  canEdit: boolean;
  label?: string;
  icon?: ReactNode;
  className?: string;
};

export type TripParticipant = { id: string; name: string };

export type TripActionPopupProps = TripActionBaseProps & {
  action: TripActionType;
  tripStartsAt?: string | Date;
  tripEndsAt?: string | Date | null;
  tripType?: string;
  lakeGearRequirements?: string[];
  participants?: TripParticipant[];
};

export type ChecklistItem = {
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

export type Checklist = {
  id: string;
  title: string;
  status: string;
  items: ChecklistItem[];
} | null;

export type UserChecklistTemplate = {
  id: string;
  name: string;
  description: string | null;
  tripType: string;
  updatedAt: string;
  items: ChecklistTemplateItem[];
};

export type AvailableGear = {
  id: string;
  name: string;
  quantity: number;
  category: string;
  brand: string | null;
  model: string | null;
  fishingMethod: string;
  condition: string;
  isDefault: boolean;
};

export type TripGearItem = {
  id: string;
  gearId: string | null;
  addedByUserId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string | null;
  note: string | null;
  isRequired: boolean;
  isPacked: boolean;
};
