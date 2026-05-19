import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLakeBySlug } from "@/lib/lakes";
import { PublicLakeDetailsPage } from "@/components/public/PublicLakeDetailsPage";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lake = await getLakeBySlug(slug);

  if (!lake) {
    return {
      title: "Łowisko nie znalezione | Rybio",
    };
  }

  return {
    title: `${lake.name} – łowisko ${lake.address.voivodeship} | Rybio`,
    description: `Sprawdź informacje o łowisku ${lake.name}: lokalizacja, gatunki ryb, udogodnienia, opis, cennik i zasady. Publiczna baza łowisk Rybio.`,
  };
}

export default async function PublicLakePage({ params }: PageProps) {
  const { slug } = await params;
  const lake = await getLakeBySlug(slug);

  if (!lake) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <PublicHeader />

      <PublicLakeDetailsPage lake={lake} />

      <PublicFooter />
    </main>
  );
}