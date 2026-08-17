import type { Metadata } from "next";
import Link from "next/link";

import { BlogPostCard } from "@/components/blog/BlogPostCard";
import {
  BLOG_CATEGORIES,
  getBlogCategoryLabel,
  isBlogCategory,
} from "@/lib/blog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wiedza Rybio — poradniki wędkarskie",
  description:
    "Poradniki wędkarskie, gatunki ryb, sprzęt oraz inspiracje na wyprawy i łowiska.",
};

type BlogPageProps = {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    search?: string;
  }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;

  const category =
    params.category && isBlogCategory(params.category)
      ? params.category
      : null;

  const tag = params.tag?.trim().toLocaleLowerCase("pl-PL") || null;
  const search = params.search?.trim() || "";

  const now = new Date();

  const baseWhere = {
    status: "published",
    publishedAt: {
      lte: now,
    },
  } as const;

  const filterWhere = {
    ...baseWhere,
    ...(category ? { category } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              excerpt: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [featuredPost, posts, postsForTags] = await Promise.all([
    prisma.blogPost.findFirst({
      where: {
        ...baseWhere,
        isFeatured: true,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    }),
    prisma.blogPost.findMany({
      where: filterWhere,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 18,
    }),
    prisma.blogPost.findMany({
      where: baseWhere,
      select: {
        tags: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 80,
    }),
  ]);

  const fallbackFeatured =
    featuredPost ??
    (category || tag || search
      ? null
      : posts[0] ?? null);

  const displayedPosts = fallbackFeatured
    ? posts.filter((post) => post.id !== fallbackFeatured.id)
    : posts;

  const popularTags = getPopularTags(postsForTags.flatMap((post) => post.tags));

  const hasFilters = Boolean(category || tag || search);

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Wiedza Rybio
          </p>

          <div className="mt-3 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                Wiedza, która pomaga łowić skuteczniej.
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-500">
                Poradniki, gatunki ryb, sprzęt i praktyczne inspiracje na
                kolejną wyprawę nad wodę.
              </p>
            </div>

            <form
              action="/blog"
              className="flex w-full max-w-xl gap-2 rounded-2xl bg-slate-50 p-1.5 ring-1 ring-slate-200"
            >
              <input
                name="search"
                defaultValue={search}
                placeholder="Szukaj poradnika, ryby, sprzętu..."
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Szukaj
              </button>
            </form>
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
            <CategoryPill
              href="/blog"
              label="Wszystkie"
              active={!category}
            />

            {BLOG_CATEGORIES.map((item) => (
              <CategoryPill
                key={item.value}
                href={`/blog?category=${item.value}`}
                label={item.label}
                active={category === item.value}
              />
            ))}
          </div>

          {popularTags.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Popularne tagi
              </span>

              {popularTags.slice(0, 8).map((item) => (
                <Link
                  key={item.tag}
                  href={`/blog?tag=${encodeURIComponent(item.tag)}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    tag === item.tag
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  #{item.tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {!hasFilters && fallbackFeatured && (
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Wyróżniony artykuł
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
                  Warto przeczytać
                </h2>
              </div>
            </div>

            <BlogPostCard post={fallbackFeatured} large />
          </section>
        )}

        <section className={fallbackFeatured && !hasFilters ? "mt-12" : ""}>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {hasFilters ? "Wyniki" : "Najnowsze"}
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
                {category
                  ? getBlogCategoryLabel(category)
                  : tag
                    ? `#${tag}`
                    : search
                      ? `Wyniki dla „${search}”`
                      : "Najnowsze artykuły"}
              </h2>
            </div>

            {hasFilters && (
              <Link
                href="/blog"
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Wyczyść filtry →
              </Link>
            )}
          </div>

          {displayedPosts.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {displayedPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
              <p className="text-xl font-bold text-slate-950">
                Brak artykułów
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                W tej sekcji nie ma jeszcze opublikowanych materiałów.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function CategoryPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </Link>
  );
}

function getPopularTags(tags: string[]) {
  const counts = new Map<string, number>();

  tags.forEach((tag) => {
    const normalized = tag.trim().toLocaleLowerCase("pl-PL");

    if (!normalized) {
      return;
    }

    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "pl"));
}
