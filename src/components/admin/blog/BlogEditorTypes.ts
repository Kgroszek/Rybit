import type {
  BlogBlock,
  BlogCategoryValue,
} from "@/lib/blog";

export type BlogEditorInitialPost =
  | {
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
      authorName: string | null;
      publishedAt: string | null;
    }
  | null;

export type BlogEditorSnapshot = {
  title: string;
  slug: string;
  excerpt: string;
  category: BlogCategoryValue;
  tags: string[];
  coverImageUrl: string;
  blocks: BlogBlock[];
  status: "draft" | "published";
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  authorName: string;
  publishedAt: string | null;
};

export type BlogEditorMessage = {
  tone:
    | "success"
    | "error"
    | "info";
  text: string;
};

export type BlogEditorSaveAction =
  | "draft"
  | "publish"
  | "published"
  | "unpublish";

export type BlogInspectorTab =
  | "document"
  | "block"
  | "seo";

export type BlogPreviewDevice =
  | "desktop"
  | "mobile";

export type BlogPublicationMode =
  | "now"
  | "scheduled";
