"use client";

import {
  useRef,
  useState,
  type RefObject,
} from "react";

import {
  createBlogBlockId,
  type BlogBlock,
  type BlogImageBlock,
} from "@/lib/blog";

type BlogBlockEditorProps = {
  blocks: BlogBlock[];
  onChange: (blocks: BlogBlock[]) => void;
};

export function BlogBlockEditor({
  blocks,
  onChange,
}: BlogBlockEditorProps) {
  const [uploadingAt, setUploadingAt] = useState<number | null>(null);

  function insertBlock(index: number, block: BlogBlock) {
    const next = [...blocks];
    next.splice(index, 0, block);
    onChange(next);
  }

  function updateBlock(index: number, block: BlogBlock) {
    const next = [...blocks];
    next[index] = block;
    onChange(next);
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, blockIndex) => blockIndex !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= blocks.length) {
      return;
    }

    const next = [...blocks];
    const [block] = next.splice(index, 1);
    next.splice(nextIndex, 0, block);
    onChange(next);
  }

  async function insertImage(index: number, file: File) {
    setUploadingAt(index);

    try {
      const image = await uploadBlogImage(file);

      insertBlock(index, {
        id: createBlogBlockId(),
        type: "image",
        url: image.url,
        alt: "",
        caption: "",
      });
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Nie udało się przesłać zdjęcia."
      );
    } finally {
      setUploadingAt(null);
    }
  }

  return (
    <div>
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
              Treść artykułu
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-950">
              Edytor blokowy
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Dodawaj tekst, nagłówki i zdjęcia dokładnie w miejscu, w którym
              mają pojawić się w artykule. W akapitach możesz także pogrubiać
              fragmenty i dodawać linki.
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-400">
            {blocks.length} bloków
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <BlockInsertMenu
            disabled={uploadingAt !== null}
            uploading={uploadingAt === 0}
            onInsert={(type) =>
              insertBlock(0, createEmptyBlock(type))
            }
            onImage={(file) => void insertImage(0, file)}
          />

          {blocks.map((block, index) => (
            <div key={block.id}>
              <BlockCard
                block={block}
                index={index}
                total={blocks.length}
                onChange={(nextBlock) => updateBlock(index, nextBlock)}
                onRemove={() => removeBlock(index)}
                onMove={moveBlock}
              />

              <div className="mt-3">
                <BlockInsertMenu
                  disabled={uploadingAt !== null}
                  uploading={uploadingAt === index + 1}
                  onInsert={(type) =>
                    insertBlock(index + 1, createEmptyBlock(type))
                  }
                  onImage={(file) => void insertImage(index + 1, file)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockCard({
  block,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: {
  block: BlogBlock;
  index: number;
  total: number;
  onChange: (block: BlogBlock) => void;
  onRemove: () => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  function applyBold() {
    if (
      block.type !== "paragraph" &&
      block.type !== "quote"
    ) {
      return;
    }

    const nextText = wrapSelection(
      textAreaRef,
      block.text,
      "**",
      "**",
      "pogrubiony tekst"
    );

    if (nextText !== null) {
      onChange({
        ...block,
        text: nextText,
      });
    }
  }

  function applyLink() {
    if (
      block.type !== "paragraph" &&
      block.type !== "quote"
    ) {
      return;
    }

    const textarea = textAreaRef.current;
    const start = textarea?.selectionStart ?? block.text.length;
    const end = textarea?.selectionEnd ?? block.text.length;
    const selected = block.text.slice(start, end);

    const label =
      selected ||
      window.prompt("Tekst linku:", "zobacz więcej") ||
      "";

    if (!label.trim()) {
      return;
    }

    const href = window.prompt(
      "Adres linku:",
      "https://"
    );

    if (!href?.trim()) {
      return;
    }

    const markup = `[${label}](${href.trim()})`;
    const nextText =
      block.text.slice(0, start) +
      markup +
      block.text.slice(end);

    onChange({
      ...block,
      text: nextText,
    });

    requestAnimationFrame(() => {
      const current = textAreaRef.current;

      if (!current) {
        return;
      }

      const caret = start + markup.length;
      current.focus();
      current.setSelectionRange(caret, caret);
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {getBlockLabel(block.type)}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500 transition hover:bg-slate-200 disabled:opacity-30"
            aria-label="Przesuń blok wyżej"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500 transition hover:bg-slate-200 disabled:opacity-30"
            aria-label="Przesuń blok niżej"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
          >
            Usuń
          </button>
        </div>
      </div>

      {(block.type === "paragraph" || block.type === "quote") && (
        <InlineTextToolbar
          onBold={applyBold}
          onLink={applyLink}
        />
      )}

      {block.type === "paragraph" && (
        <textarea
          ref={textAreaRef}
          value={block.text}
          onChange={(event) =>
            onChange({
              ...block,
              text: event.target.value,
            })
          }
          rows={5}
          placeholder="Napisz akapit..."
          className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      )}

      {(block.type === "heading2" || block.type === "heading3") && (
        <input
          value={block.text}
          onChange={(event) =>
            onChange({
              ...block,
              text: event.target.value,
            })
          }
          placeholder={
            block.type === "heading2"
              ? "Nagłówek sekcji..."
              : "Nagłówek niższego poziomu..."
          }
          className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 ${
            block.type === "heading2"
              ? "text-lg font-extrabold"
              : "font-bold"
          }`}
        />
      )}

      {block.type === "quote" && (
        <textarea
          ref={textAreaRef}
          value={block.text}
          onChange={(event) =>
            onChange({
              ...block,
              text: event.target.value,
            })
          }
          rows={4}
          placeholder="Treść wyróżnienia lub cytatu..."
          className="mt-2 w-full resize-y rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium leading-7 text-blue-950 outline-none transition placeholder:text-blue-300 focus:border-blue-400"
        />
      )}

      {block.type === "list" && (
        <textarea
          value={block.items.join("\n")}
          onChange={(event) =>
            onChange({
              ...block,
              items: event.target.value.split("\n"),
            })
          }
          rows={5}
          placeholder={"Każdy element listy w nowej linii\nWędka\nKołowrotek\nPrzynęta"}
          className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      )}

      {block.type === "image" && (
        <ImageBlockFields
          block={block}
          onChange={(next) => onChange(next)}
        />
      )}
    </div>
  );
}

function InlineTextToolbar({
  onBold,
  onLink,
}: {
  onBold: () => void;
  onLink: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-1.5">
      <button
        type="button"
        onClick={onBold}
        className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-white px-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
        title="Pogrub zaznaczony tekst"
        aria-label="Pogrub zaznaczony tekst"
      >
        B
      </button>

      <button
        type="button"
        onClick={onLink}
        className="flex h-8 items-center justify-center rounded-lg bg-white px-3 text-xs font-bold text-blue-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50"
        title="Dodaj link"
      >
        Link
      </button>

      <span className="ml-1 text-[11px] font-medium text-slate-400">
        Zaznacz fragment tekstu i wybierz akcję
      </span>
    </div>
  );
}

function wrapSelection(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
  before: string,
  after: string,
  fallbackText: string
) {
  const textarea = ref.current;
  const start = textarea?.selectionStart ?? value.length;
  const end = textarea?.selectionEnd ?? value.length;

  const selected = value.slice(start, end) || fallbackText;
  const replacement = `${before}${selected}${after}`;

  const next =
    value.slice(0, start) +
    replacement +
    value.slice(end);

  requestAnimationFrame(() => {
    const current = ref.current;

    if (!current) {
      return;
    }

    current.focus();

    const selectionStart = start + before.length;
    const selectionEnd = selectionStart + selected.length;

    current.setSelectionRange(selectionStart, selectionEnd);
  });

  return next;
}

function ImageBlockFields({
  block,
  onChange,
}: {
  block: BlogImageBlock;
  onChange: (block: BlogImageBlock) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={block.url}
          alt={block.alt}
          className="h-44 w-full object-cover"
        />
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            Tekst ALT
          </span>
          <input
            value={block.alt}
            onChange={(event) =>
              onChange({
                ...block,
                alt: event.target.value,
              })
            }
            placeholder="np. Wędkarz z karpiem nad łowiskiem"
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            Podpis pod zdjęciem
          </span>
          <input
            value={block.caption}
            onChange={(event) =>
              onChange({
                ...block,
                caption: event.target.value,
              })
            }
            placeholder="Opcjonalny podpis..."
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
          />
        </label>
      </div>
    </div>
  );
}

function BlockInsertMenu({
  disabled,
  uploading,
  onInsert,
  onImage,
}: {
  disabled: boolean;
  uploading: boolean;
  onInsert: (
    type: "paragraph" | "heading2" | "heading3" | "quote" | "list"
  ) => void;
  onImage: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-2">
      <span className="mr-1 text-xs font-semibold text-slate-400">
        + Dodaj:
      </span>

      <InsertButton
        label="Akapit"
        disabled={disabled}
        onClick={() => onInsert("paragraph")}
      />
      <InsertButton
        label="H2"
        disabled={disabled}
        onClick={() => onInsert("heading2")}
      />
      <InsertButton
        label="H3"
        disabled={disabled}
        onClick={() => onInsert("heading3")}
      />
      <InsertButton
        label="Lista"
        disabled={disabled}
        onClick={() => onInsert("list")}
      />
      <InsertButton
        label="Cytat"
        disabled={disabled}
        onClick={() => onInsert("quote")}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
      >
        {uploading ? "Wysyłanie..." : "Zdjęcie"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            onImage(file);
          }

          event.currentTarget.value = "";
        }}
      />
    </div>
  );
}

function InsertButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
    >
      {label}
    </button>
  );
}

function createEmptyBlock(
  type: "paragraph" | "heading2" | "heading3" | "quote" | "list"
): BlogBlock {
  if (type === "list") {
    return {
      id: createBlogBlockId(),
      type: "list",
      items: [""],
    };
  }

  return {
    id: createBlogBlockId(),
    type,
    text: "",
  };
}

function getBlockLabel(type: BlogBlock["type"]) {
  if (type === "paragraph") return "Akapit";
  if (type === "heading2") return "Nagłówek H2";
  if (type === "heading3") return "Nagłówek H3";
  if (type === "image") return "Zdjęcie";
  if (type === "quote") return "Cytat / wyróżnienie";
  return "Lista";
}

async function uploadBlogImage(file: File) {
  const compressed = await compressBlogImage(file);

  const formData = new FormData();
  formData.append("image", compressed);

  const response = await fetch("/api/admin/blog/upload", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | {
        url?: string;
        message?: string;
      }
    | null;

  if (!response.ok || !data?.url) {
    throw new Error(
      data?.message || "Nie udało się przesłać zdjęcia."
    );
  }

  return {
    url: data.url,
  };
}

async function compressBlogImage(file: File) {
  const maxWidth = 1800;
  const maxHeight = 1800;
  const quality = 0.82;

  if (!file.type.startsWith("image/")) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);

    let width = bitmap.width;
    let height = bitmap.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      return file;
    }

    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", quality);
    });

    if (!blob) {
      return file;
    }

    const baseName = file.name.replace(/\.[^/.]+$/, "") || "blog-image";

    return new File([blob], `${baseName}.webp`, {
      type: "image/webp",
    });
  } catch {
    return file;
  }
}
