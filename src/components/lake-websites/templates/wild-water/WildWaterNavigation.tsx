"use client";

import { useState } from "react";

import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import styles from "@/components/lake-websites/templates/wild-water/WildWater.module.css";
import { getWildWaterNavLabel } from "@/components/lake-websites/templates/wild-water/wild-water-utils";

export function WildWaterNavigation({
  siteName,
  logoUrl,
  city,
  voivodeship,
  phone,
  sections,
}: {
  siteName: string;
  logoUrl: string | null;
  city: string;
  voivodeship: string;
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
        "contact",
      ].includes(section.type)
    )
    .slice(0, 6);

  const contact = sections.find(
    (section) => section.type === "contact"
  );

  return (
    <>
      <aside className={styles.sidebar}>
        <div>
          <Brand
            siteName={siteName}
            logoUrl={logoUrl}
          />

          <nav className={styles.sideNav}>
            {navigation.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
              >
                {getWildWaterNavLabel(section)}
              </a>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarMeta}>
            {city ? <>{city}<br /></> : null}
            {voivodeship ? (
              <>woj. {voivodeship}<br /></>
            ) : null}
            {phone ? (
              <>
                <br />
                <a href={`tel:${phone.replace(/\s+/g, "")}`}>
                  {phone}
                </a>
              </>
            ) : null}
          </div>

          {contact ? (
            <a
              className={styles.sidebarCta}
              href={`#${contact.id}`}
            >
              Zaplanuj wizytę
            </a>
          ) : null}
        </div>
      </aside>

      <header className={styles.mobileHeader}>
        <Brand
          siteName={siteName}
          logoUrl={logoUrl}
          compact
        />

        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() =>
            setOpen((current) => !current)
          }
          aria-label={
            open ? "Zamknij menu" : "Otwórz menu"
          }
          aria-expanded={open}
        >
          {open ? "×" : "☰"}
        </button>
      </header>

      {open ? (
        <nav className={styles.mobileMenu}>
          {navigation.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={() => setOpen(false)}
            >
              {getWildWaterNavLabel(section)}
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
      ) : null}
    </>
  );
}

function Brand({
  siteName,
  logoUrl,
  compact = false,
}: {
  siteName: string;
  logoUrl: string | null;
  compact?: boolean;
}) {
  return (
    <a
      className={styles.brand}
      href="#wild-water-start"
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
        <span className={styles.brandSymbol}>
          {siteName.charAt(0).toUpperCase()}
        </span>
      )}

      <span
        className={
          compact
            ? styles.brandTextCompact
            : styles.brandText
        }
      >
        {siteName}
      </span>
    </a>
  );
}
