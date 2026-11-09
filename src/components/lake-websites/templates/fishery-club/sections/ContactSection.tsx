import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/fishery-club/FisheryClub.module.css";
import {
  getFisheryClubAddress,
  getFisheryClubEmail,
  getFisheryClubPhone,
  getFisheryClubWebsite,
  normalizeFisheryClubUrl,
} from "@/components/lake-websites/templates/fishery-club/fishery-club-utils";

export function ContactSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const phone = getFisheryClubPhone(data);
  const email = getFisheryClubEmail(data);
  const website =
    getFisheryClubWebsite(data);
  const address =
    getFisheryClubAddress(data);

  return (
    <section
      id={section.id}
      className={styles.contactSection}
    >
      <div
        className={`${styles.container} ${styles.contactShell}`}
      >
        <div className={styles.contactCopy}>
          <div>
            <span className={styles.label}>
              {section.eyebrow ||
                "Contact / 07"}
            </span>

            <h2>
              {section.title ||
                "Kontakt"}
            </h2>
          </div>

          <div>
            <p>
              {section.text ||
                "Telefon, e-mail i lokalizacja — wszystkie najważniejsze dane w jednym miejscu."}
            </p>

            {phone ? (
              <a
                className={
                  styles.orangeButton
                }
                href={`tel:${phone.replace(
                  /\s+/g,
                  ""
                )}`}
              >
                Zadzwoń teraz
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
                ? normalizeFisheryClubUrl(
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
