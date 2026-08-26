"use client";

import { useState } from "react";

import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import { getNavLabel } from "@/components/lake-websites/templates/waterline/waterline-utils";

export function WaterlineHeader({
  siteName,
  logoUrl,
  sections,
}: {
  siteName: string;
  logoUrl: string | null;
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

  const contactSection = sections.find(
    (section) =>
      section.type === "contact"
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#16211D]/[.08] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] w-[min(1260px,calc(100%-40px))] items-center justify-between gap-8 max-[720px]:h-[66px] max-[720px]:w-[calc(100%-28px)]">
        <a
          href="#start"
          className="flex min-w-0 items-center gap-3"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={siteName}
              className="h-9 max-w-[180px] object-contain"
            />
          ) : (
            <>
              <span className="h-[34px] w-[10px] shrink-0 rounded-full bg-[linear-gradient(180deg,var(--waterline-primary),var(--waterline-accent))]" />
              <span className="truncate text-[18px] font-black tracking-[-0.03em] text-[#16211D]">
                {siteName}
              </span>
            </>
          )}
        </a>

        <nav
          className="hidden items-center gap-7 text-[13px] font-bold text-[#42504A] lg:flex"
          aria-label="Główna nawigacja"
        >
          {navigation.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="transition hover:text-[var(--waterline-primary)]"
            >
              {getNavLabel(section)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {contactSection ? (
            <a
              href={`#${contactSection.id}`}
              className="hidden min-h-12 items-center justify-center rounded-full bg-[var(--waterline-primary)] px-[22px] text-[13px] font-extrabold text-[var(--waterline-primary-contrast)] transition hover:-translate-y-0.5 sm:inline-flex"
            >
              Kontakt
            </a>
          ) : null}

          <button
            type="button"
            aria-label={
              open
                ? "Zamknij menu"
                : "Otwórz menu"
            }
            aria-expanded={open}
            onClick={() =>
              setOpen((current) => !current)
            }
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-[#DFE4DE] bg-white text-lg text-[#16211D] max-lg:flex"
          >
            {open ? "×" : "☰"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-full border-y border-[#DFE4DE] bg-white px-5 py-4 shadow-xl lg:hidden">
          <nav className="mx-auto grid max-w-[1260px]">
            {navigation.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setOpen(false)}
                className="border-b border-[#DFE4DE] py-3.5 text-sm font-bold text-[#16211D]"
              >
                {getNavLabel(section)}
              </a>
            ))}

            {contactSection ? (
              <a
                href={`#${contactSection.id}`}
                onClick={() => setOpen(false)}
                className="mt-4 flex min-h-11 items-center justify-center rounded-full bg-[var(--waterline-primary)] px-5 text-sm font-extrabold text-[var(--waterline-primary-contrast)]"
              >
                Kontakt
              </a>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
