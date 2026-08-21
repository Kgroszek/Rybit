export type FishingGearDto = {
  id: string;
  name: string;
  quantity: number;
  category: string;
  brand: string | null;
  model: string | null;
  fishingMethod: string;
  condition: string;
  status: string;
  price: number | null;
  purchaseDate: string | null;
  note: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GearFormState = {
  name: string;
  quantity: string;
  category: string;
  brand: string;
  model: string;
  fishingMethod: string;
  condition: string;
  status: string;
  price: string;
  purchaseDate: string;
  note: string;
  isDefault: boolean;
};

export type GearScopeFilter =
  | "all"
  | "trip"
  | "attention"
  | "inactive";

export type GearSort =
  | "newest"
  | "name"
  | "value_desc"
  | "value_asc";

export type GearManagerProps = {
  initialGear: FishingGearDto[];
};
