import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import {
  EmptyText,
  Eyebrow,
} from "@/components/lake-websites/templates/waterline/WaterlineUI";
import { getListItems } from "@/components/lake-websites/templates/waterline/waterline-utils";

export function RulesSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const items = getListItems(
    section,
    data.lake.rules,
    "waterline-rule"
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
              {section.eyebrow ||
                "Regulamin"}
            </Eyebrow>

            <h2 className="mt-[14px] text-[clamp(34px,3.6vw,50px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#16211D]">
              {section.title ||
                "Najważniejsze zasady nad wodą."}
            </h2>
          </div>

          <p className="max-w-[430px] text-[15px] leading-7 text-[#66706B]">
            {section.subtitle ||
              "Przed przyjazdem warto zapoznać się z zasadami obowiązującymi na łowisku."}
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 border-t border-[#16211D]/10 max-[720px]:grid-cols-1">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[46px_1fr] gap-4 border-b border-[#16211D]/10 py-6 odd:border-r odd:pr-[30px] even:pl-[30px] max-[720px]:border-r-0 max-[720px]:px-0"
              >
                <span className="pt-1 text-[10px] font-black text-[var(--waterline-primary)]">
                  {String(
                    index + 1
                  ).padStart(2, "0")}
                </span>
                <p className="m-0 text-[14px] leading-[1.7] text-[#53615A]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyText>
            Szczegółowe zasady dostępne są u
            właściciela łowiska.
          </EmptyText>
        )}
      </div>
    </section>
  );
}
