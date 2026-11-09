import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/carp-lodge/CarpLodge.module.css";
import { getCarpLodgeList } from "@/components/lake-websites/templates/carp-lodge/carp-lodge-utils";

export function PriceSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const items = getCarpLodgeList(
    section,
    data.lake.priceList,
    "carp-price"
  );

  return (
    <section
      id={section.id}
      className={`${styles.section} ${styles.sandSection}`}
    >
      <div
        className={`${styles.container} ${styles.priceWrap}`}
      >
        <div className={styles.priceCopy}>
          <span className={styles.label}>
            {section.eyebrow || "Cennik"}
          </span>

          <h2>
            {section.title ||
              "Aktualne opłaty"}
          </h2>

          <p>
            {section.subtitle ||
              "Sprawdź najważniejsze informacje dotyczące opłat."}
          </p>
        </div>

        {items.length > 0 ? (
          <div className={styles.priceCards}>
            {items.map((item, index) => (
              <article
                key={item.id}
                className={[
                  styles.priceCard,
                  index === 1
                    ? styles.priceCardFeatured
                    : "",
                ].join(" ")}
              >
                <div>
                  <small>
                    Pozycja{" "}
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </small>
                  <strong>
                    {item.text}
                  </strong>
                </div>
              </article>
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
