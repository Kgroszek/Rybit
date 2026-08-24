import Link from "next/link";

import {
  formatBlogDate,
  getBlogCategoryLabel,
  getBlogReadTime,
  parseBlogBlocks,
} from "@/lib/blog";
import { cn } from "@/lib/cn";

type BlogPostCardProps = {
  post: {
    slug: string;
    title: string;
    excerpt: string | null;
    category: string;
    tags: string[];
    coverImageUrl: string | null;
    content: unknown;
    publishedAt: Date | null;
  };
  variant?:
    | "default"
    | "compact"
    | "hero";
};

export function BlogPostCard({
  post,
  variant = "default",
}: BlogPostCardProps) {
  const blocks =
    parseBlogBlocks(
      post.content
    );

  const readTime =
    getBlogReadTime(blocks);

  if (
    variant === "compact"
  ) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group relative flex min-h-[238px] overflow-hidden rounded-card border border-border bg-navy-950 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card xl:min-h-0"
      >
        <CardImage
          post={post}
          className="absolute inset-0 h-full w-full"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/38 to-navy-950/5 transition duration-300 group-hover:via-navy-950/48" />

        <div className="relative mt-auto min-w-0 p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full border border-white/20 bg-white/92 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-primary-800 backdrop-blur-sm">
            {getBlogCategoryLabel(
              post.category
            )}
          </span>

          <h3 className="mt-3 line-clamp-3 font-display text-xl font-extrabold leading-[1.12] tracking-[-0.03em] text-white sm:text-[22px]">
            {post.title}
          </h3>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-bold text-white/68">
            {post.publishedAt && (
              <span>
                {formatBlogDate(
                  post.publishedAt
                )}
              </span>
            )}

            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-white/35"
            />

            <span>
              {readTime} min czytania
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (
    variant === "hero"
  ) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group relative flex min-h-[420px] overflow-hidden rounded-panel border border-border bg-navy-950 shadow-card sm:min-h-[520px]"
      >
        <CardImage
          post={post}
          className="absolute inset-0 h-full w-full"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/42 to-transparent" />

        <div className="relative mt-auto max-w-3xl p-6 text-white sm:p-8 lg:p-10">
          <span className="inline-flex rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-primary-800">
            {getBlogCategoryLabel(
              post.category
            )}
          </span>

          <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
              {
                post.excerpt
              }
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/60">
            {post.publishedAt && (
              <span>
                {formatBlogDate(
                  post.publishedAt
                )}
              </span>
            )}

            <span>
              {readTime} min czytania
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card"
    >
      <CardImage
        post={post}
        className="aspect-[16/10]"
      />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <Meta
          post={post}
          readTime={readTime}
        />

        <h3 className="mt-3 font-display text-xl font-extrabold leading-snug tracking-[-0.03em] text-text transition group-hover:text-primary-800 sm:text-[22px]">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-secondary">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {post.tags
              .slice(0, 2)
              .map((tag) => (
                <span
                  key={tag}
                  className="max-w-[130px] truncate rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-bold text-text-muted"
                >
                  #{tag}
                </span>
              ))}
          </div>

          <span className="shrink-0 text-xs font-extrabold text-primary-700">
            Czytaj →
          </span>
        </div>
      </div>
    </Link>
  );
}

function CardImage({
  post,
  className,
}: {
  post: BlogPostCardProps["post"];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-primary-100 via-surface-muted to-primary-50",
        className
      )}
    >
      {post.coverImageUrl ? (
        <img
          src={
            post.coverImageUrl
          }
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
        />
      ) : (
        <div className="flex h-full min-h-[160px] items-center justify-center">
          <div className="rounded-2xl bg-surface/90 px-4 py-3 font-display text-sm font-black uppercase tracking-[0.16em] text-primary-700 shadow-sm">
            Wiedza Rybio
          </div>
        </div>
      )}
    </div>
  );
}

function Meta({
  post,
  readTime,
}: {
  post: BlogPostCardProps["post"];
  readTime: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-text-muted">
      <span className="text-primary-700">
        {getBlogCategoryLabel(
          post.category
        )}
      </span>

      <span
        aria-hidden="true"
        className="h-1 w-1 rounded-full bg-border-strong"
      />

      <span>
        {readTime} min
      </span>

      {post.publishedAt && (
        <>
          <span
            aria-hidden="true"
            className="h-1 w-1 rounded-full bg-border-strong"
          />

          <span>
            {formatBlogDate(
              post.publishedAt
            )}
          </span>
        </>
      )}
    </div>
  );
}
