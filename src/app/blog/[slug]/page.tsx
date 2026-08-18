import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogArticleContent } from "@/components/blog/BlogArticleContent";
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
  const now = new Date();

  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      status: "published",
      publishedAt: {
        lte: now,
      },
    },
  });

  if (!post) {
    notFound();
  }

  const blocks = parseBlogBlocks(post.content);
  const readTime = getBlogReadTime(blocks);

  const sameCategoryPosts = await prisma.blogPost.findMany({
    where: {
      id: {
        not: post.id,
      },
      category: post.category,
      status: "published",
      publishedAt: {
        lte: now,
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 4,
    select: {
      id: true,
      slug: true,
      title: true,
      coverImageUrl: true,
      category: true,
      publishedAt: true,
    },
  });

  const sameCategoryIds = sameCategoryPosts.map((item) => item.id);

  const latestPosts = await prisma.blogPost.findMany({
    where: {
      id: {
        notIn: [post.id, ...sameCategoryIds],
      },
      status: "published",
      publishedAt: {
        lte: now,
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 5,
    select: {
      id: true,
      slug: true,
      title: true,
      coverImageUrl: true,
      category: true,
      publishedAt: true,
    },
  });

  return (
    <main className="bg-white">
      <div className="mx-auto grid w-full max-w-[1500px] gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <article className="min-w-0">
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

          <header className="mt-5 border-b border-slate-100 pb-7">
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
                    className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:text-blue-600"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {post.coverImageUrl && (
            <div className="mt-7 overflow-hidden rounded-3xl bg-slate-100">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="max-h-[760px] w-full object-cover"
              />
            </div>
          )}

          <div className="py-10 sm:py-12">
            <BlogArticleContent blocks={blocks} />
          </div>
        </article>

        <aside className="space-y-8 xl:sticky xl:top-24">
          {latestPosts.length > 0 && (
            <ArticleSidebarSection
              eyebrow="Najnowsze"
              posts={latestPosts}
            />
          )}

          {sameCategoryPosts.length > 0 && (
            <ArticleSidebarSection
              eyebrow={`Więcej w: ${getBlogCategoryLabel(post.category)}`}
              posts={sameCategoryPosts}
            />
          )}
        </aside>
      </div>
    </main>
  );
}

type SidebarPost = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string | null;
  category: string;
  publishedAt: Date | null;
};

function ArticleSidebarSection({
  eyebrow,
  posts,
}: {
  eyebrow: string;
  posts: SidebarPost[];
}) {
  return (
    <section className="border-t-2 border-slate-950 pt-4">
      <div className="mb-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">
          {eyebrow}
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {posts.map((post) => (
          <SidebarArticle key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

function SidebarArticle({ post }: { post: SidebarPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid grid-cols-[92px_minmax(0,1fr)] gap-3 py-4 first:pt-3"
    >
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl text-slate-300">
            🎣
          </div>
        )}
      </div>

      <div className="min-w-0">
        <h3 className="line-clamp-3 text-sm font-bold leading-5 text-slate-900 transition group-hover:text-blue-600">
          {post.title}
        </h3>

        {post.publishedAt && (
          <p className="mt-2 text-xs font-medium text-slate-400">
            {formatShortDate(post.publishedAt)}
          </p>
        )}
      </div>
    </Link>
  );
}

function formatBlogDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}