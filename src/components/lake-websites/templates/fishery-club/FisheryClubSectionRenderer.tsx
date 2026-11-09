import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import { AboutSection } from "@/components/lake-websites/templates/fishery-club/sections/AboutSection";
import { ContactSection } from "@/components/lake-websites/templates/fishery-club/sections/ContactSection";
import { CtaSection } from "@/components/lake-websites/templates/fishery-club/sections/CtaSection";
import { FishSection } from "@/components/lake-websites/templates/fishery-club/sections/FishSection";
import { GallerySection } from "@/components/lake-websites/templates/fishery-club/sections/GallerySection";
import { HeroSection } from "@/components/lake-websites/templates/fishery-club/sections/HeroSection";
import { PriceSection } from "@/components/lake-websites/templates/fishery-club/sections/PriceSection";
import { RulesSection } from "@/components/lake-websites/templates/fishery-club/sections/RulesSection";

export function FisheryClubSectionRenderer({
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
