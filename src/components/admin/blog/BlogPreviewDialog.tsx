"use client";

import {
  BlogEditorDialog,
} from "@/components/admin/blog/BlogEditorDialog";
import type {
  BlogEditorSnapshot,
  BlogPreviewDevice,
} from "@/components/admin/blog/BlogEditorTypes";
import {
  BlogArticleContent,
} from "@/components/blog/BlogArticleContent";
import {
  BlogTableOfContents,
} from "@/components/blog/BlogTableOfContents";
import {
  formatBlogDate,
  getBlogCategoryLabel,
  getBlogReadTime,
  getBlogTableOfContents,
} from "@/lib/blog";
import { cn } from "@/lib/cn";

export function BlogPreviewDialog({
  open,
  snapshot,
  device,
  onDeviceChange,
  onClose,
}: {
  open: boolean;
  snapshot: BlogEditorSnapshot;
  device: BlogPreviewDevice;
  onDeviceChange: (
    device: BlogPreviewDevice
  ) => void;
  onClose: () => void;
}) {
  const readTime =
    getBlogReadTime(
      snapshot.blocks
    );

  const toc =
    getBlogTableOfContents(
      snapshot.blocks
    );

  return (
    <BlogEditorDialog
      open={open}
      onClose={onClose}
      title="Podgląd artykułu"
      description="Podgląd korzysta z tego samego renderera treści co publiczny artykuł."
      size="preview"
    >
      <div className="flex min-h-full flex-col bg-surface-strong">
        <div className="flex shrink-0 items-center justify-center border-b border-border bg-surface px-4 py-3">
          <div className="grid grid-cols-2 gap-1 rounded-control bg-surface-muted p-1">
            <DeviceButton
              active={
                device ===
                "desktop"
              }
              label="Desktop"
              onClick={() =>
                onDeviceChange(
                  "desktop"
                )
              }
            />

            <DeviceButton
              active={
                device ===
                "mobile"
              }
              label="Mobile"
              onClick={() =>
                onDeviceChange(
                  "mobile"
                )
              }
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">
          <div
            className={cn(
              "mx-auto min-h-full overflow-hidden bg-background shadow-float transition-[width,border-radius] duration-200",
              device ===
                "mobile"
                ? "w-[390px] max-w-full rounded-[28px] border-[10px] border-navy-950"
                : "w-full max-w-[1180px] rounded-panel border border-border"
            )}
          >
            <article className="bg-background">
              <header className="border-b border-border bg-surface px-5 py-8 sm:px-8 sm:py-10">
                <span className="inline-flex rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-primary-700">
                  {getBlogCategoryLabel(
                    snapshot.category
                  )}
                </span>

                <h1
                  className={cn(
                    "mt-4 font-display font-extrabold leading-[1.05] tracking-[-0.045em] text-text",
                    device ===
                      "mobile"
                      ? "text-4xl"
                      : "max-w-4xl text-5xl lg:text-6xl"
                  )}
                >
                  {snapshot.title ||
                    "Tytuł artykułu"}
                </h1>

                {snapshot.excerpt && (
                  <p className="mt-5 max-w-3xl text-lg leading-8 text-text-secondary">
                    {
                      snapshot.excerpt
                    }
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-bold text-text-muted">
                  <span className="text-text-secondary">
                    {snapshot.authorName ||
                      "Rybio"}
                  </span>

                  <span>•</span>

                  <span>
                    {formatBlogDate(
                      snapshot.publishedAt
                        ? new Date(
                            snapshot.publishedAt
                          )
                        : new Date()
                    )}
                  </span>

                  <span>•</span>

                  <span>
                    {readTime} min
                    czytania
                  </span>
                </div>
              </header>

              {snapshot.coverImageUrl && (
                <div className="p-5 sm:p-8">
                  <img
                    src={
                      snapshot.coverImageUrl
                    }
                    alt=""
                    className="max-h-[620px] w-full rounded-panel border border-border object-cover"
                  />
                </div>
              )}

              <div
                className={cn(
                  "mx-auto grid w-full gap-8 px-5 py-8 sm:px-8",
                  device ===
                    "desktop" &&
                    toc.length >=
                      2
                    ? "max-w-[1060px] xl:grid-cols-[200px_minmax(0,1fr)]"
                    : "max-w-[920px]"
                )}
              >
                {device ===
                  "desktop" &&
                  toc.length >=
                    2 && (
                    <aside className="hidden xl:block">
                      <BlogTableOfContents
                        items={toc}
                      />
                    </aside>
                  )}

                <BlogArticleContent
                  blocks={
                    snapshot.blocks
                  }
                />
              </div>
            </article>
          </div>
        </div>
      </div>
    </BlogEditorDialog>
  );
}

function DeviceButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-9 rounded-xl px-4 text-xs font-bold transition",
        active
          ? "bg-surface text-primary-700 shadow-sm"
          : "text-text-muted hover:text-text"
      )}
    >
      {label}
    </button>
  );
}
