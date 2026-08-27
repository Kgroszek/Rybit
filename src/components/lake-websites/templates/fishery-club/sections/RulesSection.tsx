import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/fishery-club/FisheryClub.module.css";
import { getFisheryClubList } from "@/components/lake-websites/templates/fishery-club/fishery-club-utils";

export function RulesSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const items = getFisheryClubList(
    section,
    data.lake.rules,
    "fishery-rule"
  );

  return (
    <section
      id={section.id}
      className={styles.rulesSection}
    >
      <div
        className={`${styles.container} ${styles.rulesShell}`}
      >
        <div className={styles.rulesTitle}>
          <div>
            <span className={styles.label}>
              {section.eyebrow ||
                "Rules / 06"}
            </span>

            <h2>
              {section.title ||
                "Regulamin"}
            </h2>
          </div>

          <div className={styles.hugeNumber}>
            {String(
              Math.max(items.length, 1)
            ).padStart(2, "0")}
          </div>
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
            <p className={styles.emptyDark}>
              Szczegółowe zasady dostępne
              są u właściciela łowiska.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
