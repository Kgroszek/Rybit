import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = "https://rybio.pl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/lowiska-w-polsce`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/lowiska-mazowieckie`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-lubelskie`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-malopolskie`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-wielkopolskie`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-podkarpackie`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-slaskie`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-no-kill`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/lowiska-z-domkami`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/lowiska-z-noclegiem`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/lowiska-karpiowe`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/regulamin`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/polityka-prywatnosci`,
      lastModified: new Date(),
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