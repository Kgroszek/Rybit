import type { LakeAmenityKey } from "@/lib/lakes";
import type { LakeExplorerSort } from "@/lib/lake-explorer-types";

export const LAKE_EXPLORER_PAGE_SIZE = 20;

export const OWNER_TYPE_OPTIONS = [
  { value: "all", label: "Wszystkie" },
  { value: "pzw", label: "PZW" },
  {
    value: "commercial",
    label: "Komercyjne",
  },
] as const;

export const FISHING_TYPE_OPTIONS = [
  { value: "all", label: "Wszystkie" },
  { value: "general", label: "Ogólne" },
  {
    value: "spinning",
    label: "Spinningowe",
  },
  { value: "carp", label: "Karpiowe" },
] as const;

export const LAKE_SORT_OPTIONS: Array<{
  value: LakeExplorerSort;
  label: string;
}> = [
  {
    value: "rating-desc",
    label: "Najwyższa ocena",
  },
  {
    value: "distance-asc",
    label: "Najbliżej mnie",
  },
  {
    value: "name-asc",
    label: "Nazwa A–Z",
  },
  {
    value: "name-desc",
    label: "Nazwa Z–A",
  },
];

export const AMENITY_OPTIONS: Array<{
  key: LakeAmenityKey;
  label: string;
}> = [
  { key: "noKill", label: "No Kill" },
  { key: "parking", label: "Parking" },
  { key: "cottages", label: "Domki" },
  { key: "tent", label: "Namiot" },
  { key: "pier", label: "Pomost" },
  { key: "toilet", label: "Toaleta" },
  {
    key: "sanitaryFacilities",
    label: "Sanitariaty",
  },
  { key: "shop", label: "Sklep" },
  {
    key: "nightFishing",
    label: "Wędkowanie nocne",
  },
  {
    key: "boatRental",
    label: "Wypożyczalnia łodzi",
  },
  {
    key: "camperCaravan",
    label: "Kamper / przyczepa",
  },
  {
    key: "electricityHookup",
    label: "Prąd",
  },
  {
    key: "gearRental",
    label: "Wypożyczalnia sprzętu",
  },
  { key: "campfire", label: "Ognisko" },
  { key: "shelter", label: "Altana" },
  {
    key: "coveredSpots",
    label: "Zadaszone stanowiska",
  },
  {
    key: "playground",
    label: "Plac zabaw",
  },
  {
    key: "cardPayment",
    label: "Płatność kartą",
  },
];

export const CARD_AMENITIES =
  AMENITY_OPTIONS.filter((item) =>
    [
      "noKill",
      "parking",
      "cottages",
      "pier",
      "toilet",
      "nightFishing",
      "boatRental",
    ].includes(item.key)
  );
