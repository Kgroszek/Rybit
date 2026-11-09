import type { LakeAmenitiesDto } from "@/lib/lakes";

export type LakeAmenityKey = keyof LakeAmenitiesDto;

export const LAKE_AMENITIES: Array<{
  key: LakeAmenityKey;
  label: string;
}> = [
  { key: "noKill", label: "No Kill" },
  { key: "parking", label: "Parking" },
  { key: "cottages", label: "Domki" },
  { key: "nightFishing", label: "Wędkowanie nocne" },
  { key: "pier", label: "Pomost" },
  { key: "toilet", label: "Toalety" },
  { key: "sanitaryFacilities", label: "Sanitariaty" },
  { key: "tent", label: "Namiot" },
  { key: "camperCaravan", label: "Kamper / przyczepa" },
  { key: "electricityHookup", label: "Przyłącze prądu" },
  { key: "campfire", label: "Ognisko" },
  { key: "boatRental", label: "Wypożyczalnia łodzi" },
  { key: "gearRental", label: "Wypożyczalnia sprzętu" },
  { key: "shop", label: "Sklep / punkt sprzedaży" },
  { key: "shelter", label: "Altana" },
  { key: "coveredSpots", label: "Zadaszone stanowiska" },
  { key: "playground", label: "Plac zabaw" },
  { key: "cardPayment", label: "Płatność kartą" },
];

export const LAKE_SECTION_LINKS = [
  { href: "#informacje", label: "Informacje" },
  { href: "#ryby", label: "Ryby" },
  { href: "#cennik", label: "Cennik" },
  { href: "#zasady", label: "Zasady" },
  { href: "#ranking", label: "Ranking" },
  { href: "#komentarze", label: "Komentarze" },
] as const;
