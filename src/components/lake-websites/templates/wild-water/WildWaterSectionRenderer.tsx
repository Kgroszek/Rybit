import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import { AboutSection } from "@/components/lake-websites/templates/wild-water/sections/AboutSection";
import { ContactSection } from "@/components/lake-websites/templates/wild-water/sections/ContactSection";
import { CtaSection } from "@/components/lake-websites/templates/wild-water/sections/CtaSection";
import { FishSection } from "@/components/lake-websites/templates/wild-water/sections/FishSection";
import { GallerySection } from "@/components/lake-websites/templates/wild-water/sections/GallerySection";
import { HeroSection } from "@/components/lake-websites/templates/wild-water/sections/HeroSection";
import { PriceSection } from "@/components/lake-websites/templates/wild-water/sections/PriceSection";
import { RulesSection } from "@/components/lake-websites/templates/wild-water/sections/RulesSection";

export function WildWaterSectionRenderer({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  switch (section.type) {
    case "hero":
      return <HeroSection section={section} data={data} />;
    case "about":
      return <AboutSection section={section} data={data} />;
    case "fish":
      return <FishSection section={section} data={data} />;
    case "gallery":
      return <GallerySection section={section} data={data} />;
    case "priceList":
      return <PriceSection section={section} data={data} />;
    case "rules":
      return <RulesSection section={section} data={data} />;
    case "contact":
      return <ContactSection section={section} data={data} />;
    case "cta":
      return <CtaSection section={section} data={data} />;
    default:
      return null;
  }
}
