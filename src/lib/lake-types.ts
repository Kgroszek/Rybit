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

export type LakeAmenitiesDto = Record<LakeAmenityKey, boolean>;

export type LakeListSort =
  | "rating-desc"
  | "name-asc"
  | "name-desc"
  | "distance-asc";

/**
 * Typ kompatybilności dla starszych komponentów.
 * Nie uruchamia starego systemu pobierania danych.
 */
export type LakeListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  ownerType?: string;
  fishingType?: string;
  voivodeship?: string;
  fish?: string;
  amenities?: string[];
  accommodation?: boolean;
  sort?: string;
  userLat?: number | null;
  userLng?: number | null;
};

export type LakeListDto = {
  id: string;
  name: string;
  slug: string;
  rating: string;
  fish: string;
  fishSpecies: string[];
  type: "pzw" | "commercial";
  fishingType: "general" | "spinning" | "carp";
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
   * Pola kompatybilności ze starszymi widokami.
   * Nowy explorer nie potrzebuje ich na liście.
   */
  distance?: string;
  description?: string;
};

export type LakeFilterOptions = {
  voivodeships: string[];
  fishOptions: string[];
  allLakesCount: number;
};

export type PaginatedLakesResult = {
  lakes: LakeListDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
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

export type LakeDto = LakeListDto & {
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
  fishRecords: LakeFishRecordDto[];
  gearRequirements: string[];
  openingHours: LakeOpeningHoursDto;
  catchRankings: {
    byWeight: CatchRankingItem[];
    byLength: CatchRankingItem[];
  };
};
