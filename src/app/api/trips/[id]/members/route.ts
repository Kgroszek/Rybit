import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTripApiAccess, getUserDisplayName } from "@/lib/trip-api-access";

const ALLOWED_ROLES = new Set(["editor", "viewer"]);

type RouteProps = { params: Promise<{ id: string }> };

function getTargetName(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const metadata = user.user_metadata ?? {};
  const values = [
    metadata.display_name,
    metadata.full_name,
    metadata.name,
    metadata.username,
    metadata.user_name,
  ];
  const name = values.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  );
  return name?.trim() || user.email?.split("@")[0] || "Użytkownik Rybio";
}

export async function POST(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const access = await getTripApiAccess(id);

  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  if (!access.isOwner) {
    return NextResponse.json(
      { message: "Tylko właściciel wyprawy może zapraszać uczestników." },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const userId = String(body?.userId ?? "").trim();
  const role = String(body?.role ?? "editor").trim();

  if (!userId || userId === access.user.id) {
    return NextResponse.json({ message: "Nieprawidłowy użytkownik." }, { status: 400 });
  }

  if (!ALLOWED_ROLES.has(role)) {
    return NextResponse.json({ message: "Nieprawidłowa rola." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);

  if (error || !data.user) {
    return NextResponse.json({ message: "Nie znaleziono użytkownika." }, { status: 404 });
  }

  const target = data.user;
  const targetName = getTargetName(target);
  const actorName = getUserDisplayName(access.user);

  const existing = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId: id, userId } },
  });

  if (existing?.status === "accepted") {
    return NextResponse.json(
      { message: "Ten użytkownik już uczestniczy w wyprawie." },
      { status: 409 }
    );
  }

  const member = await prisma.$transaction(async (tx) => {
    const saved = await tx.tripMember.upsert({
      where: { tripId_userId: { tripId: id, userId } },
      create: {
        tripId: id,
        userId,
        userName: targetName,
        userEmail: target.email ?? null,
        role,
        status: "pending",
        invitedByUserId: access.user.id,
      },
      update: {
        userName: targetName,
        userEmail: target.email ?? null,
        role,
        status: "pending",
        invitedByUserId: access.user.id,
        acceptedAt: null,
        declinedAt: null,
      },
    });

    await tx.userNotification.create({
      data: {
        userId,
        title: "Zaproszenie do wspólnej wyprawy",
        message: `${actorName} zaprasza Cię do wyprawy „${access.trip.title}”.`,
        href: "/wyprawy",
        type: "trip_invitation",
      },
    });

    await tx.tripActivity.create({
      data: {
        tripId: id,
        actorUserId: access.user.id,
        actorName,
        action: "member_invited",
        metadata: { memberId: saved.id, userId, userName: targetName, role },
      },
    });

    return saved;
  });

  return NextResponse.json({ message: "Zaproszenie zostało wysłane.", member }, { status: 201 });
}
