import type { Prisma } from "@prisma/client";

export const ACCOMMODATION_SEARCH_TERMS = [
  "nocleg",
  "noclegi",
  "domek",
  "domki",
  "apartament",
  "pokoje",
] as const;

/**
 * Wspólny warunek dla strony /lowiska-z-noclegiem.
 *
 * Łowisko trafia do kategorii, gdy:
 * - ma jawnie zaznaczone domki,
 * - albo w opisie / polu fish / nazwach gatunków pojawia się
 *   informacja sugerująca nocleg.
 */
export function buildAccommodationWhere(): Prisma.LakeWhereInput {
  const textConditions: Prisma.LakeWhereInput[] =
    ACCOMMODATION_SEARCH_TERMS.flatMap((term) => [
      {
        description: {
          contains: term,
          mode: "insensitive",
        },
      },
      {
        fish: {
          contains: term,
          mode: "insensitive",
        },
      },
      {
        fishSpecies: {
          some: {
            name: {
              contains: term,
              mode: "insensitive",
            },
          },
        },
      },
    ]);

  return {
    OR: [
      {
        cottages: true,
      },
      ...textConditions,
    ],
  };
}
