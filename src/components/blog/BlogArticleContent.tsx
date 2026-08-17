import { BlogRichText } from "@/components/blog/BlogRichText";
import type { BlogBlock } from "@/lib/blog";

export function BlogArticleContent({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="mx-auto w-full max-w-[860px]">
      {blocks.map((block) => {
        if (block.type === "paragraph") {
          return (
            <p
              key={block.id}
              className="mb-6 text-[17px] leading-8 text-slate-700"
            >
              <BlogRichText text={block.text} />
            </p>
          );
        }

        if (block.type === "heading2") {
          return (
            <h2
              key={block.id}
              className="mb-4 mt-10 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "heading3") {
          return (
            <h3
              key={block.id}
              className="mb-3 mt-8 text-xl font-bold text-slate-950 sm:text-2xl"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={block.id}
              className="my-8 rounded-r-2xl border-l-4 border-blue-500 bg-blue-50 px-5 py-4 text-base font-medium leading-7 text-blue-950"
            >
              <BlogRichText text={block.text} />
            </blockquote>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              key={block.id}
              className="mb-7 ml-5 list-disc space-y-2 text-[17px] leading-8 text-slate-700 marker:text-blue-500"
            >
              {block.items.map((item, index) => (
                <li key={`${block.id}-${index}`}>
                  <BlogRichText text={item} />
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "image") {
          return (
            <figure key={block.id} className="my-9">
              <div className="overflow-hidden rounded-3xl bg-slate-100">
                <img
                  src={block.url}
                  alt={block.alt}
                  className="h-auto w-full object-cover"
                />
              </div>

              {block.caption && (
                <figcaption className="mt-3 text-center text-sm leading-6 text-slate-500">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        return null;
      })}
    </div>
  );
}