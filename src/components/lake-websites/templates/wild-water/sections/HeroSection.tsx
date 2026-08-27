import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/wild-water/WildWater.module.css";
import {
  getWildWaterPhone,
  getWildWaterSectionImage,
  resolveWildWaterHref,
} from "@/components/lake-websites/templates/wild-water/wild-water-utils";

export function HeroSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const image = getWildWaterSectionImage(
    section,
    data,
    0
  );

  const gallery = data.website.sections.find(
    (item) => item.type === "gallery"
  );

  const phone = getWildWaterPhone(data);

  const href = resolveWildWaterHref(
    section.buttonHref,
    data
  );

  return (
    <section
      id="wild-water-start"
      className={styles.hero}
    >
      <div className={styles.container}>
        <div className={styles.heroFrame}>
          <div className={styles.heroCopy}>
            <div>
              <div className={styles.kicker}>
                {section.eyebrow ||
                  "Łowisko w naturze"}
              </div>

              <h1>
                {section.title ||
                  data.lake.name}
              </h1>

              <p className={styles.heroLead}>
                {section.subtitle ||
                  data.lake.description ||
                  "Poznaj łowisko i wszystkie najważniejsze informacje przed przyjazdem."}
              </p>

              <div
                className={styles.heroActions}
              >
                {section.buttonLabel &&
                href ? (
                  <a
                    className={
                      styles.primaryButton
                    }
                    href={href}
                  >
                    {section.buttonLabel}
                  </a>
                ) : null}

                {gallery ? (
                  <a
                    className={
                      styles.outlineButton
                    }
                    href={`#${gallery.id}`}
                  >
                    Zobacz miejsce
                  </a>
                ) : null}
              </div>
            </div>

            <div className={styles.heroBottom}>
              <HeroFact
                label="Miejscowość"
                value={data.lake.city || "—"}
              />
              <HeroFact
                label="Region"
                value={
                  data.lake.voivodeship ||
                  "—"
                }
              />
              <HeroFact
                label="Kontakt"
                value={phone || "—"}
              />
            </div>
          </div>

          <div className={styles.heroPhoto}>
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

            <div className={styles.heroWatermark}>
              {data.website.siteName ||
                data.lake.name}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroFact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className={styles.heroFact}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
