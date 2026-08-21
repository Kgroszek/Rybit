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
      "Techniki łowienia, sezonowe wskazówki i praktyczna wiedza dla wędkarzy.",
  },
  {
    value: "ryby",
    label: "Ryby",
    description:
      "Gatunki, zachowanie ryb, występowanie oraz sposoby skutecznego łowienia.",
  },
  {
    value: "sprzet",
    label: "Sprzęt",
    description:
      "Dobór wędek, kołowrotków, zestawów, przynęt i akcesoriów.",
  },
  {
    value: "wyprawy-i-lowiska",
    label: "Wyprawy i łowiska",
    description:
      "Przygotowanie wypraw, wybór łowiska i organizacja czasu nad wodą.",
  },
];

export type BlogImageWidth =
  | "content"
  | "wide";

export type BlogListStyle =
  | "bullet"
  | "numbered";

export type BlogCalloutTone =
  | "tip"
  | "important"
  | "warning";

export type BlogGalleryLayout =
  | "grid"
  | "feature";

export type BlogCtaStyle =
  | "primary"
  | "dark";

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
  width: BlogImageWidth;
};

export type BlogQuoteBlock = {
  id: string;
  type: "quote";
  text: string;
  attribution: string;
};

export type BlogListBlock = {
  id: string;
  type: "list";
  items: string[];
  style: BlogListStyle;
};

export type BlogCalloutBlock = {
  id: string;
  type: "callout";
  tone: BlogCalloutTone;
  title: string;
  text: string;
};

export type BlogGalleryImage = {
  id: string;
  url: string;
  alt: string;
  caption: string;
};

export type BlogGalleryBlock = {
  id: string;
  type: "gallery";
  layout: BlogGalleryLayout;
  images: BlogGalleryImage[];
};

export type BlogTableBlock = {
  id: string;
  type: "table";
  caption: string;
  headers: string[];
  rows: string[][];
};

export type BlogStepItem = {
  id: string;
  title: string;
  text: string;
};

export type BlogStepsBlock = {
  id: string;
  type: "steps";
  title: string;
  items: BlogStepItem[];
};

export type BlogFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type BlogFaqBlock = {
  id: string;
  type: "faq";
  title: string;
  items: BlogFaqItem[];
};

export type BlogCtaBlock = {
  id: string;
  type: "cta";
  eyebrow: string;
  title: string;
  text: string;
  buttonLabel: string;
  buttonHref: string;
  style: BlogCtaStyle;
};

export type BlogDividerBlock = {
  id: string;
  type: "divider";
};

export type BlogBlock =
  | BlogParagraphBlock
  | BlogHeadingBlock
  | BlogImageBlock
  | BlogQuoteBlock
  | BlogListBlock
  | BlogCalloutBlock
  | BlogGalleryBlock
  | BlogTableBlock
  | BlogStepsBlock
  | BlogFaqBlock
  | BlogCtaBlock
  | BlogDividerBlock;

export type BlogBlockType =
  BlogBlock["type"];

export type BlogTableOfContentsItem = {
  blockId: string;
  id: string;
  text: string;
  level: 2 | 3;
};

export type BlogPublicationState =
  | "draft"
  | "scheduled"
  | "published";

export const BLOG_BLOCK_LIBRARY: Array<{
  type: BlogBlockType;
  label: string;
  description: string;
  group: "text" | "media" | "structure" | "conversion";
}> = [
  {
    type: "paragraph",
    label: "Akapit",
    description: "Podstawowy blok tekstu.",
    group: "text",
  },
  {
    type: "heading2",
    label: "Nagłówek H2",
    description: "Główna sekcja artykułu.",
    group: "text",
  },
  {
    type: "heading3",
    label: "Nagłówek H3",
    description: "Podsekcja wewnątrz H2.",
    group: "text",
  },
  {
    type: "list",
    label: "Lista",
    description: "Lista punktowana lub numerowana.",
    group: "text",
  },
  {
    type: "quote",
    label: "Cytat",
    description: "Wyróżniona wypowiedź lub fragment.",
    group: "text",
  },
  {
    type: "callout",
    label: "Wskazówka",
    description: "Tip, ważna informacja albo ostrzeżenie.",
    group: "text",
  },
  {
    type: "image",
    label: "Zdjęcie",
    description: "Zdjęcie w treści z ALT i podpisem.",
    group: "media",
  },
  {
    type: "gallery",
    label: "Galeria",
    description: "Kilka zdjęć w jednym komponencie.",
    group: "media",
  },
  {
    type: "table",
    label: "Tabela",
    description: "Porównania, dane i parametry.",
    group: "structure",
  },
  {
    type: "steps",
    label: "Kroki",
    description: "Instrukcja krok po kroku.",
    group: "structure",
  },
  {
    type: "faq",
    label: "FAQ",
    description: "Pytania i odpowiedzi w artykule.",
    group: "structure",
  },
  {
    type: "cta",
    label: "CTA",
    description: "Powiązanie artykułu z funkcją Rybio.",
    group: "conversion",
  },
  {
    type: "divider",
    label: "Separator",
    description: "Delikatny podział dłuższego materiału.",
    group: "structure",
  },
];

export function createBlogBlockId() {
  if (
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    globalThis.crypto &&
    "randomUUID" in globalThis.crypto
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `blog-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function createEmptyBlogBlock(
  type: BlogBlockType
): BlogBlock {
  const id = createBlogBlockId();

  if (type === "paragraph") {
    return {
      id,
      type,
      text: "",
    };
  }

  if (
    type === "heading2" ||
    type === "heading3"
  ) {
    return {
      id,
      type,
      text: "",
    };
  }

  if (type === "image") {
    return {
      id,
      type,
      url: "",
      alt: "",
      caption: "",
      width: "content",
    };
  }

  if (type === "quote") {
    return {
      id,
      type,
      text: "",
      attribution: "",
    };
  }

  if (type === "list") {
    return {
      id,
      type,
      items: [""],
      style: "bullet",
    };
  }

  if (type === "callout") {
    return {
      id,
      type,
      tone: "tip",
      title: "Warto wiedzieć",
      text: "",
    };
  }

  if (type === "gallery") {
    return {
      id,
      type,
      layout: "grid",
      images: [],
    };
  }

  if (type === "table") {
    return {
      id,
      type,
      caption: "",
      headers: [
        "Kolumna 1",
        "Kolumna 2",
      ],
      rows: [["", ""]],
    };
  }

  if (type === "steps") {
    return {
      id,
      type,
      title: "",
      items: [
        {
          id: createBlogBlockId(),
          title: "Krok 1",
          text: "",
        },
      ],
    };
  }

  if (type === "faq") {
    return {
      id,
      type,
      title: "Najczęstsze pytania",
      items: [
        {
          id: createBlogBlockId(),
          question: "",
          answer: "",
        },
      ],
    };
  }

  if (type === "cta") {
    return {
      id,
      type,
      eyebrow: "Rybio",
      title: "Zaplanuj kolejną wyprawę",
      text:
        "Znajdź łowisko i przygotuj wyprawę w jednym miejscu.",
      buttonLabel: "Przejdź do Rybio",
      buttonHref: "/lowiska-w-polsce",
      style: "primary",
    };
  }

  return {
    id,
    type: "divider",
  };
}

export function slugifyBlogValue(
  value: string
) {
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
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function normalizeBlogTag(
  value: string
) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pl-PL");
}

export function getBlogCategoryLabel(
  value: string
) {
  return (
    BLOG_CATEGORIES.find(
      (category) =>
        category.value === value
    )?.label ?? "Poradniki"
  );
}

export function isBlogCategory(
  value: string
): value is BlogCategoryValue {
  return BLOG_CATEGORIES.some(
    (category) =>
      category.value === value
  );
}

export function parseBlogBlocks(
  value: unknown
): BlogBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap(
    (item): BlogBlock[] => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return [];
      }

      const block =
        item as Record<
          string,
          unknown
        >;

      const id =
        cleanText(block.id) ||
        createBlogBlockId();

      if (
        block.type ===
          "paragraph" &&
        typeof block.text ===
          "string"
      ) {
        return [
          {
            id,
            type: "paragraph",
            text: block.text,
          },
        ];
      }

      if (
        (block.type ===
          "heading2" ||
          block.type ===
            "heading3") &&
        typeof block.text ===
          "string"
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
        typeof block.text ===
          "string"
      ) {
        return [
          {
            id,
            type: "quote",
            text: block.text,
            attribution:
              cleanText(
                block.attribution
              ),
          },
        ];
      }

      if (
        block.type === "image" &&
        typeof block.url ===
          "string"
      ) {
        return [
          {
            id,
            type: "image",
            url: block.url,
            alt: cleanText(
              block.alt
            ),
            caption: cleanText(
              block.caption
            ),
            width:
              block.width === "wide"
                ? "wide"
                : "content",
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
            items:
              block.items.filter(
                (
                  listItem
                ): listItem is string =>
                  typeof listItem ===
                  "string"
              ),
            style:
              block.style ===
              "numbered"
                ? "numbered"
                : "bullet",
          },
        ];
      }

      if (
        block.type === "callout"
      ) {
        return [
          {
            id,
            type: "callout",
            tone:
              block.tone ===
                "important" ||
              block.tone ===
                "warning"
                ? block.tone
                : "tip",
            title: cleanText(
              block.title
            ),
            text: cleanText(
              block.text
            ),
          },
        ];
      }

      if (
        block.type ===
          "gallery" &&
        Array.isArray(
          block.images
        )
      ) {
        return [
          {
            id,
            type: "gallery",
            layout:
              block.layout ===
              "feature"
                ? "feature"
                : "grid",
            images:
              block.images
                .flatMap(
                  (
                    image
                  ): BlogGalleryImage[] => {
                    if (
                      !image ||
                      typeof image !==
                        "object"
                    ) {
                      return [];
                    }

                    const source =
                      image as Record<
                        string,
                        unknown
                      >;

                    const url =
                      cleanText(
                        source.url
                      );

                    if (!url) {
                      return [];
                    }

                    return [
                      {
                        id:
                          cleanText(
                            source.id
                          ) ||
                          createBlogBlockId(),
                        url,
                        alt:
                          cleanText(
                            source.alt
                          ),
                        caption:
                          cleanText(
                            source.caption
                          ),
                      },
                    ];
                  }
                )
                .slice(0, 12),
          },
        ];
      }

      if (
        block.type === "table"
      ) {
        const headers =
          Array.isArray(
            block.headers
          )
            ? block.headers
                .filter(
                  (
                    header
                  ): header is string =>
                    typeof header ===
                    "string"
                )
                .slice(0, 6)
            : [];

        const rows =
          Array.isArray(
            block.rows
          )
            ? block.rows
                .flatMap(
                  (
                    row
                  ): string[][] => {
                    if (
                      !Array.isArray(
                        row
                      )
                    ) {
                      return [];
                    }

                    return [
                      row
                        .filter(
                          (
                            cell
                          ): cell is string =>
                            typeof cell ===
                            "string"
                        )
                        .slice(
                          0,
                          Math.max(
                            1,
                            headers.length
                          )
                        ),
                    ];
                  }
                )
                .slice(0, 30)
            : [];

        if (
          headers.length === 0
        ) {
          return [];
        }

        return [
          {
            id,
            type: "table",
            caption: cleanText(
              block.caption
            ),
            headers,
            rows,
          },
        ];
      }

      if (
        block.type === "steps" &&
        Array.isArray(block.items)
      ) {
        return [
          {
            id,
            type: "steps",
            title: cleanText(
              block.title
            ),
            items:
              block.items
                .flatMap(
                  (
                    step
                  ): BlogStepItem[] => {
                    if (
                      !step ||
                      typeof step !==
                        "object"
                    ) {
                      return [];
                    }

                    const source =
                      step as Record<
                        string,
                        unknown
                      >;

                    return [
                      {
                        id:
                          cleanText(
                            source.id
                          ) ||
                          createBlogBlockId(),
                        title:
                          cleanText(
                            source.title
                          ),
                        text:
                          cleanText(
                            source.text
                          ),
                      },
                    ];
                  }
                )
                .slice(0, 20),
          },
        ];
      }

      if (
        block.type === "faq" &&
        Array.isArray(block.items)
      ) {
        return [
          {
            id,
            type: "faq",
            title: cleanText(
              block.title
            ),
            items:
              block.items
                .flatMap(
                  (
                    faq
                  ): BlogFaqItem[] => {
                    if (
                      !faq ||
                      typeof faq !==
                        "object"
                    ) {
                      return [];
                    }

                    const source =
                      faq as Record<
                        string,
                        unknown
                      >;

                    return [
                      {
                        id:
                          cleanText(
                            source.id
                          ) ||
                          createBlogBlockId(),
                        question:
                          cleanText(
                            source.question
                          ),
                        answer:
                          cleanText(
                            source.answer
                          ),
                      },
                    ];
                  }
                )
                .slice(0, 20),
          },
        ];
      }

      if (
        block.type === "cta"
      ) {
        return [
          {
            id,
            type: "cta",
            eyebrow: cleanText(
              block.eyebrow
            ),
            title: cleanText(
              block.title
            ),
            text: cleanText(
              block.text
            ),
            buttonLabel:
              cleanText(
                block.buttonLabel
              ),
            buttonHref:
              cleanText(
                block.buttonHref
              ),
            style:
              block.style ===
              "dark"
                ? "dark"
                : "primary",
          },
        ];
      }

      if (
        block.type === "divider"
      ) {
        return [
          {
            id,
            type: "divider",
          },
        ];
      }

      return [];
    }
  );
}

export function cleanBlogBlocks(
  blocks: BlogBlock[]
) {
  return parseBlogBlocks(
    blocks
      .map((block) => {
        if (
          block.type ===
          "paragraph" ||
          block.type ===
            "heading2" ||
          block.type ===
            "heading3"
        ) {
          return {
            ...block,
            text: block.text.trim(),
          };
        }

        if (
          block.type === "quote"
        ) {
          return {
            ...block,
            text: block.text.trim(),
            attribution:
              block.attribution.trim(),
          };
        }

        if (
          block.type === "image"
        ) {
          return {
            ...block,
            url: block.url.trim(),
            alt: block.alt.trim(),
            caption:
              block.caption.trim(),
          };
        }

        if (
          block.type === "list"
        ) {
          return {
            ...block,
            items: block.items
              .map((item) =>
                item.trim()
              )
              .filter(Boolean),
          };
        }

        if (
          block.type === "callout"
        ) {
          return {
            ...block,
            title:
              block.title.trim(),
            text: block.text.trim(),
          };
        }

        if (
          block.type === "gallery"
        ) {
          return {
            ...block,
            images: block.images
              .map((image) => ({
                ...image,
                url: image.url.trim(),
                alt: image.alt.trim(),
                caption:
                  image.caption.trim(),
              }))
              .filter(
                (image) =>
                  Boolean(image.url)
              ),
          };
        }

        if (
          block.type === "table"
        ) {
          return {
            ...block,
            caption:
              block.caption.trim(),
            headers:
              block.headers.map(
                (header) =>
                  header.trim()
              ),
            rows: block.rows.map(
              (row) =>
                row.map((cell) =>
                  cell.trim()
                )
            ),
          };
        }

        if (
          block.type === "steps"
        ) {
          return {
            ...block,
            title:
              block.title.trim(),
            items: block.items
              .map((item) => ({
                ...item,
                title:
                  item.title.trim(),
                text:
                  item.text.trim(),
              }))
              .filter(
                (item) =>
                  Boolean(
                    item.title ||
                      item.text
                  )
              ),
          };
        }

        if (
          block.type === "faq"
        ) {
          return {
            ...block,
            title:
              block.title.trim(),
            items: block.items
              .map((item) => ({
                ...item,
                question:
                  item.question.trim(),
                answer:
                  item.answer.trim(),
              }))
              .filter(
                (item) =>
                  Boolean(
                    item.question ||
                      item.answer
                  )
              ),
          };
        }

        if (
          block.type === "cta"
        ) {
          return {
            ...block,
            eyebrow:
              block.eyebrow.trim(),
            title:
              block.title.trim(),
            text: block.text.trim(),
            buttonLabel:
              block.buttonLabel.trim(),
            buttonHref:
              block.buttonHref.trim(),
          };
        }

        return block;
      })
      .filter((block) => {
        if (
          block.type ===
            "paragraph" ||
          block.type ===
            "heading2" ||
          block.type ===
            "heading3"
        ) {
          return Boolean(
            block.text
          );
        }

        if (
          block.type === "quote"
        ) {
          return Boolean(
            block.text
          );
        }

        if (
          block.type === "image"
        ) {
          return Boolean(
            block.url
          );
        }

        if (
          block.type === "list"
        ) {
          return (
            block.items.length > 0
          );
        }

        if (
          block.type === "callout"
        ) {
          return Boolean(
            block.title ||
              block.text
          );
        }

        if (
          block.type ===
          "gallery"
        ) {
          return (
            block.images.length >
            0
          );
        }

        if (
          block.type === "table"
        ) {
          return (
            block.headers.length >
            0
          );
        }

        if (
          block.type === "steps"
        ) {
          return (
            block.items.length >
            0
          );
        }

        if (
          block.type === "faq"
        ) {
          return (
            block.items.length >
            0
          );
        }

        if (
          block.type === "cta"
        ) {
          return Boolean(
            block.title ||
              block.text ||
              block.buttonLabel
          );
        }

        return true;
      })
  );
}

export function getBlogReadTime(
  blocks: BlogBlock[]
) {
  const text =
    getBlogPlainText(blocks);

  if (!text) {
    return 1;
  }

  const words = text
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(
    1,
    Math.ceil(words / 220)
  );
}

export function getBlogTextPreview(
  blocks: BlogBlock[],
  maxLength = 170
) {
  const text =
    getBlogPlainText(blocks)
      .replace(/\s+/g, " ")
      .trim();

  if (
    text.length <= maxLength
  ) {
    return text;
  }

  return `${text
    .slice(0, maxLength)
    .trimEnd()}…`;
}

export function getBlogPlainText(
  blocks: BlogBlock[]
) {
  return blocks
    .flatMap((block) => {
      if (
        block.type ===
          "paragraph" ||
        block.type ===
          "heading2" ||
        block.type ===
          "heading3" ||
        block.type === "quote"
      ) {
        return [block.text];
      }

      if (
        block.type === "list"
      ) {
        return block.items;
      }

      if (
        block.type === "image"
      ) {
        return [
          block.alt,
          block.caption,
        ];
      }

      if (
        block.type === "callout"
      ) {
        return [
          block.title,
          block.text,
        ];
      }

      if (
        block.type ===
        "gallery"
      ) {
        return block.images.flatMap(
          (image) => [
            image.alt,
            image.caption,
          ]
        );
      }

      if (
        block.type === "table"
      ) {
        return [
          block.caption,
          ...block.headers,
          ...block.rows.flat(),
        ];
      }

      if (
        block.type === "steps"
      ) {
        return [
          block.title,
          ...block.items.flatMap(
            (item) => [
              item.title,
              item.text,
            ]
          ),
        ];
      }

      if (
        block.type === "faq"
      ) {
        return [
          block.title,
          ...block.items.flatMap(
            (item) => [
              item.question,
              item.answer,
            ]
          ),
        ];
      }

      if (
        block.type === "cta"
      ) {
        return [
          block.eyebrow,
          block.title,
          block.text,
          block.buttonLabel,
        ];
      }

      return [];
    })
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function getBlogTableOfContents(
  blocks: BlogBlock[]
): BlogTableOfContentsItem[] {
  const used =
    new Map<string, number>();

  return blocks.flatMap(
    (
      block
    ): BlogTableOfContentsItem[] => {
      if (
        block.type !==
          "heading2" &&
        block.type !==
          "heading3"
      ) {
        return [];
      }

      const text =
        block.text.trim();

      if (!text) {
        return [];
      }

      const base =
        slugifyBlogValue(text) ||
        `sekcja-${block.id}`;

      const count =
        used.get(base) ?? 0;

      used.set(
        base,
        count + 1
      );

      return [
        {
          blockId: block.id,
          id:
            count === 0
              ? base
              : `${base}-${count + 1}`,
          text,
          level:
            block.type ===
            "heading2"
              ? 2
              : 3,
        },
      ];
    }
  );
}

export function getBlogFaqItems(
  blocks: BlogBlock[]
) {
  return blocks.flatMap(
    (block) =>
      block.type === "faq"
        ? block.items.filter(
            (item) =>
              item.question.trim() &&
              item.answer.trim()
          )
        : []
  );
}

export function getBlogPublicationState(
  status: string,
  publishedAt:
    | Date
    | string
    | null
    | undefined,
  now = new Date()
): BlogPublicationState {
  if (status !== "published") {
    return "draft";
  }

  if (!publishedAt) {
    return "published";
  }

  const date =
    publishedAt instanceof Date
      ? publishedAt
      : new Date(publishedAt);

  if (
    !Number.isNaN(
      date.getTime()
    ) &&
    date.getTime() >
      now.getTime()
  ) {
    return "scheduled";
  }

  return "published";
}

export function formatBlogDate(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "pl-PL",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

export function formatBlogShortDate(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "pl-PL",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
}

function cleanText(
  value: unknown
) {
  return typeof value ===
    "string"
    ? value
    : "";
}
