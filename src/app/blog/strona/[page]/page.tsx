import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { BlogListing } from "@/components/blog/BlogListing";

export const revalidate = 3600;

function parsePage(value: string) {
  const page = Number.parseInt(value, 10);

  return Number.isFinite(page) && page >= 1 ? page : null;
}

type BlogPaginationPageProps = {
  params: Promise<{
    page: string;
  }>;
};

export async function generateMetadata({
  params,
}: BlogPaginationPageProps): Promise<Metadata> {
  const { page: rawPage } = await params;
  const page = parsePage(rawPage);

  if (!page || page === 1) {
    return {
      alternates: {
        canonical: "/blog",
      },
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  return {
    title: `Wiedza Rybio — strona ${page}`,
    description:
      `Najnowsze poradniki i artykuły wędkarskie Rybio — strona ${page}.`,
    alternates: {
      canonical: `/blog/strona/${page}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BlogPaginationPage({
  params,
}: BlogPaginationPageProps) {
  const { page: rawPage } = await params;
  const page = parsePage(rawPage);

  if (!page) {
    notFound();
  }

  if (page === 1) {
    redirect("/blog");
  }

  return (
    <BlogListing
      requestedPage={page}
      strictPage
    />
  );
}
