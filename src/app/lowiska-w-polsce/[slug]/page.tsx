import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicLakeDetailsPage } from "@/components/public/PublicLakeDetailsPage";
import { getLakeBySlug } from "@/lib/lakes";
import { getNearbyLakesForDetails } from "@/lib/lake-details";

const siteUrl = "https://rybio.pl";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function truncateText(text: string, maxLength = 155) {
  const cleanText = text.replace(/\s+/g, " ").trim();

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  return `${cleanText.slice(0, maxLength - 3).trim()}...`;
}

function getOwnerTypeLabel(ownerType?: string) {
  if (ownerType === "commercial") return "łowisko komercyjne";
  if (ownerType === "pzw") return "łowisko PZW";
  return "łowisko wędkarskie";
}

function getFishingTypeLabel(fishingType?: string) {
  if (fishingType === "carp") return "łowisko karpiowe";
  if (fishingType === "spinning") return "łowisko spinningowe";
  return "łowisko ogólne";
}

function getLakeImage(lake: Awaited<ReturnType<typeof getLakeBySlug>>) {
  if (!lake) return "/og-lakes.jpg";
  if (Array.isArray(lake.images) && lake.images.length > 0) return lake.images[0];
  return "/og-lakes.jpg";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lake = await getLakeBySlug(slug);

  if (!lake) {
    return {
      metadataBase: new URL(siteUrl),
      title: "Łowisko nie znalezione | Rybio",
      description: "Nie znaleziono wybranego łowiska w publicznej bazie łowisk Rybio.",
      robots: { index: false, follow: false },
    };
  }

  const city = lake.address?.city || "";
  const voivodeship = lake.address?.voivodeship || "";
  const ownerTypeLabel = getOwnerTypeLabel(lake.type);
  const fishingTypeLabel = getFishingTypeLabel(lake.fishingType);
  const imageUrl = getLakeImage(lake);

  const title = city
    ? `${lake.name} ${city} – ryby, ceny i regulamin | Rybio`
    : `${lake.name} – ryby, ceny i regulamin | Rybio`;

  const description = truncateText(
    lake.description ||
      `Sprawdź ${lake.name}${city ? ` w miejscowości ${city}` : ""}: lokalizację, gatunki ryb, typ łowiska, udogodnienia, cennik, zasady i informacje przydatne przed wyprawą.`
  );

  const canonicalUrl = `/lowiska-w-polsce/${lake.slug}`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: [
      lake.name,
      city ? `łowisko ${city}` : "",
      city ? `łowiska ${city}` : "",
      voivodeship ? `łowiska ${voivodeship}` : "",
      "łowisko wędkarskie",
      "gdzie na ryby",
      "baza łowisk",
      ownerTypeLabel,
      fishingTypeLabel,
      lake.fish || "",
      "Rybio",
    ].filter(Boolean),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Rybio",
      locale: "pl_PL",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${lake.name}${city ? ` – łowisko w ${city}` : ""}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: { index: true, follow: true },
  };
}

export default async function PublicLakePage({ params }: PageProps) {
  const { slug } = await params;

  const [lake, recommendedLakes] = await Promise.all([
    getLakeBySlug(slug),
    getNearbyLakesForDetails(slug, 3),
  ]);

  if (!lake) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-text">
      <PublicHeader />
      <PublicLakeDetailsPage lake={lake} recommendedLakes={recommendedLakes} />
      <PublicFooter />
    </main>
  );
}
