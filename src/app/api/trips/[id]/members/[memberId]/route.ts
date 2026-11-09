import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getTripApiAccess, getUserDisplayName } from "@/lib/trip-api-access";

const ALLOWED_ROLES = new Set(["editor", "viewer"]);

type RouteProps = { params: Promise<{ id: string; memberId: string }> };

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id, memberId } = await params;
  const access = await getTripApiAccess(id);

  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  if (!access.isOwner) {
    return NextResponse.json({ message: "Tylko właściciel może zmieniać role." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const role = String(body?.role ?? "").trim();

  if (!ALLOWED_ROLES.has(role)) {
    return NextResponse.json({ message: "Nieprawidłowa rola." }, { status: 400 });
  }

  const member = await prisma.tripMember.findFirst({ where: { id: memberId, tripId: id } });
  if (!member) {
    return NextResponse.json({ message: "Nie znaleziono uczestnika." }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const saved = await tx.tripMember.update({ where: { id: memberId }, data: { role } });
    await tx.tripActivity.create({
      data: {
        tripId: id,
        actorUserId: access.user.id,
        actorName: getUserDisplayName(access.user),
        action: "member_role_changed",
        metadata: { memberId, userName: member.userName, role },
      },
    });
    return saved;
  });

  return NextResponse.json({ message: "Rola została zmieniona.", member: updated });
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const { id, memberId } = await params;
  const access = await getTripApiAccess(id);

  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  if (!access.isOwner) {
    return NextResponse.json({ message: "Tylko właściciel może usuwać uczestników." }, { status: 403 });
  }

  const member = await prisma.tripMember.findFirst({ where: { id: memberId, tripId: id } });
  if (!member) {
    return NextResponse.json({ message: "Nie znaleziono uczestnika." }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.tripMember.delete({ where: { id: memberId } });
    await tx.userNotification.create({
      data: {
        userId: member.userId,
        title: "Usunięto Cię z wyprawy",
        message: `Nie masz już dostępu do wyprawy „${access.trip.title}”.`,
        href: "/wyprawy",
        type: "trip_member_removed",
      },
    });
    await tx.tripActivity.create({
      data: {
        tripId: id,
        actorUserId: access.user.id,
        actorName: getUserDisplayName(access.user),
        action: "member_removed",
        metadata: { memberId, userId: member.userId, userName: member.userName },
      },
    });
  });

  return NextResponse.json({ message: "Uczestnik został usunięty." });
}
