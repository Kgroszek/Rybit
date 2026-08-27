import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/fishery-club/FisheryClub.module.css";

export function AboutSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const text =
    section.text ||
    data.lake.description ||
    "Opis łowiska można uzupełnić w edytorze strony.";

  const paragraphs = text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <section
      id={section.id}
      className={styles.editorialSection}
    >
      <div
        className={`${styles.container} ${styles.editorialGrid}`}
      >
        <aside
          className={styles.editorialAside}
        >
          <small>
            {section.eyebrow ||
              "O ŁOWISKU"}{" "}
            / 01
          </small>

          <h2>
            {section.title || "O łowisku"}
          </h2>
        </aside>

        <div
          className={styles.editorialMain}
        >
          {(paragraphs.length > 0
            ? paragraphs
            : [text]
          ).map((paragraph, index) => (
            <div
              key={`${paragraph}-${index}`}
              className={styles.editorialRow}
            >
              <span>
                {String(
                  index + 1
                ).padStart(2, "0")}
              </span>
              <p>{paragraph}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
