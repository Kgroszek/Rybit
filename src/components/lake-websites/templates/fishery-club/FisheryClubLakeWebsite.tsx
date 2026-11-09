import type { CSSProperties } from "react";

import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import { FisheryClubFeatureGrid } from "@/components/lake-websites/templates/fishery-club/FisheryClubFeatureGrid";
import { FisheryClubHeader } from "@/components/lake-websites/templates/fishery-club/FisheryClubHeader";
import styles from "@/components/lake-websites/templates/fishery-club/FisheryClub.module.css";
import { FisheryClubQuickScore } from "@/components/lake-websites/templates/fishery-club/FisheryClubQuickScore";
import { FisheryClubSectionRenderer } from "@/components/lake-websites/templates/fishery-club/FisheryClubSectionRenderer";
import { FisheryClubSectionShell } from "@/components/lake-websites/templates/fishery-club/FisheryClubSectionShell";
import {
  getFisheryClubContrast,
  getFisheryClubSiteName,
} from "@/components/lake-websites/templates/fishery-club/fishery-club-utils";

export function FisheryClubLakeWebsite({
  data,
  editorMode = false,
  selectedSectionId = null,
}: {
  data: PublicLakeWebsiteData;
  editorMode?: boolean;
  selectedSectionId?: string | null;
}) {
  const siteName =
    getFisheryClubSiteName(data);

  const firstHero = data.website.sections.find(
    (section) => section.type === "hero"
  );

  const firstAbout = data.website.sections.find(
    (section) => section.type === "about"
  );

  const accent =
    data.website.primaryColor || "#F05A28";

  const style = {
    "--fc-orange": accent,
    "--fc-orange-contrast":
      getFisheryClubContrast(accent),
  } as CSSProperties;

  return (
    <div
      style={style}
      className={styles.page}
    >
      <FisheryClubHeader
        siteName={siteName}
        logoUrl={data.website.logoUrl}
        city={data.lake.city}
        sections={data.website.sections}
      />

      <main>
        {data.website.sections.map(
          (section) => (
            <div key={section.id}>
              <FisheryClubSectionShell
                id={section.id}
                editorMode={editorMode}
                selected={
                  selectedSectionId ===
                  section.id
                }
              >
                <FisheryClubSectionRenderer
                  section={section}
                  data={data}
                />
              </FisheryClubSectionShell>

              {firstHero?.id ===
              section.id ? (
                <FisheryClubQuickScore
                  data={data}
                />
              ) : null}

              {firstAbout?.id ===
              section.id ? (
                <FisheryClubFeatureGrid
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
            <span className={styles.brandBox}>
              FC
            </span>
            <span>{siteName}</span>
          </div>

          <span>
            {[data.lake.city, data.lake.voivodeship]
              .filter(Boolean)
              .join(" / ")}
          </span>
        </div>
      </footer>
    </div>
  );
}
