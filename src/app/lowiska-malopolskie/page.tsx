import { SeoLakesLandingPage } from "@/components/public/SeoLakesLandingPage";
import {
  createSeoLakesMetadata,
  seoLakesLandings,
} from "@/lib/seo-lakes-landings";

const config = seoLakesLandings.malopolskie;

export const revalidate = 3600;

export const metadata = createSeoLakesMetadata(config);

export default function Page() {
  return <SeoLakesLandingPage config={config} />;
}
