import { LakeCommentsSection } from "@/components/lakes/LakeCommentsSection";
import { cn } from "@/lib/cn";
import { LakeDetailsActions } from "./LakeDetailsActions";
import { LakeDetailsContent } from "./LakeDetailsContent";
import { LakeDetailsHeader } from "./LakeDetailsHeader";
import { LakeDetailsSidebar } from "./LakeDetailsSidebar";
import { LakeGallery } from "./LakeGallery";
import { LakeNearbyLakes } from "./LakeNearbyLakes";
import { LakeSectionNav } from "./LakeSectionNav";
import type { LakeDetailsCommonProps } from "./types";

export function LakeDetailsView({
  lake,
  mode,
  recommendedLakes = [],
  isAdmin = false,
}: LakeDetailsCommonProps) {
  return (
    <div
      className={cn(
        "w-full",
        mode === "public" && "mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      )}
    >
      <LakeDetailsHeader lake={lake} mode={mode} isAdmin={isAdmin} />

      <LakeGallery lakeName={lake.name} images={lake.images} />

      <LakeDetailsActions lake={lake} mode={mode} isAdmin={isAdmin} />

      <LakeSectionNav />

      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-6">
        <LakeDetailsContent lake={lake} mode={mode} />
        <LakeDetailsSidebar lake={lake} mode={mode} />
      </div>

      <section id="komentarze" className="mt-6 scroll-mt-24">
        <LakeCommentsSection lakeSlug={lake.slug} lakeName={lake.name} />
      </section>

      <LakeNearbyLakes
        lakeCity={lake.address.city}
        lakes={recommendedLakes}
        mode={mode}
      />
    </div>
  );
}
