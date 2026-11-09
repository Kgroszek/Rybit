export const FISHING_METHOD_OPTIONS = [
  { value: "float", label: "Spławik", icon: "🎣" },
  { value: "ground", label: "Grunt", icon: "⚓" },
  {
    value: "method_feeder",
    label: "Method feeder",
    icon: "🟢",
  },
  { value: "carp", label: "Karpiówka", icon: "🐟" },
  { value: "spinning", label: "Spinning", icon: "🌀" },
  { value: "fly", label: "Muchówka", icon: "🪶" },
] as const;

export type FishingMethod =
  (typeof FISHING_METHOD_OPTIONS)[number]["value"];

const FISHING_METHOD_VALUES =
  new Set<string>(
    FISHING_METHOD_OPTIONS.map(
      (option) => option.value
    )
  );

/**
 * Historyczna wartość `feeder` była wcześniej osobną metodą.
 * W aktualnym modelu produktowym zwykły feeder traktujemy jako grunt,
 * a Method feeder pozostaje osobną metodą.
 */
export function normalizeFishingMethod(
  value: unknown
): FishingMethod | null {
  const normalized =
    String(value ?? "")
      .trim()
      .toLocaleLowerCase(
        "pl-PL"
      );

  if (normalized === "feeder") {
    return "ground";
  }

  return FISHING_METHOD_VALUES.has(
    normalized
  )
    ? (normalized as FishingMethod)
    : null;
}

export function normalizeFishingMethods(
  value: unknown
): FishingMethod[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  const normalized =
    values
      .map(
        normalizeFishingMethod
      )
      .filter(
        (
          method
        ): method is FishingMethod =>
          method !== null
      );

  return Array.from(
    new Set(normalized)
  );
}

export function getFishingMethodLabel(
  value: string
) {
  const normalized =
    normalizeFishingMethod(
      value
    );

  if (!normalized) {
    return value;
  }

  return (
    FISHING_METHOD_OPTIONS.find(
      (option) =>
        option.value ===
        normalized
    )?.label ?? value
  );
}
