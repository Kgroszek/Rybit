export type BlogCategoryValue =
  | "poradniki"
  | "ryby"
  | "sprzet"
  | "wyprawy-i-lowiska";

export const BLOG_CATEGORIES: Array<{
  value: BlogCategoryValue;
  label: string;
  description: string;
}> = [
  {
    value: "poradniki",
    label: "Poradniki",
    description:
      "Techniki łowienia, przepisy, sezonowe wskazówki i wiedza dla wędkarzy.",
  },
  {
    value: "ryby",
    label: "Ryby",
    description:
      "Gatunki ryb, ich zachowanie, występowanie oraz sposoby skutecznego łowienia.",
  },
  {
    value: "sprzet",
    label: "Sprzęt",
    description:
      "Dobór wędek, kołowrotków, zestawów, przynęt i akcesoriów wędkarskich.",
  },
  {
    value: "wyprawy-i-lowiska",
    label: "Wyprawy i łowiska",
    description:
      "Przygotowanie wypraw, wybór łowisk, nocki i organizacja czasu nad wodą.",
  },
];

export type BlogParagraphBlock = {
  id: string;
  type: "paragraph";
  text: string;
};

export type BlogHeadingBlock = {
  id: string;
  type: "heading2" | "heading3";
  text: string;
};

export type BlogImageBlock = {
  id: string;
  type: "image";
  url: string;
  alt: string;
  caption: string;
};

export type BlogQuoteBlock = {
  id: string;
  type: "quote";
  text: string;
};

export type BlogListBlock = {
  id: string;
  type: "list";
  items: string[];
};

export type BlogBlock =
  | BlogParagraphBlock
  | BlogHeadingBlock
  | BlogImageBlock
  | BlogQuoteBlock
  | BlogListBlock;

export function createBlogBlockId() {
  if (
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    globalThis.crypto &&
    "randomUUID" in globalThis.crypto
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `blog-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function slugifyBlogValue(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("pl-PL")
    .replace(/ł/g, "l")
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ń/g, "n")
    .replace(/ó/g, "o")
    .replace(/ś/g, "s")
    .replace(/ź/g, "z")
    .replace(/ż/g, "z")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function normalizeBlogTag(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pl-PL");
}

export function getBlogCategoryLabel(value: string) {
  return (
    BLOG_CATEGORIES.find((category) => category.value === value)?.label ??
    "Poradniki"
  );
}

export function isBlogCategory(value: string): value is BlogCategoryValue {
  return BLOG_CATEGORIES.some((category) => category.value === value);
}

export function parseBlogBlocks(value: unknown): BlogBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): BlogBlock[] => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const block = item as Record<string, unknown>;
    const id =
      typeof block.id === "string" && block.id
        ? block.id
        : createBlogBlockId();

    if (
      block.type === "paragraph" &&
      typeof block.text === "string"
    ) {
      return [{ id, type: "paragraph", text: block.text }];
    }

    if (
      (block.type === "heading2" || block.type === "heading3") &&
      typeof block.text === "string"
    ) {
      return [
        {
          id,
          type: block.type,
          text: block.text,
        },
      ];
    }

    if (
      block.type === "quote" &&
      typeof block.text === "string"
    ) {
      return [{ id, type: "quote", text: block.text }];
    }

    if (
      block.type === "image" &&
      typeof block.url === "string"
    ) {
      return [
        {
          id,
          type: "image",
          url: block.url,
          alt: typeof block.alt === "string" ? block.alt : "",
          caption:
            typeof block.caption === "string" ? block.caption : "",
        },
      ];
    }

    if (
      block.type === "list" &&
      Array.isArray(block.items)
    ) {
      return [
        {
          id,
          type: "list",
          items: block.items.filter(
            (listItem): listItem is string =>
              typeof listItem === "string"
          ),
        },
      ];
    }

    return [];
  });
}

export function getBlogReadTime(blocks: BlogBlock[]) {
  const text = blocks
    .flatMap((block) => {
      if (block.type === "list") {
        return block.items;
      }

      if (block.type === "image") {
        return [block.alt, block.caption];
      }

      return [block.text];
    })
    .join(" ")
    .trim();

  if (!text) {
    return 1;
  }

  const words = text.split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 220));
}

export function getBlogTextPreview(blocks: BlogBlock[], maxLength = 170) {
  const text = blocks
    .flatMap((block) => {
      if (block.type === "paragraph" || block.type === "quote") {
        return [block.text];
      }

      if (block.type === "list") {
        return block.items;
      }

      return [];
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}…`;
}
