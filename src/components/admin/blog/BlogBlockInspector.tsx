"use client";

import {
  useRef,
  useState,
  type ReactNode,
} from "react";

import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import type {
  BlogBlock,
  BlogGalleryImage,
} from "@/lib/blog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export function BlogBlockInspector({
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
  if (
    block.type ===
      "paragraph" ||
    block.type ===
      "heading2" ||
    block.type ===
      "heading3" ||
    block.type ===
      "divider"
  ) {
    return (
      <InspectorEmpty
        title="Ten blok nie ma dodatkowych ustawień."
        description="Treść i hierarchię edytujesz bezpośrednio na płótnie artykułu."
      />
    );
  }

  if (block.type === "image") {
    return (
      <div className="grid gap-5">
        <InspectorUpload
          currentUrl={
            block.url
          }
          onUpload={async (
            file
          ) => {
            const url =
              await onUpload(
                file
              );

            onChange({
              ...block,
              url,
            });
          }}
        />

        <Field
          label="Tekst ALT"
          value={block.alt}
          onChange={(value) =>
            onChange({
              ...block,
              alt: value,
            })
          }
          placeholder="Opisz, co znajduje się na zdjęciu."
        />

        <Field
          label="Podpis"
          value={
            block.caption
          }
          onChange={(value) =>
            onChange({
              ...block,
              caption: value,
            })
          }
          placeholder="Opcjonalny podpis pod zdjęciem."
        />

        <SelectField
          label="Szerokość"
          value={block.width}
          onChange={(value) =>
            onChange({
              ...block,
              width:
                value === "wide"
                  ? "wide"
                  : "content",
            })
          }
        >
          <option value="content">
            W treści
          </option>
          <option value="wide">
            Szerokie
          </option>
        </SelectField>
      </div>
    );
  }

  if (block.type === "quote") {
    return (
      <Field
        label="Autor / źródło"
        value={
          block.attribution
        }
        onChange={(value) =>
          onChange({
            ...block,
            attribution:
              value,
          })
        }
        placeholder="np. Jan Kowalski"
      />
    );
  }

  if (block.type === "list") {
    return (
      <SelectField
        label="Rodzaj listy"
        value={block.style}
        onChange={(value) =>
          onChange({
            ...block,
            style:
              value ===
              "numbered"
                ? "numbered"
                : "bullet",
          })
        }
      >
        <option value="bullet">
          Punktowana
        </option>
        <option value="numbered">
          Numerowana
        </option>
      </SelectField>
    );
  }

  if (
    block.type ===
    "callout"
  ) {
    return (
      <div className="grid gap-5">
        <SelectField
          label="Typ wyróżnienia"
          value={block.tone}
          onChange={(value) =>
            onChange({
              ...block,
              tone:
                value ===
                  "important" ||
                value ===
                  "warning"
                  ? value
                  : "tip",
            })
          }
        >
          <option value="tip">
            Wskazówka
          </option>
          <option value="important">
            Ważne
          </option>
          <option value="warning">
            Uwaga
          </option>
        </SelectField>

        <Field
          label="Tytuł"
          value={block.title}
          onChange={(value) =>
            onChange({
              ...block,
              title: value,
            })
          }
        />
      </div>
    );
  }

  if (
    block.type ===
    "gallery"
  ) {
    return (
      <GalleryInspector
        block={block}
        onChange={onChange}
        onUpload={onUpload}
      />
    );
  }

  if (
    block.type === "table"
  ) {
    return (
      <TableInspector
        block={block}
        onChange={onChange}
      />
    );
  }

  if (
    block.type === "steps"
  ) {
    return (
      <div className="grid gap-5">
        <Field
          label="Tytuł sekcji"
          value={block.title}
          onChange={(value) =>
            onChange({
              ...block,
              title: value,
            })
          }
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          fullWidth
          onClick={() =>
            onChange({
              ...block,
              items: [
                ...block.items,
                {
                  id:
                    createLocalId(),
                  title: `Krok ${
                    block.items
                      .length + 1
                  }`,
                  text: "",
                },
              ],
            })
          }
        >
          <AddCircleIcon className="h-4 w-4" />
          Dodaj krok
        </Button>
      </div>
    );
  }

  if (
    block.type === "faq"
  ) {
    return (
      <div className="grid gap-5">
        <Field
          label="Tytuł sekcji"
          value={block.title}
          onChange={(value) =>
            onChange({
              ...block,
              title: value,
            })
          }
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          fullWidth
          onClick={() =>
            onChange({
              ...block,
              items: [
                ...block.items,
                {
                  id:
                    createLocalId(),
                  question: "",
                  answer: "",
                },
              ],
            })
          }
        >
          <AddCircleIcon className="h-4 w-4" />
          Dodaj pytanie
        </Button>
      </div>
    );
  }

  if (
    block.type === "cta"
  ) {
    return (
      <div className="grid gap-5">
        <SelectField
          label="Wygląd CTA"
          value={block.style}
          onChange={(value) =>
            onChange({
              ...block,
              style:
                value === "dark"
                  ? "dark"
                  : "primary",
            })
          }
        >
          <option value="primary">
            Kolor marki
          </option>
          <option value="dark">
            Ciemne
          </option>
        </SelectField>

        <Field
          label="Mały nagłówek"
          value={block.eyebrow}
          onChange={(value) =>
            onChange({
              ...block,
              eyebrow: value,
            })
          }
        />

        <Field
          label="Tekst przycisku"
          value={
            block.buttonLabel
          }
          onChange={(value) =>
            onChange({
              ...block,
              buttonLabel:
                value,
            })
          }
        />

        <Field
          label="Link przycisku"
          value={
            block.buttonHref
          }
          onChange={(value) =>
            onChange({
              ...block,
              buttonHref:
                value,
            })
          }
          placeholder="/lowiska-w-polsce"
        />
      </div>
    );
  }

  return null;
}

function GalleryInspector({
  block,
  onChange,
  onUpload,
}: {
  block: Extract<
    BlogBlock,
    {
      type: "gallery";
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
    localUploading,
    setLocalUploading,
  ] = useState(false);

  async function addImage(
    file: File
  ) {
    setLocalUploading(true);

    try {
      const url =
        await onUpload(file);

      const image:
        BlogGalleryImage = {
        id: createLocalId(),
        url,
        alt: "",
        caption: "",
      };

      onChange({
        ...block,
        images: [
          ...block.images,
          image,
        ].slice(0, 12),
      });
    } finally {
      setLocalUploading(false);
    }
  }

  return (
    <div className="grid gap-5">
      <SelectField
        label="Układ galerii"
        value={block.layout}
        onChange={(value) =>
          onChange({
            ...block,
            layout:
              value === "feature"
                ? "feature"
                : "grid",
          })
        }
      >
        <option value="grid">
          Siatka
        </option>
        <option value="feature">
          Jedno duże + mniejsze
        </option>
      </SelectField>

      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-text-secondary">
            Zdjęcia
          </p>

          <span className="text-[10px] font-bold text-text-muted">
            {block.images.length}/12
          </span>
        </div>

        <div className="mt-2.5 space-y-3">
          {block.images.map(
            (image, index) => (
              <div
                key={image.id}
                className="rounded-card border border-border bg-surface-muted p-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={image.url}
                    alt=""
                    className="h-16 w-20 shrink-0 rounded-xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <Input
                      value={
                        image.alt
                      }
                      onChange={(
                        event
                      ) =>
                        updateGalleryImage(
                          block,
                          index,
                          {
                            alt:
                              event
                                .target
                                .value,
                          },
                          onChange
                        )
                      }
                      placeholder="ALT"
                      className="h-9 text-xs"
                    />

                    <Input
                      value={
                        image.caption
                      }
                      onChange={(
                        event
                      ) =>
                        updateGalleryImage(
                          block,
                          index,
                          {
                            caption:
                              event
                                .target
                                .value,
                          },
                          onChange
                        )
                      }
                      placeholder="Podpis"
                      className="mt-2 h-9 text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...block,
                        images:
                          block.images.filter(
                            (
                              _,
                              current
                            ) =>
                              current !==
                              index
                          ),
                      })
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-danger-foreground transition hover:bg-danger-subtle"
                    aria-label="Usuń zdjęcie"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {block.images.length <
          12 && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              disabled={
                localUploading
              }
              onChange={(
                event
              ) => {
                const file =
                  event.target
                    .files?.[0];

                if (file) {
                  void addImage(
                    file
                  );
                }

                event.currentTarget.value =
                  "";
              }}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              fullWidth
              disabled={
                localUploading
              }
              className="mt-3"
              onClick={() =>
                inputRef.current?.click()
              }
            >
              <AddCircleIcon className="h-4 w-4" />
              {localUploading
                ? "Wysyłanie…"
                : "Dodaj zdjęcie"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function TableInspector({
  block,
  onChange,
}: {
  block: Extract<
    BlogBlock,
    {
      type: "table";
    }
  >;
  onChange: (
    block: BlogBlock
  ) => void;
}) {
  const columns =
    block.headers.length;

  function addColumn() {
    if (columns >= 6) {
      return;
    }

    onChange({
      ...block,
      headers: [
        ...block.headers,
        `Kolumna ${
          columns + 1
        }`,
      ],
      rows:
        block.rows.map(
          (row) => [
            ...row,
            "",
          ]
        ),
    });
  }

  function removeColumn() {
    if (columns <= 1) {
      return;
    }

    onChange({
      ...block,
      headers:
        block.headers.slice(
          0,
          -1
        ),
      rows:
        block.rows.map(
          (row) =>
            row.slice(0, -1)
        ),
    });
  }

  function addRow() {
    if (
      block.rows.length >=
      30
    ) {
      return;
    }

    onChange({
      ...block,
      rows: [
        ...block.rows,
        Array.from(
          {
            length:
              columns,
          },
          () => ""
        ),
      ],
    });
  }

  function removeRow() {
    if (
      block.rows.length <=
      1
    ) {
      return;
    }

    onChange({
      ...block,
      rows:
        block.rows.slice(
          0,
          -1
        ),
    });
  }

  return (
    <div className="grid gap-5">
      <Field
        label="Podpis tabeli"
        value={
          block.caption
        }
        onChange={(value) =>
          onChange({
            ...block,
            caption: value,
          })
        }
      />

      <div>
        <p className="text-xs font-bold text-text-secondary">
          Kolumny
        </p>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              columns >= 6
            }
            onClick={addColumn}
          >
            + Kolumna
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={
              columns <= 1
            }
            onClick={
              removeColumn
            }
          >
            − Kolumna
          </Button>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-text-secondary">
          Wiersze
        </p>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              block.rows
                .length >= 30
            }
            onClick={addRow}
          >
            + Wiersz
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={
              block.rows
                .length <= 1
            }
            onClick={
              removeRow
            }
          >
            − Wiersz
          </Button>
        </div>
      </div>
    </div>
  );
}

function InspectorUpload({
  currentUrl,
  onUpload,
}: {
  currentUrl: string;
  onUpload: (
    file: File
  ) => Promise<void>;
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
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-bold text-text-secondary">
        Zdjęcie
      </p>

      {currentUrl && (
        <img
          src={currentUrl}
          alt=""
          className="mt-2.5 aspect-[16/10] w-full rounded-card border border-border object-cover"
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        disabled={uploading}
        onChange={(event) => {
          const file =
            event.target.files?.[0];

          if (file) {
            void handleFile(file);
          }

          event.currentTarget.value =
            "";
        }}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        fullWidth
        className="mt-3"
        disabled={uploading}
        onClick={() =>
          inputRef.current?.click()
        }
      >
        {uploading
          ? "Wysyłanie…"
          : currentUrl
            ? "Zmień zdjęcie"
            : "Wybierz zdjęcie"}
      </Button>
    </div>
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

function InspectorEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-card border border-border bg-surface-muted p-4">
      <p className="text-sm font-extrabold text-text">
        {title}
      </p>

      <p className="mt-1.5 text-xs leading-5 text-text-muted">
        {description}
      </p>
    </div>
  );
}

function updateGalleryImage(
  block: Extract<
    BlogBlock,
    {
      type: "gallery";
    }
  >,
  index: number,
  patch: Partial<BlogGalleryImage>,
  onChange: (
    block: BlogBlock
  ) => void
) {
  onChange({
    ...block,
    images:
      block.images.map(
        (image, current) =>
          current === index
            ? {
                ...image,
                ...patch,
              }
            : image
      ),
  });
}

function createLocalId() {
  return `blog-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
