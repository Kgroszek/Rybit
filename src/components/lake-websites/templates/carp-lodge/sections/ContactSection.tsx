import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/carp-lodge/CarpLodge.module.css";
import {
  getCarpLodgeAddress,
  getCarpLodgeEmail,
  getCarpLodgePhone,
  getCarpLodgeWebsite,
  normalizeCarpLodgeUrl,
} from "@/components/lake-websites/templates/carp-lodge/carp-lodge-utils";

export function ContactSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const phone = getCarpLodgePhone(data);
  const email = getCarpLodgeEmail(data);
  const website =
    getCarpLodgeWebsite(data);
  const address =
    getCarpLodgeAddress(data);

  return (
    <section
      id={section.id}
      className={styles.contactSection}
    >
      <div
        className={`${styles.container} ${styles.contactShell}`}
      >
        <div className={styles.contactCopy}>
          <span
            className={`${styles.label} ${styles.labelLight}`}
          >
            {section.eyebrow ||
              "Kontakt"}
          </span>

          <h2>
            {section.title ||
              "Zaplanuj swój czas nad wodą."}
          </h2>

          <p>
            {section.text ||
              "Skontaktuj się z łowiskiem i ustal wszystkie szczegóły przed przyjazdem."}
          </p>

          <div
            className={
              styles.contactActions
            }
          >
            {phone ? (
              <a
                className={
                  styles.primaryButton
                }
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
                className={
                  styles.darkOutlineButton
                }
                href={`mailto:${email}`}
              >
                Napisz e-mail
              </a>
            ) : null}
          </div>
        </div>

        <div className={styles.contactPanel}>
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
              address ||
              [
                data.lake.city,
                data.lake.voivodeship,
              ]
                .filter(Boolean)
                .join(", ") ||
              "—"
            }
          />

          <ContactItem
            label="WWW"
            value={
              website
                ? website.replace(
                    /^https?:\/\//,
                    ""
                  )
                : "—"
            }
            href={
              website
                ? normalizeCarpLodgeUrl(
                    website
                  )
                : undefined
            }
            external
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
      target={
        external ? "_blank" : undefined
      }
      rel={
        external
          ? "noreferrer"
          : undefined
      }
    >
      {content}
    </a>
  );
}
