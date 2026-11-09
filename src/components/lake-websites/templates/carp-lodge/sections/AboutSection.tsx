import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/carp-lodge/CarpLodge.module.css";

export function AboutSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  return (
    <section
      id={section.id}
      className={`${styles.section} ${styles.paperSection}`}
    >
      <div
        className={`${styles.container} ${styles.introGrid}`}
      >
        <div className={styles.introSide}>
          <span className={styles.label}>
            {section.eyebrow ||
              "Poznaj miejsce"}
          </span>
          <h2>
            {section.title ||
              "O łowisku"}
          </h2>
        </div>

        <div className={styles.introCopy}>
          <p>
            {section.text ||
              data.lake.description ||
              "Opis łowiska można uzupełnić w edytorze strony."}
          </p>
        </div>
      </div>
    </section>
  );
}
