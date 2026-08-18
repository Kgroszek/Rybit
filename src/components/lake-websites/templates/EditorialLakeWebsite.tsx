import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";
import { LakeWebsiteSectionsPage } from "@/components/lake-websites/LakeWebsiteSectionsPage";

export function EditorialLakeWebsite({
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
      theme="fishery-club"
      editorMode={editorMode}
      selectedSectionId={selectedSectionId}
    />
  );
}
