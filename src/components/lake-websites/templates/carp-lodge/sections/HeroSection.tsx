import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/carp-lodge/CarpLodge.module.css";
import {
  getCarpLodgeFish,
  getCarpLodgeImages,
  getCarpLodgePhone,
  resolveCarpLodgeHref,
} from "@/components/lake-websites/templates/carp-lodge/carp-lodge-utils";

export function HeroSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const images = getCarpLodgeImages(
    section,
    data
  );

  const fishSection =
    data.website.sections.find(
      (item) => item.type === "fish"
    );

  const fish = getCarpLodgeFish(
    fishSection,
    data
  );

  const phone = getCarpLodgePhone(data);

  const href = resolveCarpLodgeHref(
    section.buttonHref,
    data
  );

  const about =
    data.website.sections.find(
      (item) => item.type === "about"
    );

  return (
    <section
      id="carp-lodge-start"
      className={styles.hero}
    >
      <div
        className={`${styles.container} ${styles.heroGrid}`}
      >
        <div className={styles.heroCopy}>
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
              "Poznaj łowisko i zaplanuj swój czas nad wodą."}
          </p>

          <div className={styles.heroActions}>
            {section.buttonLabel && href ? (
              <a
                className={styles.primaryButton}
                href={href}
              >
                {section.buttonLabel}
              </a>
            ) : null}

            {about ? (
              <a
                className={styles.outlineButton}
                href={`#${about.id}`}
              >
                Poznaj łowisko
              </a>
            ) : null}
          </div>

          <div className={styles.heroNotes}>
            <HeroNote
              value={data.lake.city || "—"}
              label="miejscowość"
            />
            <HeroNote
              value={
                fish.length > 0
                  ? String(fish.length)
                  : "—"
              }
              label="gatunków"
            />
            <HeroNote
              value={phone || "—"}
              label="kontakt"
            />
          </div>
        </div>

        <div className={styles.heroMedia}>
          <div className={styles.heroMainPhoto}>
            {images[0] ? (
              <img
                src={images[0]}
                alt={
                  section.title ||
                  data.lake.name
                }
              />
            ) : (
              <div
                className={
                  styles.mediaPlaceholder
                }
              />
            )}
          </div>

          <div className={styles.heroSmallPhoto}>
            {images[1] ? (
              <img src={images[1]} alt="" />
            ) : images[0] ? (
              <img src={images[0]} alt="" />
            ) : (
              <div
                className={
                  styles.mediaPlaceholder
                }
              />
            )}
          </div>

          <div className={styles.heroCard}>
            <small>Kontakt z łowiskiem</small>
            <strong>
              {phone
                ? phone
                : "Ustal szczegóły wizyty"}
            </strong>
            <p>
              Skontaktuj się bezpośrednio
              z właścicielem przed
              przyjazdem.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroNote({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className={styles.heroNote}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
