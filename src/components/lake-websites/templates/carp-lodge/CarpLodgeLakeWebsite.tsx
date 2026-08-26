import type { CSSProperties } from "react";

import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import styles from "@/components/lake-websites/templates/carp-lodge/CarpLodge.module.css";
import { CarpLodgeExperienceStrip } from "@/components/lake-websites/templates/carp-lodge/CarpLodgeExperienceStrip";
import { CarpLodgeHeader } from "@/components/lake-websites/templates/carp-lodge/CarpLodgeHeader";
import { CarpLodgeSectionRenderer } from "@/components/lake-websites/templates/carp-lodge/CarpLodgeSectionRenderer";
import { CarpLodgeSectionShell } from "@/components/lake-websites/templates/carp-lodge/CarpLodgeSectionShell";
import { CarpLodgeStayGuide } from "@/components/lake-websites/templates/carp-lodge/CarpLodgeStayGuide";
import {
  getCarpLodgeContrast,
  getCarpLodgePhone,
  getCarpLodgeSiteName,
} from "@/components/lake-websites/templates/carp-lodge/carp-lodge-utils";

export function CarpLodgeLakeWebsite({
  data,
  editorMode = false,
  selectedSectionId = null,
}: {
  data: PublicLakeWebsiteData;
  editorMode?: boolean;
  selectedSectionId?: string | null;
}) {
  const siteName =
    getCarpLodgeSiteName(data);

  const firstHero =
    data.website.sections.find(
      (section) => section.type === "hero"
    );

  const firstAbout =
    data.website.sections.find(
      (section) => section.type === "about"
    );

  const style = {
    "--cl-rust":
      data.website.primaryColor ||
      "#B85B3E",
    "--cl-rust-contrast":
      getCarpLodgeContrast(
        data.website.primaryColor ||
          "#B85B3E"
      ),
    "--cl-moss":
      data.website.accentColor ||
      "#71765A",
  } as CSSProperties;

  return (
    <div
      style={style}
      className={styles.page}
    >
      <CarpLodgeHeader
        siteName={siteName}
        logoUrl={data.website.logoUrl}
        phone={getCarpLodgePhone(data)}
        sections={data.website.sections}
      />

      <main>
        {data.website.sections.map(
          (section) => (
            <div key={section.id}>
              <CarpLodgeSectionShell
                id={section.id}
                editorMode={editorMode}
                selected={
                  selectedSectionId ===
                  section.id
                }
              >
                <CarpLodgeSectionRenderer
                  section={section}
                  data={data}
                />
              </CarpLodgeSectionShell>

              {firstHero?.id ===
              section.id ? (
                <CarpLodgeExperienceStrip
                  data={data}
                />
              ) : null}

              {firstAbout?.id ===
              section.id ? (
                <CarpLodgeStayGuide
                  data={data}
                />
              ) : null}
            </div>
          )
        )}
      </main>

      <footer className={styles.footer}>
        <div
          className={`${styles.container} ${styles.footerInner}`}
        >
          <div className={styles.brand}>
            {data.website.logoUrl ? (
              <img
                src={data.website.logoUrl}
                alt={siteName}
                className={
                  styles.footerLogo
                }
              />
            ) : (
              <>
                <span
                  className={styles.brandMark}
                >
                  {siteName
                    .charAt(0)
                    .toUpperCase()}
                </span>
                <span>{siteName}</span>
              </>
            )}
          </div>

          <small>
            {[data.lake.city, data.lake.voivodeship]
              .filter(Boolean)
              .join(" · ")}
          </small>
        </div>
      </footer>
    </div>
  );
}
