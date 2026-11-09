import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import {
  EmptyText,
  Eyebrow,
} from "@/components/lake-websites/templates/waterline/WaterlineUI";
import { getListItems } from "@/components/lake-websites/templates/waterline/waterline-utils";

export function PriceSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const items = getListItems(
    section,
    data.lake.priceList,
    "waterline-price"
  );

  return (
    <section
      id={section.id}
      className="bg-[#EEF1EB] py-24 max-[720px]:py-[70px]"
    >
      <div className="mx-auto grid w-[min(1260px,calc(100%-40px))] grid-cols-[.72fr_1.28fr] gap-14 max-[1050px]:grid-cols-1 max-[720px]:w-[calc(100%-28px)]">
        <div>
          <Eyebrow>
            {section.eyebrow || "Cennik"}
          </Eyebrow>

          <h2 className="mt-[14px] text-[clamp(34px,3.6vw,50px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#16211D]">
            {section.title ||
              "Proste zasady. Jasne opłaty."}
          </h2>

          <p className="mt-[18px] max-w-[430px] text-[15px] leading-7 text-[#66706B]">
            {section.subtitle ||
              "Aktualne opłaty związane z pobytem i wędkowaniem."}
          </p>
        </div>

        <div className="border-t border-[#DFE4DE]">
          {items.length > 0 ? (
            items.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[52px_1fr] gap-[18px] border-b border-[#DFE4DE] py-[22px]"
              >
                <span className="pt-1 text-[10px] font-black text-[var(--waterline-primary)]">
                  {String(
                    index + 1
                  ).padStart(2, "0")}
                </span>
                <strong className="text-[15px] font-bold leading-[1.6] text-[#16211D]">
                  {item.text}
                </strong>
              </div>
            ))
          ) : (
            <EmptyText>
              Aktualny cennik dostępny jest u
              właściciela łowiska.
            </EmptyText>
          )}
        </div>
      </div>
    </section>
  );
}
