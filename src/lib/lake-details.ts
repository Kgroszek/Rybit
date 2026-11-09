import { prisma } from "@/lib/prisma";

export type NearbyLakeDto = {
  id: string;
  name: string;
  slug: string;
  rating: string;
  type: "pzw" | "commercial";
  fishingType: "general" | "spinning" | "carp";
  address: {
    city: string;
    voivodeship: string;
  };
  fishSpecies: string[];
  images: string[];
  nearbyDistanceInKm: number;
};

function calculateDistanceInKm(
  firstLat: number,
  firstLng: number,
  secondLat: number,
  secondLng: number
) {
  const earthRadiusKm = 6371;
  const latDifference = ((secondLat - firstLat) * Math.PI) / 180;
  const lngDifference = ((secondLng - firstLng) * Math.PI) / 180;
  const firstLatRadians = (firstLat * Math.PI) / 180;
  const secondLatRadians = (secondLat * Math.PI) / 180;

  const a =
    Math.sin(latDifference / 2) ** 2 +
    Math.cos(firstLatRadians) *
      Math.cos(secondLatRadians) *
      Math.sin(lngDifference / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

/**
 * Lekki query do sekcji „Łowiska w pobliżu” na profilu łowiska.
 * Nie pobiera pełnego LakeDto ani galerii/cenników/regulaminów innych łowisk.
 */
export async function getNearbyLakesForDetails(
  slug: string,
  limit = 3
): Promise<NearbyLakeDto[]> {
  const currentLake = await prisma.lake.findUnique({
    where: { slug },
    select: {
      id: true,
      lat: true,
      lng: true,
      city: true,
      voivodeship: true,
    },
  });

  if (!currentLake) return [];

  const candidates = await prisma.lake.findMany({
    where: {
      id: { not: currentLake.id },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      rating: true,
      ownerType: true,
      fishingType: true,
      lat: true,
      lng: true,
      city: true,
      voivodeship: true,
      fishSpecies: {
        select: { name: true },
      },
      images: {
        select: { url: true },
        take: 1,
        orderBy: [
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
      },
    },
  });

  return candidates
    .map((lake) => {
      const distance = calculateDistanceInKm(
        currentLake.lat,
        currentLake.lng,
        lake.lat,
        lake.lng
      );
      const sameCity =
        lake.city.trim().toLocaleLowerCase("pl") ===
        currentLake.city.trim().toLocaleLowerCase("pl");
      const sameVoivodeship =
        lake.voivodeship.trim().toLocaleLowerCase("pl") ===
        currentLake.voivodeship.trim().toLocaleLowerCase("pl");

      return {
        lake,
        distance,
        score:
          (sameCity ? 1000 : 0) +
          (sameVoivodeship ? 500 : 0) -
          distance +
          Number(lake.rating || 0),
      };
    })
    .sort((first, second) => second.score - first.score)
    .slice(0, Math.max(0, limit))
    .map(({ lake, distance }) => ({
      id: lake.id,
      name: lake.name,
      slug: lake.slug,
      rating: Number(lake.rating).toFixed(1),
      type: lake.ownerType as "pzw" | "commercial",
      fishingType: lake.fishingType as "general" | "spinning" | "carp",
      address: {
        city: lake.city,
        voivodeship: lake.voivodeship,
      },
      fishSpecies: lake.fishSpecies.map((fish) => fish.name),
      images: lake.images.map((image) => image.url),
      nearbyDistanceInKm: distance,
    }));
}
