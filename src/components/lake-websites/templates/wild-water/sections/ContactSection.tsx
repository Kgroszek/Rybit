import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/wild-water/WildWater.module.css";
import {
  getWildWaterAddress,
  getWildWaterEmail,
  getWildWaterPhone,
  getWildWaterWebsite,
  normalizeWildWaterUrl,
} from "@/components/lake-websites/templates/wild-water/wild-water-utils";

export function ContactSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const phone = getWildWaterPhone(data);
  const email = getWildWaterEmail(data);
  const website = getWildWaterWebsite(data);
  const address = getWildWaterAddress(data);

  return (
    <section
      id={section.id}
      className={styles.contactSection}
    >
      <div
        className={`${styles.container} ${styles.contactShell}`}
      >
        <div className={styles.contactCopy}>
          <div className={styles.kicker}>
            {section.eyebrow || "Kontakt"}
          </div>

          <h2>
            {section.title ||
              "Masz pytanie? Odezwij się bezpośrednio."}
          </h2>

          <p>
            {section.text ||
              "Telefon, e-mail i najważniejsze dane łowiska są tutaj pod ręką."}
          </p>

          <div className={styles.contactActions}>
            {phone ? (
              <a
                className={styles.primaryButton}
                href={`tel:${phone.replace(
                  /\s+/g,
                  ""
                )}`}
              >
                Zadzwoń
              </a>
            ) : null}

            {email ? (
              <a
                className={styles.outlineButton}
                href={`mailto:${email}`}
              >
                Napisz e-mail
              </a>
            ) : null}
          </div>
        </div>

        <div className={styles.contactData}>
          <ContactItem
            label="Telefon"
            value={phone || "—"}
            href={
              phone
                ? `tel:${phone.replace(
                    /\s+/g,
                    ""
                  )}`
                : undefined
            }
          />

          <ContactItem
            label="E-mail"
            value={email || "—"}
            href={
              email
                ? `mailto:${email}`
                : undefined
            }
          />

          <ContactItem
            label="Lokalizacja"
            value={
              [
                data.lake.city,
                data.lake.voivodeship,
              ]
                .filter(Boolean)
                .join(", ") || "—"
            }
          />

          <ContactItem
            label={website ? "WWW" : "Adres"}
            value={
              website
                ? website.replace(
                    /^https?:\/\//,
                    ""
                  )
                : address || "—"
            }
            href={
              website
                ? normalizeWildWaterUrl(
                    website
                  )
                : undefined
            }
            external={Boolean(website)}
          />
        </div>
      </div>
    </section>
  );
}

function ContactItem({
  label,
  value,
  href,
  external = false,
}: {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <span>{label}</span>
      <strong>{value}</strong>
    </>
  );

  if (!href) {
    return (
      <div className={styles.contactItem}>
        {content}
      </div>
    );
  }

  return (
    <a
      className={styles.contactItem}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      {content}
    </a>
  );
}
