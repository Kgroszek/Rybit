import type { CSSProperties, ReactNode } from "react";

import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";
import {
  LakeWebsiteMobileNav,
  type LakeWebsiteNavItem,
} from "@/components/lake-websites/LakeWebsiteMobileNav";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import type { LakeWebsiteTemplateKey } from "@/lib/lake-websites";

type Theme = LakeWebsiteTemplateKey;

export function LakeWebsiteSectionsPage({
  data,
  theme,
  editorMode,
  selectedSectionId,
}: {
  data: PublicLakeWebsiteData;
  theme: Theme;
  editorMode: boolean;
  selectedSectionId: string | null;
}) {
  const { website, lake } = data;
  const siteName = website.siteName || lake.name;

  const style = {
    "--site-primary": website.primaryColor,
    "--site-accent": website.accentColor,
    "--site-bg": website.backgroundColor,
    "--site-text": website.textColor,
  } as CSSProperties;

  const navigationSections = website.sections.filter((section) =>
    ["about", "gallery", "fish", "priceList", "rules", "contact"].includes(
      section.type
    )
  );

  const navItems: LakeWebsiteNavItem[] = navigationSections
    .slice(0, 6)
    .map((section) => ({
      id: section.id,
      label: getNavLabel(section),
    }));

  const contactSection = website.sections.find(
    (section) => section.type === "contact"
  );

  return (
    <div style={style} className={rootClass(theme)}>
      <SiteHeader
        data={data}
        theme={theme}
        siteName={siteName}
        navItems={navItems}
        contactId={contactSection?.id || null}
      />

      <main>
        {website.sections.map((section, index) => (
          <EditableSectionShell
            key={section.id}
            id={section.id}
            editorMode={editorMode}
            selected={selectedSectionId === section.id}
          >
            <LakeSection
              section={section}
              data={data}
              theme={theme}
              index={index}
            />
          </EditableSectionShell>
        ))}
      </main>

      <footer className={footerClass(theme)}>
        <div className="mx-auto grid w-full max-w-[1440px] gap-5 px-5 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <strong className={footerBrandClass(theme)}>
              {siteName}
            </strong>
            <p className="mt-2 text-xs opacity-45">
              {lake.city} · woj. {lake.voivodeship}
            </p>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-35">
            Strona łowiska
          </p>
        </div>
      </footer>
    </div>
  );
}

function SiteHeader({
  data,
  theme,
  siteName,
  navItems,
  contactId,
}: {
  data: PublicLakeWebsiteData;
  theme: Theme;
  siteName: string;
  navItems: LakeWebsiteNavItem[];
  contactId: string | null;
}) {
  const { website } = data;

  return (
    <header className={headerClass(theme)}>
      <div className={headerInnerClass(theme)}>
        <a href="#start" className="flex min-w-0 items-center gap-3">
          {website.logoUrl ? (
            <img
              src={website.logoUrl}
              alt={siteName}
              className="h-10 max-w-[190px] object-contain"
            />
          ) : (
            <>
              {theme === "fishery-club" && (
                <span
                  className="h-3 w-3 shrink-0"
                  style={{ backgroundColor: "var(--site-accent)" }}
                />
              )}
              <span className={logoTextClass(theme)}>
                {siteName}
              </span>
            </>
          )}
        </a>

        <nav className={navClass(theme)}>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="transition-opacity hover:opacity-55"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {contactId &&
            (theme === "waterline" || theme === "carp-lodge") && (
              <a
                href={`#${contactId}`}
                className={headerCtaClass(theme)}
              >
                Kontakt
              </a>
            )}

          <LakeWebsiteMobileNav
            items={navItems}
            contactId={contactId}
            dark={theme === "carp-lodge"}
            editorial={theme === "fishery-club"}
          />
        </div>
      </div>
    </header>
  );
}

function EditableSectionShell({
  id,
  editorMode,
  selected,
  children,
}: {
  id: string;
  editorMode: boolean;
  selected: boolean;
  children: ReactNode;
}) {
  return (
    <div
      data-lake-section-id={id}
      className={`relative ${
        editorMode ? "cursor-pointer" : ""
      } ${
        selected
          ? "z-10 outline outline-[3px] outline-blue-500 outline-offset-[-3px]"
          : editorMode
            ? "hover:outline hover:outline-2 hover:outline-blue-400/70 hover:outline-offset-[-2px]"
            : ""
      }`}
    >
      {selected && editorMode && (
        <div className="pointer-events-none absolute left-3 top-3 z-50 rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-lg">
          Edytowana sekcja
        </div>
      )}
      {children}
    </div>
  );
}

function LakeSection({
  section,
  data,
  theme,
  index,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
  theme: Theme;
  index: number;
}) {
  if (section.type === "hero") {
    return <HeroSection section={section} data={data} theme={theme} />;
  }

  if (section.type === "about") {
    return (
      <AboutSection
        section={section}
        data={data}
        theme={theme}
        index={index}
      />
    );
  }

  if (section.type === "gallery") {
    return (
      <GallerySection
        section={section}
        data={data}
        theme={theme}
        index={index}
      />
    );
  }

  if (section.type === "fish") {
    return (
      <FishSection
        section={section}
        data={data}
        theme={theme}
        index={index}
      />
    );
  }

  if (section.type === "priceList") {
    return (
      <SimpleListSection
        section={section}
        theme={theme}
        index={index}
        items={
          section.dataSource === "custom"
            ? (section.items || []).map((text, itemIndex) => ({
                id: `custom-price-${itemIndex}`,
                text,
              }))
            : data.lake.priceList
        }
        empty="Aktualny cennik dostępny jest u właściciela."
      />
    );
  }

  if (section.type === "rules") {
    return (
      <SimpleListSection
        section={section}
        theme={theme}
        index={index}
        items={
          section.dataSource === "custom"
            ? (section.items || []).map((text, itemIndex) => ({
                id: `custom-rule-${itemIndex}`,
                text,
              }))
            : data.lake.rules
        }
        empty="Szczegółowe zasady dostępne są u właściciela łowiska."
      />
    );
  }

  if (section.type === "contact") {
    return (
      <ContactSection
        section={section}
        data={data}
        theme={theme}
        index={index}
      />
    );
  }

  return (
    <CtaSection
      section={section}
      data={data}
      theme={theme}
      index={index}
    />
  );
}

function HeroSection({
  section,
  data,
  theme,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
  theme: Theme;
}) {
  const imageUrl =
    section.imageUrl || data.lake.images[0]?.url || "";

  const fishCount =
    data.lake.fishSpecies.length ||
    data.lake.fish
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean).length;

  if (theme === "carp-lodge") {
    return (
      <section
        id="start"
        className="relative overflow-hidden bg-[#0D1110] text-[#F4F0E7]"
      >
        <div className="mx-auto grid min-h-[780px] w-full max-w-[1560px] lg:grid-cols-[.82fr_1.18fr]">
          <div className="relative z-10 flex flex-col justify-between px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--site-primary)]">
              <span className="h-px w-10 bg-[var(--site-primary)]" />
              {section.eyebrow}
            </div>

            <div className="py-14 lg:py-20">
              <h1 className="max-w-[720px] text-5xl font-extrabold uppercase leading-[0.89] tracking-[-0.06em] sm:text-7xl xl:text-[94px]">
                {section.title || data.lake.name}
              </h1>

              {section.subtitle && (
                <p className="mt-8 max-w-xl text-base leading-8 text-[#F4F0E7]/58">
                  {section.subtitle}
                </p>
              )}

              <SectionButton section={section} theme={theme} />
            </div>

            <HeroMeta
              theme={theme}
              city={data.lake.city}
              voivodeship={data.lake.voivodeship}
              fishCount={fishCount}
            />
          </div>

          <div className="relative min-h-[540px] overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover contrast-[1.03] saturate-[.85]"
              />
            ) : (
              <div className="absolute inset-0 bg-[#202822]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D1110]/55 via-transparent to-transparent" />
            <div className="absolute bottom-8 right-8 border border-white/15 bg-black/20 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 backdrop-blur">
              Private water
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (theme === "wild-water") {
    return (
      <section id="start" className="overflow-hidden bg-[#F4F0E5]">
        <div className="mx-auto grid min-h-[750px] w-full max-w-[1420px] gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[.88fr_1.12fr] lg:items-center lg:py-20">
          <div className="relative z-10 py-8">
            <Eyebrow theme={theme}>{section.eyebrow}</Eyebrow>

            <h1 className="mt-5 max-w-[700px] font-serif text-5xl font-medium leading-[.98] tracking-[-0.045em] text-[#263129] sm:text-7xl lg:text-[82px]">
              {section.title || data.lake.name}
            </h1>

            {section.subtitle && (
              <p className="mt-7 max-w-xl text-base leading-8 text-[#263129]/62 sm:text-lg">
                {section.subtitle}
              </p>
            )}

            <SectionButton section={section} theme={theme} />

            <div className="mt-10 grid max-w-lg grid-cols-2 gap-x-8 gap-y-5 border-t border-[#263129]/12 pt-6 sm:grid-cols-3">
              <MiniMeta label="Miejsce" value={data.lake.city} />
              <MiniMeta label="Region" value={data.lake.voivodeship} />
              <MiniMeta label="Gatunki" value={`${fishCount}`} />
            </div>
          </div>

          <div className="relative pb-10 pt-4">
            <div className="absolute -left-6 top-0 h-24 w-24 rounded-full border border-black/10" />
            <div className="absolute -bottom-2 right-8 h-36 w-36 rounded-full bg-[var(--site-accent)]/10" />

            <div className="relative overflow-hidden rounded-[52%_48%_46%_54%/42%_44%_56%_58%] bg-[#D8D0BE] shadow-[0_35px_80px_rgba(38,49,41,.13)]">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="h-[600px] w-full object-cover saturate-[.84]"
                />
              ) : (
                <div className="h-[600px]" />
              )}
            </div>

            <div className="absolute bottom-0 left-0 max-w-[230px] rounded-[26px_6px_26px_6px] bg-[var(--site-primary)] p-5 text-white shadow-xl">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/55">
                Nad wodą
              </p>
              <p className="mt-2 text-sm font-semibold leading-6">
                Cisza, natura i własny rytm.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (theme === "fishery-club") {
    return (
      <section
        id="start"
        className="relative min-h-[80vh] overflow-hidden bg-black text-white"
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-52 grayscale-[.18]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/10" />

        <div className="relative mx-auto flex min-h-[80vh] w-full max-w-[1540px] flex-col justify-between px-5 py-10 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between border-b border-white/30 pb-4 text-[9px] font-bold uppercase tracking-[0.22em]">
            <span>{section.eyebrow || "Fishery / Poland"}</span>
            <span>
              {data.lake.city} / {data.lake.voivodeship}
            </span>
          </div>

          <div className="py-16">
            <h1 className="max-w-[1100px] font-serif text-5xl font-black uppercase leading-[0.84] tracking-[-0.065em] sm:text-7xl lg:text-[108px]">
              {section.title || data.lake.name}
            </h1>

            <div className="mt-8 grid max-w-5xl gap-7 border-t border-white/30 pt-6 md:grid-cols-[1fr_auto] md:items-end">
              {section.subtitle && (
                <p className="max-w-xl text-sm leading-7 text-white/62 sm:text-base">
                  {section.subtitle}
                </p>
              )}
              <SectionButton section={section} theme={theme} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-white/20 pt-4 text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 sm:max-w-lg">
            <span>{fishCount} gatunków</span>
            <span>{data.lake.city}</span>
            <span>Rybio / fishery</span>
          </div>
        </div>
      </section>
    );
  }

  // WATERLINE
  return (
    <section
      id="start"
      className="relative flex min-h-[84vh] items-end overflow-hidden bg-[#071526] text-white"
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-82"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#061321] via-[#061321]/30 to-black/5" />
      <div className="absolute inset-y-0 right-0 hidden w-[34%] border-l border-white/10 bg-white/[.025] lg:block" />
      <div className="absolute right-[10%] top-[18%] hidden h-44 w-44 rounded-full border border-white/18 lg:block" />

      <div className="relative mx-auto w-full max-w-[1500px] px-5 pb-14 pt-32 sm:px-8 sm:pb-20">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_320px]">
          <div className="max-w-5xl">
            <Eyebrow theme={theme}>{section.eyebrow}</Eyebrow>

            <h1 className="mt-5 text-5xl font-extrabold leading-[0.93] tracking-[-0.06em] sm:text-7xl lg:text-[96px]">
              {section.title || data.lake.name}
            </h1>

            <div className="mt-8 grid gap-5 border-t border-white/20 pt-6 md:grid-cols-[1fr_auto] md:items-end">
              {section.subtitle && (
                <p className="max-w-2xl text-base leading-8 text-white/68">
                  {section.subtitle}
                </p>
              )}
              <SectionButton section={section} theme={theme} />
            </div>
          </div>

          <div className="hidden border-l border-white/15 pl-7 lg:block">
            <HeroMeta
              theme={theme}
              city={data.lake.city}
              voivodeship={data.lake.voivodeship}
              fishCount={fishCount}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection({
  section,
  data,
  theme,
  index,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
  theme: Theme;
  index: number;
}) {
  const imageUrl =
    section.imageUrl ||
    data.lake.images[1]?.url ||
    data.lake.images[0]?.url;

  const hasImage = section.variant !== "text" && imageUrl;
  const imageLeft = section.variant === "image-left";

  if (theme === "fishery-club") {
    return (
      <section id={section.id} className="bg-white text-black">
        <div className="mx-auto grid w-full max-w-[1480px] gap-10 border-b border-black px-5 py-20 sm:px-8 lg:grid-cols-[250px_1fr] lg:py-28">
          <SectionNumber index={index} theme={theme} eyebrow={section.eyebrow} />
          <div>
            <h2 className="max-w-5xl font-serif text-4xl font-black uppercase leading-[.95] tracking-[-0.05em] sm:text-6xl">
              {section.title || "O łowisku"}
            </h2>
            <p className="mt-8 max-w-3xl text-base leading-8 text-black/63 sm:text-lg">
              {section.text || data.lake.description}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={section.id}
      className={
        theme === "carp-lodge"
          ? "border-y border-white/10 bg-[#111715] text-[#F4F0E7]"
          : theme === "wild-water"
            ? "bg-[#EAE4D6] text-[#263129]"
            : "bg-white text-[#0B1628]"
      }
    >
      <div
        className={`mx-auto grid w-full gap-12 px-5 py-20 sm:px-8 lg:py-28 ${
          hasImage ? "lg:grid-cols-2 lg:items-center" : "max-w-[1050px]"
        } ${hasImage ? "max-w-[1360px]" : ""}`}
      >
        {hasImage && imageLeft && <SectionImage url={imageUrl} theme={theme} />}

        <div>
          <Eyebrow theme={theme}>{section.eyebrow}</Eyebrow>
          <h2 className={sectionTitleClass(theme)}>
            {section.title || "O łowisku"}
          </h2>
          <p className={bodyLeadClass(theme)}>
            {section.text || data.lake.description}
          </p>
        </div>

        {hasImage && !imageLeft && <SectionImage url={imageUrl} theme={theme} />}
      </div>
    </section>
  );
}

function GallerySection({
  section,
  data,
  theme,
  index,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
  theme: Theme;
  index: number;
}) {
  const images =
    section.images && section.images.length > 0
      ? section.images
      : data.lake.images.map((image) => image.url);

  const background =
    theme === "carp-lodge"
      ? "bg-[#0D1110] text-[#F4F0E7]"
      : theme === "wild-water"
        ? "bg-[#F4F0E5] text-[#263129]"
        : theme === "fishery-club"
          ? "bg-[#F2F2EF] text-black"
          : "bg-[#F4F8FC] text-[#0B1628]";

  return (
    <section id={section.id} className={background}>
      <div className="mx-auto w-full max-w-[1480px] px-5 py-20 sm:px-8 lg:py-28">
        {theme === "fishery-club" ? (
          <div className="grid gap-6 border-b border-black pb-6 md:grid-cols-[250px_1fr]">
            <SectionNumber index={index} theme={theme} eyebrow={section.eyebrow} />
            <div>
              <h2 className={sectionTitleClass(theme)}>
                {section.title || "Galeria"}
              </h2>
              {section.subtitle && (
                <p className="mt-3 max-w-2xl text-sm leading-7 opacity-60">
                  {section.subtitle}
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <Eyebrow theme={theme}>{section.eyebrow}</Eyebrow>
            <h2 className={sectionTitleClass(theme)}>
              {section.title || "Galeria"}
            </h2>
            {section.subtitle && (
              <p className="mt-3 max-w-2xl text-sm leading-7 opacity-60">
                {section.subtitle}
              </p>
            )}
          </>
        )}

        {images.length > 0 ? (
          <GalleryGrid images={images} theme={theme} variant={section.variant} />
        ) : (
          <EmptySectionText text="Dodaj zdjęcia w panelu edycji." theme={theme} />
        )}
      </div>
    </section>
  );
}

function GalleryGrid({
  images,
  theme,
  variant,
}: {
  images: string[];
  theme: Theme;
  variant: string;
}) {
  if (theme === "fishery-club") {
    return (
      <div className="mt-8 grid gap-2 md:grid-cols-12">
        {images.slice(0, 8).map((url, index) => (
          <figure
            key={`${url}-${index}`}
            className={`group relative overflow-hidden bg-black ${
              index % 4 === 0
                ? "md:col-span-7"
                : index % 4 === 1
                  ? "md:col-span-5"
                  : "md:col-span-6"
            }`}
          >
            <img
              src={url}
              alt=""
              className={`w-full object-cover transition duration-700 group-hover:scale-[1.025] ${
                index < 2 ? "h-[470px]" : "h-[340px]"
              }`}
            />
            <figcaption className="absolute bottom-3 left-3 bg-black px-2 py-1 text-[9px] font-bold uppercase tracking-[.15em] text-white">
              {String(index + 1).padStart(2, "0")}
            </figcaption>
          </figure>
        ))}
      </div>
    );
  }

  if (theme === "waterline") {
    return (
      <div className="mt-10 grid gap-4 md:grid-cols-12">
        {images.slice(0, 8).map((url, index) => (
          <div
            key={`${url}-${index}`}
            className={`group overflow-hidden rounded-[30px] bg-slate-200 ${
              index === 0
                ? "md:col-span-7"
                : index === 1
                  ? "md:col-span-5"
                  : "md:col-span-4"
            }`}
          >
            <img
              src={url}
              alt=""
              className={`w-full object-cover transition duration-700 group-hover:scale-[1.025] ${
                index < 2 ? "h-[480px]" : "h-[295px]"
              }`}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`mt-9 grid gap-5 ${
        variant === "wide"
          ? "md:grid-cols-2"
          : "md:grid-cols-2 xl:grid-cols-3"
      }`}
    >
      {images.slice(0, 10).map((url, index) => (
        <div
          key={`${url}-${index}`}
          className={`group overflow-hidden bg-black/5 ${
            theme === "wild-water"
              ? index % 2
                ? "rounded-[8px_38px_8px_38px]"
                : "rounded-[38px_8px_38px_8px]"
              : "rounded-2xl"
          }`}
        >
          <img
            src={url}
            alt=""
            className="h-[370px] w-full object-cover transition duration-700 group-hover:scale-[1.025]"
          />
        </div>
      ))}
    </div>
  );
}

function FishSection({
  section,
  data,
  theme,
  index,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
  theme: Theme;
  index: number;
}) {
  const fishFromRybio =
    data.lake.fishSpecies.length > 0
      ? data.lake.fishSpecies.map((item) => item.name)
      : data.lake.fish
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

  const fish =
    section.dataSource === "custom"
      ? section.items || []
      : fishFromRybio;

  const editorial = theme === "fishery-club";
  const dark = theme === "carp-lodge";

  return (
    <section
      id={section.id}
      className={
        dark
          ? "bg-[#151B18] text-[#F4F0E7]"
          : editorial
            ? "bg-white text-black"
            : ""
      }
    >
      <div className="mx-auto w-full max-w-[1340px] px-5 py-20 sm:px-8 lg:py-24">
        {editorial ? (
          <SectionNumber index={index} theme={theme} eyebrow={section.eyebrow} />
        ) : (
          <Eyebrow theme={theme}>{section.eyebrow}</Eyebrow>
        )}

        <h2 className={sectionTitleClass(theme)}>
          {section.title || "Ryby"}
        </h2>

        {section.subtitle && (
          <p className="mt-3 max-w-2xl text-sm leading-7 opacity-60">
            {section.subtitle}
          </p>
        )}

        {dark || editorial ? (
          <div className="mt-10 border-t border-current/20">
            {fish.map((item, fishIndex) => (
              <div
                key={item}
                className="group grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-current/15 py-5 transition hover:pl-2"
              >
                <span className="text-xs font-bold opacity-35">
                  {String(fishIndex + 1).padStart(2, "0")}
                </span>

                <span
                  className={
                    editorial
                      ? "font-serif text-2xl font-black uppercase tracking-[-.035em]"
                      : "text-xl font-bold uppercase tracking-[-0.02em]"
                  }
                >
                  {item}
                </span>

                <span className="text-[9px] font-bold uppercase tracking-[.15em] opacity-30">
                  species
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-9 flex flex-wrap gap-3">
            {fish.map((item) => (
              <span
                key={item}
                className={`rounded-full px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 ${
                  theme === "wild-water"
                    ? "border border-black/10 bg-white/35"
                    : "bg-white shadow-sm ring-1 ring-slate-200"
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SimpleListSection({
  section,
  theme,
  index,
  items,
  empty,
}: {
  section: LakeWebsiteSection;
  theme: Theme;
  index: number;
  items: Array<{ id: string; text: string }>;
  empty: string;
}) {
  const dark = theme === "carp-lodge";
  const editorial = theme === "fishery-club";

  return (
    <section
      id={section.id}
      className={
        dark
          ? "bg-[#0D1110] text-[#F4F0E7]"
          : editorial
            ? "bg-white text-black"
            : theme === "wild-water"
              ? "bg-[#EAE4D6] text-[#263129]"
              : "bg-[#081726] text-white"
      }
    >
      <div className="mx-auto w-full max-w-[1120px] px-5 py-20 sm:px-8 lg:py-24">
        {editorial ? (
          <SectionNumber index={index} theme={theme} eyebrow={section.eyebrow} />
        ) : (
          <Eyebrow
            theme={theme}
            inverse={theme === "waterline" || dark}
          >
            {section.eyebrow}
          </Eyebrow>
        )}

        <h2 className={sectionTitleClass(theme)}>
          {section.title}
        </h2>

        {section.subtitle && (
          <p className="mt-3 max-w-2xl text-sm leading-7 opacity-60">
            {section.subtitle}
          </p>
        )}

        <div className="mt-9 divide-y divide-current/15 border-t border-current/15">
          {items.length > 0 ? (
            items.map((item, itemIndex) => (
              <div
                key={item.id}
                className="grid gap-3 py-5 md:grid-cols-[58px_1fr]"
              >
                <span className="text-xs font-bold opacity-30">
                  {String(itemIndex + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-7 opacity-75">
                  {item.text}
                </p>
              </div>
            ))
          ) : (
            <p className="py-5 text-sm opacity-60">{empty}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function ContactSection({
  section,
  data,
  theme,
  index,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
  theme: Theme;
  index: number;
}) {
  const phone = data.website.contactPhone || data.lake.contactPhone;
  const email = data.website.contactEmail || data.lake.contactEmail;
  const website =
    data.website.contactWebsite || data.lake.contactWebsite;

  return (
    <section
      id={section.id}
      className={
        theme === "carp-lodge"
          ? "bg-[#151B18] text-[#F4F0E7]"
          : theme === "wild-water"
            ? "bg-[#F4F0E5] text-[#263129]"
            : "bg-white text-black"
      }
    >
      <div className="mx-auto grid w-full max-w-[1340px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:py-28">
        <div>
          {theme === "fishery-club" ? (
            <SectionNumber index={index} theme={theme} eyebrow={section.eyebrow} />
          ) : (
            <Eyebrow theme={theme}>{section.eyebrow}</Eyebrow>
          )}

          <h2 className={sectionTitleClass(theme)}>
            {section.title || "Kontakt"}
          </h2>

          {section.text && (
            <p className="mt-5 max-w-sm text-sm leading-7 opacity-60">
              {section.text}
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ContactCard
            label="Telefon"
            value={phone}
            href={`tel:${phone}`}
            theme={theme}
          />
          <ContactCard
            label="E-mail"
            value={email}
            href={`mailto:${email}`}
            theme={theme}
          />
          <ContactCard
            label="Adres"
            value={`${data.lake.street}, ${data.lake.postalCode} ${data.lake.city}`}
            theme={theme}
          />
          <ContactCard
            label="Strona"
            value={website}
            href={website}
            theme={theme}
          />
        </div>
      </div>
    </section>
  );
}

function CtaSection({
  section,
  data,
  theme,
  index,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
  theme: Theme;
  index: number;
}) {
  const image = section.imageUrl || data.lake.images[0]?.url;

  return (
    <section
      id={section.id}
      className={`relative overflow-hidden ${
        theme === "fishery-club"
          ? "bg-[var(--site-accent)] text-black"
          : "text-white"
      }`}
      style={
        theme === "fishery-club"
          ? undefined
          : { backgroundColor: data.website.primaryColor }
      }
    >
      {section.variant === "image" && image && (
        <>
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-black/55" />
        </>
      )}

      <div
        className={`relative mx-auto w-full px-5 py-20 sm:px-8 lg:py-28 ${
          theme === "fishery-club"
            ? "max-w-[1480px] text-left"
            : "max-w-[1120px] text-center"
        }`}
      >
        {theme === "fishery-club" ? (
          <SectionNumber index={index} theme={theme} eyebrow={section.eyebrow} />
        ) : (
          <Eyebrow theme={theme} inverse>
            {section.eyebrow}
          </Eyebrow>
        )}

        <h2
          className={
            theme === "fishery-club"
              ? "mt-4 max-w-5xl font-serif text-5xl font-black uppercase leading-[.9] tracking-[-0.055em] sm:text-7xl"
              : theme === "wild-water"
                ? "mt-4 font-serif text-4xl font-medium tracking-[-.04em] sm:text-5xl"
                : "mt-4 text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl"
          }
        >
          {section.title}
        </h2>

        {section.text && (
          <p
            className={`mt-5 text-sm leading-7 ${
              theme === "fishery-club"
                ? "max-w-2xl text-black/62"
                : "mx-auto max-w-2xl text-white/72"
            }`}
          >
            {section.text}
          </p>
        )}

        <SectionButton section={section} theme={theme} inverse />
      </div>
    </section>
  );
}

function HeroMeta({
  theme,
  city,
  voivodeship,
  fishCount,
}: {
  theme: Theme;
  city: string;
  voivodeship: string;
  fishCount: number;
}) {
  const line =
    theme === "carp-lodge" ? "border-white/10" : "border-white/15";

  return (
    <div className={`grid grid-cols-3 border-t ${line} pt-5`}>
      <MiniMeta label="Miejsce" value={city} inverse />
      <MiniMeta label="Region" value={voivodeship} inverse />
      <MiniMeta label="Gatunki" value={`${fishCount}`} inverse />
    </div>
  );
}

function MiniMeta({
  label,
  value,
  inverse = false,
}: {
  label: string;
  value: string;
  inverse?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p
        className={`text-[8px] font-bold uppercase tracking-[0.17em] ${
          inverse ? "text-white/35" : "opacity-35"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1 truncate text-xs font-bold ${
          inverse ? "text-white/75" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SectionNumber({
  index,
  theme,
  eyebrow,
}: {
  index: number;
  theme: Theme;
  eyebrow?: string;
}) {
  return (
    <div className="flex items-baseline gap-4">
      <span
        className="text-xs font-black"
        style={{
          color: theme === "fishery-club" ? "var(--site-accent)" : undefined,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      {eyebrow && (
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-50">
          {eyebrow.replace(/^\d+\s*\/\s*/, "")}
        </p>
      )}
    </div>
  );
}

function SectionButton({
  section,
  theme,
  inverse = false,
}: {
  section: LakeWebsiteSection;
  theme: Theme;
  inverse?: boolean;
}) {
  if (!section.buttonLabel || !section.buttonHref) {
    return null;
  }

  const classes =
    theme === "fishery-club"
      ? "border border-current bg-transparent uppercase tracking-[0.12em] hover:bg-black hover:text-white"
      : theme === "carp-lodge"
        ? "border border-[var(--site-primary)] bg-[var(--site-primary)] text-[#0D1110] hover:opacity-85"
        : theme === "wild-water"
          ? "rounded-full bg-[var(--site-primary)] text-white hover:opacity-85"
          : inverse
            ? "rounded-2xl bg-white text-[#0B1628] hover:bg-white/85"
            : "rounded-2xl bg-[var(--site-primary)] text-white hover:opacity-85";

  return (
    <div className="mt-8">
      <a
        href={section.buttonHref}
        className={`inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold transition ${classes}`}
      >
        {section.buttonLabel}
        <span className="ml-3 text-base leading-none">↗</span>
      </a>
    </div>
  );
}

function SectionImage({
  url,
  theme,
}: {
  url: string;
  theme: Theme;
}) {
  return (
    <div
      className={`group overflow-hidden bg-black/5 ${
        theme === "waterline"
          ? "rounded-[36px]"
          : theme === "wild-water"
            ? "rounded-[42px_8px_42px_8px]"
            : "rounded-none"
      }`}
    >
      <img
        src={url}
        alt=""
        className="h-[490px] w-full object-cover transition duration-700 group-hover:scale-[1.02]"
      />
    </div>
  );
}

function Eyebrow({
  children,
  theme,
  inverse = false,
}: {
  children?: ReactNode;
  theme: Theme;
  inverse?: boolean;
}) {
  if (!children) {
    return null;
  }

  const classes =
    theme === "fishery-club"
      ? "text-black"
      : theme === "carp-lodge"
        ? "text-[var(--site-primary)]"
        : theme === "wild-water"
          ? "text-[var(--site-primary)]"
          : inverse
            ? "text-white/55"
            : "text-[var(--site-primary)]";

  return (
    <p
      className={`text-[10px] font-bold uppercase tracking-[0.22em] ${classes}`}
    >
      {children}
    </p>
  );
}

function ContactCard({
  label,
  value,
  href,
  theme,
}: {
  label: string;
  value?: string | null;
  href?: string | null;
  theme: Theme;
}) {
  if (!value) {
    return null;
  }

  const cls =
    theme === "carp-lodge"
      ? "border border-white/10 bg-white/[.035] hover:bg-white/[.055]"
      : theme === "wild-water"
        ? "border border-[var(--site-primary)]/15 bg-white/35 rounded-[28px_6px_28px_6px] hover:bg-white/50"
        : theme === "fishery-club"
          ? "border-t border-black bg-transparent rounded-none hover:bg-black/[.025]"
          : "rounded-3xl bg-[#F4F8FC] hover:bg-[#EDF5FC]";

  return (
    <div className={`p-5 transition ${cls}`}>
      <p className="text-[9px] font-bold uppercase tracking-[0.17em] opacity-38">
        {label}
      </p>

      {href ? (
        <a
          href={href}
          className="mt-3 block break-words text-sm font-bold hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="mt-3 text-sm font-bold">{value}</p>
      )}
    </div>
  );
}

function EmptySectionText({
  text,
  theme,
}: {
  text: string;
  theme: Theme;
}) {
  return (
    <div
      className={`mt-8 border border-dashed px-6 py-12 text-center text-sm opacity-45 ${
        theme === "waterline" ? "rounded-3xl" : ""
      }`}
    >
      {text}
    </div>
  );
}

function rootClass(theme: Theme) {
  if (theme === "carp-lodge") {
    return "min-h-screen bg-[#0D1110] font-sans text-[#F4F0E7] antialiased";
  }

  if (theme === "wild-water") {
    return "min-h-screen bg-[#F4F0E5] font-sans text-[#263129] antialiased";
  }

  if (theme === "fishery-club") {
    return "min-h-screen bg-white font-sans text-black antialiased";
  }

  return "min-h-screen bg-white font-sans text-[#0B1628] antialiased";
}

function headerClass(theme: Theme) {
  if (theme === "carp-lodge") {
    return "sticky top-0 z-40 border-b border-white/10 bg-[#0D1110]/92 text-[#F4F0E7] backdrop-blur-xl";
  }

  if (theme === "wild-water") {
    return "sticky top-0 z-40 border-b border-[#263129]/10 bg-[#F4F0E5]/94 text-[#263129] backdrop-blur-xl";
  }

  if (theme === "fishery-club") {
    return "sticky top-0 z-40 border-b border-black bg-white text-black";
  }

  return "sticky top-0 z-40 border-b border-[#0B1628]/10 bg-white/92 text-[#0B1628] backdrop-blur-xl";
}

function headerInnerClass(theme: Theme) {
  return `relative mx-auto flex w-full items-center justify-between gap-6 px-5 sm:px-8 ${
    theme === "fishery-club"
      ? "h-[72px] max-w-[1540px]"
      : "h-20 max-w-[1500px]"
  }`;
}

function logoTextClass(theme: Theme) {
  if (theme === "fishery-club") {
    return "truncate font-serif text-xl font-black uppercase tracking-[-0.045em]";
  }

  if (theme === "wild-water") {
    return "truncate font-serif text-2xl font-semibold tracking-[-0.025em]";
  }

  if (theme === "carp-lodge") {
    return "truncate text-lg font-extrabold uppercase tracking-[0.09em]";
  }

  return "truncate text-xl font-extrabold tracking-[-0.03em]";
}

function navClass(theme: Theme) {
  return `hidden items-center text-[11px] font-bold lg:flex ${
    theme === "fishery-club"
      ? "gap-7 uppercase tracking-[0.09em]"
      : theme === "carp-lodge"
        ? "gap-7 uppercase tracking-[0.13em] text-white/62"
        : "gap-7"
  }`;
}

function headerCtaClass(theme: Theme) {
  return theme === "carp-lodge"
    ? "hidden border border-[var(--site-primary)] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--site-primary)] transition hover:bg-[var(--site-primary)] hover:text-[#0D1110] sm:inline-flex"
    : "hidden rounded-full bg-[var(--site-primary)] px-5 py-2.5 text-xs font-bold text-white transition hover:opacity-85 sm:inline-flex";
}

function sectionTitleClass(theme: Theme) {
  if (theme === "fishery-club") {
    return "mt-4 font-serif text-4xl font-black uppercase leading-[.95] tracking-[-0.05em] sm:text-6xl";
  }

  if (theme === "wild-water") {
    return "mt-4 font-serif text-4xl font-medium leading-[1] tracking-[-0.04em] sm:text-5xl";
  }

  if (theme === "carp-lodge") {
    return "mt-4 text-4xl font-extrabold uppercase leading-[.96] tracking-[-0.05em] sm:text-5xl";
  }

  return "mt-4 text-4xl font-extrabold leading-[.98] tracking-[-0.05em] sm:text-5xl";
}

function bodyLeadClass(theme: Theme) {
  return `mt-6 whitespace-pre-line text-base leading-8 sm:text-lg ${
    theme === "carp-lodge"
      ? "text-[#F4F0E7]/58"
      : "opacity-[.66]"
  }`;
}

function footerClass(theme: Theme) {
  if (theme === "carp-lodge") {
    return "border-t border-white/10 bg-[#0D1110] py-9 text-[#F4F0E7]";
  }

  if (theme === "wild-water") {
    return "border-t border-[#263129]/10 bg-[#F4F0E5] py-9 text-[#263129]";
  }

  if (theme === "fishery-club") {
    return "border-t border-black bg-white py-9 text-black";
  }

  return "border-t border-[#0B1628]/10 bg-white py-9 text-[#0B1628]";
}

function footerBrandClass(theme: Theme) {
  if (theme === "fishery-club") {
    return "font-serif text-xl font-black uppercase tracking-[-.035em]";
  }

  if (theme === "wild-water") {
    return "font-serif text-xl font-semibold";
  }

  return "text-lg font-extrabold";
}

function getNavLabel(section: LakeWebsiteSection) {
  if (section.type === "about") return "O łowisku";
  if (section.type === "gallery") return "Galeria";
  if (section.type === "fish") return "Ryby";
  if (section.type === "priceList") return "Cennik";
  if (section.type === "rules") return "Regulamin";
  return "Kontakt";
}
