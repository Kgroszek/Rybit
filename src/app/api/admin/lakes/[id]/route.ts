import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
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

  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();
  const fish = String(body.fish || "").trim();

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

  const priceListItems = splitLines(String(body.priceListText || ""));
  const rulesItems = splitLines(String(body.rulesText || ""));
  const fishItems = splitFishNames(fish);

  const updatedLake = await prisma.lake.update({
    where: {
      id,
    },
    data: {
      name,
      description,

      ownerType: String(body.ownerType || "pzw"),
      fishingType: String(body.fishingType || "general"),
      fish,

      lat,
      lng,

      street: String(body.street || "").trim(),
      city: String(body.city || "").trim(),
      postalCode: String(body.postalCode || "").trim(),
      voivodeship: String(body.voivodeship || "").trim(),

      area: String(body.area || "").trim() || "Brak danych",
      averageDepth: String(body.averageDepth || "").trim() || "Brak danych",
      bottomType: String(body.bottomType || "").trim() || "Brak danych",
      waterType: String(body.waterType || "").trim() || "Brak danych",

      priceListText: String(body.priceListText || "").trim() || null,
      priceListUrl: String(body.priceListUrl || "").trim() || null,
      rulesText: String(body.rulesText || "").trim() || null,
      rulesUrl: String(body.rulesUrl || "").trim() || null,

      cottages: Boolean(body.cottages),
      campfire: Boolean(body.campfire),
      noKill: Boolean(body.noKill),
      tent: Boolean(body.tent),
      parking: Boolean(body.parking),
      pier: Boolean(body.pier),
      toilet: Boolean(body.toilet),
      shop: Boolean(body.shop),
      nightFishing: Boolean(body.nightFishing),
      boatRental: Boolean(body.boatRental),

      gearRental: Boolean(body.gearRental),
      shelter: Boolean(body.shelter),
      coveredSpots: Boolean(body.coveredSpots),
      playground: Boolean(body.playground),
      cardPayment: Boolean(body.cardPayment),

      contactName: String(body.contactName || "").trim() || "Brak danych",
      contactPhone: String(body.contactPhone || "").trim() || "Brak danych",
      contactEmail: String(body.contactEmail || "").trim(),
      contactWebsite: String(body.contactWebsite || "").trim(),

      fishSpecies: {
        deleteMany: {},
        create:
          fishItems.length > 0
            ? fishItems.map((fishName) => ({
                name: fishName,
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
  });

  return NextResponse.json({
    message: "Łowisko zostało zaktualizowane.",
    lake: updatedLake,
  });
}