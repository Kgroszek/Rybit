import type { Prisma } from "@prisma/client";

export const tripDetailsInclude = {
  lake: {
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      voivodeship: true,
      street: true,
      postalCode: true,
      rating: true,
      fish: true,
      lat: true,
      lng: true,
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true },
      },
      gearRequirements: {
        orderBy: { createdAt: "asc" },
        select: { text: true },
      },
    },
  },
  checklist: {
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  },
  members: {
    orderBy: { createdAt: "asc" },
  },
  notes: {
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" },
    ],
  },
  costs: {
    orderBy: { createdAt: "asc" },
  },
  gearItems: {
    orderBy: [
      { isRequired: "desc" },
      { createdAt: "asc" },
    ],
    include: {
      gear: {
        select: {
          id: true,
          name: true,
          brand: true,
          model: true,
          category: true,
        },
      },
    },
  },
  reminders: {
    orderBy: { remindAt: "asc" },
  },
  media: {
    orderBy: { createdAt: "desc" },
  },
  catches: {
    orderBy: { caughtAt: "desc" },
  },
} satisfies Prisma.FishingTripInclude;

export type TripDetailsData =
  Prisma.FishingTripGetPayload<{
    include: typeof tripDetailsInclude;
  }>;

export type TripChecklistItem =
  NonNullable<TripDetailsData["checklist"]>["items"][number];

export type TripGearItem =
  TripDetailsData["gearItems"][number];

export type TripNote =
  TripDetailsData["notes"][number];

export type TripCost =
  TripDetailsData["costs"][number];

export type TripMedia =
  TripDetailsData["media"][number];

export type TripCatch =
  TripDetailsData["catches"][number];
