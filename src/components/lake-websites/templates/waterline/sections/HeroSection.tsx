import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import {
  Eyebrow,
  PrimaryButton,
} from "@/components/lake-websites/templates/waterline/WaterlineUI";
import {
  getContactPhone,
  getFishItems,
  getSectionImage,
  resolveSectionHref,
} from "@/components/lake-websites/templates/waterline/waterline-utils";

export function HeroSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const image = getSectionImage(
    section,
    data,
    0
  );

  const fishSection =
    data.website.sections.find(
      (item) => item.type === "fish"
    );

  const gallerySection =
    data.website.sections.find(
      (item) => item.type === "gallery"
    );

  const fishCount =
    getFishItems(fishSection, data).length;

  const phone = getContactPhone(data);

  const primaryHref =
    resolveSectionHref(
      section.buttonHref,
      data
    );

  return (
    <section className="bg-[#F5F6F2] py-[34px] pb-[18px] max-[720px]:py-4">
      <div className="mx-auto w-[min(1260px,calc(100%-40px))] max-[720px]:w-[calc(100%-28px)]">
        <div className="grid min-h-[580px] grid-cols-[1.05fr_.95fr] overflow-hidden rounded-[28px] border border-[#16211D]/[.07] bg-white shadow-[0_20px_60px_rgba(22,33,29,.08)] max-[1050px]:grid-cols-1 max-[720px]:rounded-[20px]">
          <div className="flex flex-col justify-between gap-9 px-14 pb-10 pt-16 max-[720px]:px-6 max-[720px]:pb-7 max-[720px]:pt-9">
            <div>
              <Eyebrow>
                {section.eyebrow ||
                  "Łowisko wędkarskie"}
              </Eyebrow>

              <h1 className="mt-[14px] max-w-[780px] text-[clamp(44px,5.2vw,72px)] font-extrabold leading-[.98] tracking-[-0.04em] text-[#16211D]">
                {section.title || data.lake.name}
              </h1>

              <p className="mt-6 max-w-[680px] text-[17px] leading-[1.8] text-[#66706B] max-[720px]:text-[15px]">
                {section.subtitle ||
                  data.lake.description ||
                  "Najważniejsze informacje o łowisku w jednym miejscu."}
              </p>

              <div className="mt-[30px] flex flex-wrap gap-3">
                {section.buttonLabel &&
                primaryHref ? (
                  <PrimaryButton
                    href={primaryHref}
                  >
                    {section.buttonLabel}
                  </PrimaryButton>
                ) : null}

                {gallerySection ? (
                  <PrimaryButton
                    href={`#${gallerySection.id}`}
                    secondary
                  >
                    Zobacz galerię
                  </PrimaryButton>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-5 border-t border-[#DFE4DE] pt-6 max-[720px]:grid-cols-2">
              <HeroFact
                label="Lokalizacja"
                value={data.lake.city || "—"}
              />
              <HeroFact
                label="Region"
                value={data.lake.voivodeship || "—"}
              />
              <HeroFact
                label="Gatunki"
                value={
                  fishCount > 0
                    ? `${fishCount}`
                    : "—"
                }
              />
              <HeroFact
                label="Kontakt"
                value={phone || "—"}
              />
            </div>
          </div>

          <div className="relative min-h-[460px] bg-[#D8E0DB] max-[1050px]:min-h-[420px] max-[720px]:min-h-[300px]">
            {image ? (
              <img
                src={image}
                alt={
                  section.title ||
                  data.lake.name
                }
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(145deg,#D8E0DB,#BCC9C1)]" />
            )}

            <span className="absolute bottom-[22px] left-[22px] rounded-full bg-white/90 px-3.5 py-2 text-[11px] font-extrabold text-[#16211D] shadow-lg backdrop-blur">
              {[data.lake.city, data.lake.voivodeship]
                .filter(Boolean)
                .join(" · ") || data.lake.name}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroFact({
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
      <p className="mt-1.5 truncate text-[14px] font-extrabold text-[#16211D]">
        {value}
      </p>
    </div>
  );
}
