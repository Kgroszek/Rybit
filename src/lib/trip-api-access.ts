import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const EDITOR_ROLES = new Set(["editor", "co_owner"]);

export function getUserDisplayName(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const metadata = user.user_metadata ?? {};
  const possibleNames = [
    metadata.display_name,
    metadata.full_name,
    metadata.name,
    metadata.username,
    metadata.user_name,
  ];

  const metadataName = possibleNames.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0
  );

  if (metadataName) {
    return metadataName.trim().slice(0, 80);
  }

  const emailName = user.email?.split("@")[0]?.trim();
  return emailName ? emailName.slice(0, 80) : "Użytkownik Rybio";
}

export async function getTripApiAccess(tripId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false as const,
      status: 401,
      message: "Musisz być zalogowany.",
      supabase,
      user: null,
      trip: null,
      isOwner: false,
      canEdit: false,
      role: null,
    };
  }

  const trip = await prisma.fishingTrip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      userId: true,
      title: true,
      lakeId: true,
      lakeName: true,
      tripType: true,
      status: true,
      startsAt: true,
      endsAt: true,
      peopleCount: true,
      checklistId: true,
      members: {
        where: {
          userId: user.id,
          status: "accepted",
        },
        take: 1,
        select: {
          id: true,
          role: true,
          status: true,
        },
      },
    },
  });

  if (!trip) {
    return {
      ok: false as const,
      status: 404,
      message: "Nie znaleziono wyprawy.",
      supabase,
      user,
      trip: null,
      isOwner: false,
      canEdit: false,
      role: null,
    };
  }

  const isOwner = trip.userId === user.id;
  const member = trip.members[0] ?? null;
  const hasAccess = isOwner || Boolean(member);

  if (!hasAccess) {
    return {
      ok: false as const,
      status: 403,
      message: "Nie masz dostępu do tej wyprawy.",
      supabase,
      user,
      trip: null,
      isOwner: false,
      canEdit: false,
      role: null,
    };
  }

  const role = isOwner ? "owner" : member?.role ?? "viewer";
  const canEdit = isOwner || EDITOR_ROLES.has(role);

  return {
    ok: true as const,
    status: 200,
    message: null,
    supabase,
    user,
    trip,
    isOwner,
    canEdit,
    role,
  };
}
