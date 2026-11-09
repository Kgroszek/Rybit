import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/wild-water/WildWater.module.css";

export function AboutSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const paragraphs = (
    section.text ||
    data.lake.description ||
    "Opis łowiska można uzupełnić w edytorze strony."
  )
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  const lines =
    paragraphs.length > 0
      ? paragraphs.slice(0, 3)
      : ["Poznaj nasze łowisko."];

  return (
    <section
      id={section.id}
      className={styles.manifest}
    >
      <div
        className={`${styles.container} ${styles.manifestGrid}`}
      >
        <div className={styles.manifestTitle}>
          <div className={styles.kicker}>
            {section.eyebrow || "O miejscu"}
          </div>

          <h2>
            {section.title ||
              "Poznaj nasze łowisko"}
          </h2>
        </div>

        <div className={styles.manifestLines}>
          {lines.map((line, index) => (
            <div
              key={`${line}-${index}`}
              className={styles.manifestLine}
            >
              <span>
                {String(index + 1).padStart(
                  2,
                  "0"
                )}
              </span>
              <p>{line}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
