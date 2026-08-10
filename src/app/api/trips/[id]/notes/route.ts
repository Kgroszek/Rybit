import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getTripApiAccess,
  getUserDisplayName,
} from "@/lib/trip-api-access";

type RouteProps = { params: Promise<{ id: string }> };

const ALLOWED_TYPES = new Set(["general", "plan", "water", "bait", "result"]);

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const access = await getTripApiAccess(id);

    if (!access.ok) {
      return NextResponse.json({ message: access.message }, { status: access.status });
    }

    if (!access.canEdit) {
      return NextResponse.json(
        { message: "Nie masz uprawnień do dodawania notatek." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const content = String(body?.content ?? "").trim();
    const type = String(body?.type ?? "general").trim();
    const isPinned = Boolean(body?.isPinned);

    if (content.length < 2 || content.length > 3000) {
      return NextResponse.json(
        { message: "Notatka musi mieć od 2 do 3000 znaków." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json(
        { message: "Wybrano nieprawidłowy typ notatki." },
        { status: 400 }
      );
    }

    const actorName = getUserDisplayName(access.user);

    const note = await prisma.$transaction(async (tx) => {
      const created = await tx.tripNote.create({
        data: {
          tripId: id,
          authorUserId: access.user.id,
          authorName: actorName,
          type,
          content,
          isPinned,
        },
      });

      await tx.tripActivity.create({
        data: {
          tripId: id,
          actorUserId: access.user.id,
          actorName,
          action: "note_added",
          metadata: { noteId: created.id, type },
        },
      });

      return created;
    });

    return NextResponse.json({ message: "Notatka została dodana.", note }, { status: 201 });
  } catch (error) {
    console.error("[trip notes POST]", error);
    return NextResponse.json({ message: "Nie udało się dodać notatki." }, { status: 500 });
  }
}


export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const access = await getTripApiAccess(id);

    if (!access.ok) {
      return NextResponse.json({ message: access.message }, { status: access.status });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const noteId = String(body?.noteId ?? "").trim();

    const note = await prisma.tripNote.findFirst({
      where: { id: noteId, tripId: id },
      select: { id: true, authorUserId: true, content: true, type: true, isPinned: true },
    });

    if (!note) {
      return NextResponse.json({ message: "Nie znaleziono notatki." }, { status: 404 });
    }

    if (!access.isOwner && note.authorUserId !== access.user.id) {
      return NextResponse.json(
        { message: "Możesz edytować tylko własną notatkę." },
        { status: 403 }
      );
    }

    const data: { content?: string; type?: string; isPinned?: boolean } = {};

    if (typeof body?.content === "string") {
      const content = body.content.trim();
      if (content.length < 1 || content.length > 3000) {
        return NextResponse.json(
          { message: "Treść notatki musi mieć od 1 do 3000 znaków." },
          { status: 400 }
        );
      }
      data.content = content;
    }

    if (typeof body?.type === "string") {
      const type = body.type.trim();
      if (!ALLOWED_TYPES.has(type)) {
        return NextResponse.json({ message: "Nieprawidłowy typ notatki." }, { status: 400 });
      }
      data.type = type;
    }

    if (typeof body?.isPinned === "boolean") {
      data.isPinned = body.isPinned;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const saved = await tx.tripNote.update({ where: { id: note.id }, data });
      await tx.tripActivity.create({
        data: {
          tripId: id,
          actorUserId: access.user.id,
          actorName: getUserDisplayName(access.user),
          action: "note_updated",
          metadata: { noteId: note.id },
        },
      });
      return saved;
    });

    return NextResponse.json({ message: "Notatka została zaktualizowana.", note: updated });
  } catch (error) {
    console.error("[trip notes PATCH]", error);
    return NextResponse.json({ message: "Nie udało się zaktualizować notatki." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const access = await getTripApiAccess(id);

    if (!access.ok) {
      return NextResponse.json({ message: access.message }, { status: access.status });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const noteId = String(body?.noteId ?? "").trim();

    const note = await prisma.tripNote.findFirst({
      where: { id: noteId, tripId: id },
      select: { id: true, authorUserId: true, content: true },
    });

    if (!note) {
      return NextResponse.json({ message: "Nie znaleziono notatki." }, { status: 404 });
    }

    if (!access.isOwner && note.authorUserId !== access.user.id) {
      return NextResponse.json(
        { message: "Możesz usunąć tylko własną notatkę." },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.tripNote.delete({ where: { id: note.id } });
      await tx.tripActivity.create({
        data: {
          tripId: id,
          actorUserId: access.user.id,
          actorName: getUserDisplayName(access.user),
          action: "note_deleted",
          metadata: {
            noteId: note.id,
            preview: note.content.slice(0, 80),
          },
        },
      });
    });

    return NextResponse.json({ message: "Notatka została usunięta." });
  } catch (error) {
    console.error("[trip notes DELETE]", error);
    return NextResponse.json({ message: "Nie udało się usunąć notatki." }, { status: 500 });
  }
}
