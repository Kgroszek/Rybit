import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/wild-water/WildWater.module.css";
import { getWildWaterFish } from "@/components/lake-websites/templates/wild-water/wild-water-utils";

export function FishSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const fish = getWildWaterFish(
    section,
    data
  );

  return (
    <section
      id={section.id}
      className={styles.fishSection}
    >
      <div className={styles.container}>
        <div className={styles.fishHead}>
          <div>
            <div className={styles.kicker}>
              {section.eyebrow || "Ryby"}
            </div>

            <h2>
              {section.title ||
                "Co znajdziesz w wodzie?"}
            </h2>
          </div>

          <p>
            {section.subtitle ||
              "Gatunki występujące w łowisku."}
          </p>
        </div>

        {fish.length > 0 ? (
          <div className={styles.fishBoard}>
            {fish
              .slice(0, 16)
              .map((name, index) => (
                <div
                  key={`${name}-${index}`}
                  className={styles.fishCell}
                >
                  <span>
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>
                  <strong>{name}</strong>
                </div>
              ))}
          </div>
        ) : (
          <p className={styles.empty}>
            Lista gatunków pojawi się po
            uzupełnieniu danych łowiska.
          </p>
        )}
      </div>
    </section>
  );
}
