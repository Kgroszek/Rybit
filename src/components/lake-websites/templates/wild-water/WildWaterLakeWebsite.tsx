import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import styles from "@/components/lake-websites/templates/wild-water/WildWater.module.css";
import { WildWaterNatureCards } from "@/components/lake-websites/templates/wild-water/WildWaterNatureCards";
import { WildWaterNavigation } from "@/components/lake-websites/templates/wild-water/WildWaterNavigation";
import { WildWaterSectionRenderer } from "@/components/lake-websites/templates/wild-water/WildWaterSectionRenderer";
import { WildWaterSectionShell } from "@/components/lake-websites/templates/wild-water/WildWaterSectionShell";
import { WildWaterSnapshot } from "@/components/lake-websites/templates/wild-water/WildWaterSnapshot";
import {
  getWildWaterPhone,
  getWildWaterSiteName,
} from "@/components/lake-websites/templates/wild-water/wild-water-utils";

export function WildWaterLakeWebsite({
  data,
  editorMode = false,
  selectedSectionId = null,
}: {
  data: PublicLakeWebsiteData;
  editorMode?: boolean;
  selectedSectionId?: string | null;
}) {
  const siteName = getWildWaterSiteName(data);

  const firstHero = data.website.sections.find(
    (section) => section.type === "hero"
  );

  const firstAbout = data.website.sections.find(
    (section) => section.type === "about"
  );

  return (
    <div className={styles.page}>
      <WildWaterNavigation
        siteName={siteName}
        logoUrl={data.website.logoUrl}
        city={data.lake.city}
        voivodeship={data.lake.voivodeship}
        phone={getWildWaterPhone(data)}
        sections={data.website.sections}
      />

      <div className={styles.content}>
        <main>
          {data.website.sections.map(
            (section) => (
              <div key={section.id}>
                <WildWaterSectionShell
                  id={section.id}
                  editorMode={editorMode}
                  selected={
                    selectedSectionId ===
                    section.id
                  }
                >
                  <WildWaterSectionRenderer
                    section={section}
                    data={data}
                  />
                </WildWaterSectionShell>

                {firstHero?.id === section.id ? (
                  <WildWaterSnapshot data={data} />
                ) : null}

                {firstAbout?.id === section.id ? (
                  <WildWaterNatureCards data={data} />
                ) : null}
              </div>
            )
          )}
        </main>

        <footer className={styles.footer}>
          <div
            className={`${styles.container} ${styles.footerInner}`}
          >
            <strong>{siteName}</strong>
            <span>
              {[data.lake.city, data.lake.voivodeship]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
