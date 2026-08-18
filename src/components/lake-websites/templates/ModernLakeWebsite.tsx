import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";
import { LakeWebsiteSectionsPage } from "@/components/lake-websites/LakeWebsiteSectionsPage";

export function ModernLakeWebsite({
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
      theme="waterline"
      editorMode={editorMode}
      selectedSectionId={selectedSectionId}
    />
  );
}
