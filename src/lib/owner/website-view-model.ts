import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";
import type { InitialLakeWebsite } from "@/components/owner/website/types";
import {
  parseLakeWebsiteSections,
} from "@/lib/lake-website-sections";
import {
  normalizeLakeWebsiteSubdomain,
  resolveLakeWebsiteTemplateKey,
} from "@/lib/lake-websites";

type WebsiteLakeSource = {
  name: string;
  slug: string;
  description: string;
  city: string;
  street: string;
  postalCode: string;
  voivodeship: string;
  fish: string;
  contactPhone: string;
  contactEmail: string;
  contactWebsite: string;
  priceList: Array<{
    id: string;
    text: string;
  }>;
  rules: Array<{
    id: string;
    text: string;
  }>;
  fishSpecies: Array<{
    id: string;
    name: string;
  }>;
  images: Array<{
    id: string;
    url: string;
  }>;
  website:
    | {
        subdomain: string;
        templateKey: string;
        siteName: string | null;
        logoUrl: string | null;
        primaryColor: string;
        accentColor: string;
        backgroundColor: string;
        textColor: string;
        contactPhone: string | null;
        contactEmail: string | null;
        contactWebsite: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        status: string;
        sections: unknown;
      }
    | null;
};

export function buildOwnerWebsiteEditorData(
  lake: WebsiteLakeSource
): {
  initialWebsite: InitialLakeWebsite;
  lakeData: PublicLakeWebsiteData["lake"];
} {
  const website = lake.website;
  const imageUrls =
    lake.images.map((image) => image.url);

  const sections =
    parseLakeWebsiteSections(
      website?.sections,
      {
        lakeName: lake.name,
        description: lake.description,
        images: imageUrls,
      }
    );

  const hasWebsite = Boolean(website);

  return {
    initialWebsite: {
      subdomain:
        website?.subdomain ||
        normalizeLakeWebsiteSubdomain(
          lake.name
        ),
      templateKey:
        resolveLakeWebsiteTemplateKey(
          website?.templateKey
        ),
      siteName:
        website?.siteName || lake.name,
      logoUrl:
        website?.logoUrl || null,
      primaryColor:
        website?.primaryColor ||
        "#155EEF",
      accentColor:
        website?.accentColor ||
        "#6ED5D0",
      backgroundColor:
        website?.backgroundColor ||
        "#FFFFFF",
      textColor:
        website?.textColor ||
        "#0B1628",
      contactPhone: hasWebsite
        ? website?.contactPhone || null
        : cleanContact(
            lake.contactPhone
          ),
      contactEmail: hasWebsite
        ? website?.contactEmail || null
        : cleanContact(
            lake.contactEmail
          ),
      contactWebsite: hasWebsite
        ? website?.contactWebsite || null
        : cleanContact(
            lake.contactWebsite
          ),
      seoTitle:
        website?.seoTitle || null,
      seoDescription:
        website?.seoDescription || null,
      status:
        website?.status || "draft",
      sections,
    },
    lakeData: {
      name: lake.name,
      slug: lake.slug,
      description: lake.description,
      city: lake.city,
      street: lake.street,
      postalCode: lake.postalCode,
      voivodeship:
        lake.voivodeship,
      fish: lake.fish,
      contactPhone:
        lake.contactPhone,
      contactEmail:
        lake.contactEmail,
      contactWebsite:
        lake.contactWebsite,
      priceList: lake.priceList,
      rules: lake.rules,
      fishSpecies:
        lake.fishSpecies,
      images: lake.images,
    },
  };
}

export function buildSavedWebsitePreviewData(
  lake: WebsiteLakeSource
): PublicLakeWebsiteData {
  const {
    initialWebsite,
    lakeData,
  } =
    buildOwnerWebsiteEditorData(
      lake
    );

  return {
    website: {
      subdomain:
        initialWebsite.subdomain,
      templateKey:
        initialWebsite.templateKey,
      siteName:
        initialWebsite.siteName,
      logoUrl:
        initialWebsite.logoUrl,
      primaryColor:
        initialWebsite.primaryColor,
      accentColor:
        initialWebsite.accentColor,
      backgroundColor:
        initialWebsite.backgroundColor,
      textColor:
        initialWebsite.textColor,
      contactPhone:
        initialWebsite.contactPhone,
      contactEmail:
        initialWebsite.contactEmail,
      contactWebsite:
        initialWebsite.contactWebsite,
      sections:
        initialWebsite.sections,
    },
    lake: lakeData,
  };
}

function cleanContact(
  value: string | null
) {
  const clean = String(
    value || ""
  ).trim();

  const lower =
    clean.toLocaleLowerCase("pl-PL");

  if (
    !clean ||
    lower === "brak danych" ||
    lower === "brak"
  ) {
    return null;
  }

  return clean;
}
