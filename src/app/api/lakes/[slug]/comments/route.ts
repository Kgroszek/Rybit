import { NextResponse } from "next/server";

import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

const MIN_COMMENT_LENGTH = 3;
const MAX_COMMENT_LENGTH = 1000;

function normalizeCommentContent(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\r\n/g, "\n").trim();
}

function readMetadataValue(
  metadata: Record<string, unknown> | undefined,
  key: string
) {
  const value = metadata?.[key];

  return typeof value === "string" ? value.trim() : "";
}

function getUserDisplayName(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const metadata = user.user_metadata;

  const metadataName =
    readMetadataValue(metadata, "display_name") ||
    readMetadataValue(metadata, "full_name") ||
    readMetadataValue(metadata, "name") ||
    readMetadataValue(metadata, "username");

  if (metadataName) {
    return metadataName.slice(0, 80);
  }

  const emailName = user.email?.split("@")[0]?.trim();

  return emailName ? emailName.slice(0, 80) : "Użytkownik Rybio";
}

export async function GET(_request: Request, { params }: RouteProps) {
  try {
    const { slug } = await params;

    const lake = await prisma.lake.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!lake) {
      return NextResponse.json(
        {
          message: "Nie znaleziono łowiska.",
        },
        {
          status: 404,
        }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const comments = await prisma.lakeComment.findMany({
      where: {
        lakeId: lake.id,
        status: "visible",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        userId: true,
        userName: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const reportsByViewer =
      user && comments.length > 0
        ? await prisma.lakeCommentReport.findMany({
            where: {
              userId: user.id,
              commentId: {
                in: comments.map((comment) => comment.id),
              },
            },
            select: {
              commentId: true,
            },
          })
        : [];

    const reportedCommentIds = new Set(
      reportsByViewer.map((report) => report.commentId)
    );

    return NextResponse.json({
      comments: comments.map((comment) => ({
        id: comment.id,
        userName: comment.userName,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        isOwn: user?.id === comment.userId,
        isReportedByViewer: reportedCommentIds.has(comment.id),
      })),
      viewer: {
        isAuthenticated: Boolean(user),
        userId: user?.id ?? null,
        isAdmin: isAdminUser(user),
      },
    });
  } catch (error) {
    console.error("[lake-comments/GET] Nie udało się pobrać komentarzy:", error);

    return NextResponse.json(
      {
        message: "Nie udało się pobrać komentarzy.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          message: "Musisz być zalogowany, aby dodać komentarz.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          message: "Nieprawidłowe dane komentarza.",
        },
        {
          status: 400,
        }
      );
    }

    const content = normalizeCommentContent(
      (body as { content?: unknown }).content
    );

    if (content.length < MIN_COMMENT_LENGTH) {
      return NextResponse.json(
        {
          message: `Komentarz musi mieć co najmniej ${MIN_COMMENT_LENGTH} znaki.`,
        },
        {
          status: 400,
        }
      );
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        {
          message: `Komentarz może mieć maksymalnie ${MAX_COMMENT_LENGTH} znaków.`,
        },
        {
          status: 400,
        }
      );
    }

    const { slug } = await params;

    const lake = await prisma.lake.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!lake) {
      return NextResponse.json(
        {
          message: "Nie znaleziono łowiska.",
        },
        {
          status: 404,
        }
      );
    }

    const userName = getUserDisplayName(user);

    const comment = await prisma.lakeComment.create({
      data: {
        lakeId: lake.id,
        userId: user.id,
        userName,
        content,
      },
      select: {
        id: true,
        userName: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Komentarz został dodany.",
        comment: {
          id: comment.id,
          userName: comment.userName,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
          isOwn: true,
          isReportedByViewer: false,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("[lake-comments/POST] Nie udało się dodać komentarza:", error);

    return NextResponse.json(
      {
        message: "Nie udało się dodać komentarza.",
      },
      {
        status: 500,
      }
    );
  }
}