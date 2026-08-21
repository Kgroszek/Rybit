"use client";

import {
  useEffect,
  useRef,
  useState,
  type RefObject,
  type ReactNode,
} from "react";

import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { BlogEditorDialog } from "@/components/admin/blog/BlogEditorDialog";
import {
  BLOG_BLOCK_LIBRARY,
  type BlogBlock,
  type BlogBlockType,
} from "@/lib/blog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";

export function BlogBlockEditor({
  blocks,
  selectedBlockId,
  onSelect,
  onChange,
  onAdd,
  onRemove,
  onMove,
  onDrag,
  onUpload,
}: {
  blocks: BlogBlock[];
  selectedBlockId: string | null;
  onSelect: (
    id: string
  ) => void;
  onChange: (
    id: string,
    block: BlogBlock
  ) => void;
  onAdd: (
    type: BlogBlockType,
    afterId?: string | null
  ) => void;
  onRemove: (
    id: string
  ) => void;
  onMove: (
    id: string,
    direction: -1 | 1
  ) => void;
  onDrag: (
    sourceId: string,
    targetId: string
  ) => void;
  onUpload: (
    file: File
  ) => Promise<string>;
}) {
  const [
    draggingId,
    setDraggingId,
  ] = useState<string | null>(
    null
  );

  return (
    <div className="mt-8">
      <BlogBlockInsertMenu
        onInsert={(type) =>
          onAdd(type, null)
        }
      />

      <div className="mt-3 space-y-3">
        {blocks.map(
          (block, index) => (
            <div
              key={block.id}
            >
              <BlogBlockCard
                block={block}
                index={index}
                total={
                  blocks.length
                }
                selected={
                  selectedBlockId ===
                  block.id
                }
                dragging={
                  draggingId ===
                  block.id
                }
                onSelect={() =>
                  onSelect(
                    block.id
                  )
                }
                onChange={(
                  next
                ) =>
                  onChange(
                    block.id,
                    next
                  )
                }
                onMove={(
                  direction
                ) =>
                  onMove(
                    block.id,
                    direction
                  )
                }
                onRemove={() =>
                  onRemove(
                    block.id
                  )
                }
                onDragStart={() =>
                  setDraggingId(
                    block.id
                  )
                }
                onDragEnd={() =>
                  setDraggingId(
                    null
                  )
                }
                onDrop={() => {
                  if (
                    draggingId
                  ) {
                    onDrag(
                      draggingId,
                      block.id
                    );
                  }

                  setDraggingId(
                    null
                  );
                }}
                onUpload={
                  onUpload
                }
              />

              <div className="mt-3">
                <BlogBlockInsertMenu
                  compact
                  onInsert={(
                    type
                  ) =>
                    onAdd(
                      type,
                      block.id
                    )
                  }
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function BlogBlockCard({
  block,
  index,
  total,
  selected,
  dragging,
  onSelect,
  onChange,
  onMove,
  onRemove,
  onDragStart,
  onDragEnd,
  onDrop,
  onUpload,
}: {
  block: BlogBlock;
  index: number;
  total: number;
  selected: boolean;
  dragging: boolean;
  onSelect: () => void;
  onChange: (
    block: BlogBlock
  ) => void;
  onMove: (
    direction: -1 | 1
  ) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onUpload: (
    file: File
  ) => Promise<string>;
}) {
  return (
    <article
      onDragOver={(event) =>
        event.preventDefault()
      }
      onDrop={onDrop}
      onMouseDown={onSelect}
      className={cn(
        "group rounded-card border bg-surface transition",
        selected
          ? "border-primary-300 shadow-[0_0_0_3px_rgba(47,91,167,0.08)]"
          : "border-border hover:border-primary-200",
        dragging &&
          "opacity-50"
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed =
                "move";
              onDragStart();
            }}
            onDragEnd={onDragEnd}
            className="cursor-grab select-none text-base font-black text-text-muted active:cursor-grabbing"
            title="Przeciągnij blok"
            aria-label="Przeciągnij blok"
          >
            ⋮⋮
          </span>

          <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.11em] text-text-muted">
            {getBlockLabel(
              block.type
            )}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <MiniAction
            label="Przesuń wyżej"
            disabled={
              index === 0
            }
            onClick={() =>
              onMove(-1)
            }
          >
            <ArrowSmallRightIcon className="h-3.5 w-3.5 -rotate-90" />
          </MiniAction>

          <MiniAction
            label="Przesuń niżej"
            disabled={
              index ===
              total - 1
            }
            onClick={() =>
              onMove(1)
            }
          >
            <ArrowSmallRightIcon className="h-3.5 w-3.5 rotate-90" />
          </MiniAction>

          <MiniAction
            label="Usuń blok"
            danger
            onClick={
              onRemove
            }
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </MiniAction>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <BlockBody
          block={block}
          onChange={onChange}
          onUpload={onUpload}
        />
      </div>
    </article>
  );
}

function BlockBody({
  block,
  onChange,
  onUpload,
}: {
  block: BlogBlock;
  onChange: (
    block: BlogBlock
  ) => void;
  onUpload: (
    file: File
  ) => Promise<string>;
}) {
  const textAreaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  if (
    block.type ===
    "paragraph"
  ) {
    return (
      <>
        <InlineTextToolbar
          text={block.text}
          textAreaRef={
            textAreaRef
          }
          onChange={(text) =>
            onChange({
              ...block,
              text,
            })
          }
        />

        <textarea
          ref={textAreaRef}
          value={block.text}
          rows={6}
          onChange={(event) =>
            onChange({
              ...block,
              text:
                event.target
                  .value,
            })
          }
          placeholder="Napisz akapit..."
          className="mt-3 min-h-36 w-full resize-y border-0 bg-transparent px-0 py-2 text-[16px] leading-7 text-text outline-none placeholder:text-text-muted/60"
        />
      </>
    );
  }

  if (
    block.type ===
      "heading2" ||
    block.type ===
      "heading3"
  ) {
    return (
      <input
        value={block.text}
        onChange={(event) =>
          onChange({
            ...block,
            text:
              event.target
                .value,
          })
        }
        placeholder={
          block.type ===
          "heading2"
            ? "Nagłówek głównej sekcji..."
            : "Nagłówek podsekcji..."
        }
        className={cn(
          "w-full bg-transparent font-display font-extrabold tracking-[-0.03em] text-text outline-none placeholder:text-text-muted/55",
          block.type ===
            "heading2"
            ? "text-2xl sm:text-3xl"
            : "text-xl sm:text-2xl"
        )}
      />
    );
  }

  if (
    block.type === "quote"
  ) {
    return (
      <>
        <InlineTextToolbar
          text={block.text}
          textAreaRef={
            textAreaRef
          }
          onChange={(text) =>
            onChange({
              ...block,
              text,
            })
          }
        />

        <textarea
          ref={textAreaRef}
          value={block.text}
          rows={4}
          onChange={(event) =>
            onChange({
              ...block,
              text:
                event.target
                  .value,
            })
          }
          placeholder="Treść cytatu..."
          className="mt-3 min-h-28 w-full resize-y rounded-control border border-primary-200 bg-primary-50 px-3.5 py-3 text-[16px] font-semibold leading-7 text-primary-900 outline-none placeholder:text-primary-400 focus:border-primary focus:ring-4 focus:ring-primary-100"
        />
      </>
    );
  }

  if (
    block.type === "list"
  ) {
    return (
      <Textarea
        value={block.items.join(
          "\n"
        )}
        rows={6}
        onChange={(event) =>
          onChange({
            ...block,
            items:
              event.target.value.split(
                "\n"
              ),
          })
        }
        placeholder={
          "Każdy element w nowej linii\nWędka\nKołowrotek\nPrzynęta"
        }
        className="min-h-36 leading-7"
      />
    );
  }

  if (
    block.type ===
    "callout"
  ) {
    return (
      <div
        className={cn(
          "rounded-control border p-4",
          block.tone ===
            "warning"
            ? "border-warning-border bg-warning-subtle"
            : block.tone ===
                "important"
              ? "border-primary-200 bg-primary-50"
              : "border-success-border bg-success-subtle"
        )}
      >
        <input
          value={block.title}
          onChange={(event) =>
            onChange({
              ...block,
              title:
                event.target
                  .value,
            })
          }
          placeholder="Tytuł wyróżnienia"
          className="w-full bg-transparent font-display text-base font-extrabold text-text outline-none"
        />

        <Textarea
          value={block.text}
          rows={4}
          onChange={(event) =>
            onChange({
              ...block,
              text:
                event.target
                  .value,
            })
          }
          placeholder="Treść wskazówki..."
          className="mt-2 min-h-24 border-0 bg-transparent px-0 shadow-none focus:ring-0"
        />
      </div>
    );
  }

  if (
    block.type === "image"
  ) {
    return (
      <ImageBlockBody
        block={block}
        onChange={onChange}
        onUpload={onUpload}
      />
    );
  }

  if (
    block.type ===
    "gallery"
  ) {
    return (
      <div>
        {block.images.length >
        0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {block.images.map(
              (image) => (
                <img
                  key={image.id}
                  src={
                    image.url
                  }
                  alt=""
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
              )
            )}
          </div>
        ) : (
          <EmptyBlockHint
            title="Galeria jest pusta"
            description="Dodaj zdjęcia w panelu ustawień bloku po prawej stronie."
          />
        )}
      </div>
    );
  }

  if (
    block.type === "table"
  ) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr>
              {block.headers.map(
                (
                  header,
                  index
                ) => (
                  <th
                    key={index}
                    className="min-w-[150px] border-b border-border p-1.5"
                  >
                    <Input
                      value={
                        header
                      }
                      onChange={(
                        event
                      ) => {
                        const headers =
                          [
                            ...block.headers,
                          ];

                        headers[
                          index
                        ] =
                          event.target.value;

                        onChange({
                          ...block,
                          headers,
                        });
                      }}
                      className="h-10 text-xs font-extrabold"
                    />
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {block.rows.map(
              (
                row,
                rowIndex
              ) => (
                <tr
                  key={
                    rowIndex
                  }
                >
                  {block.headers.map(
                    (
                      _,
                      cellIndex
                    ) => (
                      <td
                        key={
                          cellIndex
                        }
                        className="min-w-[150px] border-b border-border p-1.5"
                      >
                        <Input
                          value={
                            row[
                              cellIndex
                            ] ||
                            ""
                          }
                          onChange={(
                            event
                          ) => {
                            const rows =
                              block.rows.map(
                                (
                                  item
                                ) => [
                                  ...item,
                                ]
                              );

                            if (
                              !rows[
                                rowIndex
                              ]
                            ) {
                              rows[
                                rowIndex
                              ] =
                                [];
                            }

                            rows[
                              rowIndex
                            ][
                              cellIndex
                            ] =
                              event.target.value;

                            onChange({
                              ...block,
                              rows,
                            });
                          }}
                          className="h-10 text-xs"
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
    );
  }

  if (
    block.type === "steps"
  ) {
    return (
      <div className="space-y-3">
        {block.items.map(
          (item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[36px_minmax(0,1fr)_32px] gap-3 rounded-control border border-border bg-surface-muted p-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-xs font-black text-primary-700">
                {String(
                  index + 1
                ).padStart(
                  2,
                  "0"
                )}
              </span>

              <div className="grid gap-2">
                <Input
                  value={
                    item.title
                  }
                  onChange={(
                    event
                  ) =>
                    updateStep(
                      block,
                      index,
                      {
                        title:
                          event.target
                            .value,
                      },
                      onChange
                    )
                  }
                  placeholder={`Krok ${
                    index + 1
                  }`}
                  className="h-10 font-bold"
                />

                <Textarea
                  value={
                    item.text
                  }
                  rows={3}
                  onChange={(
                    event
                  ) =>
                    updateStep(
                      block,
                      index,
                      {
                        text:
                          event.target
                            .value,
                      },
                      onChange
                    )
                  }
                  placeholder="Opis kroku..."
                  className="min-h-20 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...block,
                    items:
                      block.items.filter(
                        (
                          _,
                          current
                        ) =>
                          current !==
                          index
                      ),
                  })
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-danger-foreground transition hover:bg-danger-subtle"
                aria-label="Usuń krok"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        )}

        {block.items.length ===
          0 && (
          <EmptyBlockHint
            title="Brak kroków"
            description="Dodaj pierwszy krok w panelu ustawień bloku."
          />
        )}
      </div>
    );
  }

  if (
    block.type === "faq"
  ) {
    return (
      <div className="space-y-3">
        {block.items.map(
          (item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[minmax(0,1fr)_32px] gap-3 rounded-control border border-border bg-surface-muted p-3"
            >
              <div className="grid gap-2">
                <Input
                  value={
                    item.question
                  }
                  onChange={(
                    event
                  ) =>
                    updateFaq(
                      block,
                      index,
                      {
                        question:
                          event.target
                            .value,
                      },
                      onChange
                    )
                  }
                  placeholder="Pytanie..."
                  className="h-10 font-bold"
                />

                <Textarea
                  value={
                    item.answer
                  }
                  rows={3}
                  onChange={(
                    event
                  ) =>
                    updateFaq(
                      block,
                      index,
                      {
                        answer:
                          event.target
                            .value,
                      },
                      onChange
                    )
                  }
                  placeholder="Odpowiedź..."
                  className="min-h-20 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...block,
                    items:
                      block.items.filter(
                        (
                          _,
                          current
                        ) =>
                          current !==
                          index
                      ),
                  })
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-danger-foreground transition hover:bg-danger-subtle"
                aria-label="Usuń pytanie"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        )}

        {block.items.length ===
          0 && (
          <EmptyBlockHint
            title="FAQ jest puste"
            description="Dodaj pytanie w panelu ustawień bloku."
          />
        )}
      </div>
    );
  }

  if (
    block.type === "cta"
  ) {
    return (
      <div
        className={cn(
          "rounded-panel px-5 py-6 text-white sm:px-6",
          block.style ===
            "dark"
            ? "bg-navy-950"
            : "bg-primary-700"
        )}
      >
        <input
          value={block.title}
          onChange={(event) =>
            onChange({
              ...block,
              title:
                event.target
                  .value,
            })
          }
          placeholder="Tytuł CTA..."
          className="w-full bg-transparent font-display text-2xl font-extrabold tracking-[-0.03em] outline-none placeholder:text-white/45"
        />

        <Textarea
          value={block.text}
          rows={3}
          onChange={(event) =>
            onChange({
              ...block,
              text:
                event.target
                  .value,
            })
          }
          placeholder="Krótki tekst zachęcający do działania..."
          className="mt-3 min-h-20 border-white/10 bg-white/10 text-white placeholder:text-white/45 focus:border-white/30 focus:ring-0"
        />

        <span className="mt-4 inline-flex rounded-control bg-white px-4 py-2.5 text-xs font-extrabold text-primary-800">
          {block.buttonLabel ||
            "Przycisk"}
        </span>
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="h-px bg-border" />
    </div>
  );
}

function ImageBlockBody({
  block,
  onChange,
  onUpload,
}: {
  block: Extract<
    BlogBlock,
    {
      type: "image";
    }
  >;
  onChange: (
    block: BlogBlock
  ) => void;
  onUpload: (
    file: File
  ) => Promise<string>;
}) {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    uploading,
    setUploading,
  ] = useState(false);

  async function handleFile(
    file: File
  ) {
    setUploading(true);

    try {
      const url =
        await onUpload(file);

      onChange({
        ...block,
        url,
      });
    } finally {
      setUploading(false);
    }
  }

  if (block.url) {
    return (
      <div>
        <img
          src={block.url}
          alt={block.alt}
          className="max-h-[520px] w-full rounded-card object-cover"
        />

        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          className="mt-3 text-xs font-bold text-primary-700"
        >
          {uploading
            ? "Wysyłanie…"
            : "Zmień zdjęcie"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={uploading}
          className="hidden"
          onChange={(event) => {
            const file =
              event.target
                .files?.[0];

            if (file) {
              void handleFile(
                file
              );
            }

            event.currentTarget.value =
              "";
          }}
        />
      </div>
    );
  }

  return (
    <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-border-strong bg-surface-muted px-5 py-8 text-center transition hover:border-primary-300 hover:bg-primary-50">
      <AddCircleIcon className="h-5 w-5 text-primary-700" />

      <span className="mt-2 text-sm font-extrabold text-text">
        {uploading
          ? "Wysyłanie…"
          : "Dodaj zdjęcie"}
      </span>

      <span className="mt-1 text-xs text-text-muted">
        JPG, PNG, WEBP lub
        AVIF · do 8 MB
      </span>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        disabled={uploading}
        className="hidden"
        onChange={(event) => {
          const file =
            event.target
              .files?.[0];

          if (file) {
            void handleFile(
              file
            );
          }

          event.currentTarget.value =
            "";
        }}
      />
    </label>
  );
}

function InlineTextToolbar({
  text,
  textAreaRef,
  onChange,
}: {
  text: string;
  textAreaRef: RefObject<HTMLTextAreaElement | null>;
  onChange: (
    text: string
  ) => void;
}) {
  const [
    linkOpen,
    setLinkOpen,
  ] = useState(false);

  const [
    selection,
    setSelection,
  ] = useState({
    start: 0,
    end: 0,
    label: "",
  });

  function applyWrap(
    before: string,
    after: string,
    fallback: string
  ) {
    const textarea =
      textAreaRef.current;

    const start =
      textarea?.selectionStart ??
      text.length;

    const end =
      textarea?.selectionEnd ??
      text.length;

    const selected =
      text.slice(
        start,
        end
      ) || fallback;

    const replacement =
      `${before}${selected}${after}`;

    onChange(
      text.slice(0, start) +
        replacement +
        text.slice(end)
    );

    requestAnimationFrame(
      () => {
        const current =
          textAreaRef.current;

        if (!current) {
          return;
        }

        current.focus();

        current.setSelectionRange(
          start +
            before.length,
          start +
            before.length +
            selected.length
        );
      }
    );
  }

  function requestLink() {
    const textarea =
      textAreaRef.current;

    const start =
      textarea?.selectionStart ??
      text.length;

    const end =
      textarea?.selectionEnd ??
      text.length;

    setSelection({
      start,
      end,
      label:
        text.slice(
          start,
          end
        ) || "",
    });

    setLinkOpen(true);
  }

  function applyLink(
    label: string,
    href: string
  ) {
    const finalLabel =
      label.trim() ||
      "zobacz więcej";

    const markup =
      `[${finalLabel}](${href.trim()})`;

    onChange(
      text.slice(
        0,
        selection.start
      ) +
        markup +
        text.slice(
          selection.end
        )
    );

    setLinkOpen(false);

    requestAnimationFrame(
      () => {
        const current =
          textAreaRef.current;

        if (!current) {
          return;
        }

        const caret =
          selection.start +
          markup.length;

        current.focus();
        current.setSelectionRange(
          caret,
          caret
        );
      }
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5 rounded-control bg-surface-muted p-1.5">
        <ToolbarButton
          label="Pogrubienie"
          onClick={() =>
            applyWrap(
              "**",
              "**",
              "pogrubiony tekst"
            )
          }
        >
          B
        </ToolbarButton>

        <ToolbarButton
          label="Kursywa"
          onClick={() =>
            applyWrap(
              "*",
              "*",
              "tekst kursywą"
            )
          }
        >
          <em>I</em>
        </ToolbarButton>

        <ToolbarButton
          label="Dodaj link"
          onClick={
            requestLink
          }
        >
          Link
        </ToolbarButton>

        <span className="ml-1 hidden text-[10px] font-semibold text-text-muted sm:inline">
          Zaznacz tekst i wybierz
          formatowanie
        </span>
      </div>

      <LinkDialog
        open={linkOpen}
        initialLabel={
          selection.label
        }
        onClose={() =>
          setLinkOpen(false)
        }
        onApply={applyLink}
      />
    </>
  );
}

function LinkDialog({
  open,
  initialLabel,
  onClose,
  onApply,
}: {
  open: boolean;
  initialLabel: string;
  onClose: () => void;
  onApply: (
    label: string,
    href: string
  ) => void;
}) {
  const [label, setLabel] =
    useState("");

  const [href, setHref] =
    useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setLabel(initialLabel);
    setHref("");
  }, [open, initialLabel]);

  const validHref =
    href.trim().startsWith(
      "/"
    ) ||
    href.trim().startsWith(
      "#"
    ) ||
    href.trim().startsWith(
      "http://"
    ) ||
    href.trim().startsWith(
      "https://"
    ) ||
    href.trim().startsWith(
      "mailto:"
    ) ||
    href.trim().startsWith(
      "tel:"
    );

  return (
    <BlogEditorDialog
      open={open}
      onClose={onClose}
      title="Dodaj link"
      description="Link może prowadzić do Rybio, sekcji artykułu albo zewnętrznej strony."
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Anuluj
          </Button>

          <Button
            type="button"
            disabled={
              !validHref
            }
            onClick={() =>
              onApply(
                label,
                href
              )
            }
          >
            Dodaj link
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 p-5 sm:p-6">
        <label className="grid gap-2">
          <span className="text-xs font-bold text-text-secondary">
            Tekst linku
          </span>

          <Input
            value={label}
            onChange={(event) =>
              setLabel(
                event.target
                  .value
              )
            }
            data-autofocus
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-bold text-text-secondary">
            Adres
          </span>

          <Input
            value={href}
            onChange={(event) =>
              setHref(
                event.target
                  .value
              )
            }
            placeholder="/lowiska-w-polsce lub https://..."
          />

          {href &&
            !validHref && (
              <span className="text-xs font-bold text-danger-foreground">
                Dozwolone są
                adresy zaczynające
                się od /, #,
                http://, https://,
                mailto: lub tel:.
              </span>
            )}
        </label>
      </div>
    </BlogEditorDialog>
  );
}

function BlogBlockInsertMenu({
  compact = false,
  onInsert,
}: {
  compact?: boolean;
  onInsert: (
    type: BlogBlockType
  ) => void;
}) {
  const [open, setOpen] =
    useState(false);

  const rootRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(
      event: MouseEvent
    ) {
      if (
        rootRef.current &&
        !rootRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative flex justify-center"
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full border border-dashed border-border-strong bg-surface text-xs font-extrabold text-text-muted transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700",
          compact
            ? "h-8 px-3"
            : "h-10 px-4"
        )}
      >
        <AddCircleIcon className="h-4 w-4" />
        {compact
          ? "Dodaj blok"
          : "Dodaj blok na początku"}
      </button>

      {open && (
        <div className="absolute top-11 z-50 w-[min(560px,calc(100vw-40px))] rounded-panel border border-border bg-surface p-3 shadow-float">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BLOG_BLOCK_LIBRARY.map(
              (item) => (
                <button
                  key={
                    item.type
                  }
                  type="button"
                  onClick={() => {
                    onInsert(
                      item.type
                    );
                    setOpen(false);
                  }}
                  className="rounded-control border border-border bg-surface px-3 py-3 text-left transition hover:border-primary-200 hover:bg-primary-50"
                >
                  <span className="block text-xs font-extrabold text-text">
                    {
                      item.label
                    }
                  </span>

                  <span className="mt-1 block text-[10px] leading-4 text-text-muted">
                    {
                      item.description
                    }
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-border bg-surface px-2 text-xs font-extrabold text-text-secondary transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
    >
      {children}
    </button>
  );
}

function MiniAction({
  label,
  children,
  onClick,
  disabled = false,
  danger = false,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-25",
        danger
          ? "text-danger-foreground hover:bg-danger-subtle"
          : "text-text-muted hover:bg-surface-muted hover:text-text"
      )}
    >
      {children}
    </button>
  );
}

function EmptyBlockHint({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-control border border-dashed border-border-strong bg-surface-muted px-4 py-7 text-center">
      <p className="text-sm font-extrabold text-text">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-text-muted">
        {description}
      </p>
    </div>
  );
}

function updateStep(
  block: Extract<
    BlogBlock,
    {
      type: "steps";
    }
  >,
  index: number,
  patch: {
    title?: string;
    text?: string;
  },
  onChange: (
    block: BlogBlock
  ) => void
) {
  onChange({
    ...block,
    items:
      block.items.map(
        (item, current) =>
          current === index
            ? {
                ...item,
                ...patch,
              }
            : item
      ),
  });
}

function updateFaq(
  block: Extract<
    BlogBlock,
    {
      type: "faq";
    }
  >,
  index: number,
  patch: {
    question?: string;
    answer?: string;
  },
  onChange: (
    block: BlogBlock
  ) => void
) {
  onChange({
    ...block,
    items:
      block.items.map(
        (item, current) =>
          current === index
            ? {
                ...item,
                ...patch,
              }
            : item
      ),
  });
}

function getBlockLabel(
  type: BlogBlockType
) {
  return (
    BLOG_BLOCK_LIBRARY.find(
      (item) =>
        item.type === type
    )?.label || type
  );
}
