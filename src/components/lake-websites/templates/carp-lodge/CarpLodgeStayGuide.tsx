import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import styles from "@/components/lake-websites/templates/carp-lodge/CarpLodge.module.css";

export function CarpLodgeStayGuide({
  data,
}: {
  data: PublicLakeWebsiteData;
}) {
  const price = data.website.sections.find(
    (section) => section.type === "priceList"
  );
  const rules = data.website.sections.find(
    (section) => section.type === "rules"
  );
  const contact = data.website.sections.find(
    (section) => section.type === "contact"
  );

  const images = data.lake.images.map(
    (image) => image.url
  );

  const cards = [
    price
      ? {
          id: price.id,
          eyebrow: "01 / OPŁATY",
          title: "Sprawdź cennik",
          text:
            "Zobacz aktualne opłaty związane z pobytem i wędkowaniem.",
          image:
            images[1] ||
            images[0] ||
            "",
        }
      : null,
    rules
      ? {
          id: rules.id,
          eyebrow: "02 / ZASADY",
          title: "Poznaj regulamin",
          text:
            "Przed przyjazdem sprawdź najważniejsze zasady obowiązujące nad wodą.",
          image:
            images[2] ||
            images[0] ||
            "",
        }
      : null,
    contact
      ? {
          id: contact.id,
          eyebrow: "03 / KONTAKT",
          title: "Ustal szczegóły wizyty",
          text:
            "Skontaktuj się bezpośrednio z łowiskiem i potwierdź wszystkie szczegóły przed przyjazdem.",
          image:
            images[3] ||
            images[0] ||
            "",
        }
      : null,
  ].filter(
    (
      item
    ): item is {
      id: string;
      eyebrow: string;
      title: string;
      text: string;
      image: string;
    } => Boolean(item)
  );

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className={styles.staySection}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.label}>
              Przed przyjazdem
            </span>
            <h2>
              Zaplanuj swój czas nad wodą.
            </h2>
          </div>

          <p>
            Najważniejsze informacje,
            które warto sprawdzić przed
            wizytą na łowisku.
          </p>
        </div>

        <div className={styles.stayList}>
          {cards.map((item, index) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={[
                styles.stay,
                index % 2 === 1
                  ? styles.stayReverse
                  : "",
              ].join(" ")}
            >
              <div className={styles.stayMedia}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                  />
                ) : (
                  <div
                    className={
                      styles.mediaPlaceholder
                    }
                  />
                )}
              </div>

              <div className={styles.stayCopy}>
                <span
                  className={styles.stayIndex}
                >
                  {item.eyebrow}
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                <span
                  className={styles.textArrow}
                >
                  Przejdź do sekcji →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
