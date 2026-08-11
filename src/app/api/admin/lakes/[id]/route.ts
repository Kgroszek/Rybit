import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { normalizeFishingMethods } from "@/lib/fishing-methods";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

type FishRecordPayload = {
  fishName?: string;
  weightKg?: number | string;
};

type GearRequirementPayload = {
  text?: string;
};

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitFishNames(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getStringValue(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getBooleanValue(value: unknown) {
  return value === true || value === "true";
}

function getNumberValue(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value.replace(",", "."));
  }

  return Number.NaN;
}

function parseFishRecords(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): FishRecordPayload => {
      if (!item || typeof item !== "object") {
        return {};
      }

      return item as FishRecordPayload;
    })
    .map((item) => ({
      fishName: getStringValue(item.fishName),
      weightKg: getNumberValue(item.weightKg),
    }))
    .filter((item) => item.fishName && !Number.isNaN(item.weightKg) && item.weightKg > 0);
}

function parseGearRequirements(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item === "object") {
        return getStringValue((item as GearRequirementPayload).text);
      }

      return "";
    })
    .filter(Boolean);
}

export async function PUT(request: Request, { params }: RouteProps) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { message: "Brak uprawnień administratora." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await request.json();

  const name = getStringValue(body.name);
  const description = getStringValue(body.description);
  const fish = getStringValue(body.fish);

  const lat = Number(body.lat);
  const lng = Number(body.lng);

  if (!name || !description || !fish) {
    return NextResponse.json(
      { message: "Nazwa, opis i ryby są wymagane." },
      { status: 400 }
    );
  }

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { message: "Współrzędne muszą być poprawnymi liczbami." },
      { status: 400 }
    );
  }

  const existingLake = await prisma.lake.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!existingLake) {
    return NextResponse.json(
      { message: "Nie znaleziono łowiska." },
      { status: 404 }
    );
  }

  const priceListItems = splitLines(getStringValue(body.priceListText));
  const rulesItems = splitLines(getStringValue(body.rulesText));
  const fishItems = splitFishNames(fish);

  const fishRecords = parseFishRecords(body.fishRecords);
  const gearRequirements = parseGearRequirements(body.gearRequirements);

  const isOpenAllDay = getBooleanValue(body.isOpenAllDay);
  const openingHours = getStringValue(body.openingHours);

  const updatedLake = await prisma.lake.update({
    where: {
      id,
    },
    data: {
      name,
      description,

      ownerType: getStringValue(body.ownerType) || "pzw",
      fishingType: getStringValue(body.fishingType) || "general",
      fishingMethods: normalizeFishingMethods(body.fishingMethods),
      fish,

      lat,
      lng,

      street: getStringValue(body.street),
      city: getStringValue(body.city),
      postalCode: getStringValue(body.postalCode),
      voivodeship: getStringValue(body.voivodeship),

      area: getStringValue(body.area) || "Brak danych",
      averageDepth: getStringValue(body.averageDepth) || "Brak danych",
      bottomType: getStringValue(body.bottomType) || "Brak danych",
      waterType: getStringValue(body.waterType) || "Brak danych",

      priceListText: getStringValue(body.priceListText) || null,
      priceListUrl: getStringValue(body.priceListUrl) || null,
      rulesText: getStringValue(body.rulesText) || null,
      rulesUrl: getStringValue(body.rulesUrl) || null,

      isOpenAllDay,
      openingHours: isOpenAllDay ? null : openingHours || null,

      cottages: Boolean(body.cottages),
      campfire: Boolean(body.campfire),
      noKill: Boolean(body.noKill),
      tent: Boolean(body.tent),
      parking: Boolean(body.parking),
      pier: Boolean(body.pier),
      toilet: Boolean(body.toilet),
      sanitaryFacilities: Boolean(body.sanitaryFacilities),
      shop: Boolean(body.shop),
      nightFishing: Boolean(body.nightFishing),
      boatRental: Boolean(body.boatRental),
      camperCaravan: Boolean(body.camperCaravan),
      electricityHookup: Boolean(body.electricityHookup),

      gearRental: Boolean(body.gearRental),
      shelter: Boolean(body.shelter),
      coveredSpots: Boolean(body.coveredSpots),
      playground: Boolean(body.playground),
      cardPayment: Boolean(body.cardPayment),

      contactName: getStringValue(body.contactName) || "Brak danych",
      contactPhone: getStringValue(body.contactPhone) || "Brak danych",
      contactEmail: getStringValue(body.contactEmail),
      contactWebsite: getStringValue(body.contactWebsite),

      fishSpecies: {
        deleteMany: {},
        create:
          fishItems.length > 0
            ? fishItems.map((fishName) => ({
                name: fishName,
              }))
            : [],
      },

      fishRecords: {
        deleteMany: {},
        create:
          fishRecords.length > 0
            ? fishRecords.map((record) => ({
                fishName: record.fishName,
                weightKg: record.weightKg,
              }))
            : [],
      },

      gearRequirements: {
        deleteMany: {},
        create:
          gearRequirements.length > 0
            ? gearRequirements.map((text) => ({
                text,
              }))
            : [],
      },

      priceList: {
        deleteMany: {},
        create:
          priceListItems.length > 0
            ? priceListItems.map((text) => ({
                text,
              }))
            : [
                {
                  text: "Brak dodanego cennika.",
                },
              ],
      },

      rules: {
        deleteMany: {},
        create:
          rulesItems.length > 0
            ? rulesItems.map((text) => ({
                text,
              }))
            : [
                {
                  text: "Brak dodanych zasad łowiska.",
                },
              ],
      },
    },
    include: {
      fishSpecies: true,
      fishRecords: true,
      gearRequirements: true,
      priceList: true,
      rules: true,
      images: true,
    },
  });

  return NextResponse.json({
    message: "Łowisko zostało zaktualizowane.",
    lake: updatedLake,
  });
}