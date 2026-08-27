import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import styles from "@/components/lake-websites/templates/wild-water/WildWater.module.css";
import {
  getWildWaterEmail,
  getWildWaterFish,
  getWildWaterPhone,
} from "@/components/lake-websites/templates/wild-water/wild-water-utils";

export function WildWaterNatureCards({
  data,
}: {
  data: PublicLakeWebsiteData;
}) {
  const fishSection = data.website.sections.find(
    (section) => section.type === "fish"
  );

  const fish = getWildWaterFish(
    fishSection,
    data
  );

  const phone = getWildWaterPhone(data);
  const email = getWildWaterEmail(data);

  const cards = [
    {
      index: "01 / MIEJSCE",
      title:
        data.lake.city ||
        "Nad wodą",
      text: data.lake.voivodeship
        ? `Łowisko położone w województwie ${data.lake.voivodeship}.`
        : "Sprawdź lokalizację w sekcji kontakt.",
    },
    {
      index: "02 / RYBY",
      title:
        fish.length > 0
          ? fish.slice(0, 2).join(" · ")
          : "Gatunki ryb",
      text:
        fish.length > 2
          ? `W wodzie występują także: ${fish
              .slice(2, 5)
              .join(", ")}.`
          : "Pełną listę znajdziesz w sekcji Ryby.",
    },
    {
      index: "03 / KONTAKT",
      title:
        phone || email || "Bezpośredni kontakt",
      text:
        "Dane właściciela i adres łowiska znajdziesz w sekcji kontaktowej.",
    },
  ];

  return (
    <section className={styles.natureSection}>
      <div
        className={`${styles.container} ${styles.natureGrid}`}
      >
        {cards.map((card) => (
          <article
            key={card.index}
            className={styles.natureCard}
          >
            <span className={styles.natureIndex}>
              {card.index}
            </span>

            <div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
