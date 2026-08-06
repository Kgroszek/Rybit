import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    commentId: string;
  }>;
};

const ALLOWED_REASONS = [
  "spam",
  "offensive",
  "misinformation",
  "privacy",
  "other",
] as const;

type ReportReason = (typeof ALLOWED_REASONS)[number];

function isReportReason(value: string): value is ReportReason {
  return ALLOWED_REASONS.includes(value as ReportReason);
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
          message: "Musisz być zalogowany, aby zgłosić komentarz.",
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
          message: "Nieprawidłowe dane zgłoszenia.",
        },
        {
          status: 400,
        }
      );
    }

    const reason = String(
      (body as { reason?: unknown }).reason ?? ""
    )
      .trim()
      .toLowerCase();

    const description = String(
      (body as { description?: unknown }).description ?? ""
    ).trim();

    if (!isReportReason(reason)) {
      return NextResponse.json(
        {
          message: "Wybierz prawidłowy powód zgłoszenia.",
        },
        {
          status: 400,
        }
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        {
          message: "Dodatkowy opis może mieć maksymalnie 500 znaków.",
        },
        {
          status: 400,
        }
      );
    }

    if (reason === "other" && description.length < 10) {
      return NextResponse.json(
        {
          message:
            "Przy wyborze „Inny powód” wpisz co najmniej 10 znaków wyjaśnienia.",
        },
        {
          status: 400,
        }
      );
    }

    const { commentId } = await params;

    const comment = await prisma.lakeComment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });

    if (!comment || comment.status !== "visible") {
      return NextResponse.json(
        {
          message: "Komentarz nie istnieje albo nie jest już widoczny.",
        },
        {
          status: 404,
        }
      );
    }

    if (comment.userId === user.id) {
      return NextResponse.json(
        {
          message: "Nie możesz zgłosić własnego komentarza.",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.lakeCommentReport.create({
      data: {
        commentId: comment.id,
        userId: user.id,
        userEmail: user.email ?? null,
        reason,
        description: description || null,
      },
    });

    return NextResponse.json(
      {
        message:
          "Komentarz został zgłoszony. Administrator sprawdzi zgłoszenie.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message: "Ten komentarz został już przez Ciebie zgłoszony.",
        },
        {
          status: 409,
        }
      );
    }

    console.error(
      "[comment-report/POST] Nie udało się zgłosić komentarza:",
      error
    );

    return NextResponse.json(
      {
        message: "Nie udało się wysłać zgłoszenia.",
      },
      {
        status: 500,
      }
    );
  }
}