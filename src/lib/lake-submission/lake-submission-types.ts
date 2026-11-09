import type {
  FishingMethod,
} from "@/lib/fishing-methods";

export type LakeSubmissionStepKey =
  | "basic"
  | "location"
  | "details"
  | "amenities"
  | "photos"
  | "contact";

export type LakeSubmissionStep = {
  key: LakeSubmissionStepKey;
  title: string;
  shortTitle: string;
  description: string;
};

export type LakeSubmissionFormState = {
  name: string;
  description: string;
  ownerType: string;
  fishingType: string;
  fishingMethods: FishingMethod[];
  fish: string;
  lat: string;
  lng: string;
  street: string;
  city: string;
  postalCode: string;
  voivodeship: string;
  area: string;
  averageDepth: string;
  bottomType: string;
  waterType: string;
  priceListText: string;
  priceListUrl: string;
  rulesText: string;
  rulesUrl: string;
  isOpenAllDay: boolean;
  openingHours: string;
  cottages: boolean;
  campfire: boolean;
  noKill: boolean;
  tent: boolean;
  parking: boolean;
  pier: boolean;
  toilet: boolean;
  sanitaryFacilities: boolean;
  shop: boolean;
  nightFishing: boolean;
  boatRental: boolean;
  camperCaravan: boolean;
  electricityHookup: boolean;
  gearRental: boolean;
  shelter: boolean;
  coveredSpots: boolean;
  playground: boolean;
  cardPayment: boolean;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactWebsite: string;
};


export type LakeSubmissionFieldUpdater = <
  K extends keyof LakeSubmissionFormState,
>(
  field: K,
  value: LakeSubmissionFormState[K]
) => void;

export type LakeSubmissionFormErrors =
  Partial<
    Record<
      keyof LakeSubmissionFormState,
      string
    >
  >;

export type FishRecordFormItem = {
  id: string;
  fishName: string;
  weightKg: string;
};

export type GearRequirementFormItem = {
  id: string;
  text: string;
};

export type LakeSubmissionFeedback = {
  tone:
    | "info"
    | "warning"
    | "error";
  text: string;
};

export type LakeSubmissionApiResponse = {
  message?: string;
};

export type LakeSubmissionImagePreview = {
  file: File;
  url: string;
};
