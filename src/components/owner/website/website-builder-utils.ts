import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";
import type {
  LakeWebsiteSection,
  LakeWebsiteSectionType,
} from "@/lib/lake-website-sections";
import type { LakeWebsiteEditableSnapshot } from "@/components/owner/website/types";

export const WEBSITE_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif";

export const WEBSITE_IMAGE_MAX_BYTES =
  8 * 1024 * 1024;

export const WEBSITE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function snapshotSignature(
  value: LakeWebsiteEditableSnapshot
) {
  return JSON.stringify(value);
}

export function cloneSnapshot(
  value: LakeWebsiteEditableSnapshot
): LakeWebsiteEditableSnapshot {
  return JSON.parse(
    JSON.stringify(value)
  ) as LakeWebsiteEditableSnapshot;
}

export function buildPublicWebsiteUrl(
  subdomain: string,
  rootDomain: string
) {
  const cleanRoot = rootDomain
    .trim()
    .toLowerCase();

  if (
    cleanRoot === "localhost" ||
    cleanRoot.endsWith(".localhost")
  ) {
    return `http://${subdomain}.localhost:3000`;
  }

  return `https://${subdomain}.${cleanRoot}`;
}

export function isDataBackedSection(
  type: LakeWebsiteSectionType
) {
  return (
    type === "fish" ||
    type === "priceList" ||
    type === "rules"
  );
}

export function getRybioSectionItems(
  type: LakeWebsiteSectionType,
  lake: PublicLakeWebsiteData["lake"]
) {
  if (type === "fish") {
    if (lake.fishSpecies.length > 0) {
      return lake.fishSpecies.map(
        (item) => item.name
      );
    }

    return lake.fish
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (type === "priceList") {
    return lake.priceList.map(
      (item) => item.text
    );
  }

  if (type === "rules") {
    return lake.rules.map(
      (item) => item.text
    );
  }

  return [];
}

export function getSectionVariants(
  type: LakeWebsiteSectionType
): Array<[string, string]> {
  if (type === "hero") {
    return [
      ["cover", "Zdjęcie w tle"],
      ["split", "Tekst + zdjęcie"],
    ];
  }

  if (type === "about") {
    return [
      ["image-right", "Zdjęcie po prawej"],
      ["image-left", "Zdjęcie po lewej"],
      ["text", "Sam tekst"],
    ];
  }

  if (type === "gallery") {
    return [
      ["grid", "Mozaika"],
      ["wide", "Duże kafelki"],
    ];
  }

  if (type === "fish") {
    return [
      ["pills", "Etykiety"],
      ["list", "Lista"],
    ];
  }

  if (type === "cta") {
    return [
      ["solid", "Kolor"],
      ["image", "Zdjęcie w tle"],
    ];
  }

  return [["list", "Lista"]];
}

type SupportedField =
  | "eyebrow"
  | "title"
  | "subtitle"
  | "text"
  | "image"
  | "button";

export function sectionSupports(
  type: LakeWebsiteSectionType,
  field: SupportedField
) {
  const map: Record<
    LakeWebsiteSectionType,
    SupportedField[]
  > = {
    hero: [
      "eyebrow",
      "title",
      "subtitle",
      "image",
      "button",
    ],
    about: [
      "eyebrow",
      "title",
      "text",
      "image",
    ],
    gallery: [
      "eyebrow",
      "title",
      "subtitle",
    ],
    fish: [
      "eyebrow",
      "title",
      "subtitle",
    ],
    priceList: [
      "eyebrow",
      "title",
      "subtitle",
    ],
    rules: [
      "eyebrow",
      "title",
      "subtitle",
    ],
    contact: [
      "eyebrow",
      "title",
      "text",
    ],
    cta: [
      "eyebrow",
      "title",
      "text",
      "image",
      "button",
    ],
  };

  return map[type].includes(field);
}

export function moveArrayItem<T>(
  items: T[],
  from: number,
  to: number
) {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);

  return next;
}

export function normalizedSectionTitle(
  section: LakeWebsiteSection
) {
  return (
    section.title?.trim() ||
    section.eyebrow?.trim() ||
    section.variant
  );
}
