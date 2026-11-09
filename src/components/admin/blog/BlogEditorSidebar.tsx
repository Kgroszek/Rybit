"use client";

import {
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { BlogBlockInspector } from "@/components/admin/blog/BlogBlockInspector";
import type {
  BlogInspectorTab,
} from "@/components/admin/blog/BlogEditorTypes";
import type {
  BlogPostEditorController,
} from "@/components/admin/blog/useBlogPostEditor";
import {
  BLOG_CATEGORIES,
  getBlogPublicationState,
} from "@/lib/blog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";

const TABS: Array<{
  value: BlogInspectorTab;
  label: string;
}> = [
  {
    value: "document",
    label: "Dokument",
  },
  {
    value: "block",
    label: "Blok",
  },
  {
    value: "seo",
    label: "SEO",
  },
];

export function BlogEditorSidebar({
  controller,
  onRequestUnpublish,
}: {
  controller: BlogPostEditorController;
  onRequestUnpublish: () => void;
}) {
  return (
    <aside className="min-w-0 rounded-panel border border-border bg-surface shadow-card xl:sticky xl:top-[92px] xl:self-start">
      <div className="border-b border-border p-2">
        <div className="grid grid-cols-3 gap-1 rounded-control bg-surface-muted p-1">
          {TABS.map((tab) => {
            const disabled =
              tab.value ===
                "block" &&
              !controller.selectedBlock;

            return (
              <button
                key={tab.value}
                type="button"
                disabled={disabled}
                onClick={() =>
                  controller.setInspectorTab(
                    tab.value
                  )
                }
                className={cn(
                  "min-h-9 rounded-xl px-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-35",
                  controller.inspectorTab ===
                    tab.value
                    ? "bg-surface text-primary-700 shadow-sm"
                    : "text-text-muted hover:text-text"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-h-[calc(100dvh-150px)] overflow-y-auto p-5 [scrollbar-gutter:stable]">
        {controller.inspectorTab ===
          "document" && (
          <DocumentPanel
            controller={
              controller
            }
            onRequestUnpublish={
              onRequestUnpublish
            }
          />
        )}

        {controller.inspectorTab ===
          "block" && (
          controller.selectedBlock ? (
            <BlockPanel
              controller={
                controller
              }
            />
          ) : (
            <p className="text-sm leading-6 text-text-muted">
              Kliknij blok na
              płótnie artykułu, aby
              zobaczyć jego
              ustawienia.
            </p>
          )
        )}

        {controller.inspectorTab ===
          "seo" && (
          <SeoPanel
            controller={
              controller
            }
          />
        )}
      </div>
    </aside>
  );
}

function DocumentPanel({
  controller,
  onRequestUnpublish,
}: {
  controller: BlogPostEditorController;
  onRequestUnpublish: () => void;
}) {
  const [tagInput, setTagInput] =
    useState("");

  const coverInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const state =
    getBlogPublicationState(
      controller.snapshot.status,
      controller.snapshot.publishedAt
    );

  function handleTagKeyDown(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key === "Enter" ||
      event.key === ","
    ) {
      event.preventDefault();

      controller.addTag(
        tagInput
      );

      setTagInput("");
    }

    if (
      event.key ===
        "Backspace" &&
      !tagInput &&
      controller.snapshot.tags
        .length > 0
    ) {
      const last =
        controller.snapshot
          .tags[
          controller.snapshot
            .tags.length - 1
        ];

      controller.removeTag(
        last
      );
    }
  }

  return (
    <div className="grid gap-6">
      <PanelHeading
        title="Ustawienia artykułu"
        description="Organizacja, publikacja i dane widoczne dla czytelnika."
      />

      <section className="grid gap-4">
        <SectionLabel>
          Publikacja
        </SectionLabel>

        <div className="flex items-center justify-between gap-3 rounded-control border border-border bg-surface-muted px-3.5 py-3">
          <span className="text-xs font-bold text-text-secondary">
            Status
          </span>

          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em]",
              state ===
                "published"
                ? "bg-success-subtle text-success-foreground"
                : state ===
                    "scheduled"
                  ? "bg-primary-50 text-primary-700"
                  : "bg-warning-subtle text-warning-foreground"
            )}
          >
            {state ===
            "published"
              ? "Online"
              : state ===
                  "scheduled"
                ? "Zaplanowany"
                : "Szkic"}
          </span>
        </div>

        {state !==
          "published" && (
          <>
            <SelectField
              label="Sposób publikacji"
              value={
                controller.publicationMode
              }
              onChange={(
                value
              ) =>
                controller.setPublicationMode(
                  value ===
                    "scheduled"
                    ? "scheduled"
                    : "now"
                )
              }
            >
              <option value="now">
                Od razu
              </option>
              <option value="scheduled">
                Zaplanuj
              </option>
            </SelectField>

            {controller.publicationMode ===
              "scheduled" && (
              <label className="grid gap-2.5">
                <span className="text-xs font-bold text-text-secondary">
                  Data i godzina
                </span>

                <Input
                  type="datetime-local"
                  value={
                    controller.scheduledLocalValue
                  }
                  onChange={(
                    event
                  ) =>
                    controller.setScheduledLocal(
                      event
                        .target
                        .value
                    )
                  }
                />
              </label>
            )}
          </>
        )}

        {state ===
          "published" && (
          <button
            type="button"
            onClick={
              onRequestUnpublish
            }
            className="text-left text-xs font-bold text-danger-foreground transition hover:underline"
          >
            Cofnij publikację
          </button>
        )}
      </section>

      <section className="grid gap-4 border-t border-border pt-6">
        <SectionLabel>
          Organizacja
        </SectionLabel>

        <SelectField
          label="Kategoria"
          value={
            controller.snapshot.category
          }
          onChange={(value) =>
            controller.patchSnapshot(
              {
                category:
                  value as typeof controller.snapshot.category,
              }
            )
          }
        >
          {BLOG_CATEGORIES.map(
            (item) => (
              <option
                key={
                  item.value
                }
                value={
                  item.value
                }
              >
                {item.label}
              </option>
            )
          )}
        </SelectField>

        <div>
          <label className="text-xs font-bold text-text-secondary">
            Tagi
          </label>

          <div className="mt-2.5 flex min-h-11 flex-wrap items-center gap-1.5 rounded-control border border-border-strong bg-surface p-2 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary-100">
            {controller.snapshot.tags.map(
              (tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-50 py-1 pl-2.5 pr-1 text-[10px] font-bold text-primary-700"
                >
                  #{tag}

                  <button
                    type="button"
                    onClick={() =>
                      controller.removeTag(
                        tag
                      )
                    }
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-surface text-primary-600"
                    aria-label={`Usuń tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              )
            )}

            <input
              value={tagInput}
              onChange={(event) =>
                setTagInput(
                  event.target
                    .value
                )
              }
              onKeyDown={
                handleTagKeyDown
              }
              onBlur={() => {
                if (
                  tagInput.trim()
                ) {
                  controller.addTag(
                    tagInput
                  );
                  setTagInput("");
                }
              }}
              placeholder={
                controller.snapshot
                  .tags.length === 0
                  ? "karp, lato..."
                  : ""
              }
              className="h-7 min-w-[110px] flex-1 bg-transparent px-1 text-xs font-semibold text-text outline-none placeholder:text-text-muted"
            />
          </div>

          <p className="mt-1.5 text-[10px] leading-4 text-text-muted">
            Maksymalnie 12 tagów.
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-control border border-border bg-surface-muted p-4">
          <input
            type="checkbox"
            checked={
              controller.snapshot
                .isFeatured
            }
            onChange={(event) =>
              controller.patchSnapshot(
                {
                  isFeatured:
                    event.target
                      .checked,
                }
              )
            }
            className="mt-0.5 h-4 w-4 accent-[var(--rybio-primary)]"
          />

          <span>
            <span className="block text-xs font-extrabold text-text">
              Wyróżniony
              artykuł
            </span>

            <span className="mt-1 block text-[11px] leading-5 text-text-muted">
              Może zostać
              pokazany jako główny
              materiał na stronie
              Wiedzy Rybio.
            </span>
          </span>
        </label>
      </section>

      <section className="grid gap-4 border-t border-border pt-6">
        <SectionLabel>
          Adres i autor
        </SectionLabel>

        <label className="grid gap-2.5">
          <span className="text-xs font-bold text-text-secondary">
            Slug
          </span>

          <div className="flex h-11 items-center rounded-control border border-border-strong bg-surface px-3 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary-100">
            <span className="text-xs font-semibold text-text-muted">
              /blog/
            </span>

            <input
              value={
                controller.snapshot.slug
              }
              onChange={(event) =>
                controller.setSlug(
                  event.target
                    .value
                )
              }
              onBlur={
                controller.normalizeSlug
              }
              className="min-w-0 flex-1 bg-transparent text-xs font-bold text-text outline-none"
            />
          </div>
        </label>

        <Field
          label="Autor"
          value={
            controller.snapshot
              .authorName
          }
          onChange={(value) =>
            controller.patchSnapshot(
              {
                authorName:
                  value,
              }
            )
          }
          placeholder="Rybio"
        />
      </section>

      <section className="grid gap-4 border-t border-border pt-6">
        <SectionLabel>
          Zdjęcie główne
        </SectionLabel>

        {controller.snapshot
          .coverImageUrl && (
          <img
            src={
              controller.snapshot
                .coverImageUrl
            }
            alt=""
            className="aspect-[16/10] w-full rounded-card border border-border object-cover"
          />
        )}

        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          disabled={
            controller.uploadingCover
          }
          onChange={(
            event
          ) => {
            const file =
              event.target
                .files?.[0];

            if (file) {
              void controller.uploadCover(
                file
              );
            }

            event.currentTarget.value =
              "";
          }}
        />

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              controller.uploadingCover
            }
            onClick={() =>
              coverInputRef.current?.click()
            }
          >
            {controller.uploadingCover
              ? "Wysyłanie…"
              : controller
                    .snapshot
                    .coverImageUrl
                ? "Zmień"
                : "Dodaj"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={
              !controller.snapshot
                .coverImageUrl
            }
            onClick={() =>
              controller.patchSnapshot(
                {
                  coverImageUrl:
                    "",
                }
              )
            }
          >
            Usuń
          </Button>
        </div>
      </section>
    </div>
  );
}

function BlockPanel({
  controller,
}: {
  controller: BlogPostEditorController;
}) {
  const block =
    controller.selectedBlock;

  if (!block) {
    return null;
  }

  return (
    <div className="grid gap-6">
      <PanelHeading
        title="Ustawienia bloku"
        description="Treść edytujesz na płótnie. Tutaj znajdują się ustawienia zależne od typu bloku."
      />

      <div className="rounded-control bg-primary-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-primary-700">
        {getBlockLabel(
          block.type
        )}
      </div>

      <BlogBlockInspector
        block={block}
        onUpload={
          controller.uploadContentImage
        }
        onChange={(next) =>
          controller.replaceBlock(
            block.id,
            next
          )
        }
      />
    </div>
  );
}

function SeoPanel({
  controller,
}: {
  controller: BlogPostEditorController;
}) {
  const title =
    controller.snapshot
      .seoTitle.trim() ||
    controller.snapshot.title.trim() ||
    "Tytuł artykułu";

  const description =
    controller.snapshot
      .seoDescription.trim() ||
    controller.snapshot
      .excerpt.trim() ||
    "Krótki opis artykułu widoczny w wynikach wyszukiwania.";

  const slug =
    controller.snapshot.slug ||
    "slug-artykulu";

  return (
    <div className="grid gap-6">
      <PanelHeading
        title="Widoczność w Google"
        description="Ustaw tytuł i opis wyników wyszukiwania bez sztucznego punktowego SEO score."
      />

      <div className="rounded-card border border-border bg-surface-muted p-4">
        <p className="truncate text-xs text-success-foreground">
          rybio.pl › blog ›{" "}
          {slug}
        </p>

        <p className="mt-1.5 line-clamp-2 text-base font-semibold leading-6 text-primary-700">
          {title}
        </p>

        <p className="mt-1 line-clamp-3 text-xs leading-5 text-text-secondary">
          {description}
        </p>
      </div>

      <CounterField
        label="SEO title"
        value={
          controller.snapshot
            .seoTitle
        }
        max={70}
        recommended={60}
        onChange={(value) =>
          controller.patchSnapshot(
            {
              seoTitle: value,
            }
          )
        }
        placeholder={
          controller.snapshot
            .title ||
          "Tytuł artykułu | Rybio"
        }
      />

      <CounterTextarea
        label="Meta description"
        value={
          controller.snapshot
            .seoDescription
        }
        max={180}
        recommended={160}
        onChange={(value) =>
          controller.patchSnapshot(
            {
              seoDescription:
                value,
            }
          )
        }
        placeholder={
          controller.snapshot
            .excerpt ||
          "Opis artykułu widoczny w wynikach wyszukiwania."
        }
      />
    </div>
  );
}

function PanelHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="font-display text-lg font-extrabold tracking-[-0.025em] text-text">
        {title}
      </h2>

      <p className="mt-1.5 text-xs leading-5 text-text-muted">
        {description}
      </p>
    </div>
  );
}

function SectionLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
      {children}
    </p>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2.5">
      <span className="text-xs font-bold text-text-secondary">
        {label}
      </span>

      <Input
        value={value}
        placeholder={
          placeholder
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2.5">
      <span className="text-xs font-bold text-text-secondary">
        {label}
      </span>

      <Select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      >
        {children}
      </Select>
    </label>
  );
}

function CounterField({
  label,
  value,
  max,
  recommended,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  max: number;
  recommended: number;
  onChange: (
    value: string
  ) => void;
  placeholder: string;
}) {
  return (
    <label className="grid gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-text-secondary">
          {label}
        </span>

        <Counter
          value={
            value.length
          }
          max={max}
          recommended={
            recommended
          }
        />
      </div>

      <Input
        value={value}
        maxLength={max}
        placeholder={
          placeholder
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      />
    </label>
  );
}

function CounterTextarea({
  label,
  value,
  max,
  recommended,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  max: number;
  recommended: number;
  onChange: (
    value: string
  ) => void;
  placeholder: string;
}) {
  return (
    <label className="grid gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-text-secondary">
          {label}
        </span>

        <Counter
          value={
            value.length
          }
          max={max}
          recommended={
            recommended
          }
        />
      </div>

      <Textarea
        value={value}
        rows={5}
        maxLength={max}
        placeholder={
          placeholder
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      />
    </label>
  );
}

function Counter({
  value,
  max,
  recommended,
}: {
  value: number;
  max: number;
  recommended: number;
}) {
  return (
    <span
      className={cn(
        "text-[10px] font-bold tabular-nums",
        value > recommended
          ? "text-warning-foreground"
          : "text-text-muted"
      )}
    >
      {value}/{max}
    </span>
  );
}

function getBlockLabel(
  type: string
) {
  const labels:
    Record<string, string> = {
    paragraph: "Akapit",
    heading2:
      "Nagłówek H2",
    heading3:
      "Nagłówek H3",
    image: "Zdjęcie",
    gallery: "Galeria",
    quote: "Cytat",
    list: "Lista",
    callout:
      "Wyróżnienie",
    table: "Tabela",
    steps: "Kroki",
    faq: "FAQ",
    cta: "CTA",
    divider:
      "Separator",
  };

  return (
    labels[type] || type
  );
}
