import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = "https://rybio.pl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [lakes, blogPosts] = await Promise.all([
    prisma.lake.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.blogPost.findMany({
      where: {
        status: "published",
        publishedAt: {
          lte: now,
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
  ]);

  const latestLakeModified = lakes[0]?.updatedAt;
  const latestBlogModified = blogPosts[0]?.updatedAt;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/lowiska-w-polsce`,
      ...(latestLakeModified
        ? {
            lastModified: latestLakeModified,
          }
        : {}),
      changeFrequency: "daily",
      priority: 0.95,
    },

    // Województwa
    // Nie ustawiamy sztucznego lastModified.
    // Bez osobnego śledzenia zmian dla każdego województwa
    // nie mamy wiarygodnej daty dla konkretnego landing page.
    {
      url: `${siteUrl}/lowiska-mazowieckie`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-lubelskie`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-malopolskie`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-wielkopolskie`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-podkarpackie`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-slaskie`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-zachodniopomorskie`,
      changeFrequency: "weekly",
      priority: 0.85,
    },

    // Typy i kategorie łowisk
    // Tu również pomijamy lastModified, dopóki nie śledzimy
    // rzeczywistej daty zmiany konkretnego zestawu wyników.
    {
      url: `${siteUrl}/lowiska-komercyjne`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/lowiska-no-kill`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/lowiska-z-domkami`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/lowiska-z-noclegiem`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/lowiska-karpiowe`,
      changeFrequency: "weekly",
      priority: 0.75,
    },

    // Blog i publiczne strony produktowe
    {
      url: `${siteUrl}/blog`,
      ...(latestBlogModified
        ? {
            lastModified: latestBlogModified,
          }
        : {}),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/dla-wlascicieli-lowisk`,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    // Pozostałe strony statyczne.
    // Brak lastModified jest celowy — lepszy brak daty
    // niż data zmieniająca się przy każdym wygenerowaniu sitemap.
    {
      url: `${siteUrl}/kontakt`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/regulamin`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/polityka-prywatnosci`,
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

  const blogPostPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...lakePages, ...blogPostPages];
}
