import type {
  Metadata,
} from "next";
import Link from "next/link";
import {
  notFound,
} from "next/navigation";

import {
  BlogArticleContent,
} from "@/components/blog/BlogArticleContent";
import {
  BlogRelatedPosts,
} from "@/components/blog/BlogRelatedPosts";
import {
  BlogTableOfContents,
} from "@/components/blog/BlogTableOfContents";
import {
  formatBlogDate,
  getBlogCategoryLabel,
  getBlogFaqItems,
  getBlogReadTime,
  getBlogTableOfContents,
  parseBlogBlocks,
} from "@/lib/blog";
import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

type BlogArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } =
    await params;

  const post =
    await prisma.blogPost.findFirst(
      {
        where: {
          slug,
          status:
            "published",
          publishedAt: {
            lte: new Date(),
          },
        },
        select: {
          title: true,
          excerpt: true,
          seoTitle: true,
          seoDescription:
            true,
          coverImageUrl:
            true,
          publishedAt: true,
          updatedAt: true,
          authorName: true,
          tags: true,
        },
      }
    );

  if (!post) {
    return {
      title:
        "Artykuł | Rybio",
    };
  }

  return {
    title:
      post.seoTitle ||
      `${post.title} | Rybio`,
    description:
      post.seoDescription ||
      post.excerpt ||
      undefined,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title:
        post.seoTitle ||
        post.title,
      description:
        post.seoDescription ||
        post.excerpt ||
        undefined,
      images:
        post.coverImageUrl
          ? [
              post.coverImageUrl,
            ]
          : undefined,
      type: "article",
      publishedTime:
        post.publishedAt?.toISOString(),
      modifiedTime:
        post.updatedAt.toISOString(),
      authors:
        post.authorName
          ? [
              post.authorName,
            ]
          : ["Rybio"],
      tags: post.tags,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const { slug } =
    await params;

  const now = new Date();

  const post =
    await prisma.blogPost.findFirst(
      {
        where: {
          slug,
          status:
            "published",
          publishedAt: {
            lte: now,
          },
        },
      }
    );

  if (!post) {
    notFound();
  }

  const blocks =
    parseBlogBlocks(
      post.content
    );

  const readTime =
    getBlogReadTime(blocks);

  const toc =
    getBlogTableOfContents(
      blocks
    );

  const faqItems =
    getBlogFaqItems(
      blocks
    );

  const related =
    await prisma.blogPost.findMany(
      {
        where: {
          id: {
            not: post.id,
          },
          status:
            "published",
          publishedAt: {
            lte: now,
          },
          OR:
            post.tags.length > 0
              ? [
                  {
                    category:
                      post.category,
                  },
                  {
                    tags: {
                      hasSome:
                        post.tags,
                    },
                  },
                ]
              : [
                  {
                    category:
                      post.category,
                  },
                ],
        },
        orderBy: [
          {
            isFeatured:
              "desc",
          },
          {
            publishedAt:
              "desc",
          },
        ],
        take: 3,
      }
    );

  const articleJsonLd = {
    "@context":
      "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description:
      post.seoDescription ||
      post.excerpt ||
      undefined,
    image:
      post.coverImageUrl ||
      undefined,
    datePublished:
      post.publishedAt?.toISOString(),
    dateModified:
      post.updatedAt.toISOString(),
    author: {
      "@type":
        post.authorName
          ? "Person"
          : "Organization",
      name:
        post.authorName ||
        "Rybio",
    },
    publisher: {
      "@type":
        "Organization",
      name: "Rybio",
      url: "https://rybio.pl",
    },
    mainEntityOfPage:
      `https://rybio.pl/blog/${post.slug}`,
  };

  const faqJsonLd =
    faqItems.length > 0
      ? {
          "@context":
            "https://schema.org",
          "@type":
            "FAQPage",
          mainEntity:
            faqItems.map(
              (item) => ({
                "@type":
                  "Question",
                name:
                  item.question,
                acceptedAnswer:
                  {
                    "@type":
                      "Answer",
                    text:
                      item.answer,
                  },
              })
            ),
        }
      : null;

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              articleJsonLd
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />

      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                faqJsonLd
              ).replace(
                /</g,
                "\\u003c"
              ),
          }}
        />
      )}

      <article>
        <header className="border-b border-border bg-surface">
          <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
            <nav className="flex flex-wrap items-center gap-2 text-xs font-bold text-text-muted">
              <Link
                href="/blog"
                className="transition hover:text-primary-700"
              >
                Wiedza
              </Link>

              <span>/</span>

              <Link
                href={`/blog?category=${post.category}`}
                className="transition hover:text-primary-700"
              >
                {getBlogCategoryLabel(
                  post.category
                )}
              </Link>
            </nav>

            <div className="mt-6 max-w-[980px]">
              <span className="inline-flex rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.11em] text-primary-700">
                {getBlogCategoryLabel(
                  post.category
                )}
              </span>

              <h1 className="mt-4 max-w-[980px] font-display text-[clamp(2.6rem,4.35vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.048em] text-text">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-5 max-w-3xl text-lg leading-8 text-text-secondary sm:text-xl">
                  {
                    post.excerpt
                  }
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-text-muted">
                <span className="font-bold text-text-secondary">
                  {post.authorName ||
                    "Rybio"}
                </span>

                {post.publishedAt && (
                  <>
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 rounded-full bg-border-strong"
                    />

                    <time
                      dateTime={post.publishedAt.toISOString()}
                    >
                      {formatBlogDate(
                        post.publishedAt
                      )}
                    </time>
                  </>
                )}

                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-border-strong"
                />

                <span>
                  {readTime} min
                  czytania
                </span>
              </div>
            </div>
          </div>
        </header>

        {post.coverImageUrl && (
          <div className="mx-auto w-full max-w-[1180px] px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
            <div className="overflow-hidden rounded-panel border border-border bg-surface-muted shadow-card">
              <img
                src={
                  post.coverImageUrl
                }
                alt={post.title}
                className="aspect-[16/8.6] max-h-[680px] w-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid min-w-0 xl:grid-cols-[220px_minmax(0,1024px)_220px] xl:justify-center xl:gap-8 xl:items-start">
            <aside className="hidden xl:sticky xl:top-24 xl:block">
              <BlogTableOfContents
                items={toc}
              />
            </aside>

            <div className="min-w-0">
              {toc.length >= 2 && (
                <details className="mb-8 rounded-card border border-border bg-surface p-4 xl:hidden">
                  <summary className="cursor-pointer text-sm font-extrabold text-text">
                    Spis treści
                  </summary>

                  <div className="mt-3">
                    <BlogTableOfContents
                      items={toc}
                    />
                  </div>
                </details>
              )}

              <BlogArticleContent
                blocks={blocks}
              />

              {post.tags.length >
                0 && (
                <div className="mx-auto mt-12 flex w-full max-w-[760px] flex-wrap gap-2 border-t border-border pt-6">
                  {post.tags.map(
                    (tag) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(
                          tag
                        )}`}
                        className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text-secondary transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
                      >
                        #{tag}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>

            <div
              className="hidden xl:block"
              aria-hidden="true"
            />
          </div>
        </div>
      </article>

      <div className="mx-auto w-full max-w-[1180px] px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <BlogRelatedPosts
          posts={related}
          title="Powiązane artykuły"
        />
      </div>
    </main>
  );
}
