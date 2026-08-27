import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/fishery-club/FisheryClub.module.css";
import {
  getFisheryClubPhone,
  getFisheryClubSectionImage,
  resolveFisheryClubHref,
} from "@/components/lake-websites/templates/fishery-club/fishery-club-utils";

export function HeroSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const image = getFisheryClubSectionImage(
    section,
    data,
    0
  );

  const phone = getFisheryClubPhone(data);

  const fishSection = data.website.sections.find(
    (item) => item.type === "fish"
  );

  const primaryHref = resolveFisheryClubHref(
    section.buttonHref,
    data
  );

  return (
    <section
      id="fishery-club-start"
      className={styles.hero}
    >
      <div
        className={`${styles.container} ${styles.heroGrid}`}
      >
        <div className={styles.heroCopy}>
          <div>
            <span className={styles.label}>
              {section.eyebrow ||
                "Łowisko wędkarskie"}
            </span>

            <h1>
              {section.title ||
                data.lake.name}
            </h1>

            <p className={styles.heroLead}>
              {section.subtitle ||
                data.lake.description ||
                "Poznaj łowisko, ryby, cennik i najważniejsze informacje przed przyjazdem."}
            </p>

            <div className={styles.heroActions}>
              {section.buttonLabel &&
              primaryHref ? (
                <a
                  className={styles.orangeButton}
                  href={primaryHref}
                >
                  {section.buttonLabel}
                </a>
              ) : null}

              {fishSection ? (
                <a
                  className={
                    styles.outlineDarkButton
                  }
                  href={`#${fishSection.id}`}
                >
                  Zobacz ryby
                </a>
              ) : null}
            </div>
          </div>

          <div className={styles.heroMeta}>
            <HeroMeta
              label="Lokalizacja"
              value={data.lake.city || "—"}
            />
            <HeroMeta
              label="Region"
              value={
                data.lake.voivodeship ||
                "—"
              }
            />
            <HeroMeta
              label="Kontakt"
              value={phone || "—"}
            />
          </div>
        </div>

        <div className={styles.heroMedia}>
          {image ? (
            <img
              src={image}
              alt={
                section.title ||
                data.lake.name
              }
            />
          ) : (
            <div
              className={
                styles.photoPlaceholder
              }
            />
          )}

          <div className={styles.heroSticker}>
            Fishery
            <br />
            Club
            <br />
            04
          </div>

          <div
            className={styles.heroPhotoLabel}
          >
            PHOTO / WATER / FISHERY
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
