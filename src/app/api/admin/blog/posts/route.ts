import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  isBlogCategory,
  normalizeBlogTag,
  parseBlogBlocks,
  slugifyBlogValue,
} from "@/lib/blog";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const auth = await getAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const title =
      typeof body.title === "string" ? body.title.trim() : "";
    const slug =
      typeof body.slug === "string"
        ? slugifyBlogValue(body.slug)
        : "";
    const category =
      typeof body.category === "string" ? body.category : "";
    const status = body.status === "published" ? "published" : "draft";
    const content = parseBlogBlocks(body.content);

    if (!title || !slug) {
      return NextResponse.json(
        { message: "Tytuł i slug są wymagane." },
        { status: 400 }
      );
    }

    if (!isBlogCategory(category)) {
      return NextResponse.json(
        { message: "Wybierz poprawną kategorię." },
        { status: 400 }
      );
    }

    if (content.length === 0) {
      return NextResponse.json(
        { message: "Artykuł musi zawierać treść." },
        { status: 400 }
      );
    }

    const tags = normalizeTags(body.tags);

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: cleanOptionalText(body.excerpt),
        category,
        tags,
        coverImageUrl: cleanOptionalText(body.coverImageUrl),
        content: content as Prisma.InputJsonValue,
        status,
        isFeatured: Boolean(body.isFeatured),
        seoTitle: cleanOptionalText(body.seoTitle),
        seoDescription: cleanOptionalText(body.seoDescription),
        publishedAt: status === "published" ? new Date() : null,
        authorId: auth.user.id,
        authorName:
          getUserDisplayName(auth.user) ||
          auth.user.email ||
          "Rybio",
      },
    });

    if (post.isFeatured) {
      await prisma.blogPost.updateMany({
        where: {
          id: {
            not: post.id,
          },
          isFeatured: true,
        },
        data: {
          isFeatured: false,
        },
      });
    }

    return NextResponse.json({
      id: post.id,
      slug: post.slug,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Artykuł z takim slugiem już istnieje." },
        { status: 409 }
      );
    }

    console.error("[admin/blog/posts] POST", error);

    return NextResponse.json(
      { message: "Nie udało się zapisać artykułu." },
      { status: 500 }
    );
  }
}

async function getAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Brak uprawnień." },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true as const,
    user,
  };
}

function cleanOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const clean = value.trim();
  return clean || null;
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map(normalizeBlogTag)
        .filter(Boolean)
    )
  ).slice(0, 12);
}

function getUserDisplayName(user: {
  user_metadata?: Record<string, unknown>;
}) {
  const metadata = user.user_metadata ?? {};

  for (const key of ["full_name", "name", "display_name"]) {
    const value = metadata[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}
