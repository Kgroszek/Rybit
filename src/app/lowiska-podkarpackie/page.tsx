import { SeoLakesLandingPage } from "@/components/public/SeoLakesLandingPage";
import {
  createSeoLakesMetadata,
  seoLakesLandings,
} from "@/lib/seo-lakes-landings";

const config = seoLakesLandings.podkarpackie;

export const dynamic = "force-dynamic";

export const metadata = createSeoLakesMetadata(config);

export default function Page() {
  return <SeoLakesLandingPage config={config} />;
}
