import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import {
  Eyebrow,
  PrimaryButton,
} from "@/components/lake-websites/templates/waterline/WaterlineUI";
import { resolveSectionHref } from "@/components/lake-websites/templates/waterline/waterline-utils";

export function CtaSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const href = resolveSectionHref(
    section.buttonHref,
    data
  );

  return (
    <section className="bg-[#F5F6F2] py-16">
      <div className="mx-auto w-[min(1260px,calc(100%-40px))] max-[720px]:w-[calc(100%-28px)]">
        <div className="grid items-center gap-8 rounded-3xl border border-[#DFE4DE] bg-white p-8 md:grid-cols-[1fr_auto]">
          <div>
            <Eyebrow>
              {section.eyebrow ||
                "Zaplanuj wizytę"}
            </Eyebrow>

            <h2 className="mt-[14px] max-w-2xl text-[clamp(30px,3vw,42px)] font-extrabold leading-[1.05] tracking-[-0.04em] text-[#16211D]">
              {section.title ||
                "Zaplanuj kolejną wyprawę nad wodę."}
            </h2>

            {section.text ? (
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#66706B]">
                {section.text}
              </p>
            ) : null}
          </div>

          {section.buttonLabel && href ? (
            <PrimaryButton href={href}>
              {section.buttonLabel}
            </PrimaryButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}
