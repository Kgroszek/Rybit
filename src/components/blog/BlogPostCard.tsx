import Link from "next/link";

import {
  getBlogCategoryLabel,
  getBlogReadTime,
  parseBlogBlocks,
} from "@/lib/blog";

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
  large?: boolean;
};

export function BlogPostCard({ post, large = false }: BlogPostCardProps) {
  const blocks = parseBlogBlocks(post.content);
  const readTime = getBlogReadTime(blocks);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg ${
        large ? "md:grid md:grid-cols-[1.12fr_.88fr]" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-blue-100 via-cyan-50 to-emerald-50 ${
          large ? "min-h-[300px] md:min-h-[390px]" : "aspect-[16/10]"
        }`}
      >
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full min-h-[220px] items-center justify-center text-5xl">
            🎣
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />

        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur">
          {getBlogCategoryLabel(post.category)}
        </span>
      </div>

      <div className={`flex flex-1 flex-col ${large ? "p-6 sm:p-8" : "p-5"}`}>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
          {post.publishedAt && (
            <span>{formatBlogDate(post.publishedAt)}</span>
          )}
          <span>•</span>
          <span>{readTime} min czytania</span>
        </div>

        <h2
          className={`mt-3 font-extrabold tracking-tight text-slate-950 ${
            large ? "text-2xl sm:text-3xl" : "text-xl"
          }`}
        >
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
            {post.excerpt}
          </p>
        )}

        {post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <span className="mt-auto pt-6 text-sm font-bold text-blue-600">
          Czytaj artykuł →
        </span>
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
