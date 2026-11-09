import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import styles from "@/components/lake-websites/templates/fishery-club/FisheryClub.module.css";
import {
  getFisheryClubEmail,
  getFisheryClubFish,
  getFisheryClubPhone,
} from "@/components/lake-websites/templates/fishery-club/fishery-club-utils";

export function FisheryClubFeatureGrid({
  data,
}: {
  data: PublicLakeWebsiteData;
}) {
  const fishSection = data.website.sections.find(
    (section) => section.type === "fish"
  );

  const fish = getFisheryClubFish(
    fishSection,
    data
  );

  const phone = getFisheryClubPhone(data);
  const email = getFisheryClubEmail(data);

  const items = [
    {
      index: "01 / PLACE",
      title:
        data.lake.city ||
        "Lokalizacja",
      text: data.lake.voivodeship
        ? `Województwo ${data.lake.voivodeship}.`
        : "Dokładny adres znajdziesz w sekcji kontaktowej.",
    },
    {
      index: "02 / FISH",
      title:
        fish.length > 0
          ? fish.slice(0, 2).join(" / ")
          : "Ryby",
      text:
        fish.length > 2
          ? `Pozostałe gatunki: ${fish
              .slice(2, 5)
              .join(", ")}.`
          : "Pełną listę gatunków znajdziesz poniżej.",
    },
    {
      index: "03 / INFO",
      title:
        phone || email || "Kontakt",
      text:
        "Skontaktuj się bezpośrednio z łowiskiem przed przyjazdem.",
    },
  ];

  return (
    <section className={styles.featureSection}>
      <div className={styles.container}>
        <div className={styles.featureHead}>
          <h2>
            Wszystko, co najważniejsze.
          </h2>

          <p>
            Konkretne informacje o miejscu,
            rybach i kontakcie — bez
            systemowych komunikatów generatora.
          </p>
        </div>

        <div className={styles.featureCards}>
          {items.map((item) => (
            <article
              key={item.index}
              className={styles.featureCard}
            >
              <small>{item.index}</small>

              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
