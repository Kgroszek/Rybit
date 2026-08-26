import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import {
  EmptyText,
  Eyebrow,
} from "@/components/lake-websites/templates/waterline/WaterlineUI";
import { getFishItems } from "@/components/lake-websites/templates/waterline/waterline-utils";

export function FishSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const items = getFishItems(
    section,
    data
  );

  return (
    <section
      id={section.id}
      className="bg-[#17211E] py-24 text-white max-[720px]:py-[70px]"
    >
      <div className="mx-auto grid w-[min(1260px,calc(100%-40px))] grid-cols-[.72fr_1.28fr] gap-[54px] max-[1050px]:grid-cols-1 max-[720px]:w-[calc(100%-28px)]">
        <div>
          <Eyebrow inverse>
            {section.eyebrow || "Ryby"}
          </Eyebrow>

          <h2 className="mt-[14px] text-[clamp(34px,3.6vw,50px)] font-extrabold leading-[1.02] tracking-[-0.04em]">
            {section.title ||
              "Gatunki występujące w łowisku."}
          </h2>

          <p className="mt-[18px] max-w-md text-[15px] leading-7 text-white/55">
            {section.subtitle ||
              "Lista ryb pobierana bezpośrednio z danych łowiska albo ustawień tej strony."}
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 border-t border-white/15 max-[720px]:grid-cols-1">
            {items.slice(0, 16).map(
              (item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex min-h-[82px] items-center justify-between gap-4 border-b border-white/10 py-[18px] odd:border-r odd:pr-7 even:pl-7 max-[720px]:border-r-0 max-[720px]:px-0"
                >
                  <strong className="text-[18px] font-extrabold tracking-[-0.02em]">
                    {item}
                  </strong>
                  <span className="text-[10px] font-extrabold text-[#CFB07C]">
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>
                </div>
              )
            )}
          </div>
        ) : (
          <EmptyText inverse>
            Lista gatunków pojawi się po
            uzupełnieniu danych łowiska.
          </EmptyText>
        )}
      </div>
    </section>
  );
}
