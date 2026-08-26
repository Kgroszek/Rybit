import type { LakeWebsiteSection } from "@/lib/lake-website-sections";

export type PublicLakeWebsiteData = {
  website: {
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
    sections: LakeWebsiteSection[];
  };
  lake: {
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
    priceList: Array<{ id: string; text: string }>;
    rules: Array<{ id: string; text: string }>;
    fishSpecies: Array<{ id: string; name: string }>;
    images: Array<{ id: string; url: string }>;
  };
};
