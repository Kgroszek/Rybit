import type { CSSProperties } from "react";

import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import { WaterlineHeader } from "@/components/lake-websites/templates/waterline/WaterlineHeader";
import { WaterlineQuickInfo } from "@/components/lake-websites/templates/waterline/WaterlineQuickInfo";
import { WaterlineSectionRenderer } from "@/components/lake-websites/templates/waterline/WaterlineSectionRenderer";
import { WaterlineSectionShell } from "@/components/lake-websites/templates/waterline/WaterlineSectionShell";
import {
  getPrimaryContrast,
  getSiteName,
} from "@/components/lake-websites/templates/waterline/waterline-utils";

export function WaterlineLakeWebsite({
  data,
  editorMode = false,
  selectedSectionId = null,
}: {
  data: PublicLakeWebsiteData;
  editorMode?: boolean;
  selectedSectionId?: string | null;
}) {
  const siteName = getSiteName(data);

  const style = {
    "--waterline-primary":
      data.website.primaryColor,
    "--waterline-primary-contrast":
      getPrimaryContrast(
        data.website.primaryColor
      ),
    "--waterline-accent":
      data.website.accentColor,
  } as CSSProperties;

  return (
    <div
      style={style}
      className="min-h-screen overflow-x-hidden bg-[#F5F6F2] font-[var(--font-manrope)] text-[#16211D]"
    >
      <WaterlineHeader
        siteName={siteName}
        logoUrl={data.website.logoUrl}
        sections={data.website.sections}
      />

      <main id="start">
        {data.website.sections.map(
          (section) => (
            <div key={section.id}>
              <WaterlineSectionShell
                id={section.id}
                editorMode={editorMode}
                selected={
                  selectedSectionId ===
                  section.id
                }
              >
                <WaterlineSectionRenderer
                  section={section}
                  data={data}
                />
              </WaterlineSectionShell>

              {section.type === "hero" ? (
                <WaterlineQuickInfo
                  data={data}
                />
              ) : null}

            </div>
          )
        )}
      </main>

      <footer className="border-t border-[#DFE4DE] bg-white py-[34px]">
        <div className="mx-auto flex w-[min(1260px,calc(100%-40px))] items-end justify-between gap-6 max-[720px]:w-[calc(100%-28px)] max-[720px]:flex-col max-[720px]:items-start">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-[34px] w-[10px] rounded-full bg-[linear-gradient(180deg,var(--waterline-primary),var(--waterline-accent))]" />
              <strong className="text-[18px] font-black tracking-[-0.03em]">
                {siteName}
              </strong>
            </div>
            <p className="mt-2 text-xs text-[#8A928E]">
              {[data.lake.city, data.lake.voivodeship]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          <p className="text-xs text-[#8A928E]">
            Oficjalna strona łowiska
          </p>
        </div>
      </footer>
    </div>
  );
}
