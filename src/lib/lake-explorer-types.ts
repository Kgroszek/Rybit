import type {
  LakeFilterOptions,
  LakeListDto,
} from "@/lib/lake-types";

export type LakeExplorerMode =
  | "public"
  | "authenticated";

export type LakeExplorerSort =
  | "rating-desc"
  | "distance-asc"
  | "name-asc"
  | "name-desc";

/**
 * Scope jest niewidocznym ograniczeniem źródła danych.
 * Obecnie służy m.in. kategorii /lowiska-z-noclegiem,
 * która nie jest prostym pojedynczym checkboxem.
 */
export type LakeExplorerScope =
  | "all"
  | "accommodation";

export type LakeExplorerBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type LakeExplorerFilters = {
  search: string;
  ownerType: string;
  fishingType: string;
  voivodeship: string;
  fish: string;
  amenities: string[];
  sort: LakeExplorerSort;
};

export type LakeExplorerQuery = {
  search?: string;
  ownerType?: string;
  fishingType?: string;
  voivodeship?: string;
  fish?: string;
  amenities?: string[];
  sort?:
    | LakeExplorerSort
    | string;
  page?: number;
  pageSize?: number;
  bounds?:
    | LakeExplorerBounds
    | null;
  userLat?: number | null;
  userLng?: number | null;
  scope?:
    | LakeExplorerScope
    | string;
};

export type LakeExplorerResult = {
  lakes: LakeListDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type LakeMapPointDto = {
  id: string;
  name: string;
  slug: string;
  rating: string;
  type:
    | "pzw"
    | "commercial";
  fishingType:
    | "general"
    | "spinning"
    | "carp";
  lat: number;
  lng: number;
  city: string;
  voivodeship: string;
  imageUrl: string | null;
};

export type LakeExplorerMapResult = {
  lakes: LakeMapPointDto[];
  totalCount: number;
};

export type LakeExplorerInitialData = {
  result: LakeExplorerResult;
  mapResult:
    LakeExplorerMapResult;
  filterOptions:
    LakeFilterOptions;
  filters:
    LakeExplorerFilters;
  bounds:
    LakeExplorerBounds;
  mobileView:
    | "list"
    | "map";
  scope?:
    LakeExplorerScope;
  favouriteLakeIds?: string[];
};
