import { LakeWebsiteSectionsPage } from "@/components/lake-websites/LakeWebsiteSectionsPage";
import { WaterlineLakeWebsite } from "@/components/lake-websites/templates/waterline/WaterlineLakeWebsite";
import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import { resolveLakeWebsiteTemplateKey } from "@/lib/lake-websites";

export type { PublicLakeWebsiteData } from "@/components/lake-websites/types";

export function LakeWebsiteRenderer({
  data,
  editorMode = false,
  selectedSectionId = null,
}: {
  data: PublicLakeWebsiteData;
  editorMode?: boolean;
  selectedSectionId?: string | null;
}) {
  const template = resolveLakeWebsiteTemplateKey(
    data.website.templateKey
  );

  if (template === "waterline") {
    return (
      <WaterlineLakeWebsite
        data={data}
        editorMode={editorMode}
        selectedSectionId={selectedSectionId}
      />
    );
  }

  return (
    <LakeWebsiteSectionsPage
      data={data}
      theme={template}
      editorMode={editorMode}
      selectedSectionId={selectedSectionId}
    />
  );
}
