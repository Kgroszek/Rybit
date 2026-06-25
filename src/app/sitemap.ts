import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = "https://rybio.pl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const lakes = await prisma.lake.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/lowiska-w-polsce`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },

    // Województwa
    {
      url: `${siteUrl}/lowiska-mazowieckie`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-lubelskie`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-malopolskie`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-wielkopolskie`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-podkarpackie`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-slaskie`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-zachodniopomorskie`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },

    // Typy i kategorie łowisk
    {
      url: `${siteUrl}/lowiska-komercyjne`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-no-kill`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/lowiska-z-domkami`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/lowiska-z-noclegiem`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/lowiska-karpiowe`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },

    // Pozostałe strony
    {
      url: `${siteUrl}/kontakt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/regulamin`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/polityka-prywatnosci`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const lakePages: MetadataRoute.Sitemap = lakes.map((lake) => ({
    url: `${siteUrl}/lowiska-w-polsce/${lake.slug}`,
    lastModified: lake.updatedAt,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticPages, ...lakePages];
}