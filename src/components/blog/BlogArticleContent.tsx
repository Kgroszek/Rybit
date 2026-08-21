import {
  BlogRichText,
  sanitizeBlogHref,
} from "@/components/blog/BlogRichText";
import {
  getBlogTableOfContents,
  type BlogBlock,
} from "@/lib/blog";
import { cn } from "@/lib/cn";

export function BlogArticleContent({
  blocks,
}: {
  blocks: BlogBlock[];
}) {
  const toc =
    getBlogTableOfContents(
      blocks
    );

  const headingIds =
    new Map(
      toc.map((item) => [
        item.blockId,
        item.id,
      ])
    );

  return (
    <div className="w-full">
      {blocks.map((block) => {
        if (
          block.type ===
          "paragraph"
        ) {
          return (
            <p
              key={block.id}
              className="mx-auto mb-7 w-full max-w-[760px] text-[17px] leading-[1.9] text-text-secondary sm:text-[18px]"
            >
              <BlogRichText
                text={block.text}
              />
            </p>
          );
        }

        if (
          block.type ===
          "heading2"
        ) {
          return (
            <h2
              key={block.id}
              id={
                headingIds.get(
                  block.id
                )
              }
              className="mx-auto mb-5 mt-14 w-full max-w-[760px] scroll-mt-28 font-display text-3xl font-extrabold leading-tight tracking-[-0.035em] text-text sm:text-[36px]"
            >
              {block.text}
            </h2>
          );
        }

        if (
          block.type ===
          "heading3"
        ) {
          return (
            <h3
              key={block.id}
              id={
                headingIds.get(
                  block.id
                )
              }
              className="mx-auto mb-4 mt-10 w-full max-w-[760px] scroll-mt-28 font-display text-2xl font-extrabold leading-tight tracking-[-0.025em] text-text"
            >
              {block.text}
            </h3>
          );
        }

        if (
          block.type === "quote"
        ) {
          return (
            <figure
              key={block.id}
              className="mx-auto my-10 w-full max-w-[820px] rounded-panel border border-primary-200 bg-primary-50 px-5 py-6 sm:px-7"
            >
              <blockquote className="font-display text-xl font-bold leading-8 tracking-[-0.015em] text-primary-900 sm:text-2xl">
                “
                <BlogRichText
                  text={block.text}
                />
                ”
              </blockquote>

              {block.attribution && (
                <figcaption className="mt-4 text-sm font-bold text-primary-700">
                  —{" "}
                  {
                    block.attribution
                  }
                </figcaption>
              )}
            </figure>
          );
        }

        if (
          block.type === "list"
        ) {
          const ListTag =
            block.style ===
            "numbered"
              ? "ol"
              : "ul";

          return (
            <ListTag
              key={block.id}
              className={cn(
                "mx-auto mb-8 w-full max-w-[760px] space-y-3 pl-6 text-[17px] leading-8 text-text-secondary marker:font-extrabold marker:text-primary-600 sm:text-[18px]",
                block.style ===
                  "numbered"
                  ? "list-decimal"
                  : "list-disc"
              )}
            >
              {block.items.map(
                (item, index) => (
                  <li
                    key={`${block.id}-${index}`}
                    className="pl-1"
                  >
                    <BlogRichText
                      text={item}
                    />
                  </li>
                )
              )}
            </ListTag>
          );
        }

        if (
          block.type ===
          "callout"
        ) {
          const styles =
            getCalloutStyles(
              block.tone
            );

          return (
            <aside
              key={block.id}
              className={cn(
                "mx-auto my-9 w-full max-w-[820px] rounded-panel border px-5 py-5 sm:px-6",
                styles.container
              )}
            >
              <p
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.15em]",
                  styles.eyebrow
                )}
              >
                {styles.label}
              </p>

              {block.title && (
                <h4 className="mt-2 font-display text-lg font-extrabold tracking-[-0.02em] text-text">
                  {block.title}
                </h4>
              )}

              {block.text && (
                <p className="mt-2 text-[16px] leading-7 text-text-secondary">
                  <BlogRichText
                    text={
                      block.text
                    }
                  />
                </p>
              )}
            </aside>
          );
        }

        if (
          block.type === "image"
        ) {
          return (
            <figure
              key={block.id}
              className={cn(
                "mx-auto my-10",
                block.width ===
                  "wide"
                  ? "w-full max-w-[1120px]"
                  : "w-full max-w-[820px]"
              )}
            >
              <div className="overflow-hidden rounded-panel border border-border bg-surface-muted">
                <img
                  src={block.url}
                  alt={block.alt}
                  className="h-auto w-full object-cover"
                />
              </div>

              {block.caption && (
                <figcaption className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-text-muted">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        if (
          block.type ===
          "gallery"
        ) {
          return (
            <BlogGallery
              key={block.id}
              block={block}
            />
          );
        }

        if (
          block.type === "table"
        ) {
          return (
            <figure
              key={block.id}
              className="mx-auto my-10 w-full max-w-[940px]"
            >
              <div className="overflow-x-auto rounded-panel border border-border bg-surface shadow-sm">
                <table className="min-w-full border-collapse text-left">
                  <thead className="bg-surface-muted">
                    <tr>
                      {block.headers.map(
                        (
                          header,
                          index
                        ) => (
                          <th
                            key={`${block.id}-header-${index}`}
                            className="border-b border-border px-4 py-3.5 text-xs font-black uppercase tracking-[0.08em] text-text-secondary"
                          >
                            {
                              header
                            }
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {block.rows.map(
                      (
                        row,
                        rowIndex
                      ) => (
                        <tr
                          key={`${block.id}-row-${rowIndex}`}
                        >
                          {block.headers.map(
                            (
                              _,
                              cellIndex
                            ) => (
                              <td
                                key={`${block.id}-${rowIndex}-${cellIndex}`}
                                className="px-4 py-3.5 align-top text-sm leading-6 text-text-secondary"
                              >
                                <BlogRichText
                                  text={
                                    row[
                                      cellIndex
                                    ] ||
                                    ""
                                  }
                                />
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {block.caption && (
                <figcaption className="mt-3 text-center text-sm leading-6 text-text-muted">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        if (
          block.type === "steps"
        ) {
          return (
            <section
              key={block.id}
              className="mx-auto my-11 w-full max-w-[820px]"
            >
              {block.title && (
                <h4 className="mb-5 font-display text-2xl font-extrabold tracking-[-0.025em] text-text">
                  {block.title}
                </h4>
              )}

              <ol className="space-y-3">
                {block.items.map(
                  (item, index) => (
                    <li
                      key={
                        item.id
                      }
                      className="grid grid-cols-[40px_minmax(0,1fr)] gap-4 rounded-card border border-border bg-surface px-4 py-4 sm:px-5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-sm font-black tabular-nums text-primary-700">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <div className="min-w-0 pt-0.5">
                        {item.title && (
                          <p className="font-display text-base font-extrabold text-text">
                            {
                              item.title
                            }
                          </p>
                        )}

                        {item.text && (
                          <p className="mt-1.5 text-sm leading-6 text-text-secondary">
                            <BlogRichText
                              text={
                                item.text
                              }
                            />
                          </p>
                        )}
                      </div>
                    </li>
                  )
                )}
              </ol>
            </section>
          );
        }

        if (
          block.type === "faq"
        ) {
          return (
            <section
              key={block.id}
              className="mx-auto my-12 w-full max-w-[820px]"
            >
              <div className="mb-5">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">
                  FAQ
                </p>

                <h4 className="mt-1.5 font-display text-2xl font-extrabold tracking-[-0.025em] text-text">
                  {block.title ||
                    "Najczęstsze pytania"}
                </h4>
              </div>

              <div className="divide-y divide-border overflow-hidden rounded-panel border border-border bg-surface">
                {block.items.map(
                  (item) => (
                    <details
                      key={
                        item.id
                      }
                      className="group"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-extrabold text-text marker:hidden sm:px-6">
                        {
                          item.question
                        }

                        <span
                          className="shrink-0 text-lg font-medium text-text-muted transition group-open:rotate-45"
                          aria-hidden="true"
                        >
                          +
                        </span>
                      </summary>

                      <div className="px-5 pb-5 text-sm leading-7 text-text-secondary sm:px-6">
                        <BlogRichText
                          text={
                            item.answer
                          }
                        />
                      </div>
                    </details>
                  )
                )}
              </div>
            </section>
          );
        }

        if (
          block.type === "cta"
        ) {
          const href =
            sanitizeBlogHref(
              block.buttonHref
            );

          return (
            <aside
              key={block.id}
              className={cn(
                "mx-auto my-12 w-full max-w-[940px] overflow-hidden rounded-panel px-6 py-8 sm:px-8 sm:py-10",
                block.style ===
                  "dark"
                  ? "bg-navy-950 text-white"
                  : "bg-primary-700 text-white"
              )}
            >
              {block.eyebrow && (
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/65">
                  {block.eyebrow}
                </p>
              )}

              <div className="mt-2 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="max-w-2xl">
                  {block.title && (
                    <h4 className="font-display text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
                      {
                        block.title
                      }
                    </h4>
                  )}

                  {block.text && (
                    <p className="mt-3 text-sm leading-7 text-white/75 sm:text-base">
                      {
                        block.text
                      }
                    </p>
                  )}
                </div>

                {href &&
                  block.buttonLabel && (
                    <a
                      href={href}
                      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-control bg-white px-5 text-sm font-extrabold text-primary-800 transition hover:bg-primary-50"
                    >
                      {
                        block.buttonLabel
                      }
                    </a>
                  )}
              </div>
            </aside>
          );
        }

        if (
          block.type ===
          "divider"
        ) {
          return (
            <div
              key={block.id}
              className="mx-auto my-12 w-full max-w-[760px]"
            >
              <div className="h-px bg-border" />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function BlogGallery({
  block,
}: {
  block: Extract<
    BlogBlock,
    {
      type: "gallery";
    }
  >;
}) {
  if (
    block.images.length === 0
  ) {
    return null;
  }

  if (
    block.layout ===
      "feature" &&
    block.images.length >= 2
  ) {
    const [
      first,
      ...rest
    ] = block.images;

    const sideImages =
      rest.slice(0, 3);

    const remainingImages =
      rest.slice(3);

    return (
      <div className="mx-auto my-10 w-full max-w-[1120px]">
        <div className="grid gap-3 lg:grid-cols-[1.25fr_.75fr]">
          <GalleryImage
            image={first}
            className="min-h-[300px] lg:min-h-[520px]"
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {sideImages.map(
              (image) => (
                <GalleryImage
                  key={
                    image.id
                  }
                  image={image}
                  className="min-h-[200px]"
                />
              )
            )}
          </div>
        </div>

        {remainingImages.length >
          0 && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {remainingImages.map(
              (image) => (
                <GalleryImage
                  key={
                    image.id
                  }
                  image={image}
                  className="aspect-[4/3]"
                />
              )
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto my-10 grid w-full max-w-[1040px] gap-3 sm:grid-cols-2">
      {block.images.map(
        (image) => (
          <GalleryImage
            key={image.id}
            image={image}
            className="aspect-[4/3]"
          />
        )
      )}
    </div>
  );
}

function GalleryImage({
  image,
  className,
}: {
  image: {
    url: string;
    alt: string;
    caption: string;
  };
  className: string;
}) {
  return (
    <figure className="min-w-0">
      <div
        className={cn(
          "overflow-hidden rounded-card border border-border bg-surface-muted",
          className
        )}
      >
        <img
          src={image.url}
          alt={image.alt}
          className="h-full w-full object-cover"
        />
      </div>

      {image.caption && (
        <figcaption className="mt-2 text-xs leading-5 text-text-muted">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

function getCalloutStyles(
  tone:
    | "tip"
    | "important"
    | "warning"
) {
  if (
    tone === "warning"
  ) {
    return {
      label: "Uwaga",
      container:
        "border-warning-border bg-warning-subtle",
      eyebrow:
        "text-warning-foreground",
    };
  }

  if (
    tone === "important"
  ) {
    return {
      label: "Ważne",
      container:
        "border-primary-200 bg-primary-50",
      eyebrow:
        "text-primary-700",
    };
  }

  return {
    label: "Wskazówka",
    container:
      "border-success-border bg-success-subtle",
    eyebrow:
      "text-success-foreground",
  };
}
