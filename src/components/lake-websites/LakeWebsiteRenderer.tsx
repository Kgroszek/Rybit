import { LakeWebsiteSectionsPage } from "@/components/lake-websites/LakeWebsiteSectionsPage";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import { resolveLakeWebsiteTemplateKey } from "@/lib/lake-websites";

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

export function LakeWebsiteRenderer({
  data,
  editorMode = false,
  selectedSectionId = null,
}: {
  data: PublicLakeWebsiteData;
  editorMode?: boolean;
  selectedSectionId?: string | null;
}) {
  const theme = resolveLakeWebsiteTemplateKey(
    data.website.templateKey
  );

  return (
    <LakeWebsiteSectionsPage
      data={data}
      theme={theme}
      editorMode={editorMode}
      selectedSectionId={selectedSectionId}
    />
  );
}
