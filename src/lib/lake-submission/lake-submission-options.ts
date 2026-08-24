import type {
  LakeSubmissionFormState,
  LakeSubmissionStep,
  LakeSubmissionStepKey,
} from "@/lib/lake-submission/lake-submission-types";

export const LAKE_SUBMISSION_STEPS: LakeSubmissionStep[] =
  [
    {
      key: "basic",
      title:
        "Podstawowe informacje",
      shortTitle: "Dane",
      description:
        "Podaj nazwę, charakter łowiska, ryby i dostępne metody.",
    },
    {
      key: "location",
      title:
        "Adres i lokalizacja",
      shortTitle:
        "Lokalizacja",
      description:
        "Uzupełnij adres i dokładne położenie łowiska na mapie.",
    },
    {
      key: "details",
      title:
        "Informacje o łowisku",
      shortTitle:
        "Informacje",
      description:
        "Dodaj charakterystykę, godziny, rekordy, wymagania, cennik i regulamin.",
    },
    {
      key: "amenities",
      title: "Udogodnienia",
      shortTitle:
        "Udogodnienia",
      description:
        "Zaznacz elementy dostępne dla wędkarzy na miejscu.",
    },
    {
      key: "photos",
      title:
        "Zdjęcia łowiska",
      shortTitle: "Zdjęcia",
      description:
        "Dodaj fotografie, które ułatwią weryfikację i prezentację miejsca.",
    },
    {
      key: "contact",
      title:
        "Kontakt i wysłanie",
      shortTitle: "Kontakt",
      description:
        "Opcjonalnie podaj kontakt do łowiska i sprawdź zgłoszenie przed wysłaniem.",
    },
  ];

export const INITIAL_LAKE_SUBMISSION_FORM: LakeSubmissionFormState =
  {
    name: "",
    description: "",
    ownerType: "pzw",
    fishingType:
      "general",
    fishingMethods: [],
    fish: "",
    lat: "",
    lng: "",
    street: "",
    city: "",
    postalCode: "",
    voivodeship: "",
    area: "",
    averageDepth: "",
    bottomType: "",
    waterType: "",
    priceListText: "",
    priceListUrl: "",
    rulesText: "",
    rulesUrl: "",
    isOpenAllDay: false,
    openingHours: "",
    cottages: false,
    campfire: false,
    noKill: false,
    tent: false,
    parking: false,
    pier: false,
    toilet: false,
    sanitaryFacilities:
      false,
    shop: false,
    nightFishing: false,
    boatRental: false,
    camperCaravan: false,
    electricityHookup:
      false,
    gearRental: false,
    shelter: false,
    coveredSpots: false,
    playground: false,
    cardPayment: false,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    contactWebsite: "",
  };

export const VOIVODESHIPS =
  [
    "dolnośląskie",
    "kujawsko-pomorskie",
    "lubelskie",
    "lubuskie",
    "łódzkie",
    "małopolskie",
    "mazowieckie",
    "opolskie",
    "podkarpackie",
    "podlaskie",
    "pomorskie",
    "śląskie",
    "świętokrzyskie",
    "warmińsko-mazurskie",
    "wielkopolskie",
    "zachodniopomorskie",
  ] as const;

export const FISH_RECORD_OPTIONS =
  [
    "Karp",
    "Amur",
    "Szczupak",
    "Sandacz",
    "Sum",
    "Okoń",
    "Lin",
    "Leszcz",
    "Płoć",
    "Karaś",
    "Jesiotr",
    "Tołpyga",
    "Węgorz",
    "Jaź",
    "Kleń",
    "Wzdręga",
  ] as const;

export const AMENITY_OPTIONS: Array<{
  key: keyof Pick<
    LakeSubmissionFormState,
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
    | "cardPayment"
  >;
  label: string;
  description?: string;
}> = [
  {
    key: "parking",
    label: "Parking",
  },
  {
    key: "pier",
    label: "Pomost",
  },
  {
    key: "toilet",
    label: "Toalety",
  },
  {
    key:
      "sanitaryFacilities",
    label: "Sanitariaty",
  },
  {
    key: "cottages",
    label: "Domki",
  },
  {
    key: "tent",
    label: "Namiot",
  },
  {
    key: "camperCaravan",
    label:
      "Kamper / przyczepa",
  },
  {
    key:
      "electricityHookup",
    label:
      "Przyłącze z prądem",
  },
  {
    key: "nightFishing",
    label:
      "Wędkowanie nocne",
  },
  {
    key: "boatRental",
    label:
      "Wypożyczalnia łodzi",
  },
  {
    key: "gearRental",
    label:
      "Wypożyczalnia sprzętu",
  },
  {
    key: "shop",
    label: "Sklep",
  },
  {
    key: "campfire",
    label: "Ognisko",
  },
  {
    key: "shelter",
    label: "Altana",
  },
  {
    key: "coveredSpots",
    label:
      "Zadaszone stanowiska",
  },
  {
    key: "playground",
    label: "Plac zabaw",
  },
  {
    key: "cardPayment",
    label:
      "Płatność kartą",
  },
  {
    key: "noKill",
    label: "No Kill",
  },
];

export const STEP_FIELDS: Record<
  LakeSubmissionStepKey,
  Array<
    keyof LakeSubmissionFormState
  >
> = {
  basic: [
    "name",
    "fish",
    "description",
    "ownerType",
    "fishingType",
    "fishingMethods",
  ],
  location: [
    "street",
    "city",
    "postalCode",
    "voivodeship",
    "lat",
    "lng",
  ],
  details: [
    "area",
    "averageDepth",
    "bottomType",
    "waterType",
    "priceListText",
    "priceListUrl",
    "rulesText",
    "rulesUrl",
    "isOpenAllDay",
    "openingHours",
  ],
  amenities:
    AMENITY_OPTIONS.map(
      (item) => item.key
    ),
  photos: [],
  contact: [
    "contactName",
    "contactPhone",
    "contactEmail",
    "contactWebsite",
  ],
};
