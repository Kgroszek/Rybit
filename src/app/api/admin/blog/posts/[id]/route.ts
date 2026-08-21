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

type BlogPostRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  {
    params,
  }: BlogPostRouteProps
) {
  const { id } =
    await params;

  const auth =
    await getBlogAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const existing =
    await prisma.blogPost.findUnique(
      {
        where: {
          id,
        },
        select: {
          id: true,
          publishedAt: true,
          authorName: true,
        },
      }
    );

  if (!existing) {
    return NextResponse.json(
      {
        message:
          "Nie znaleziono artykułu.",
      },
      {
        status: 404,
      }
    );
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
          const updated =
            await tx.blogPost.update(
              {
                where: {
                  id,
                },
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
                  authorName:
                    data.authorName ||
                    existing.authorName ||
                    getBlogAuthorName(
                      auth.user
                    ),
                  publishedAt:
                    data.status ===
                    "published"
                      ? data.publishedAt ??
                        existing.publishedAt ??
                        new Date()
                      : data.publishedAt,
                },
              }
            );

          if (
            updated.isFeatured
          ) {
            await tx.blogPost.updateMany(
              {
                where: {
                  id: {
                    not:
                      updated.id,
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

          return updated;
        }
      );

    return NextResponse.json({
      id: post.id,
      slug: post.slug,
      status:
        post.status,
      publishedAt:
        post.publishedAt?.toISOString() ??
        null,
      authorName:
        post.authorName,
    });
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
      "[admin/blog/posts/:id] PUT",
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

export async function DELETE(
  _request: Request,
  {
    params,
  }: BlogPostRouteProps
) {
  const { id } =
    await params;

  const auth =
    await getBlogAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  try {
    await prisma.blogPost.delete(
      {
        where: {
          id,
        },
      }
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        {
          message:
            "Nie znaleziono artykułu.",
        },
        {
          status: 404,
        }
      );
    }

    console.error(
      "[admin/blog/posts/:id] DELETE",
      error
    );

    return NextResponse.json(
      {
        message:
          "Nie udało się usunąć artykułu.",
      },
      {
        status: 500,
      }
    );
  }
}
