import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  LakeWebsiteRenderer,
  type PublicLakeWebsiteData,
} from "@/components/lake-websites/LakeWebsiteRenderer";
import {
  parseLakeWebsiteSections,
} from "@/lib/lake-website-sections";
import { getLakeWebsiteUrl } from "@/lib/lake-websites";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type LakeWebsitePageProps = {
  params: Promise<{
    subdomain: string;
    path?: string[];
  }>;
};

async function getPublishedWebsite(subdomain: string) {
  return prisma.lakeWebsite.findFirst({
    where: {
      subdomain: subdomain.toLowerCase(),
      status: "published",
    },
    include: {
      lake: {
        select: {
          name: true,
          slug: true,
          description: true,
          city: true,
          street: true,
          postalCode: true,
          voivodeship: true,
          fish: true,
          contactPhone: true,
          contactEmail: true,
          contactWebsite: true,
          priceList: {
            select: { id: true, text: true },
          },
          rules: {
            select: { id: true, text: true },
          },
          fishSpecies: {
            select: { id: true, name: true },
          },
          images: {
            orderBy: [
              { sortOrder: "asc" },
              { createdAt: "asc" },
            ],
            select: { id: true, url: true },
          },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: LakeWebsitePageProps): Promise<Metadata> {
  const { subdomain } = await params;
  const website = await getPublishedWebsite(subdomain);

  if (!website) {
    return {
      title: "Strona łowiska | Rybio",
    };
  }

  const sections = parseLakeWebsiteSections(website.sections, {
    lakeName: website.lake.name,
    description: website.lake.description,
    images: website.lake.images.map((image) => image.url),
  });

  const hero = sections.find((section) => section.type === "hero");
  const about = sections.find((section) => section.type === "about");

  const title =
    website.seoTitle ||
    website.siteName ||
    hero?.title ||
    website.lake.name;

  const description =
    website.seoDescription ||
    hero?.subtitle ||
    about?.text ||
    website.lake.description.slice(0, 160);

  const canonical = getLakeWebsiteUrl(website.subdomain);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: hero?.imageUrl ? [hero.imageUrl] : undefined,
      type: "website",
    },
  };
}

export default async function LakeWebsitePage({
  params,
}: LakeWebsitePageProps) {
  const { subdomain, path } = await params;

  if (path && path.length > 0) {
    notFound();
  }

  const website = await getPublishedWebsite(subdomain);

  if (!website) {
    notFound();
  }

  const data: PublicLakeWebsiteData = {
    website: {
      subdomain: website.subdomain,
      templateKey: website.templateKey,
      siteName: website.siteName,
      logoUrl: website.logoUrl,
      primaryColor: website.primaryColor,
      accentColor: website.accentColor,
      backgroundColor: website.backgroundColor,
      textColor: website.textColor,
      contactPhone: website.contactPhone,
      contactEmail: website.contactEmail,
      contactWebsite: website.contactWebsite,
      sections: parseLakeWebsiteSections(website.sections, {
        lakeName: website.lake.name,
        description: website.lake.description,
        images: website.lake.images.map((image) => image.url),
      }),
    },
    lake: website.lake,
  };

  return <LakeWebsiteRenderer data={data} />;
}
