import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import styles from "@/components/lake-websites/templates/carp-lodge/CarpLodge.module.css";
import {
  getCarpLodgeFish,
  getCarpLodgePhone,
} from "@/components/lake-websites/templates/carp-lodge/carp-lodge-utils";

export function CarpLodgeExperienceStrip({
  data,
}: {
  data: PublicLakeWebsiteData;
}) {
  const fishSection =
    data.website.sections.find(
      (section) => section.type === "fish"
    );

  const fish =
    getCarpLodgeFish(fishSection, data);

  const phone = getCarpLodgePhone(data);

  const items = [
    {
      title: "Miejsce",
      description:
        data.lake.city ||
        "Szczegóły w sekcji kontakt",
    },
    {
      title: "Region",
      description:
        data.lake.voivodeship ||
        "Sprawdź lokalizację łowiska",
    },
    {
      title: "Ryby",
      description:
        fish.length > 0
          ? fish.slice(0, 3).join(" · ")
          : "Zapytaj o aktualne zarybienie",
    },
    {
      title: "Kontakt",
      description:
        phone ||
        data.website.contactEmail ||
        data.lake.contactEmail ||
        "Dane kontaktowe poniżej",
    },
  ];

  return (
    <section className={styles.experienceStrip}>
      <div
        className={`${styles.container} ${styles.experienceGrid}`}
      >
        {items.map((item, index) => (
          <div
            key={item.title}
            className={styles.experienceItem}
          >
            <span className={styles.experienceNum}>
              {String(index + 1).padStart(
                2,
                "0"
              )}
            </span>

            <div>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
