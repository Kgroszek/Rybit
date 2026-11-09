import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getTripApiAccess,
  getUserDisplayName,
} from "@/lib/trip-api-access";

type RouteProps = { params: Promise<{ id: string }> };

const ALLOWED_CATEGORIES = new Set([
  "fuel",
  "fishing",
  "food",
  "accommodation",
  "bait",
  "equipment",
  "other",
]);

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const access = await getTripApiAccess(id);

    if (!access.ok) {
      return NextResponse.json({ message: access.message }, { status: access.status });
    }

    if (!access.canEdit) {
      return NextResponse.json(
        { message: "Nie masz uprawnień do dodawania kosztów." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const label = String(body?.label ?? "").trim();
    const category = String(body?.category ?? "other").trim();
    const amount = Number(body?.amount ?? 0);
    const note = String(body?.note ?? "").trim();
    const paidByUserId = String(body?.paidByUserId ?? access.user.id).trim() || access.user.id;

    if (label.length < 2 || label.length > 120) {
      return NextResponse.json(
        { message: "Nazwa kosztu musi mieć od 2 do 120 znaków." },
        { status: 400 }
      );
    }

    if (!ALLOWED_CATEGORIES.has(category)) {
      return NextResponse.json(
        { message: "Wybrano nieprawidłową kategorię kosztu." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) {
      return NextResponse.json(
        { message: "Kwota musi być większa od 0." },
        { status: 400 }
      );
    }

    if (note.length > 500) {
      return NextResponse.json(
        { message: "Notatka do kosztu może mieć maksymalnie 500 znaków." },
        { status: 400 }
      );
    }

    const actorName = getUserDisplayName(access.user);

    const isOwnerPayer = paidByUserId === access.trip.userId;
    const acceptedMemberPayer = isOwnerPayer
      ? null
      : await prisma.tripMember.findFirst({
          where: { tripId: id, userId: paidByUserId, status: "accepted" },
          select: { userId: true, userName: true },
        });

    if (!isOwnerPayer && !acceptedMemberPayer) {
      return NextResponse.json(
        { message: "Koszt może być przypisany tylko właścicielowi lub zaakceptowanemu uczestnikowi." },
        { status: 400 }
      );
    }

    let paidByName = acceptedMemberPayer?.userName ?? actorName;

    if (isOwnerPayer && paidByUserId !== access.user.id) {
      const admin = createAdminClient();
      const { data } = await admin.auth.admin.getUserById(paidByUserId);
      if (data.user) paidByName = getUserDisplayName(data.user);
    }

    const cost = await prisma.$transaction(async (tx) => {
      const created = await tx.tripCost.create({
        data: {
          tripId: id,
          category,
          label,
          amount,
          currency: "PLN",
          paidByUserId,
          paidByName,
          note: note || null,
        },
      });

      await tx.tripActivity.create({
        data: {
          tripId: id,
          actorUserId: access.user.id,
          actorName,
          action: "cost_added",
          metadata: { costId: created.id, label, amount, category, paidByUserId, paidByName },
        },
      });

      return created;
    });

    return NextResponse.json({ message: "Koszt został dodany.", cost }, { status: 201 });
  } catch (error) {
    console.error("[trip costs POST]", error);
    return NextResponse.json({ message: "Nie udało się dodać kosztu." }, { status: 500 });
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
    const costId = String(body?.costId ?? "").trim();

    const cost = await prisma.tripCost.findFirst({
      where: { id: costId, tripId: id },
      select: { id: true, paidByUserId: true, label: true, amount: true },
    });

    if (!cost) {
      return NextResponse.json({ message: "Nie znaleziono kosztu." }, { status: 404 });
    }

    if (!access.isOwner && cost.paidByUserId !== access.user.id) {
      return NextResponse.json(
        { message: "Możesz usunąć tylko koszt dodany przez siebie." },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.tripCost.delete({ where: { id: cost.id } });
      await tx.tripActivity.create({
        data: {
          tripId: id,
          actorUserId: access.user.id,
          actorName: getUserDisplayName(access.user),
          action: "cost_deleted",
          metadata: {
            costId: cost.id,
            label: cost.label,
            amount: cost.amount,
          },
        },
      });
    });

    return NextResponse.json({ message: "Koszt został usunięty." });
  } catch (error) {
    console.error("[trip costs DELETE]", error);
    return NextResponse.json({ message: "Nie udało się usunąć kosztu." }, { status: 500 });
  }
}
