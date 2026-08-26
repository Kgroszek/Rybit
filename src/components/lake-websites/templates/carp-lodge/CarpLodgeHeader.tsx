"use client";

import { useState } from "react";

import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/carp-lodge/CarpLodge.module.css";
import { getCarpLodgeNavLabel } from "@/components/lake-websites/templates/carp-lodge/carp-lodge-utils";

export function CarpLodgeHeader({
  siteName,
  logoUrl,
  phone,
  sections,
}: {
  siteName: string;
  logoUrl: string | null;
  phone: string;
  sections: LakeWebsiteSection[];
}) {
  const [open, setOpen] = useState(false);

  const navigation = sections
    .filter((section) =>
      [
        "about",
        "fish",
        "gallery",
        "priceList",
        "rules",
      ].includes(section.type)
    )
    .slice(0, 5);

  const contact = sections.find(
    (section) => section.type === "contact"
  );

  return (
    <>
      <div className={styles.topStrip}>
        <div
          className={`${styles.container} ${styles.topStripInner}`}
        >
          <span>
            {siteName} · łowisko wędkarskie
          </span>
          {phone ? (
            <a href={`tel:${phone.replace(/\s+/g, "")}`}>
              Rezerwacje: {phone}
            </a>
          ) : (
            <span>
              Skontaktuj się z łowiskiem
            </span>
          )}
        </div>
      </div>

      <header className={styles.header}>
        <div
          className={`${styles.container} ${styles.nav}`}
        >
          <a
            className={styles.brand}
            href="#carp-lodge-start"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                className={styles.brandLogo}
              />
            ) : (
              <>
                <span className={styles.brandMark}>
                  {siteName.charAt(0).toUpperCase()}
                </span>
                <span>{siteName}</span>
              </>
            )}
          </a>

          <nav className={styles.navLinks}>
            {navigation.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
              >
                {getCarpLodgeNavLabel(section)}
              </a>
            ))}
          </nav>

          <div className={styles.navRight}>
            {contact ? (
              <a
                className={styles.primaryButton}
                href={`#${contact.id}`}
              >
                Kontakt
              </a>
            ) : null}
          </div>

          <button
            type="button"
            className={styles.menuToggle}
            onClick={() =>
              setOpen((current) => !current)
            }
            aria-label={
              open
                ? "Zamknij menu"
                : "Otwórz menu"
            }
            aria-expanded={open}
          >
            {open ? "×" : "☰"}
          </button>
        </div>

        {open ? (
          <div className={styles.mobileMenu}>
            <nav className={styles.container}>
              {navigation.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setOpen(false)}
                >
                  {getCarpLodgeNavLabel(section)}
                </a>
              ))}

              {contact ? (
                <a
                  href={`#${contact.id}`}
                  onClick={() => setOpen(false)}
                >
                  Kontakt
                </a>
              ) : null}
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}
