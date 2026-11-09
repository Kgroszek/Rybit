import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";

export type WebsiteBuilderMode =
  | "sections"
  | "design"
  | "settings";

export type WebsiteBuilderDevice =
  | "desktop"
  | "mobile";

export type WebsiteSaveAction =
  | "draft"
  | "publish"
  | "published"
  | "unpublish";

export type WebsiteBuilderMessage = {
  tone: "success" | "error" | "info";
  text: string;
};

export type InitialLakeWebsite = {
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
  sections: LakeWebsiteSection[];
};

export type LakeWebsiteBuilderProps = {
  lakeSlug: string;
  lakeName: string;
  rootDomain: string;
  initialWebsite: InitialLakeWebsite;
  lake: PublicLakeWebsiteData["lake"];
};

export type LakeWebsiteEditableSnapshot = {
  subdomain: string;
  templateKey: string;
  siteName: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  contactPhone: string;
  contactEmail: string;
  contactWebsite: string;
  seoTitle: string;
  seoDescription: string;
  status: "draft" | "published";
  sections: LakeWebsiteSection[];
};
