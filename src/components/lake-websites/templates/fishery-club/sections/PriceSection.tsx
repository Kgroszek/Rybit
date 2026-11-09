import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/fishery-club/FisheryClub.module.css";
import {
  getFisheryClubList,
  splitFisheryClubPriceText,
} from "@/components/lake-websites/templates/fishery-club/fishery-club-utils";

export function PriceSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const items = getFisheryClubList(
    section,
    data.lake.priceList,
    "fishery-price"
  );

  return (
    <section
      id={section.id}
      className={styles.priceSection}
    >
      <div
        className={`${styles.container} ${styles.priceGrid}`}
      >
        <div className={styles.priceIntro}>
          <span
            className={`${styles.label} ${styles.labelWhite}`}
          >
            {section.eyebrow ||
              "Cennik / 05"}
          </span>

          <h2>
            {section.title || "Cennik"}
          </h2>

          <p>
            {section.subtitle ||
              "Aktualne opłaty za wędkowanie i pobyt."}
          </p>
        </div>

        {items.length > 0 ? (
          <div className={styles.priceList}>
            {items.map((item, index) => {
              const price =
                splitFisheryClubPriceText(
                  item.text
                );

              return (
                <div
                  key={item.id}
                  className={styles.priceRow}
                >
                  <span>
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  <strong>
                    {price.label}
                  </strong>

                  {price.value ? (
                    <em>{price.value}</em>
                  ) : (
                    <em>INFO</em>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p
            className={
              styles.emptyOnOrange
            }
          >
            Aktualny cennik dostępny jest
            u właściciela łowiska.
          </p>
        )}
      </div>
    </section>
  );
}
