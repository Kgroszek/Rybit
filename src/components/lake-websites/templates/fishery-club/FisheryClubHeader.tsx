"use client";

import { useState } from "react";

import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/fishery-club/FisheryClub.module.css";
import { getFisheryClubNavLabel } from "@/components/lake-websites/templates/fishery-club/fishery-club-utils";

export function FisheryClubHeader({
  siteName,
  logoUrl,
  city,
  sections,
}: {
  siteName: string;
  logoUrl: string | null;
  city: string;
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

  return (
    <>
      <header className={styles.header}>
        <div
          className={`${styles.container} ${styles.nav}`}
        >
          <a
            className={styles.brand}
            href="#fishery-club-start"
          >
            {logoUrl ? (
              <span className={styles.logoShell}>
                <img
                  src={logoUrl}
                  alt={siteName}
                  className={styles.logo}
                />
              </span>
            ) : (
              <span className={styles.brandBox}>
                FC
              </span>
            )}

            <span className={styles.brandText}>
              {siteName}
            </span>
          </a>

          <nav className={styles.navLinks}>
            {navigation.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
              >
                {getFisheryClubNavLabel(
                  section
                )}
              </a>
            ))}
          </nav>

          <div className={styles.navRight}>
            <span className={styles.statusDot} />
            <span>
              {city || "Łowisko wędkarskie"}
            </span>
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
          <nav className={styles.mobileMenu}>
            {navigation.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setOpen(false)}
              >
                {getFisheryClubNavLabel(
                  section
                )}
              </a>
            ))}

            {sections
              .filter(
                (section) =>
                  section.type === "contact"
              )
              .slice(0, 1)
              .map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  Kontakt
                </a>
              ))}
          </nav>
        ) : null}
      </header>

      <FisheryClubTicker
        siteName={siteName}
        city={city}
      />
    </>
  );
}

function FisheryClubTicker({
  siteName,
  city,
}: {
  siteName: string;
  city: string;
}) {
  const phrase = [
    siteName,
    "WODA",
    "RYBY",
    "ŁOWISKO",
    city,
  ]
    .filter(Boolean)
    .join(" / ");

  return (
    <div className={styles.ticker}>
      <div className={styles.tickerTrack}>
        {[0, 1, 2, 3].map((index) => (
          <span key={index}>
            {phrase} /{" "}
          </span>
        ))}
      </div>
    </div>
  );
}
