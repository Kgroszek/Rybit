import {
  BlogPostCard,
} from "@/components/blog/BlogPostCard";

type FeaturedPost = {
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

export function BlogFeaturedGrid({
  primary,
  secondary,
}: {
  primary: FeaturedPost;
  secondary: FeaturedPost[];
}) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
            Polecane
          </p>

          <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-[-0.03em] text-text sm:text-3xl">
            Zacznij tutaj
          </h2>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.75fr)]">
        <BlogPostCard
          post={primary}
          variant="hero"
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:h-[520px] xl:grid-cols-1 xl:grid-rows-2">
          {secondary.map(
            (post) => (
              <BlogPostCard
                key={post.id}
                post={post}
                variant="compact"
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}
