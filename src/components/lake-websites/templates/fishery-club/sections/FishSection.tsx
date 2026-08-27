import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/fishery-club/FisheryClub.module.css";
import { getFisheryClubFish } from "@/components/lake-websites/templates/fishery-club/fishery-club-utils";

export function FishSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const fish = getFisheryClubFish(
    section,
    data
  );

  return (
    <section
      id={section.id}
      className={styles.fishSection}
    >
      <div className={styles.container}>
        <div className={styles.sectionBar}>
          <h2>
            {section.title ||
              "Fish ranking."}
          </h2>

          <span>
            {section.subtitle ||
              "Gatunki występujące w łowisku"}
          </span>
        </div>

        {fish.length > 0 ? (
          <div className={styles.fishTable}>
            {fish
              .slice(0, 16)
              .map((name, index) => (
                <div
                  key={`${name}-${index}`}
                  className={styles.fishRow}
                >
                  <div
                    className={styles.fishRank}
                  >
                    #
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </div>

                  <div
                    className={styles.fishName}
                  >
                    {name}
                  </div>

                  <div
                    className={styles.fishTag}
                  >
                    Gatunek
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className={styles.empty}>
            Lista ryb pojawi się po
            uzupełnieniu danych łowiska.
          </p>
        )}
      </div>
    </section>
  );
}
