import { NextResponse } from "next/server";

import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    commentId: string;
  }>;
};

export async function DELETE(_request: Request, { params }: RouteProps) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          message: "Musisz być zalogowany.",
        },
        {
          status: 401,
        }
      );
    }

    if (!isAdminUser(user)) {
      return NextResponse.json(
        {
          message: "Brak uprawnień administratora.",
        },
        {
          status: 403,
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
        content: true,
        lake: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        {
          message: "Nie znaleziono komentarza.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.lakeComment.delete({
        where: {
          id: comment.id,
        },
      });

      if (comment.userId !== user.id) {
        await transaction.userNotification.create({
          data: {
            userId: comment.userId,
            title: "Twój komentarz został usunięty",
            message: `Komentarz przy łowisku „${comment.lake.name}” został usunięty przez administrację.`,
            href: `/lowiska/${comment.lake.slug}`,
            type: "comment_removed",
          },
        });
      }
    });

    return NextResponse.json({
      message: "Komentarz został usunięty.",
    });
  } catch (error) {
    console.error(
      "[admin/comments/DELETE] Nie udało się usunąć komentarza:",
      error
    );

    return NextResponse.json(
      {
        message: "Nie udało się usunąć komentarza.",
      },
      {
        status: 500,
      }
    );
  }
}