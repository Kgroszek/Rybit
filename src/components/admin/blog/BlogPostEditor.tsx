"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

import { BlogBlockEditor } from "@/components/admin/blog/BlogBlockEditor";
import {
  BLOG_CATEGORIES,
  normalizeBlogTag,
  parseBlogBlocks,
  slugifyBlogValue,
  type BlogBlock,
  type BlogCategoryValue,
} from "@/lib/blog";

type BlogEditorInitialPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  tags: string[];
  coverImageUrl: string | null;
  content: unknown;
  status: string;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
} | null;

export function BlogPostEditor({
  initialPost,
}: {
  initialPost?: BlogEditorInitialPost;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialPost));
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [category, setCategory] = useState<BlogCategoryValue>(
    BLOG_CATEGORIES.some((item) => item.value === initialPost?.category)
      ? (initialPost?.category as BlogCategoryValue)
      : "poradniki"
  );
  const [tags, setTags] = useState<string[]>(initialPost?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialPost?.coverImageUrl ?? ""
  );
  const [blocks, setBlocks] = useState<BlogBlock[]>(() => {
    const parsed = parseBlogBlocks(initialPost?.content);

    if (parsed.length > 0) {
      return parsed;
    }

    return [
      {
        id: `intro-${Date.now()}`,
        type: "paragraph",
        text: "",
      },
    ];
  });
  const [seoTitle, setSeoTitle] = useState(initialPost?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    initialPost?.seoDescription ?? ""
  );
  const [isFeatured, setIsFeatured] = useState(
    initialPost?.isFeatured ?? false
  );
  const [status, setStatus] = useState(initialPost?.status ?? "draft");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [message, setMessage] = useState("");

  const isEditing = Boolean(initialPost?.id);

  const cleanedBlocks = useMemo(() => {
    return blocks
      .map((block) => {
        if (block.type === "list") {
          return {
            ...block,
            items: block.items
              .map((item) => item.trim())
              .filter(Boolean),
          };
        }

        if (block.type === "image") {
          return {
            ...block,
            alt: block.alt.trim(),
            caption: block.caption.trim(),
          };
        }

        return {
          ...block,
          text: block.text.trim(),
        };
      })
      .filter((block) => {
        if (block.type === "image") {
          return Boolean(block.url);
        }

        if (block.type === "list") {
          return block.items.length > 0;
        }

        return Boolean(block.text);
      });
  }, [blocks]);

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slugTouched) {
      setSlug(slugifyBlogValue(value));
    }
  }

  function addTag(rawValue = tagInput) {
    const values = rawValue
      .split(",")
      .map(normalizeBlogTag)
      .filter(Boolean);

    if (values.length === 0) {
      setTagInput("");
      return;
    }

    setTags((current) => {
      const next = [...current];

      values.forEach((tag) => {
        if (!next.includes(tag) && next.length < 12) {
          next.push(tag);
        }
      });

      return next;
    });

    setTagInput("");
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    }

    if (
      event.key === "Backspace" &&
      !tagInput &&
      tags.length > 0
    ) {
      setTags((current) => current.slice(0, -1));
    }
  }

  async function handleCoverUpload(file: File) {
    setIsUploadingCover(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("image", file);

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

      setCoverImageUrl(data.url);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się przesłać zdjęcia."
      );
    } finally {
      setIsUploadingCover(false);
    }
  }

  async function savePost(nextStatus: "draft" | "published") {
    setMessage("");

    const cleanTitle = title.trim();
    const cleanSlug = slugifyBlogValue(slug);

    if (!cleanTitle) {
      setMessage("Podaj tytuł artykułu.");
      return;
    }

    if (!cleanSlug) {
      setMessage("Podaj poprawny slug artykułu.");
      return;
    }

    if (cleanedBlocks.length === 0) {
      setMessage("Dodaj przynajmniej jeden blok treści.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        isEditing
          ? `/api/admin/blog/posts/${initialPost?.id}`
          : "/api/admin/blog/posts",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: cleanTitle,
            slug: cleanSlug,
            excerpt: excerpt.trim(),
            category,
            tags,
            coverImageUrl: coverImageUrl || null,
            content: cleanedBlocks,
            status: nextStatus,
            isFeatured,
            seoTitle: seoTitle.trim(),
            seoDescription: seoDescription.trim(),
          }),
        }
      );

      const data = (await response.json().catch(() => null)) as
        | {
            id?: string;
            message?: string;
          }
        | null;

      if (!response.ok || !data?.id) {
        throw new Error(
          data?.message || "Nie udało się zapisać artykułu."
        );
      }

      setStatus(nextStatus);
      setSlug(cleanSlug);
      setSlugTouched(true);
      setMessage(
        nextStatus === "published"
          ? "Artykuł został opublikowany."
          : "Szkic został zapisany."
      );

      if (!isEditing) {
        router.replace(`/admin/blog/${data.id}/edytuj`);
      }

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się zapisać artykułu."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Artykuł
          </p>

          <div className="mt-4 grid gap-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Tytuł
              </span>
              <input
                value={title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="np. Jak rozpocząć łowienie metodą Method Feeder?"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Slug
              </span>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
                <span className="shrink-0 text-sm text-slate-400">
                  /blog/
                </span>
                <input
                  value={slug}
                  onChange={(event) => {
                    setSlug(event.target.value);
                    setSlugTouched(true);
                  }}
                  onBlur={() => setSlug(slugifyBlogValue(slug))}
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Krótki opis
              </span>
              <textarea
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                rows={3}
                maxLength={320}
                placeholder="Krótki opis widoczny na karcie artykułu i w Google..."
                className="w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
              <span className="mt-1 block text-right text-xs text-slate-400">
                {excerpt.length}/320
              </span>
            </label>
          </div>
        </section>

        <BlogBlockEditor blocks={blocks} onChange={setBlocks} />

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            SEO
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-950">
            Widoczność w Google
          </h2>

          <div className="mt-5 grid gap-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                SEO title
              </span>
              <input
                value={seoTitle}
                onChange={(event) => setSeoTitle(event.target.value)}
                maxLength={70}
                placeholder={title || "Tytuł artykułu | Rybio"}
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Meta description
              </span>
              <textarea
                value={seoDescription}
                onChange={(event) =>
                  setSeoDescription(event.target.value)
                }
                rows={3}
                maxLength={180}
                placeholder={excerpt || "Opis artykułu widoczny w wynikach wyszukiwania."}
                className="w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </label>
          </div>
        </section>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Publikacja
          </p>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-sm font-semibold text-slate-600">
              Status
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                status === "published"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {status === "published" ? "Opublikowany" : "Szkic"}
            </span>
          </div>

          {message && (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
                message.includes("został")
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void savePost("draft")}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {isSaving ? "Zapisywanie..." : "Zapisz szkic"}
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => void savePost("published")}
              className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving
                ? "Zapisywanie..."
                : status === "published"
                  ? "Zapisz i opublikuj"
                  : "Opublikuj artykuł"}
            </button>

            {status === "published" && slug && (
              <a
                href={`/blog/${slugifyBlogValue(slug)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-blue-50 px-4 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-100"
              >
                Zobacz artykuł ↗
              </a>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Organizacja
          </p>

          <div className="mt-4 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Kategoria
              </span>
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as BlogCategoryValue)
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-blue-500"
              >
                {BLOG_CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Tagi
              </span>

              <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 focus-within:border-blue-500">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 py-1 pl-2.5 pr-1 text-xs font-semibold text-blue-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() =>
                        setTags((current) =>
                          current.filter((item) => item !== tag)
                        )
                      }
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-500 hover:bg-blue-100"
                      aria-label={`Usuń tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => tagInput && addTag()}
                  placeholder={tags.length === 0 ? "karp, lato, spinning..." : ""}
                  className="h-8 min-w-[130px] flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Enter lub przecinek dodaje tag. Maksymalnie 12.
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(event) => setIsFeatured(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-blue-600"
              />
              <span>
                <span className="block text-sm font-bold text-slate-700">
                  Wyróżniony artykuł
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Może pojawić się jako główny materiał na stronie bloga.
                </span>
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Zdjęcie główne
          </p>

          {coverImageUrl ? (
            <div className="mt-4">
              <div className="overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={coverImageUrl}
                  alt=""
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() => setCoverImageUrl("")}
                className="mt-3 text-xs font-semibold text-red-600"
              >
                Usuń zdjęcie główne
              </button>
            </div>
          ) : (
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:bg-slate-100">
              <span className="text-sm font-bold text-slate-700">
                {isUploadingCover
                  ? "Wysyłanie..."
                  : "Dodaj zdjęcie główne"}
              </span>
              <span className="mt-1 text-xs text-slate-400">
                JPG, PNG, WebP lub AVIF
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={isUploadingCover}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void handleCoverUpload(file);
                  }

                  event.currentTarget.value = "";
                }}
              />
            </label>
          )}
        </section>
      </aside>
    </div>
  );
}
