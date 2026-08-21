"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import type {
  BlogEditorInitialPost,
  BlogEditorMessage,
  BlogEditorSaveAction,
  BlogEditorSnapshot,
  BlogInspectorTab,
  BlogPreviewDevice,
  BlogPublicationMode,
} from "@/components/admin/blog/BlogEditorTypes";
import {
  blogSnapshotSignature,
  cloneBlogSnapshot,
  createDefaultScheduleIso,
  localDateTimeToIso,
  toLocalDateTimeValue,
  uploadBlogImage,
} from "@/components/admin/blog/blog-editor-utils";
import {
  BLOG_CATEGORIES,
  cleanBlogBlocks,
  createEmptyBlogBlock,
  getBlogPublicationState,
  normalizeBlogTag,
  parseBlogBlocks,
  slugifyBlogValue,
  type BlogBlock,
  type BlogBlockType,
  type BlogCategoryValue,
} from "@/lib/blog";

function createInitialSnapshot(
  initialPost: BlogEditorInitialPost
): BlogEditorSnapshot {
  const parsedBlocks =
    parseBlogBlocks(
      initialPost?.content
    );

  const category =
    BLOG_CATEGORIES.some(
      (item) =>
        item.value ===
        initialPost?.category
    )
      ? (initialPost
          ?.category as BlogCategoryValue)
      : "poradniki";

  return {
    title:
      initialPost?.title || "",
    slug:
      initialPost?.slug || "",
    excerpt:
      initialPost?.excerpt || "",
    category,
    tags:
      initialPost?.tags || [],
    coverImageUrl:
      initialPost
        ?.coverImageUrl || "",
    blocks:
      parsedBlocks.length > 0
        ? parsedBlocks
        : [
            createEmptyBlogBlock(
              "paragraph"
            ),
          ],
    status:
      initialPost?.status ===
      "published"
        ? "published"
        : "draft",
    isFeatured:
      initialPost
        ?.isFeatured || false,
    seoTitle:
      initialPost?.seoTitle || "",
    seoDescription:
      initialPost
        ?.seoDescription || "",
    authorName:
      initialPost?.authorName || "",
    publishedAt:
      initialPost
        ?.publishedAt || null,
  };
}

export function useBlogPostEditor({
  initialPost,
}: {
  initialPost: BlogEditorInitialPost;
}) {
  const router = useRouter();

  const initialSnapshot =
    useMemo(
      () =>
        createInitialSnapshot(
          initialPost
        ),
      [initialPost]
    );

  const [
    savedSnapshot,
    setSavedSnapshot,
  ] =
    useState<BlogEditorSnapshot>(
      () =>
        cloneBlogSnapshot(
          initialSnapshot
        )
    );

  const [
    snapshot,
    setSnapshot,
  ] =
    useState<BlogEditorSnapshot>(
      () =>
        cloneBlogSnapshot(
          initialSnapshot
        )
    );

  const [
    slugTouched,
    setSlugTouched,
  ] = useState(
    Boolean(initialPost?.id)
  );

  const [
    selectedBlockId,
    setSelectedBlockId,
  ] = useState<string | null>(
    null
  );

  const [
    inspectorTab,
    setInspectorTab,
  ] =
    useState<BlogInspectorTab>(
      "document"
    );

  const [
    previewOpen,
    setPreviewOpen,
  ] = useState(false);

  const [
    previewDevice,
    setPreviewDevice,
  ] =
    useState<BlogPreviewDevice>(
      "desktop"
    );

  const [
    savingAction,
    setSavingAction,
  ] =
    useState<BlogEditorSaveAction | null>(
      null
    );

  const [
    uploadingCover,
    setUploadingCover,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] =
    useState<BlogEditorMessage | null>(
      null
    );

  const isDirty = useMemo(
    () =>
      blogSnapshotSignature(
        snapshot
      ) !==
      blogSnapshotSignature(
        savedSnapshot
      ),
    [snapshot, savedSnapshot]
  );

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(
      event: BeforeUnloadEvent
    ) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () =>
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
  }, [isDirty]);

  const selectedBlock =
    snapshot.blocks.find(
      (block) =>
        block.id ===
        selectedBlockId
    ) || null;

  const publicationState =
    getBlogPublicationState(
      snapshot.status,
      snapshot.publishedAt
    );

  const publicationMode:
    BlogPublicationMode =
    snapshot.publishedAt &&
    new Date(
      snapshot.publishedAt
    ).getTime() >
      Date.now()
      ? "scheduled"
      : "now";

  const scheduledLocalValue =
    toLocalDateTimeValue(
      snapshot.publishedAt
    );

  function patchSnapshot(
    patch: Partial<BlogEditorSnapshot>
  ) {
    setSnapshot((current) => ({
      ...current,
      ...patch,
    }));
  }

  function setTitle(
    title: string
  ) {
    setSnapshot((current) => ({
      ...current,
      title,
      slug:
        slugTouched
          ? current.slug
          : slugifyBlogValue(
              title
            ),
    }));
  }

  function setSlug(
    slug: string
  ) {
    setSlugTouched(true);

    patchSnapshot({
      slug,
    });
  }

  function normalizeSlug() {
    setSnapshot((current) => ({
      ...current,
      slug:
        slugifyBlogValue(
          current.slug
        ),
    }));
  }

  function addTag(
    rawValue: string
  ) {
    const values = rawValue
      .split(",")
      .map(normalizeBlogTag)
      .filter(Boolean);

    if (
      values.length === 0
    ) {
      return;
    }

    setSnapshot((current) => {
      const next = [
        ...current.tags,
      ];

      for (
        const tag of values
      ) {
        if (
          !next.includes(tag) &&
          next.length < 12
        ) {
          next.push(tag);
        }
      }

      return {
        ...current,
        tags: next,
      };
    });
  }

  function removeTag(
    tag: string
  ) {
    setSnapshot((current) => ({
      ...current,
      tags:
        current.tags.filter(
          (item) =>
            item !== tag
        ),
    }));
  }

  function selectBlock(
    id: string | null
  ) {
    setSelectedBlockId(id);

    if (id) {
      setInspectorTab(
        "block"
      );
    } else if (
      inspectorTab === "block"
    ) {
      setInspectorTab(
        "document"
      );
    }
  }

  function replaceBlock(
    id: string,
    next: BlogBlock
  ) {
    setSnapshot((current) => ({
      ...current,
      blocks:
        current.blocks.map(
          (block) =>
            block.id === id
              ? next
              : block
        ),
    }));
  }

  function addBlock(
    type: BlogBlockType,
    afterId?: string | null
  ) {
    if (
      snapshot.blocks.length >=
      200
    ) {
      setMessage({
        tone: "error",
        text:
          "Artykuł może zawierać maksymalnie 200 bloków.",
      });
      return;
    }

    const block =
      createEmptyBlogBlock(
        type
      );

    setSnapshot((current) => {
      if (!afterId) {
        return {
          ...current,
          blocks: [
            block,
            ...current.blocks,
          ],
        };
      }

      const index =
        current.blocks.findIndex(
          (item) =>
            item.id === afterId
        );

      if (index < 0) {
        return {
          ...current,
          blocks: [
            ...current.blocks,
            block,
          ],
        };
      }

      const blocks = [
        ...current.blocks,
      ];

      blocks.splice(
        index + 1,
        0,
        block
      );

      return {
        ...current,
        blocks,
      };
    });

    setSelectedBlockId(
      block.id
    );

    setInspectorTab("block");
  }

  function removeBlock(
    id: string
  ) {
    if (
      snapshot.blocks.length <=
      1
    ) {
      setMessage({
        tone: "error",
        text:
          "Artykuł musi zawierać przynajmniej jeden blok treści.",
      });
      return;
    }

    setSnapshot((current) => ({
      ...current,
      blocks:
        current.blocks.filter(
          (block) =>
            block.id !== id
        ),
    }));

    if (
      selectedBlockId === id
    ) {
      setSelectedBlockId(
        null
      );

      setInspectorTab(
        "document"
      );
    }
  }

  function moveBlock(
    id: string,
    direction: -1 | 1
  ) {
    setSnapshot((current) => {
      const index =
        current.blocks.findIndex(
          (block) =>
            block.id === id
        );

      const target =
        index + direction;

      if (
        index < 0 ||
        target < 0 ||
        target >=
          current.blocks.length
      ) {
        return current;
      }

      const blocks = [
        ...current.blocks,
      ];

      const [moved] =
        blocks.splice(
          index,
          1
        );

      blocks.splice(
        target,
        0,
        moved
      );

      return {
        ...current,
        blocks,
      };
    });
  }

  function dragBlock(
    sourceId: string,
    targetId: string
  ) {
    if (
      sourceId === targetId
    ) {
      return;
    }

    setSnapshot((current) => {
      const sourceIndex =
        current.blocks.findIndex(
          (block) =>
            block.id ===
            sourceId
        );

      const targetIndex =
        current.blocks.findIndex(
          (block) =>
            block.id ===
            targetId
        );

      if (
        sourceIndex < 0 ||
        targetIndex < 0
      ) {
        return current;
      }

      const blocks = [
        ...current.blocks,
      ];

      const [moved] =
        blocks.splice(
          sourceIndex,
          1
        );

      blocks.splice(
        targetIndex,
        0,
        moved
      );

      return {
        ...current,
        blocks,
      };
    });
  }

  function setPublicationMode(
    mode: BlogPublicationMode
  ) {
    if (
      mode === "scheduled"
    ) {
      const currentDate =
        snapshot.publishedAt
          ? new Date(
              snapshot.publishedAt
            )
          : null;

      const hasFuture =
        currentDate &&
        !Number.isNaN(
          currentDate.getTime()
        ) &&
        currentDate.getTime() >
          Date.now();

      patchSnapshot({
        publishedAt:
          hasFuture
            ? snapshot.publishedAt
            : createDefaultScheduleIso(),
      });

      return;
    }

    if (
      publicationState ===
      "published"
    ) {
      return;
    }

    patchSnapshot({
      publishedAt: null,
    });
  }

  function setScheduledLocal(
    value: string
  ) {
    patchSnapshot({
      publishedAt:
        localDateTimeToIso(
          value
        ),
    });
  }

  async function uploadCover(
    file: File
  ) {
    setUploadingCover(true);
    setMessage(null);

    try {
      const url =
        await uploadBlogImage(
          file
        );

      patchSnapshot({
        coverImageUrl: url,
      });
    } catch (error) {
      setMessage({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Nie udało się przesłać zdjęcia.",
      });
    } finally {
      setUploadingCover(false);
    }
  }

  async function uploadContentImage(
    file: File
  ) {
    try {
      return await uploadBlogImage(
        file
      );
    } catch (error) {
      const text =
        error instanceof Error
          ? error.message
          : "Nie udało się przesłać zdjęcia.";

      setMessage({
        tone: "error",
        text,
      });

      throw error;
    }
  }

  async function save(
    action: BlogEditorSaveAction
  ) {
    setMessage(null);

    const cleanTitle =
      snapshot.title.trim();

    const cleanSlug =
      slugifyBlogValue(
        snapshot.slug
      );

    const cleanBlocks =
      cleanBlogBlocks(
        snapshot.blocks
      );

    if (
      cleanTitle.length < 3
    ) {
      setMessage({
        tone: "error",
        text:
          "Podaj tytuł artykułu.",
      });
      return false;
    }

    if (!cleanSlug) {
      setMessage({
        tone: "error",
        text:
          "Podaj poprawny slug artykułu.",
      });
      return false;
    }

    if (
      cleanBlocks.length === 0
    ) {
      setMessage({
        tone: "error",
        text:
          "Dodaj przynajmniej jeden blok treści.",
      });
      return false;
    }

    let nextStatus:
      | "draft"
      | "published";

    let nextPublishedAt:
      | string
      | null;

    if (
      action === "unpublish"
    ) {
      nextStatus = "draft";
      nextPublishedAt = null;
    } else if (
      action === "draft"
    ) {
      nextStatus = "draft";

      const scheduled =
        snapshot.publishedAt &&
        new Date(
          snapshot.publishedAt
        ).getTime() >
          Date.now();

      nextPublishedAt =
        scheduled
          ? snapshot.publishedAt
          : null;
    } else if (
      action === "publish"
    ) {
      nextStatus =
        "published";

      if (
        publicationMode ===
        "scheduled"
      ) {
        if (
          !snapshot.publishedAt
        ) {
          setMessage({
            tone: "error",
            text:
              "Wybierz datę i godzinę planowanej publikacji.",
          });
          return false;
        }

        const date =
          new Date(
            snapshot.publishedAt
          );

        if (
          Number.isNaN(
            date.getTime()
          ) ||
          date.getTime() <=
            Date.now()
        ) {
          setMessage({
            tone: "error",
            text:
              "Planowana publikacja musi być ustawiona w przyszłości.",
          });
          return false;
        }

        nextPublishedAt =
          snapshot.publishedAt;
      } else {
        nextPublishedAt =
          new Date().toISOString();
      }
    } else {
      nextStatus =
        "published";

      nextPublishedAt =
        snapshot.publishedAt ||
        new Date().toISOString();
    }

    setSavingAction(action);

    try {
      const endpoint =
        initialPost?.id
          ? `/api/admin/blog/posts/${initialPost.id}`
          : "/api/admin/blog/posts";

      const response =
        await fetch(
          endpoint,
          {
            method:
              initialPost?.id
                ? "PUT"
                : "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              {
                title:
                  cleanTitle,
                slug:
                  cleanSlug,
                excerpt:
                  snapshot.excerpt.trim(),
                category:
                  snapshot.category,
                tags:
                  snapshot.tags,
                coverImageUrl:
                  snapshot.coverImageUrl ||
                  null,
                content:
                  cleanBlocks,
                status:
                  nextStatus,
                isFeatured:
                  snapshot.isFeatured,
                seoTitle:
                  snapshot.seoTitle.trim(),
                seoDescription:
                  snapshot.seoDescription.trim(),
                authorName:
                  snapshot.authorName.trim(),
                publishedAt:
                  nextPublishedAt,
              }
            ),
          }
        );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | {
              id?: string;
              slug?: string;
              status?: string;
              publishedAt?:
                | string
                | null;
              authorName?:
                | string
                | null;
              message?: string;
            }
          | null;

      if (
        !response.ok ||
        !data?.id
      ) {
        throw new Error(
          data?.message ||
            "Nie udało się zapisać artykułu."
        );
      }

      const saved:
        BlogEditorSnapshot = {
        ...snapshot,
        title: cleanTitle,
        slug:
          data.slug ||
          cleanSlug,
        blocks: cleanBlocks,
        status:
          data.status ===
          "published"
            ? "published"
            : "draft",
        publishedAt:
          data.publishedAt ??
          nextPublishedAt,
        authorName:
          data.authorName ??
          snapshot.authorName,
      };

      setSnapshot(
        cloneBlogSnapshot(saved)
      );

      setSavedSnapshot(
        cloneBlogSnapshot(saved)
      );

      setSlugTouched(true);

      const state =
        getBlogPublicationState(
          saved.status,
          saved.publishedAt
        );

      setMessage({
        tone: "success",
        text:
          action ===
          "unpublish"
            ? "Publikacja została cofnięta. Artykuł jest teraz szkicem."
            : state ===
                "scheduled"
              ? "Artykuł został zaplanowany do publikacji."
              : state ===
                  "published"
                ? "Artykuł został zapisany i jest opublikowany."
                : "Szkic został zapisany.",
      });

      if (
        !initialPost?.id
      ) {
        router.replace(
          `/admin/blog/${data.id}/edytuj`
        );
      }

      router.refresh();

      return true;
    } catch (error) {
      setMessage({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Nie udało się zapisać artykułu.",
      });

      return false;
    } finally {
      setSavingAction(null);
    }
  }

  function resetToSaved() {
    setSnapshot(
      cloneBlogSnapshot(
        savedSnapshot
      )
    );

    setSelectedBlockId(
      null
    );

    setInspectorTab(
      "document"
    );

    setMessage({
      tone: "info",
      text:
        "Przywrócono ostatnio zapisaną wersję.",
    });
  }

  return {
    snapshot,
    savedSnapshot,
    selectedBlock,
    selectedBlockId,
    inspectorTab,
    previewOpen,
    previewDevice,
    savingAction,
    uploadingCover,
    message,
    isDirty,
    publicationState,
    publicationMode,
    scheduledLocalValue,

    setInspectorTab,
    setPreviewOpen,
    setPreviewDevice,
    setMessage,

    patchSnapshot,
    setTitle,
    setSlug,
    normalizeSlug,
    addTag,
    removeTag,
    selectBlock,
    replaceBlock,
    addBlock,
    removeBlock,
    moveBlock,
    dragBlock,
    setPublicationMode,
    setScheduledLocal,
    uploadCover,
    uploadContentImage,
    save,
    resetToSaved,
  };
}

export type BlogPostEditorController =
  ReturnType<
    typeof useBlogPostEditor
  >;
