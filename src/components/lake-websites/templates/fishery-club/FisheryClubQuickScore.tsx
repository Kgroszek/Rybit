import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import styles from "@/components/lake-websites/templates/fishery-club/FisheryClub.module.css";
import {
  getFisheryClubFish,
  getFisheryClubPhone,
} from "@/components/lake-websites/templates/fishery-club/fishery-club-utils";

export function FisheryClubQuickScore({
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

  const items = [
    {
      label: "Ryby",
      value:
        fish.length > 0
          ? fish.slice(0, 3).join(" · ")
          : "Sprawdź sekcję ryb",
    },
    {
      label: "Region",
      value:
        data.lake.voivodeship ||
        data.lake.city ||
        "—",
    },
    {
      label: "Kontakt",
      value:
        phone ||
        data.website.contactEmail ||
        data.lake.contactEmail ||
        "Dane poniżej",
    },
  ];

  return (
    <section className={styles.scoreSection}>
      <div
        className={`${styles.container} ${styles.scoreGrid}`}
      >
        <div className={styles.scoreTitle}>
          <strong>
            Quick
            <br />
            score.
          </strong>
        </div>

        {items.map((item) => (
          <div
            key={item.label}
            className={styles.scoreItem}
          >
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
