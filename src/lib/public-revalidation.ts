import { revalidatePath } from "next/cache";

const LAKE_AGGREGATE_PATHS = [
  "/lowiska-w-polsce",
  "/lowiska-mazowieckie",
  "/lowiska-lubelskie",
  "/lowiska-malopolskie",
  "/lowiska-wielkopolskie",
  "/lowiska-podkarpackie",
  "/lowiska-slaskie",
  "/lowiska-zachodniopomorskie",
  "/lowiska-komercyjne",
  "/lowiska-no-kill",
  "/lowiska-z-domkami",
  "/lowiska-z-noclegiem",
  "/lowiska-karpiowe",
] as const;

function uniqueSlugs(slugs: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      slugs
        .map((slug) => slug?.trim())
        .filter((slug): slug is string => Boolean(slug))
    )
  );
}

export function revalidateLakePublicContent(
  slugs: Array<string | null | undefined> = []
) {
  LAKE_AGGREGATE_PATHS.forEach((path) => {
    revalidatePath(path);
  });

  uniqueSlugs(slugs).forEach((slug) => {
    revalidatePath(`/lowiska-w-polsce/${slug}`);
  });

  revalidatePath("/sitemap.xml");
}

export function revalidateBlogPublicContent(
  slugs: Array<string | null | undefined> = []
) {
  revalidatePath("/blog");
  revalidatePath("/blog/strona/[page]", "page");

  uniqueSlugs(slugs).forEach((slug) => {
    revalidatePath(`/blog/${slug}`);
  });

  revalidatePath("/sitemap.xml");
}
