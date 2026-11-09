import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import { WaterlineGalleryViewer } from "@/components/lake-websites/templates/waterline/WaterlineGalleryViewer";
import {
  EmptyText,
  Eyebrow,
} from "@/components/lake-websites/templates/waterline/WaterlineUI";
import { getGalleryImages } from "@/components/lake-websites/templates/waterline/waterline-utils";

export function GallerySection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const images = getGalleryImages(
    section,
    data
  );

  return (
    <section
      id={section.id}
      className="bg-white py-24 max-[720px]:py-[70px]"
    >
      <div className="mx-auto w-[min(1260px,calc(100%-40px))] max-[720px]:w-[calc(100%-28px)]">
        <div className="mb-9 grid gap-5 md:grid-cols-[1fr_360px] md:items-end">
          <div>
            <Eyebrow>
              {section.eyebrow ||
                "Nad wodą"}
            </Eyebrow>

            <h2 className="mt-[14px] text-[clamp(34px,3.6vw,50px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#16211D]">
              {section.title ||
                "Galeria"}
            </h2>
          </div>

          <p className="text-[15px] leading-7 text-[#66706B] md:text-right">
            {section.subtitle ||
              "Zobacz nasze łowisko. Kliknij zdjęcie, aby otworzyć pełny kadr."}
          </p>
        </div>

        {images.length > 0 ? (
          <WaterlineGalleryViewer
            images={images}
          />
        ) : (
          <EmptyText>
            Zdjęcia łowiska pojawią się
            tutaj po ich dodaniu.
          </EmptyText>
        )}
      </div>
    </section>
  );
}
