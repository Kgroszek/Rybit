import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import { AboutSection } from "@/components/lake-websites/templates/carp-lodge/sections/AboutSection";
import { ContactSection } from "@/components/lake-websites/templates/carp-lodge/sections/ContactSection";
import { CtaSection } from "@/components/lake-websites/templates/carp-lodge/sections/CtaSection";
import { FishSection } from "@/components/lake-websites/templates/carp-lodge/sections/FishSection";
import { GallerySection } from "@/components/lake-websites/templates/carp-lodge/sections/GallerySection";
import { HeroSection } from "@/components/lake-websites/templates/carp-lodge/sections/HeroSection";
import { PriceSection } from "@/components/lake-websites/templates/carp-lodge/sections/PriceSection";
import { RulesSection } from "@/components/lake-websites/templates/carp-lodge/sections/RulesSection";

export function CarpLodgeSectionRenderer({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  switch (section.type) {
    case "hero":
      return (
        <HeroSection
          section={section}
          data={data}
        />
      );

    case "about":
      return (
        <AboutSection
          section={section}
          data={data}
        />
      );

    case "fish":
      return (
        <FishSection
          section={section}
          data={data}
        />
      );

    case "gallery":
      return (
        <GallerySection
          section={section}
          data={data}
        />
      );

    case "priceList":
      return (
        <PriceSection
          section={section}
          data={data}
        />
      );

    case "rules":
      return (
        <RulesSection
          section={section}
          data={data}
        />
      );

    case "contact":
      return (
        <ContactSection
          section={section}
          data={data}
        />
      );

    case "cta":
      return (
        <CtaSection
          section={section}
          data={data}
        />
      );

    default:
      return null;
  }
}
