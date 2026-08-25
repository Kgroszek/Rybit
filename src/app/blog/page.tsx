import type { Metadata } from "next";

import { BlogListing } from "@/components/blog/BlogListing";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Wiedza Rybio — poradniki wędkarskie",
  description:
    "Praktyczne poradniki wędkarskie, gatunki ryb, sprzęt, łowiska i przygotowanie wypraw.",
  alternates: {
    canonical: "/blog",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogPage() {
  return <BlogListing />;
}
