import {
  BlogPostCard,
} from "@/components/blog/BlogPostCard";

type RelatedPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  tags: string[];
  coverImageUrl: string | null;
  content: unknown;
  publishedAt: Date | null;
};

export function BlogRelatedPosts({
  posts,
  title = "Czytaj dalej",
}: {
  posts: RelatedPost[];
  title?: string;
}) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border pt-10 sm:pt-12">
      <div className="mb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
          Wiedza Rybio
        </p>

        <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-[-0.03em] text-text sm:text-3xl">
          {title}
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard
            key={post.id}
            post={post}
          />
        ))}
      </div>
    </section>
  );
}
