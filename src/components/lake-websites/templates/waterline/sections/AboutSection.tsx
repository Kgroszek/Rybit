import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import { Eyebrow } from "@/components/lake-websites/templates/waterline/WaterlineUI";
import {
  getContactPhone,
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

  const phone = getContactPhone(data);

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

          <div className="mt-[30px] grid gap-x-8 gap-y-5 border-t border-[#DFE4DE] pt-6 sm:grid-cols-3">
            <AboutMeta
              label="Miejscowość"
              value={data.lake.city || "—"}
            />
            <AboutMeta
              label="Województwo"
              value={data.lake.voivodeship || "—"}
            />
            <AboutMeta
              label="Telefon"
              value={phone || "—"}
            />
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-[20px] bg-[#D7DDD7] max-[720px]:min-h-[320px]">
          {image ? (
            <img
              src={image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function AboutMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-extrabold uppercase tracking-[.1em] text-[#8A928E]">
        {label}
      </p>
      <p className="mt-1.5 break-words text-[14px] font-extrabold text-[#16211D]">
        {value}
      </p>
    </div>
  );
}
