import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/carp-lodge/CarpLodge.module.css";
import { getCarpLodgeList } from "@/components/lake-websites/templates/carp-lodge/carp-lodge-utils";

export function RulesSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const items = getCarpLodgeList(
    section,
    data.lake.rules,
    "carp-rule"
  );

  return (
    <section
      id={section.id}
      className={`${styles.section} ${styles.paperSection}`}
    >
      <div
        className={`${styles.container} ${styles.rulesShell}`}
      >
        <div className={styles.rulesTitle}>
          <span
            className={`${styles.label} ${styles.labelWhite}`}
          >
            {section.eyebrow ||
              "Zanim przyjedziesz"}
          </span>

          <h2>
            {section.title ||
              "Najważniejsze zasady."}
          </h2>

          {section.subtitle ? (
            <p>{section.subtitle}</p>
          ) : null}
        </div>

        <div className={styles.rulesList}>
          {items.length > 0 ? (
            items.map((item, index) => (
              <div
                key={item.id}
                className={styles.rule}
              >
                <span>
                  {String(
                    index + 1
                  ).padStart(2, "0")}
                </span>
                <p>{item.text}</p>
              </div>
            ))
          ) : (
            <p className={styles.empty}>
              Szczegółowe zasady dostępne
              są u właściciela łowiska.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
