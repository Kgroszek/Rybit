export type LakeOwnerType =
  | "pzw"
  | "commercial";

export type LakeFishingType =
  | "general"
  | "spinning"
  | "carp";

export type LakeAmenityKey =
  | "cottages"
  | "campfire"
  | "noKill"
  | "tent"
  | "parking"
  | "pier"
  | "toilet"
  | "sanitaryFacilities"
  | "shop"
  | "nightFishing"
  | "boatRental"
  | "camperCaravan"
  | "electricityHookup"
  | "gearRental"
  | "shelter"
  | "coveredSpots"
  | "playground"
  | "cardPayment";

export type LakeAmenitiesDto =
  Record<LakeAmenityKey, boolean>;

export type LakeListDto = {
  id: string;
  name: string;
  slug: string;
  rating: string;
  fish: string;
  fishSpecies: string[];
  type: LakeOwnerType;
  fishingType: LakeFishingType;
  lat: number;
  lng: number;
  address: {
    street: string;
    city: string;
    postalCode: string;
    voivodeship: string;
  };
  amenities: LakeAmenitiesDto;
  images: string[];

  /**
   * Pola używane tylko przez starsze / pomocnicze widoki.
   * Główny explorer nie potrzebuje ich na liście.
   */
  distance?: string;
  description?: string;
};

export type LakeFilterOptions = {
  voivodeships: string[];
  fishOptions: string[];
  allLakesCount: number;
};

export type CatchRankingItem = {
  id: string;
  userId: string;
  userName: string | null;
  fishName: string;
  weight: number | null;
  length: number | null;
  method: string;
  bait: string | null;
  caughtAt: string;
  imageUrl: string;
  note: string | null;
};

export type LakeFishRecordDto = {
  id: string;
  fishName: string;
  weightKg: number;
};

export type LakeOpeningHoursDto = {
  isOpenAllDay: boolean;
  text: string | null;
};

export type LakeDto =
  LakeListDto & {
    distance: string;
    description: string;
    fishingMethods: string[];

    details: {
      area: string;
      averageDepth: string;
      bottomType: string;
      waterType: string;
    };

    priceList: string[];
    priceListUrl: string | null;

    rules: string[];
    rulesUrl: string | null;

    contact: {
      name: string;
      phone: string;
      email: string;
      website: string;
    };

    fishRecords:
      LakeFishRecordDto[];

    gearRequirements: string[];

    openingHours:
      LakeOpeningHoursDto;

    catchRankings: {
      byWeight:
        CatchRankingItem[];
      byLength:
        CatchRankingItem[];
    };
  };
