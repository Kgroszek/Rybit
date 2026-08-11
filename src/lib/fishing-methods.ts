export const FISHING_METHOD_OPTIONS = [
  { value: "float", label: "Spławik", icon: "🎣" },
  { value: "ground", label: "Grunt", icon: "⚓" },
  { value: "feeder", label: "Feeder", icon: "🎯" },
  { value: "method_feeder", label: "Method feeder", icon: "🟢" },
  { value: "carp", label: "Karpiówka", icon: "🐟" },
  { value: "spinning", label: "Spinning", icon: "🌀" },
  { value: "fly", label: "Muchówka", icon: "🪶" },
] as const;

export type FishingMethod = (typeof FISHING_METHOD_OPTIONS)[number]["value"];

const FISHING_METHOD_VALUES = new Set<string>(
  FISHING_METHOD_OPTIONS.map((option) => option.value)
);

export function normalizeFishingMethods(value: unknown): FishingMethod[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  return Array.from(
    new Set(
      values
        .map((item) => String(item).trim())
        .filter((item): item is FishingMethod =>
          FISHING_METHOD_VALUES.has(item)
        )
    )
  );
}

export function getFishingMethodLabel(value: FishingMethod) {
  return (
    FISHING_METHOD_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}
