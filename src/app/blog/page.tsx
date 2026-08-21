import type {
  Metadata,
} from "next";
import Link from "next/link";

import {
  BlogFeaturedGrid,
} from "@/components/blog/BlogFeaturedGrid";
import {
  BlogPostCard,
} from "@/components/blog/BlogPostCard";
import {
  BLOG_CATEGORIES,
  getBlogCategoryLabel,
  isBlogCategory,
} from "@/lib/blog";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/cn";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title:
    "Wiedza Rybio — poradniki wędkarskie",
  description:
    "Praktyczne poradniki wędkarskie, gatunki ryb, sprzęt, łowiska i przygotowanie wypraw.",
};

const PAGE_SIZE = 12;

type BlogPageProps = {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    search?: string;
    page?: string;
  }>;
};

export default async function BlogPage({
  searchParams,
}: BlogPageProps) {
  const params =
    await searchParams;

  const category =
    params.category &&
    isBlogCategory(
      params.category
    )
      ? params.category
      : null;

  const tag =
    params.tag
      ?.trim()
      .toLocaleLowerCase(
        "pl-PL"
      ) || null;

  const search =
    params.search?.trim() ||
    "";

  const requestedPage =
    Math.max(
      1,
      Number.parseInt(
        params.page || "1",
        10
      ) || 1
    );

  const now = new Date();

  const baseWhere = {
    status: "published",
    publishedAt: {
      lte: now,
    },
  } as const;

  const filterWhere = {
    ...baseWhere,
    ...(category
      ? { category }
      : {}),
    ...(tag
      ? {
          tags: {
            has: tag,
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            {
              title: {
                contains:
                  search,
                mode: "insensitive" as const,
              },
            },
            {
              excerpt: {
                contains:
                  search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const hasFilters =
    Boolean(
      category ||
        tag ||
        search
    );

  const featuredCandidate =
    hasFilters
      ? null
      : await prisma.blogPost.findFirst(
          {
            where: {
              ...baseWhere,
              isFeatured:
                true,
            },
            orderBy: [
              {
                publishedAt:
                  "desc",
              },
              {
                createdAt:
                  "desc",
              },
            ],
          }
        );

  const featured =
    hasFilters
      ? null
      : featuredCandidate ??
        (await prisma.blogPost.findFirst(
          {
            where: baseWhere,
            orderBy: [
              {
                publishedAt:
                  "desc",
              },
              {
                createdAt:
                  "desc",
              },
            ],
          }
        ));

  const secondaryFeatured =
    !hasFilters && featured
      ? await prisma.blogPost.findMany(
          {
            where: {
              ...baseWhere,
              id: {
                not:
                  featured.id,
              },
            },
            orderBy: [
              {
                publishedAt:
                  "desc",
              },
              {
                createdAt:
                  "desc",
              },
            ],
            take: 2,
          }
        )
      : [];

  const heroIds = [
    featured?.id,
    ...secondaryFeatured.map(
      (post) => post.id
    ),
  ].filter(
    (
      value
    ): value is string =>
      Boolean(value)
  );

  const postsWhere =
    hasFilters
      ? filterWhere
      : {
          ...baseWhere,
          ...(heroIds.length >
          0
            ? {
                id: {
                  notIn:
                    heroIds,
                },
              }
            : {}),
        };

  const totalCount =
    await prisma.blogPost.count({
      where: postsWhere,
    });

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalCount /
          PAGE_SIZE
      )
    );

  const currentPage =
    Math.min(
      requestedPage,
      totalPages
    );

  const [
    posts,
    postsForTags,
  ] = await Promise.all([
    prisma.blogPost.findMany({
      where: postsWhere,
      orderBy: [
        {
          publishedAt:
            "desc",
        },
        {
          createdAt:
            "desc",
        },
      ],
      skip:
        (currentPage - 1) *
        PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.blogPost.findMany({
      where: baseWhere,
      select: {
        tags: true,
      },
      orderBy: {
        publishedAt:
          "desc",
      },
      take: 100,
    }),
  ]);

  const displayedPosts =
    posts;

  const popularTags =
    getPopularTags(
      postsForTags.flatMap(
        (post) => post.tags
      )
    );

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-primary-50 blur-3xl"
        />

        <div className="relative mx-auto w-full max-w-[1500px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_520px] xl:items-end">
            <div className="max-w-4xl">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                Wiedza Rybio
              </p>

              <h1 className="mt-3 max-w-4xl font-display text-4xl font-extrabold leading-[1.04] tracking-[-0.045em] text-text sm:text-5xl lg:text-6xl">
                Wiedza, która pomaga
                łowić skuteczniej.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
                Praktyczne poradniki,
                sprzęt, gatunki ryb i
                inspiracje na kolejną
                wyprawę — w jednym
                miejscu.
              </p>
            </div>

            <form
              action="/blog"
              className="rounded-panel border border-border bg-surface-muted p-2 shadow-sm"
            >
              <label className="flex items-center gap-2">
                <span className="sr-only">
                  Szukaj w Wiedzy
                  Rybio
                </span>

                <input
                  name="search"
                  defaultValue={
                    search
                  }
                  placeholder="Szukaj poradnika, ryby, sprzętu..."
                  className="h-12 min-w-0 flex-1 rounded-control bg-surface px-4 text-sm font-semibold text-text outline-none ring-1 ring-border transition placeholder:font-normal placeholder:text-text-muted focus:ring-2 focus:ring-primary-300"
                />

                <button
                  type="submit"
                  className="inline-flex h-12 shrink-0 items-center justify-center rounded-control bg-primary px-5 text-sm font-extrabold text-white transition hover:bg-primary-hover"
                >
                  Szukaj
                </button>
              </label>
            </form>
          </div>

          <div className="mt-8 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-2">
              <CategoryPill
                href={buildBlogUrl({
                  search:
                    search ||
                    undefined,
                })}
                label="Wszystkie"
                active={!category}
              />

              {BLOG_CATEGORIES.map(
                (item) => (
                  <CategoryPill
                    key={
                      item.value
                    }
                    href={buildBlogUrl(
                      {
                        category:
                          item.value,
                        search:
                          search ||
                          undefined,
                      }
                    )}
                    label={
                      item.label
                    }
                    active={
                      category ===
                      item.value
                    }
                  />
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {!hasFilters &&
          featured && (
            <BlogFeaturedGrid
              primary={featured}
              secondary={
                secondaryFeatured
              }
            />
          )}

        {(hasFilters ||
          displayedPosts.length > 0 ||
          !featured) && (
        <section
          className={cn(
            !hasFilters &&
              featured &&
              "mt-14"
          )}
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
                {hasFilters
                  ? "Wyniki"
                  : "Najnowsze"}
              </p>

              <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-[-0.03em] text-text sm:text-3xl">
                {category
                  ? getBlogCategoryLabel(
                      category
                    )
                  : tag
                    ? `#${tag}`
                    : search
                      ? `Wyniki dla „${search}”`
                      : "Najnowsze artykuły"}
              </h2>

              {hasFilters && (
                <p className="mt-2 text-sm text-text-muted">
                  {totalCount}{" "}
                  {totalCount === 1
                    ? "materiał"
                    : "materiałów"}
                </p>
              )}
            </div>

            {hasFilters && (
              <Link
                href="/blog"
                className="text-sm font-extrabold text-primary-700 transition hover:text-primary-900"
              >
                Wyczyść filtry →
              </Link>
            )}
          </div>

          {displayedPosts.length >
          0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {displayedPosts.map(
                (post) => (
                  <BlogPostCard
                    key={
                      post.id
                    }
                    post={post}
                  />
                )
              )}
            </div>
          ) : (
            <div className="rounded-panel border border-border bg-surface px-6 py-14 text-center">
              <p className="font-display text-2xl font-extrabold tracking-[-0.025em] text-text">
                Nie znaleźliśmy
                artykułów
              </p>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-text-secondary">
                Zmień kategorię,
                wyszukiwaną frazę
                albo usuń aktywne
                filtry.
              </p>

              <Link
                href="/blog"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-5 text-sm font-extrabold text-white"
              >
                Pokaż wszystkie
              </Link>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={
                currentPage
              }
              totalPages={
                totalPages
              }
              category={
                category
              }
              tag={tag}
              search={search}
            />
          )}
        </section>
        )}

        {popularTags.length >
          0 && (
          <section className="mt-14 border-t border-border pt-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                  Popularne tematy
                </p>

                <p className="mt-1.5 text-sm text-text-secondary">
                  Szybki dostęp do
                  najczęściej
                  poruszanych tematów.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {popularTags
                  .slice(0, 10)
                  .map((item) => (
                    <Link
                      key={
                        item.tag
                      }
                      href={buildBlogUrl(
                        {
                          tag:
                            item.tag,
                        }
                      )}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-bold transition",
                        tag ===
                          item.tag
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-surface text-text-secondary hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
                      )}
                    >
                      #
                      {item.tag}
                    </Link>
                  ))}
              </div>
            </div>
          </section>
        )}
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
      className={cn(
        "shrink-0 rounded-full border px-4 py-2.5 text-sm font-bold transition",
        active
          ? "border-primary bg-primary text-white"
          : "border-border bg-surface text-text-secondary hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
      )}
    >
      {label}
    </Link>
  );
}

function Pagination({
  currentPage,
  totalPages,
  category,
  tag,
  search,
}: {
  currentPage: number;
  totalPages: number;
  category: string | null;
  tag: string | null;
  search: string;
}) {
  return (
    <nav
      className="mt-8 flex items-center justify-center gap-2"
      aria-label="Paginacja bloga"
    >
      {currentPage > 1 && (
        <Link
          href={buildBlogUrl({
            category:
              category ||
              undefined,
            tag:
              tag || undefined,
            search:
              search ||
              undefined,
            page:
              currentPage - 1,
          })}
          className="inline-flex h-10 items-center justify-center rounded-control border border-border bg-surface px-4 text-xs font-extrabold text-text-secondary transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
        >
          ← Poprzednia
        </Link>
      )}

      <span className="px-3 text-xs font-bold text-text-muted">
        {currentPage} /{" "}
        {totalPages}
      </span>

      {currentPage <
        totalPages && (
        <Link
          href={buildBlogUrl({
            category:
              category ||
              undefined,
            tag:
              tag || undefined,
            search:
              search ||
              undefined,
            page:
              currentPage + 1,
          })}
          className="inline-flex h-10 items-center justify-center rounded-control border border-border bg-surface px-4 text-xs font-extrabold text-text-secondary transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
        >
          Następna →
        </Link>
      )}
    </nav>
  );
}

function buildBlogUrl(
  values: {
    category?: string;
    tag?: string;
    search?: string;
    page?: number;
  }
) {
  const query =
    new URLSearchParams();

  if (values.category) {
    query.set(
      "category",
      values.category
    );
  }

  if (values.tag) {
    query.set(
      "tag",
      values.tag
    );
  }

  if (values.search) {
    query.set(
      "search",
      values.search
    );
  }

  if (
    values.page &&
    values.page > 1
  ) {
    query.set(
      "page",
      String(values.page)
    );
  }

  const value =
    query.toString();

  return value
    ? `/blog?${value}`
    : "/blog";
}

function getPopularTags(
  tags: string[]
) {
  const counts =
    new Map<
      string,
      number
    >();

  tags.forEach((tag) => {
    const normalized =
      tag
        .trim()
        .toLocaleLowerCase(
          "pl-PL"
        );

    if (!normalized) {
      return;
    }

    counts.set(
      normalized,
      (counts.get(
        normalized
      ) ?? 0) + 1
    );
  });

  return [
    ...counts.entries(),
  ]
    .map(
      ([tag, count]) => ({
        tag,
        count,
      })
    )
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.tag.localeCompare(
          b.tag,
          "pl"
        )
    );
}
