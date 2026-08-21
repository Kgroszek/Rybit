export const GEAR_CATEGORIES = [
  { label: "Wędki", value: "rod" },
  {
    label: "Kołowrotki",
    value: "reel",
  },
  {
    label: "Żyłki i plecionki",
    value: "line",
  },
  {
    label: "Przynęty",
    value: "bait",
  },
  {
    label: "Haczyki i zestawy",
    value: "rigs",
  },
  {
    label: "Akcesoria",
    value: "accessories",
  },
  {
    label: "Odzież",
    value: "clothing",
  },
  {
    label: "Elektronika",
    value: "electronics",
  },
  {
    label: "Torby i pudełka",
    value: "bags",
  },
  { label: "Inne", value: "other" },
] as const;

export const GEAR_FISHING_METHODS = [
  {
    label: "Spinning",
    value: "spinning",
  },
  { label: "Feeder", value: "feeder" },
  {
    label: "Method feeder",
    value: "method_feeder",
  },
  {
    label: "Karpiówka",
    value: "carp",
  },
  {
    label: "Spławik",
    value: "float",
  },
  { label: "Muchówka", value: "fly" },
  {
    label: "Uniwersalne",
    value: "universal",
  },
] as const;

export const GEAR_CONDITIONS = [
  { label: "Nowy", value: "new" },
  {
    label: "Bardzo dobry",
    value: "very_good",
  },
  { label: "Dobry", value: "good" },
  {
    label: "Do sprawdzenia",
    value: "to_check",
  },
  {
    label: "Uszkodzony",
    value: "damaged",
  },
] as const;

export const GEAR_STATUSES = [
  {
    label: "Aktywny",
    value: "active",
  },
  {
    label: "Do sprawdzenia",
    value: "to_check",
  },
  {
    label: "W naprawie",
    value: "repair",
  },
  {
    label: "Nieużywany",
    value: "inactive",
  },
] as const;

export const GEAR_CATEGORY_VALUES =
  new Set<string>(
    GEAR_CATEGORIES.map(
      (item) => item.value
    )
  );

export const GEAR_METHOD_VALUES =
  new Set<string>(
    GEAR_FISHING_METHODS.map(
      (item) => item.value
    )
  );

export const GEAR_CONDITION_VALUES =
  new Set<string>(
    GEAR_CONDITIONS.map(
      (item) => item.value
    )
  );

export const GEAR_STATUS_VALUES =
  new Set<string>(
    GEAR_STATUSES.map(
      (item) => item.value
    )
  );

export function getGearCategoryLabel(
  value: string
) {
  return (
    GEAR_CATEGORIES.find(
      (item) => item.value === value
    )?.label || value
  );
}

export function getGearMethodLabel(
  value: string
) {
  return (
    GEAR_FISHING_METHODS.find(
      (item) => item.value === value
    )?.label || value
  );
}

export function getGearConditionLabel(
  value: string
) {
  return (
    GEAR_CONDITIONS.find(
      (item) => item.value === value
    )?.label || value
  );
}

export function getGearStatusLabel(
  value: string
) {
  return (
    GEAR_STATUSES.find(
      (item) => item.value === value
    )?.label || value
  );
}
