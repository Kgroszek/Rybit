import type { Prisma } from "@prisma/client";

export const FISHING_GEAR_SELECT = {
  id: true,
  name: true,
  quantity: true,
  category: true,
  brand: true,
  model: true,
  fishingMethod: true,
  condition: true,
  status: true,
  price: true,
  purchaseDate: true,
  note: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FishingGearSelect;
