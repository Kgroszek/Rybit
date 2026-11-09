import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/carp-lodge/CarpLodge.module.css";
import { resolveCarpLodgeHref } from "@/components/lake-websites/templates/carp-lodge/carp-lodge-utils";

export function CtaSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const href = resolveCarpLodgeHref(
    section.buttonHref,
    data
  );

  return (
    <section className={styles.ctaSection}>
      <div
        className={`${styles.container} ${styles.ctaShell}`}
      >
        <div>
          <span className={styles.label}>
            {section.eyebrow ||
              "Zaplanuj wizytę"}
          </span>
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
