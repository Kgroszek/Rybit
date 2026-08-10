import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getUserDisplayName } from "@/lib/trip-api-access";

type RouteProps = { params: Promise<{ memberId: string }> };

export async function PATCH(request: Request, { params }: RouteProps) {
  const { memberId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Musisz być zalogowany." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const action = String(body?.action ?? "").trim();

  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ message: "Nieprawidłowa akcja." }, { status: 400 });
  }

  const member = await prisma.tripMember.findFirst({
    where: { id: memberId, userId: user.id, status: "pending" },
    include: { trip: { select: { id: true, title: true, userId: true } } },
  });

  if (!member) {
    return NextResponse.json({ message: "Zaproszenie nie istnieje lub zostało już obsłużone." }, { status: 404 });
  }

  const now = new Date();
  const actorName = getUserDisplayName(user);

  await prisma.$transaction(async (tx) => {
    await tx.tripMember.update({
      where: { id: member.id },
      data:
        action === "accept"
          ? { status: "accepted", acceptedAt: now, declinedAt: null }
          : { status: "declined", declinedAt: now, acceptedAt: null },
    });

    if (action === "accept") {
      await tx.userNotification.create({
        data: {
          userId: member.trip.userId,
          title: "Uczestnik dołączył do wyprawy",
          message: `${actorName} zaakceptował(a) zaproszenie do wyprawy „${member.trip.title}”.`,
          href: `/wyprawy/${member.trip.id}?tab=uczestnicy`,
          type: "trip_invitation_accepted",
        },
      });
    }

    await tx.tripActivity.create({
      data: {
        tripId: member.trip.id,
        actorUserId: user.id,
        actorName,
        action: action === "accept" ? "member_joined" : "member_declined",
        metadata: { memberId: member.id },
      },
    });
  });

  return NextResponse.json({
    message: action === "accept" ? "Dołączyłeś do wyprawy." : "Zaproszenie zostało odrzucone.",
  });
}
