import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatchDetailsView } from "@/components/catches/details/CatchDetailsView";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { getPublicCatchDetails } from "@/lib/catch-details";
import { getAppBaseUrl } from "@/lib/catch-sharing";
import { resolveStoredCatchScore } from "@/lib/catch-score";

type PublicCatchPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PublicCatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const fishingCatch = await getPublicCatchDetails(id);

  if (!fishingCatch) return { title: "Połów | Rybio" };

  const score = resolveStoredCatchScore({
    ...fishingCatch,
    catchScoreVersion: fishingCatch.catchScoreVersion ?? null,
  });
  const baseUrl = getAppBaseUrl();
  const title = `${fishingCatch.fishName} — Rybio Score ${score.score ?? "—"}/100 | Rybio`;
  const description = fishingCatch.lakeName
    ? `${score.tierLabel}. Połów na łowisku ${fishingCatch.lakeName}.`
    : `${score.tierLabel}. Publiczny połów zapisany w Rybio.`;
  const pageUrl = `${baseUrl}/polowy/publiczne/${fishingCatch.id}`;
  const cardUrl = `${baseUrl}/api/catches/${fishingCatch.id}/card?format=post&variant=collector`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "Rybio",
      type: "website",
      images: [{ url: cardUrl, width: 1080, height: 1350, alt: `Karta połowu: ${fishingCatch.fishName}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cardUrl],
    },
  };
}

export default async function PublicCatchPage({ params }: PublicCatchPageProps) {
  const { id } = await params;
  const fishingCatch = await getPublicCatchDetails(id);

  if (!fishingCatch) notFound();

  return (
    <div className="min-h-screen bg-background text-text">
      <PublicHeader subtitle="Publiczny połów w Rybio" />
      <main>
        <CatchDetailsView fishingCatch={fishingCatch} mode="public" />
      </main>
      <PublicFooter />
    </div>
  );
}
