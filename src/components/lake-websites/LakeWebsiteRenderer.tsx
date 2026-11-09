import { LakeWebsiteSectionsPage } from "@/components/lake-websites/LakeWebsiteSectionsPage";
import { CarpLodgeLakeWebsite } from "@/components/lake-websites/templates/carp-lodge/CarpLodgeLakeWebsite";
import { FisheryClubLakeWebsite } from "@/components/lake-websites/templates/fishery-club/FisheryClubLakeWebsite";
import { WaterlineLakeWebsite } from "@/components/lake-websites/templates/waterline/WaterlineLakeWebsite";
import { WildWaterLakeWebsite } from "@/components/lake-websites/templates/wild-water/WildWaterLakeWebsite";
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

  if (template === "carp-lodge") {
    return (
      <CarpLodgeLakeWebsite
        data={data}
        editorMode={editorMode}
        selectedSectionId={selectedSectionId}
      />
    );
  }

  if (template === "wild-water") {
    return (
      <WildWaterLakeWebsite
        data={data}
        editorMode={editorMode}
        selectedSectionId={selectedSectionId}
      />
    );
  }

  if (template === "fishery-club") {
    return (
      <FisheryClubLakeWebsite
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
