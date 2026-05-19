import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLakeBySlug } from "@/lib/lakes";
import { PublicLakeDetailsPage } from "@/components/public/PublicLakeDetailsPage";

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
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">
              R
            </div>

            <div>
              <p className="text-xl font-black tracking-tight">Rybio</p>
              <p className="text-xs font-semibold text-slate-500">
                Publiczna baza łowisk
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
            >
              Zaloguj się
            </Link>

            <Link
              href="/register"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Załóż konto
            </Link>
          </div>
        </div>
      </header>

      <PublicLakeDetailsPage lake={lake} />
    </main>
  );
}