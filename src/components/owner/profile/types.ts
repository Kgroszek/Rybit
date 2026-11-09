export const AMENITY_FIELDS = [
  { name: "cottages", label: "Domki" },
  { name: "campfire", label: "Ognisko" },
  { name: "noKill", label: "No Kill" },
  { name: "tent", label: "Namiot" },
  { name: "parking", label: "Parking" },
  { name: "pier", label: "Pomost" },
  { name: "toilet", label: "Toaleta" },
  { name: "shop", label: "Sklep" },
  {
    name: "nightFishing",
    label: "Wędkowanie nocne",
  },
  {
    name: "boatRental",
    label: "Wypożyczalnia łodzi",
  },
  {
    name: "gearRental",
    label: "Wypożyczalnia sprzętu",
  },
  { name: "shelter", label: "Altana" },
  {
    name: "coveredSpots",
    label: "Zadaszone stanowiska",
  },
  {
    name: "playground",
    label: "Plac zabaw",
  },
  {
    name: "cardPayment",
    label: "Płatność kartą",
  },
] as const;

export type AmenityName =
  (typeof AMENITY_FIELDS)[number]["name"];

export type OwnerLakeProfileFormData = {
  id: string;
  slug: string;
  name: string;
  description: string;
  fish: string;
  ownerType: string;
  fishingType: string;

  street: string;
  city: string;
  postalCode: string;
  voivodeship: string;
  lat: number;
  lng: number;

  area: string;
  averageDepth: string;
  bottomType: string;
  waterType: string;

  priceListText: string;
  priceListUrl: string;
  rulesText: string;
  rulesUrl: string;

  cottages: boolean;
  campfire: boolean;
  noKill: boolean;
  tent: boolean;
  parking: boolean;
  pier: boolean;
  toilet: boolean;
  shop: boolean;
  nightFishing: boolean;
  boatRental: boolean;
  gearRental: boolean;
  shelter: boolean;
  coveredSpots: boolean;
  playground: boolean;
  cardPayment: boolean;

  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactWebsite: string;

  imageCount: number;
  fishSpeciesCount: number;
  rating: number;
};

export type OwnerLakeImageDto = {
  id: string;
  url: string;
  sortOrder: number;
  createdAt: string;
};
