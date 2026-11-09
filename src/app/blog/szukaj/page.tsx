import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BlogListing } from "@/components/blog/BlogListing";
import { isBlogCategory } from "@/lib/blog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wyszukiwanie w Wiedzy Rybio",
  description:
    "Wyniki wyszukiwania i filtrowania artykułów w Wiedzy Rybio.",
  alternates: {
    canonical: "/blog",
  },
  robots: {
    index: false,
    follow: true,
    noarchive: true,
  },
};

type SearchValue = string | string[] | undefined;

type BlogSearchPageProps = {
  searchParams: Promise<{
    category?: SearchValue;
    tag?: SearchValue;
    search?: SearchValue;
    page?: SearchValue;
  }>;
};

function first(value: SearchValue) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function BlogSearchPage({
  searchParams,
}: BlogSearchPageProps) {
  const params = await searchParams;

  const rawCategory = first(params.category).trim();
  const category =
    rawCategory && isBlogCategory(rawCategory)
      ? rawCategory
      : null;
  const tag = first(params.tag).trim();
  const search = first(params.search).trim();
  const page = Math.max(
    1,
    Number.parseInt(first(params.page) || "1", 10) || 1
  );

  if (!category && !tag && !search) {
    redirect(page > 1 ? `/blog/strona/${page}` : "/blog");
  }

  return (
    <BlogListing
      category={category}
      tag={tag}
      search={search}
      requestedPage={page}
    />
  );
}
