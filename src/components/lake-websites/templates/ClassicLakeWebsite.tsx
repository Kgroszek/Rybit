import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";
import { LakeWebsiteSectionsPage } from "@/components/lake-websites/LakeWebsiteSectionsPage";

export function ClassicLakeWebsite({
  data,
  editorMode = false,
  selectedSectionId = null,
}: {
  data: PublicLakeWebsiteData;
  editorMode?: boolean;
  selectedSectionId?: string | null;
}) {
  return (
    <LakeWebsiteSectionsPage
      data={data}
      theme="wild-water"
      editorMode={editorMode}
      selectedSectionId={selectedSectionId}
    />
  );
}
