import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
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
        <div className="mb-[38px] flex items-end justify-between gap-10 max-md:flex-col max-md:items-start">
          <div className="max-w-[700px]">
            <Eyebrow>
              {section.eyebrow || "Galeria"}
            </Eyebrow>

            <h2 className="mt-[14px] text-[clamp(34px,3.6vw,50px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#16211D]">
              {section.title ||
                "Zobacz łowisko przed przyjazdem."}
            </h2>
          </div>

          <p className="max-w-[430px] text-[15px] leading-7 text-[#66706B]">
            {section.subtitle ||
              "Zdjęcia najlepiej pokazują charakter miejsca i warunki nad wodą."}
          </p>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-[1.35fr_.65fr] gap-3 max-[1050px]:grid-cols-1">
            <div className="min-h-[530px] overflow-hidden rounded-[18px] bg-[#DCE1DC] max-[720px]:min-h-[340px]">
              <img
                src={images[0]}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(
                (imageIndex) =>
                  images[imageIndex] ? (
                    <div
                      key={imageIndex}
                      className="min-h-[250px] overflow-hidden rounded-2xl bg-[#DCE1DC] max-[720px]:min-h-[170px]"
                    >
                      <img
                        src={
                          images[
                            imageIndex
                          ]
                        }
                        alt=""
                        className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <div
                      key={imageIndex}
                      className="min-h-[250px] rounded-2xl bg-[#EEF1EB] max-[720px]:min-h-[170px]"
                    />
                  )
              )}
            </div>
          </div>
        ) : (
          <EmptyText>
            Dodaj zdjęcia łowiska, aby
            wyświetlić galerię.
          </EmptyText>
        )}
      </div>
    </section>
  );
}
