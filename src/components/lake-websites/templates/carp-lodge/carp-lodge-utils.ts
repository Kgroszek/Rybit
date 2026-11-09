import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";

export function getCarpLodgeSiteName(
  data: PublicLakeWebsiteData
) {
  return data.website.siteName || data.lake.name;
}

export function getCarpLodgeFish(
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

export function getCarpLodgeList(
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

export function getCarpLodgeSectionImage(
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

export function getCarpLodgeImages(
  section: LakeWebsiteSection | undefined,
  data: PublicLakeWebsiteData
) {
  const custom =
    section?.images?.filter(Boolean) ?? [];

  if (custom.length > 0) {
    return custom;
  }

  return data.lake.images
    .map((image) => image.url)
    .filter(Boolean);
}

export function getCarpLodgePhone(
  data: PublicLakeWebsiteData
) {
  return (
    data.website.contactPhone ||
    data.lake.contactPhone ||
    ""
  ).trim();
}

export function getCarpLodgeEmail(
  data: PublicLakeWebsiteData
) {
  return (
    data.website.contactEmail ||
    data.lake.contactEmail ||
    ""
  ).trim();
}

export function getCarpLodgeWebsite(
  data: PublicLakeWebsiteData
) {
  return (
    data.website.contactWebsite ||
    data.lake.contactWebsite ||
    ""
  ).trim();
}

export function getCarpLodgeAddress(
  data: PublicLakeWebsiteData
) {
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

export function normalizeCarpLodgeUrl(
  value: string
) {
  const url = value.trim();

  if (!url) {
    return "";
  }

  if (
    url.startsWith("https://") ||
    url.startsWith("http://")
  ) {
    return url;
  }

  return `https://${url}`;
}

export function getCarpLodgeNavLabel(
  section: LakeWebsiteSection
) {
  const fallback: Record<
    LakeWebsiteSection["type"],
    string
  > = {
    hero: "Start",
    about: "Poznaj miejsce",
    gallery: "Galeria",
    fish: "Ryby",
    priceList: "Cennik",
    rules: "Zasady",
    contact: "Kontakt",
    cta: "Rezerwacja",
  };

  return fallback[section.type];
}

export function getCarpLodgeContrast(
  color: string
) {
  const normalized = color.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return "#FFFFFF";
  }

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);

  const luminance =
    (0.2126 * red +
      0.7152 * green +
      0.0722 * blue) /
    255;

  return luminance > 0.64
    ? "#211B18"
    : "#FFFFFF";
}

export function resolveCarpLodgeHref(
  href: string | undefined,
  data: PublicLakeWebsiteData
) {
  if (!href) {
    return "";
  }

  if (href === "#kontakt") {
    const section = data.website.sections.find(
      (item) => item.type === "contact"
    );

    return section ? `#${section.id}` : href;
  }

  if (href === "#galeria") {
    const section = data.website.sections.find(
      (item) => item.type === "gallery"
    );

    return section ? `#${section.id}` : href;
  }

  return href;
}
