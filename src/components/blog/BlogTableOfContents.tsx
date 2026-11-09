import type {
  BlogTableOfContentsItem,
} from "@/lib/blog";

export function BlogTableOfContents({
  items,
}: {
  items: BlogTableOfContentsItem[];
}) {
  if (items.length < 2) {
    return null;
  }

  return (
    <nav
      aria-label="Spis treści"
      className="rounded-card border border-border bg-surface p-4"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">
        Spis treści
      </p>

      <ol className="mt-3 space-y-1">
        {items.map(
          (item, index) => (
            <li
              key={
                item.blockId
              }
              className={
                item.level ===
                3
                  ? "pl-4"
                  : ""
              }
            >
              <a
                href={`#${item.id}`}
                className="group grid grid-cols-[28px_minmax(0,1fr)] gap-2 rounded-xl px-2 py-2 text-xs leading-5 text-text-secondary transition hover:bg-primary-50 hover:text-primary-800"
              >
                <span className="font-black tabular-nums text-text-muted group-hover:text-primary-600">
                  {String(
                    index + 1
                  ).padStart(2, "0")}
                </span>

                <span className="font-semibold">
                  {item.text}
                </span>
              </a>
            </li>
          )
        )}
      </ol>
    </nav>
  );
}
