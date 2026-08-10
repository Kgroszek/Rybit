import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getTripApiAccess, getUserDisplayName } from "@/lib/trip-api-access";

type RouteProps = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const access = await getTripApiAccess(id);

  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  if (!access.canEdit) {
    return NextResponse.json(
      { message: "Nie masz uprawnień do zmiany statusu wyprawy." },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const action = String(body?.action ?? "").trim();

  if (!new Set(["finish", "cancel", "restore"]).has(action)) {
    return NextResponse.json({ message: "Nieprawidłowa akcja." }, { status: 400 });
  }

  const status = action === "finish" ? "finished" : action === "cancel" ? "cancelled" : "planned";
  const completedAt = action === "finish" ? new Date() : null;

  await prisma.$transaction(async (tx) => {
    await tx.fishingTrip.update({
      where: { id },
      data: { status, completedAt },
    });

    await tx.tripActivity.create({
      data: {
        tripId: id,
        actorUserId: access.user.id,
        actorName: getUserDisplayName(access.user),
        action:
          action === "finish"
            ? "trip_finished"
            : action === "cancel"
              ? "trip_cancelled"
              : "trip_restored",
      },
    });
  });

  return NextResponse.json({ message: "Status wyprawy został zaktualizowany." });
}
