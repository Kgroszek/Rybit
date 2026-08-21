import {
  Prisma,
} from "@prisma/client";
import { NextResponse } from "next/server";

import {
  getBlogAdmin,
  getBlogAuthorName,
} from "@/lib/blog-admin-auth";
import {
  parseBlogPostInput,
} from "@/lib/blog-post-input";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  const auth =
    await getBlogAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        message:
          "Nieprawidłowy format danych.",
      },
      {
        status: 400,
      }
    );
  }

  const parsed =
    parseBlogPostInput(body);

  if (!parsed.ok) {
    return NextResponse.json(
      {
        message:
          parsed.message,
      },
      {
        status: 400,
      }
    );
  }

  const data = parsed.data;

  try {
    const post =
      await prisma.$transaction(
        async (tx) => {
          const created =
            await tx.blogPost.create(
              {
                data: {
                  title:
                    data.title,
                  slug:
                    data.slug,
                  excerpt:
                    data.excerpt,
                  category:
                    data.category,
                  tags:
                    data.tags,
                  coverImageUrl:
                    data.coverImageUrl,
                  content:
                    data.content as Prisma.InputJsonValue,
                  status:
                    data.status,
                  isFeatured:
                    data.isFeatured,
                  seoTitle:
                    data.seoTitle,
                  seoDescription:
                    data.seoDescription,
                  authorId:
                    auth.user.id,
                  authorName:
                    data.authorName ||
                    getBlogAuthorName(
                      auth.user
                    ),
                  publishedAt:
                    data.status ===
                    "published"
                      ? data.publishedAt ??
                        new Date()
                      : data.publishedAt,
                },
              }
            );

          if (
            created.isFeatured
          ) {
            await tx.blogPost.updateMany(
              {
                where: {
                  id: {
                    not:
                      created.id,
                  },
                  isFeatured:
                    true,
                },
                data: {
                  isFeatured:
                    false,
                },
              }
            );
          }

          return created;
        }
      );

    return NextResponse.json(
      {
        id: post.id,
        slug: post.slug,
        status:
          post.status,
        publishedAt:
          post.publishedAt?.toISOString() ??
          null,
        authorName:
          post.authorName,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message:
            "Artykuł z takim slugiem już istnieje.",
        },
        {
          status: 409,
        }
      );
    }

    console.error(
      "[admin/blog/posts] POST",
      error
    );

    return NextResponse.json(
      {
        message:
          "Nie udało się zapisać artykułu.",
      },
      {
        status: 500,
      }
    );
  }
}
