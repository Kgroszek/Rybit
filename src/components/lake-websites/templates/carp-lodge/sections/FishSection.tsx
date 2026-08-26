import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/carp-lodge/CarpLodge.module.css";
import {
  getCarpLodgeFish,
  getCarpLodgeSectionImage,
} from "@/components/lake-websites/templates/carp-lodge/carp-lodge-utils";

export function FishSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const fish = getCarpLodgeFish(
    section,
    data
  );

  const image =
    getCarpLodgeSectionImage(
      section,
      data,
      2
    );

  return (
    <section
      id={section.id}
      className={`${styles.section} ${styles.darkSection}`}
    >
      <div
        className={`${styles.container} ${styles.speciesLayout}`}
      >
        <div className={styles.speciesVisual}>
          <div className={styles.speciesPhoto}>
            {image ? (
              <img src={image} alt="" />
            ) : (
              <div
                className={
                  styles.mediaPlaceholderDark
                }
              />
            )}
          </div>

          <div className={styles.speciesStamp}>
            Gatunki
            <br />
            naszego łowiska
          </div>
        </div>

        <div className={styles.speciesCopy}>
          <span
            className={`${styles.label} ${styles.labelLight}`}
          >
            {section.eyebrow || "Ryby"}
          </span>

          <h2>
            {section.title ||
              "Co pływa w wodzie?"}
          </h2>

          {section.subtitle ? (
            <p className={styles.sectionLeadDark}>
              {section.subtitle}
            </p>
          ) : null}

          {fish.length > 0 ? (
            <div className={styles.speciesList}>
              {fish
                .slice(0, 12)
                .map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className={
                      styles.speciesRow
                    }
                  >
                    <span>
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </span>
                    <strong>{item}</strong>
                    <em>
                      {index === 0
                        ? "gatunek"
                        : ""}
                    </em>
                  </div>
                ))}
            </div>
          ) : (
            <p className={styles.emptyDark}>
              Lista gatunków pojawi się
              po uzupełnieniu danych.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
