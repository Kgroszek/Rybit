import {
  cleanBlogBlocks,
  isBlogCategory,
  normalizeBlogTag,
  parseBlogBlocks,
  slugifyBlogValue,
  type BlogBlock,
  type BlogCategoryValue,
} from "@/lib/blog";

export type BlogPostInput = {
  title: string;
  slug: string;
  excerpt: string | null;
  category: BlogCategoryValue;
  tags: string[];
  coverImageUrl: string | null;
  content: BlogBlock[];
  status: "draft" | "published";
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  authorName: string | null;
  publishedAt: Date | null;
};

export type BlogPostInputResult =
  | {
      ok: true;
      data: BlogPostInput;
    }
  | {
      ok: false;
      message: string;
    };

export function parseBlogPostInput(
  raw: unknown
): BlogPostInputResult {
  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return fail(
      "Nieprawidłowe dane artykułu."
    );
  }

  const body =
    raw as Record<
      string,
      unknown
    >;

  const title =
    cleanString(body.title);

  if (
    title.length < 3 ||
    title.length > 220
  ) {
    return fail(
      "Tytuł artykułu musi mieć od 3 do 220 znaków."
    );
  }

  const slug =
    slugifyBlogValue(
      cleanString(body.slug)
    );

  if (
    slug.length < 3 ||
    slug.length > 220
  ) {
    return fail(
      "Slug artykułu musi mieć od 3 do 220 znaków."
    );
  }

  const category =
    cleanString(
      body.category
    );

  if (
    !isBlogCategory(category)
  ) {
    return fail(
      "Wybierz poprawną kategorię."
    );
  }

  const blocks =
    cleanBlogBlocks(
      parseBlogBlocks(
        body.content
      )
    );

  if (
    blocks.length === 0
  ) {
    return fail(
      "Artykuł musi zawierać przynajmniej jeden blok treści."
    );
  }

  if (
    blocks.length > 200
  ) {
    return fail(
      "Artykuł może zawierać maksymalnie 200 bloków."
    );
  }

  const excerpt =
    optionalString(
      body.excerpt,
      320
    );

  if (excerpt.error) {
    return fail(
      "Krótki opis może mieć maksymalnie 320 znaków."
    );
  }

  const coverImageUrl =
    optionalString(
      body.coverImageUrl,
      2000
    );

  if (
    coverImageUrl.error
  ) {
    return fail(
      "Adres zdjęcia głównego jest zbyt długi."
    );
  }

  const seoTitle =
    optionalString(
      body.seoTitle,
      70
    );

  if (seoTitle.error) {
    return fail(
      "SEO title może mieć maksymalnie 70 znaków."
    );
  }

  const seoDescription =
    optionalString(
      body.seoDescription,
      180
    );

  if (
    seoDescription.error
  ) {
    return fail(
      "Meta description może mieć maksymalnie 180 znaków."
    );
  }

  const authorName =
    optionalString(
      body.authorName,
      120
    );

  if (authorName.error) {
    return fail(
      "Nazwa autora może mieć maksymalnie 120 znaków."
    );
  }

  const tags =
    normalizeTags(body.tags);

  if (tags.error) {
    return fail(tags.error);
  }

  const status =
    body.status ===
    "published"
      ? "published"
      : "draft";

  const publishedAt =
    parsePublishedAt(
      body.publishedAt
    );

  if (
    publishedAt.error
  ) {
    return fail(
      "Podaj poprawną datę publikacji."
    );
  }

  return {
    ok: true,
    data: {
      title,
      slug,
      excerpt: excerpt.value,
      category,
      tags: tags.value,
      coverImageUrl:
        coverImageUrl.value,
      content: blocks,
      status,
      isFeatured: Boolean(
        body.isFeatured
      ),
      seoTitle:
        seoTitle.value,
      seoDescription:
        seoDescription.value,
      authorName:
        authorName.value,
      publishedAt:
        publishedAt.value,
    },
  };
}

function cleanString(
  value: unknown
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function optionalString(
  value: unknown,
  maxLength: number
): {
  value: string | null;
  error: boolean;
} {
  const clean =
    cleanString(value);

  return {
    value: clean || null,
    error:
      clean.length > maxLength,
  };
}

function normalizeTags(
  value: unknown
):
  | {
      value: string[];
      error: null;
    }
  | {
      value: [];
      error: string;
    } {
  if (!Array.isArray(value)) {
    return {
      value: [],
      error: null,
    };
  }

  const tags = Array.from(
    new Set(
      value
        .filter(
          (
            item
          ): item is string =>
            typeof item ===
            "string"
        )
        .map(normalizeBlogTag)
        .filter(Boolean)
    )
  );

  if (tags.length > 12) {
    return {
      value: [],
      error:
        "Możesz dodać maksymalnie 12 tagów.",
    };
  }

  if (
    tags.some(
      (tag) =>
        tag.length > 50
    )
  ) {
    return {
      value: [],
      error:
        "Pojedynczy tag może mieć maksymalnie 50 znaków.",
    };
  }

  return {
    value: tags,
    error: null,
  };
}

function parsePublishedAt(
  value: unknown
): {
  value: Date | null;
  error: boolean;
} {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return {
      value: null,
      error: false,
    };
  }

  if (
    typeof value !== "string"
  ) {
    return {
      value: null,
      error: true,
    };
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return {
      value: null,
      error: true,
    };
  }

  return {
    value: date,
    error: false,
  };
}

function fail(
  message: string
): BlogPostInputResult {
  return {
    ok: false,
    message,
  };
}
