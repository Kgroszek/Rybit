import { prisma } from "@/lib/prisma";

export type LakeDto = {
  id: string;
  name: string;
  slug: string;
  rating: string;
  distance: string;
  fish: string;
  fishSpecies: string[];
  type: "pzw" | "commercial";
  fishingType: "general" | "spinning" | "carp";
  lat: number;
  lng: number;
  address: {
    street: string;
    city: string;
    postalCode: string;
    voivodeship: string;
  };
  description: string;
  amenities: {
    cottages: boolean;
    campfire: boolean;
    noKill: boolean;
    tent: boolean;
    parking: boolean;
    pier: boolean;
    toilet: boolean;
    shop: boolean;
    nightFishing: boolean;
    boatRental: boolean;
  };
  details: {
    area: string;
    averageDepth: string;
    bottomType: string;
    waterType: string;
  };
  priceList: string[];
  rules: string[];
  contact: {
    name: string;
    phone: string;
    email: string;
    website: string;
  };
  images: string[];
};

type LakeFromDatabase = Awaited<ReturnType<typeof getLakesFromDatabase>>[number];

async function getLakesFromDatabase() {
  return prisma.lake.findMany({
    include: {
      fishSpecies: true,
      priceList: true,
      rules: true,
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

function mapLakeToDto(lake: LakeFromDatabase): LakeDto {
  return {
    id: lake.id,
    name: lake.name,
    slug: lake.slug,
    rating: lake.rating.toFixed(1),
    distance: "0 km",
    fish: lake.fish,
    fishSpecies: lake.fishSpecies.map((fish) => fish.name),
    type: lake.ownerType as "pzw" | "commercial",
    fishingType: lake.fishingType as "general" | "spinning" | "carp",
    lat: lake.lat,
    lng: lake.lng,
    address: {
      street: lake.street,
      city: lake.city,
      postalCode: lake.postalCode,
      voivodeship: lake.voivodeship,
    },
    description: lake.description,
    amenities: {
      cottages: lake.cottages,
      campfire: lake.campfire,
      noKill: lake.noKill,
      tent: lake.tent,
      parking: lake.parking,
      pier: lake.pier,
      toilet: lake.toilet,
      shop: lake.shop,
      nightFishing: lake.nightFishing,
      boatRental: lake.boatRental,
    },
    details: {
      area: lake.area,
      averageDepth: lake.averageDepth,
      bottomType: lake.bottomType,
      waterType: lake.waterType,
    },
    priceList: lake.priceList.map((item) => item.text),
    rules: lake.rules.map((rule) => rule.text),
    contact: {
      name: lake.contactName,
      phone: lake.contactPhone,
      email: lake.contactEmail,
      website: lake.contactWebsite,
    },
    images: lake.images.map((image) => image.url),
  };
}

export async function getLakes() {
  const lakes = await getLakesFromDatabase();

  return lakes.map(mapLakeToDto);
}

export async function getLakeBySlug(slug: string) {
  const lake = await prisma.lake.findUnique({
    where: {
      slug,
    },
    include: {
      fishSpecies: true,
      priceList: true,
      rules: true,
      images: true,
    },
  });

  if (!lake) {
    return null;
  }

  return mapLakeToDto(lake);
}