import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/wild-water/WildWater.module.css";
import { resolveWildWaterHref } from "@/components/lake-websites/templates/wild-water/wild-water-utils";

export function CtaSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const href = resolveWildWaterHref(
    section.buttonHref,
    data
  );

  return (
    <section className={styles.ctaSection}>
      <div
        className={`${styles.container} ${styles.ctaShell}`}
      >
        <div>
          <div className={styles.kicker}>
            {section.eyebrow ||
              "Zaplanuj wizytę"}
          </div>

          <h2>
            {section.title ||
              "Do zobaczenia nad wodą."}
          </h2>

          {section.text ? (
            <p>{section.text}</p>
          ) : null}
        </div>

        {section.buttonLabel && href ? (
          <a
            className={styles.primaryButton}
            href={href}
          >
            {section.buttonLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}
