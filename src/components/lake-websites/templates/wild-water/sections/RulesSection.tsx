import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/wild-water/WildWater.module.css";
import { getWildWaterList } from "@/components/lake-websites/templates/wild-water/wild-water-utils";

export function RulesSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const items = getWildWaterList(
    section,
    data.lake.rules,
    "wild-rule"
  );

  return (
    <section
      id={section.id}
      className={styles.rulesSection}
    >
      <div
        className={`${styles.container} ${styles.rulesGrid}`}
      >
        <div className={styles.rulesIntro}>
          <div className={styles.kicker}>
            {section.eyebrow || "Zasady"}
          </div>

          <h2>
            {section.title ||
              "Warto wiedzieć przed przyjazdem."}
          </h2>

          <p>
            {section.subtitle ||
              "Rozwiń wybrany punkt, aby przeczytać szczegóły."}
          </p>
        </div>

        {items.length > 0 ? (
          <div className={styles.rulesList}>
            {items.map((item, index) => (
              <details
                key={item.id}
                className={styles.ruleDetails}
                open={index === 0}
              >
                <summary>
                  <span>
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>
                  <strong>
                    Zasada {index + 1}
                  </strong>
                  <span>+</span>
                </summary>

                <p>{item.text}</p>
              </details>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>
            Szczegółowe zasady dostępne są
            u właściciela łowiska.
          </p>
        )}
      </div>
    </section>
  );
}
