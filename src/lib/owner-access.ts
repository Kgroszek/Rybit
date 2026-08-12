import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type OwnerPermission =
  | "canEditLake"
  | "canManageReservations"
  | "canManageSpots";

export async function getOwnerLakeAccess(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      ownerLake: null,
    };
  }

  const ownerLake = await prisma.lakeOwner.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      lake: {
        slug,
      },
    },
    include: {
      lake: {
        select: {
          id: true,
          slug: true,
          name: true,
          city: true,
          voivodeship: true,
          ownerType: true,
          fishingType: true,
          rating: true,
        },
      },
    },
  });

  return {
    user,
    ownerLake,
  };
}

export async function getOwnerLakeWithPermission(
  slug: string,
  permission: OwnerPermission
) {
  const access = await getOwnerLakeAccess(slug);

  if (!access.user || !access.ownerLake) {
    return access;
  }

  if (!access.ownerLake[permission]) {
    return {
      user: access.user,
      ownerLake: null,
    };
  }

  return access;
}

export const ACTIVE_RESERVATION_STATUSES = [
  "pending",
  "confirmed",
  // Compatibility with older data created by the previous reservation UI.
  "paid",
] as const;

export const RESERVATION_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "no_show",
  "cancelled",
] as const;

export function isBlockingReservationStatus(status: string) {
  return ACTIVE_RESERVATION_STATUSES.includes(
    status as (typeof ACTIVE_RESERVATION_STATUSES)[number]
  );
}
