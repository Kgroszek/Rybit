import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import styles from "@/components/lake-websites/templates/wild-water/WildWater.module.css";
import {
  getWildWaterFish,
  getWildWaterPhone,
} from "@/components/lake-websites/templates/wild-water/wild-water-utils";

export function WildWaterSnapshot({
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

  const fishSummary =
    fish.length > 0
      ? fish.slice(0, 3).join(" · ")
      : "Zapytaj o aktualne zarybienie";

  return (
    <div className={styles.snapshot}>
      <div
        className={`${styles.container} ${styles.snapshotGrid}`}
      >
        <div className={styles.snapshotIntro}>
          <strong>
            Najważniejsze
            <br />
            na pierwszy rzut oka.
          </strong>
        </div>

        <SnapshotItem
          label="Ryby"
          value={fishSummary}
        />

        <SnapshotItem
          label="Region"
          value={
            data.lake.voivodeship || "—"
          }
        />

        <SnapshotItem
          label="Kontakt"
          value={
            phone ||
            data.website.contactEmail ||
            data.lake.contactEmail ||
            "Dane poniżej"
          }
        />
      </div>
    </div>
  );
}

function SnapshotItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className={styles.snapshotItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
