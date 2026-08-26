import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import { Eyebrow } from "@/components/lake-websites/templates/waterline/WaterlineUI";
import {
  getFishItems,
  getSectionImage,
} from "@/components/lake-websites/templates/waterline/waterline-utils";

export function AboutSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const image = getSectionImage(
    section,
    data,
    1
  );

  const fishSection =
    data.website.sections.find(
      (item) => item.type === "fish"
    );

  const fishCount =
    getFishItems(fishSection, data).length;

  return (
    <section
      id={section.id}
      className="bg-white py-24 max-[720px]:py-[70px]"
    >
      <div className="mx-auto grid w-[min(1260px,calc(100%-40px))] grid-cols-[1.08fr_.92fr] items-center gap-[72px] max-[1050px]:grid-cols-1 max-[720px]:w-[calc(100%-28px)]">
        <div>
          <Eyebrow>
            {section.eyebrow || "O miejscu"}
          </Eyebrow>

          <h2 className="mt-[14px] text-[clamp(34px,3.6vw,50px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#16211D]">
            {section.title ||
              "Poznaj nasze łowisko"}
          </h2>

          <p className="mt-[18px] max-w-[680px] whitespace-pre-line text-[17px] leading-[1.8] text-[#66706B] max-[720px]:text-[15px]">
            {section.text ||
              data.lake.description ||
              "Opis łowiska można uzupełnić w edytorze strony."}
          </p>

          <div className="mt-[30px] grid grid-cols-3 gap-5 border-t border-[#DFE4DE] pt-6 max-[720px]:grid-cols-2">
            <AboutStat
              value={
                fishCount > 0
                  ? String(fishCount)
                  : "—"
              }
              label="gatunków"
            />
            <AboutStat
              value={
                data.lake.images.length > 0
                  ? String(
                      data.lake.images.length
                    )
                  : "—"
              }
              label="zdjęć"
            />
            <AboutStat
              value={
                data.lake.rules.length > 0
                  ? String(
                      data.lake.rules.length
                    )
                  : "—"
              }
              label="zasad"
            />
          </div>
        </div>

        <div className="aspect-[4/3] overflow-hidden rounded-[20px] bg-[#D7DDD7]">
          {image ? (
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function AboutStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <strong className="block text-[26px] font-extrabold tracking-[-0.04em] text-[#16211D]">
        {value}
      </strong>
      <span className="text-[12px] text-[#66706B]">
        {label}
      </span>
    </div>
  );
}
