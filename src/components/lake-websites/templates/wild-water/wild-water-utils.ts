import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";

export function getWildWaterSiteName(data: PublicLakeWebsiteData) {
  return data.website.siteName || data.lake.name;
}

export function getWildWaterPhone(data: PublicLakeWebsiteData) {
  return (
    data.website.contactPhone ||
    data.lake.contactPhone ||
    ""
  ).trim();
}

export function getWildWaterEmail(data: PublicLakeWebsiteData) {
  return (
    data.website.contactEmail ||
    data.lake.contactEmail ||
    ""
  ).trim();
}

export function getWildWaterWebsite(data: PublicLakeWebsiteData) {
  return (
    data.website.contactWebsite ||
    data.lake.contactWebsite ||
    ""
  ).trim();
}

export function getWildWaterAddress(data: PublicLakeWebsiteData) {
  return [
    data.lake.street,
    [data.lake.postalCode, data.lake.city]
      .filter(Boolean)
      .join(" "),
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

export function getWildWaterFish(
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

export function getWildWaterList(
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

export function getWildWaterSectionImage(
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

export function getWildWaterImages(
  section: LakeWebsiteSection | undefined,
  data: PublicLakeWebsiteData
) {
  const custom = section?.images?.filter(Boolean) ?? [];

  if (custom.length > 0) {
    return custom;
  }

  return data.lake.images
    .map((image) => image.url)
    .filter(Boolean);
}

export function getWildWaterNavLabel(section: LakeWebsiteSection) {
  const labels: Record<
    LakeWebsiteSection["type"],
    string
  > = {
    hero: "Start",
    about: "O miejscu",
    gallery: "Galeria",
    fish: "Ryby",
    priceList: "Cennik",
    rules: "Zasady",
    contact: "Kontakt",
    cta: "Rezerwacja",
  };

  return labels[section.type];
}

export function normalizeWildWaterUrl(value: string) {
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

export function resolveWildWaterHref(
  href: string | undefined,
  data: PublicLakeWebsiteData
) {
  if (!href) {
    return "";
  }

  if (href === "#kontakt") {
    const contact = data.website.sections.find(
      (section) => section.type === "contact"
    );

    return contact ? `#${contact.id}` : href;
  }

  if (href === "#galeria") {
    const gallery = data.website.sections.find(
      (section) => section.type === "gallery"
    );

    return gallery ? `#${gallery.id}` : href;
  }

  return href;
}
