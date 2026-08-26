import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";

export function getSiteName(data: PublicLakeWebsiteData) {
  return data.website.siteName || data.lake.name;
}

export function getSectionImage(
  section: LakeWebsiteSection,
  data: PublicLakeWebsiteData,
  fallbackIndex = 0
) {
  return (
    section.imageUrl ||
    data.lake.images[fallbackIndex]?.url ||
    data.lake.images[0]?.url ||
    ""
  );
}

export function getGalleryImages(
  section: LakeWebsiteSection,
  data: PublicLakeWebsiteData
) {
  const sectionImages =
    section.images?.filter(Boolean) ?? [];

  if (sectionImages.length > 0) {
    return sectionImages.slice(0, 5);
  }

  return data.lake.images
    .map((image) => image.url)
    .filter(Boolean)
    .slice(0, 5);
}

export function getFishItems(
  section: LakeWebsiteSection | undefined,
  data: PublicLakeWebsiteData
) {
  if (
    section?.dataSource === "custom" &&
    section.items?.length
  ) {
    return section.items.filter(Boolean);
  }

  if (data.lake.fishSpecies.length > 0) {
    return data.lake.fishSpecies
      .map((item) => item.name.trim())
      .filter(Boolean);
  }

  return data.lake.fish
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getListItems(
  section: LakeWebsiteSection,
  fallback: Array<{ id: string; text: string }>,
  prefix: string
) {
  if (section.dataSource === "custom") {
    return (section.items || [])
      .filter(Boolean)
      .map((text, index) => ({
        id: `${prefix}-${index}`,
        text,
      }));
  }

  return fallback;
}

export function getNavLabel(section: LakeWebsiteSection) {
  const fallback: Record<
    LakeWebsiteSection["type"],
    string
  > = {
    hero: "Start",
    about: "O łowisku",
    gallery: "Galeria",
    fish: "Ryby",
    priceList: "Cennik",
    rules: "Regulamin",
    contact: "Kontakt",
    cta: "Rezerwacja",
  };

  return fallback[section.type];
}

export function getAddress(data: PublicLakeWebsiteData) {
  return [
    data.lake.street,
    [data.lake.postalCode, data.lake.city]
      .filter(Boolean)
      .join(" "),
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ");
}

export function normalizeExternalUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://")
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getPrimaryContrast(color: string) {
  const hex = color.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return "#FFFFFF";
  }

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);

  const luminance =
    (0.2126 * red +
      0.7152 * green +
      0.0722 * blue) /
    255;

  return luminance > 0.64
    ? "#16211D"
    : "#FFFFFF";
}

export function resolveSectionHref(
  href: string | undefined,
  data: PublicLakeWebsiteData
) {
  if (!href) {
    return "";
  }

  if (href === "#kontakt") {
    const contactSection =
      data.website.sections.find(
        (section) =>
          section.type === "contact"
      );

    return contactSection
      ? `#${contactSection.id}`
      : href;
  }

  if (href === "#galeria") {
    const gallerySection =
      data.website.sections.find(
        (section) =>
          section.type === "gallery"
      );

    return gallerySection
      ? `#${gallerySection.id}`
      : href;
  }

  return href;
}


export function getContactPhone(
  data: PublicLakeWebsiteData
) {
  return (
    data.website.contactPhone ||
    data.lake.contactPhone ||
    ""
  ).trim();
}

export function getFishSummary(
  section: LakeWebsiteSection | undefined,
  data: PublicLakeWebsiteData,
  visibleCount = 3
) {
  const items = getFishItems(section, data);

  if (items.length === 0) {
    return "Zapytaj właściciela o aktualne zarybienie.";
  }

  const visible = items.slice(0, visibleCount);
  const rest = items.length - visible.length;

  return rest > 0
    ? `${visible.join(" · ")} +${rest}`
    : visible.join(" · ");
}
