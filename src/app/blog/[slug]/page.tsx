import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogArticleContent } from "@/components/blog/BlogArticleContent";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import {
  getBlogCategoryLabel,
  getBlogReadTime,
  parseBlogBlocks,
} from "@/lib/blog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type BlogArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      status: "published",
      publishedAt: {
        lte: new Date(),
      },
    },
  });

  if (!post) {
    return {
      title: "Artykuł | Rybio",
    };
  }

  return {
    title: post.seoTitle || `${post.title} | Rybio`,
    description: post.seoDescription || post.excerpt || undefined,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || undefined,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
  };
}

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const { slug } = await params;

  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      status: "published",
      publishedAt: {
        lte: new Date(),
      },
    },
  });

  if (!post) {
    notFound();
  }

  const blocks = parseBlogBlocks(post.content);
  const readTime = getBlogReadTime(blocks);

  const related = await prisma.blogPost.findMany({
    where: {
      id: {
        not: post.id,
      },
      category: post.category,
      status: "published",
      publishedAt: {
        lte: new Date(),
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 3,
  });

  return (
    <main className="bg-white">
      <article>
        <header className="border-b border-slate-100 bg-slate-50">
          <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
              <Link href="/" className="transition hover:text-blue-600">
                Rybio
              </Link>
              <span>/</span>
              <Link href="/blog" className="transition hover:text-blue-600">
                Wiedza
              </Link>
              <span>/</span>
              <Link
                href={`/blog?category=${post.category}`}
                className="transition hover:text-blue-600"
              >
                {getBlogCategoryLabel(post.category)}
              </Link>
            </nav>

            <div className="mt-6">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {getBlogCategoryLabel(post.category)}
              </span>

              <h1 className="mt-4 max-w-5xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl sm:leading-[1.08]">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-500">
                  {post.excerpt}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-400">
                <span>{post.authorName || "Rybio"}</span>
                <span>•</span>
                {post.publishedAt && (
                  <>
                    <span>{formatBlogDate(post.publishedAt)}</span>
                    <span>•</span>
                  </>
                )}
                <span>{readTime} min czytania</span>
              </div>

              {post.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:text-blue-600"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {post.coverImageUrl && (
          <div className="mx-auto w-full max-w-[1280px] px-4 pt-8 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-slate-100">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="max-h-[720px] w-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <BlogArticleContent blocks={blocks} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto w-full max-w-[1500px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Czytaj dalej
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
              Powiązane artykuły
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => (
                <BlogPostCard key={item.id} post={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function formatBlogDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
