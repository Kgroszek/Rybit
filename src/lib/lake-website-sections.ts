export const LAKE_WEBSITE_SECTION_TYPES = [
  "hero",
  "about",
  "gallery",
  "fish",
  "priceList",
  "rules",
  "contact",
  "cta",
] as const;

export type LakeWebsiteSectionType =
  (typeof LAKE_WEBSITE_SECTION_TYPES)[number];

export type LakeWebsiteSectionDataSource = "rybio" | "custom";

export type LakeWebsiteSection = {
  id: string;
  type: LakeWebsiteSectionType;
  variant: string;

  /**
   * Dla sekcji Ryby / Cennik / Regulamin:
   * - "rybio" = dane pobierane na żywo z profilu łowiska,
   * - "custom" = własna, niezależna lista zapisana w builderze.
   */
  dataSource?: LakeWebsiteSectionDataSource;
  items?: string[];

  eyebrow?: string;
  title?: string;
  subtitle?: string;
  text?: string;

  imageUrl?: string;
  images?: string[];

  buttonLabel?: string;
  buttonHref?: string;
};

export const LAKE_WEBSITE_SECTION_LIBRARY: Array<{
  type: LakeWebsiteSectionType;
  label: string;
  description: string;
}> = [
  {
    type: "hero",
    label: "Hero",
    description: "Duży nagłówek, zdjęcie i przycisk.",
  },
  {
    type: "about",
    label: "O łowisku",
    description: "Opis miejsca z opcjonalnym zdjęciem.",
  },
  {
    type: "gallery",
    label: "Galeria",
    description: "Sekcja ze zdjęciami łowiska.",
  },
  {
    type: "fish",
    label: "Ryby",
    description: "Gatunki występujące w łowisku.",
  },
  {
    type: "priceList",
    label: "Cennik",
    description: "Cennik pobierany z danych łowiska.",
  },
  {
    type: "rules",
    label: "Regulamin",
    description: "Najważniejsze zasady łowiska.",
  },
  {
    type: "contact",
    label: "Kontakt",
    description: "Adres i dane kontaktowe.",
  },
  {
    type: "cta",
    label: "CTA",
    description: "Sekcja z mocnym wezwaniem do działania.",
  },
];

export type LakeWebsiteSectionDefaults = {
  lakeName: string;
  description: string;
  images: string[];
};

export function createLakeWebsiteSection(
  type: LakeWebsiteSectionType,
  defaults: LakeWebsiteSectionDefaults,
  id = createSectionId(type)
): LakeWebsiteSection {
  const firstImage = defaults.images[0] || "";

  if (type === "hero") {
    return {
      id,
      type,
      variant: "cover",
      eyebrow: "Łowisko wędkarskie",
      title: defaults.lakeName,
      subtitle: "Wyjątkowe miejsce nad wodą.",
      imageUrl: firstImage,
      buttonLabel: "Kontakt",
      buttonHref: "#kontakt",
    };
  }

  if (type === "about") {
    return {
      id,
      type,
      variant: "image-right",
      eyebrow: "Poznaj miejsce",
      title: "O łowisku",
      text: defaults.description,
      imageUrl: defaults.images[1] || firstImage,
    };
  }

  if (type === "gallery") {
    return {
      id,
      type,
      variant: "grid",
      eyebrow: "Nad wodą",
      title: "Galeria",
      subtitle: "Zobacz nasze łowisko.",
      images: defaults.images.slice(0, 12),
    };
  }

  if (type === "fish") {
    return {
      id,
      type,
      variant: "pills",
      dataSource: "rybio",
      eyebrow: "Co pływa w wodzie?",
      title: "Ryby",
      subtitle: "Gatunki występujące w naszym łowisku.",
    };
  }

  if (type === "priceList") {
    return {
      id,
      type,
      variant: "list",
      dataSource: "rybio",
      eyebrow: "Opłaty",
      title: "Cennik",
      subtitle: "Aktualne opłaty za wędkowanie.",
    };
  }

  if (type === "rules") {
    return {
      id,
      type,
      variant: "list",
      dataSource: "rybio",
      eyebrow: "Zasady",
      title: "Regulamin",
      subtitle: "Najważniejsze zasady obowiązujące nad wodą.",
    };
  }

  if (type === "contact") {
    return {
      id,
      type,
      variant: "cards",
      eyebrow: "Kontakt",
      title: "Do zobaczenia nad wodą",
      text: "Masz pytania? Skontaktuj się z nami.",
    };
  }

  return {
    id,
    type: "cta",
    variant: "solid",
    eyebrow: "Zaplanuj wizytę",
    title: "Gotowy na kolejną wyprawę?",
    text: "Skontaktuj się z nami i zaplanuj pobyt nad wodą.",
    imageUrl: firstImage,
    buttonLabel: "Skontaktuj się",
    buttonHref: "#kontakt",
  };
}

export function getDefaultLakeWebsiteSections(
  defaults: LakeWebsiteSectionDefaults
): LakeWebsiteSection[] {
  return [
    createLakeWebsiteSection("hero", defaults, "hero-default"),
    createLakeWebsiteSection("about", defaults, "about-default"),
    createLakeWebsiteSection("fish", defaults, "fish-default"),
    createLakeWebsiteSection("gallery", defaults, "gallery-default"),
    createLakeWebsiteSection("priceList", defaults, "price-default"),
    createLakeWebsiteSection("rules", defaults, "rules-default"),
    createLakeWebsiteSection("contact", defaults, "contact-default"),
  ];
}

export function parseLakeWebsiteSections(
  value: unknown,
  defaults: LakeWebsiteSectionDefaults
): LakeWebsiteSection[] {
  if (!Array.isArray(value) || value.length === 0) {
    return getDefaultLakeWebsiteSections(defaults);
  }

  const sections = value
    .map((item, index) => normalizeSection(item, index))
    .filter((item): item is LakeWebsiteSection => Boolean(item))
    .slice(0, 30);

  return sections.length > 0
    ? sections
    : getDefaultLakeWebsiteSections(defaults);
}

export function normalizeLakeWebsiteSections(
  value: unknown
): LakeWebsiteSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => normalizeSection(item, index))
    .filter((item): item is LakeWebsiteSection => Boolean(item))
    .slice(0, 30);
}

export function getLakeWebsiteSectionLabel(
  type: LakeWebsiteSectionType
) {
  return (
    LAKE_WEBSITE_SECTION_LIBRARY.find((item) => item.type === type)
      ?.label || type
  );
}

function normalizeSection(
  value: unknown,
  index: number
): LakeWebsiteSection | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Record<string, unknown>;
  const type = source.type;

  if (
    typeof type !== "string" ||
    !LAKE_WEBSITE_SECTION_TYPES.includes(
      type as LakeWebsiteSectionType
    )
  ) {
    return null;
  }

  const typedType = type as LakeWebsiteSectionType;

  return {
    id:
      cleanText(source.id, 90) ||
      `${typedType}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    type: typedType,
    variant: cleanText(source.variant, 50) || getDefaultVariant(typedType),
    dataSource:
      source.dataSource === "custom" ? "custom" : "rybio",
    items: Array.isArray(source.items)
      ? source.items
          .map((item) => cleanText(item, 1000))
          .filter(Boolean)
          .slice(0, 100)
      : undefined,
    eyebrow: cleanText(source.eyebrow, 120) || undefined,
    title: cleanText(source.title, 220) || undefined,
    subtitle: cleanText(source.subtitle, 600) || undefined,
    text: cleanText(source.text, 10000) || undefined,
    imageUrl: cleanImageUrl(source.imageUrl) || undefined,
    images: Array.isArray(source.images)
      ? source.images
          .map((item) => cleanImageUrl(item))
          .filter((item): item is string => Boolean(item))
          .slice(0, 20)
      : undefined,
    buttonLabel: cleanText(source.buttonLabel, 100) || undefined,
    buttonHref: cleanHref(source.buttonHref) || undefined,
  };
}

function getDefaultVariant(type: LakeWebsiteSectionType) {
  if (type === "hero") return "cover";
  if (type === "about") return "image-right";
  if (type === "gallery") return "grid";
  if (type === "fish") return "pills";
  if (type === "contact") return "cards";
  if (type === "cta") return "solid";
  return "list";
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function cleanImageUrl(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const url = value.trim();

  if (
    url.startsWith("https://") ||
    url.startsWith("http://") ||
    url.startsWith("/")
  ) {
    return url.slice(0, 1400);
  }

  return "";
}

function cleanHref(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const href = value.trim();

  if (
    href.startsWith("#") ||
    href.startsWith("/") ||
    href.startsWith("https://") ||
    href.startsWith("http://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return href.slice(0, 1400);
  }

  return "";
}

function createSectionId(type: LakeWebsiteSectionType) {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    "randomUUID" in globalThis.crypto
  ) {
    return `${type}-${globalThis.crypto.randomUUID()}`;
  }

  return `${type}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}
