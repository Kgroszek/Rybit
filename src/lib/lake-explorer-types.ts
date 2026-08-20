import type {
  LakeFilterOptions,
  LakeListDto,
} from "@/lib/lakes";

export type LakeExplorerMode =
  | "public"
  | "authenticated";

export type LakeExplorerSort =
  | "rating-desc"
  | "distance-asc"
  | "name-asc"
  | "name-desc";

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

export type LakeExplorerQuery = LakeExplorerFilters & {
  page?: number;
  pageSize?: number;
  bounds?: LakeExplorerBounds | null;
  userLat?: number | null;
  userLng?: number | null;
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
  type: "pzw" | "commercial";
  fishingType: "general" | "spinning" | "carp";
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
  mapResult: LakeExplorerMapResult;
  filterOptions: LakeFilterOptions;
  filters: LakeExplorerFilters;
  bounds: LakeExplorerBounds;
  mobileView: "list" | "map";
  favouriteLakeIds?: string[];
};
