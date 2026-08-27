import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/wild-water/WildWater.module.css";
import { getWildWaterList } from "@/components/lake-websites/templates/wild-water/wild-water-utils";

export function PriceSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const items = getWildWaterList(
    section,
    data.lake.priceList,
    "wild-price"
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
          <div className={styles.kicker}>
            {section.eyebrow || "Cennik"}
          </div>

          <h2>
            {section.title ||
              "Opłaty bez drobnego druku."}
          </h2>

          <p>
            {section.subtitle ||
              "Najważniejsze opłaty związane z pobytem i wędkowaniem."}
          </p>
        </div>

        {items.length > 0 ? (
          <div className={styles.tickets}>
            {items.map((item, index) => (
              <div
                key={item.id}
                className={styles.ticket}
              >
                <div className={styles.ticketNum}>
                  {String(
                    index + 1
                  ).padStart(2, "0")}
                </div>

                <strong>{item.text}</strong>

                <span className={styles.ticketArrow}>
                  →
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>
            Aktualne opłaty dostępne są
            u właściciela łowiska.
          </p>
        )}
      </div>
    </section>
  );
}
