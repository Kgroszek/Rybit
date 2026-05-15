import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function createSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replaceAll("ą", "a")
    .replaceAll("ć", "c")
    .replaceAll("ę", "e")
    .replaceAll("ł", "l")
    .replaceAll("ń", "n")
    .replaceAll("ó", "o")
    .replaceAll("ś", "s")
    .replaceAll("ż", "z")
    .replaceAll("ź", "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

  const existingSubmission = await prisma.lakeSubmission.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existingSubmission) {
    return NextResponse.json(
      { message: "Nie znaleziono zgłoszenia." },
      { status: 404 }
    );
  }

  if (existingSubmission.status !== "pending") {
    return NextResponse.json(
      { message: "Można edytować tylko oczekujące zgłoszenia." },
      { status: 400 }
    );
  }

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

  const updatedSubmission = await prisma.lakeSubmission.update({
    where: {
      id,
    },
    data: {
      name,
      slug: `${createSlug(name)}-${Date.now()}`,
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

      area: String(body.area || "").trim() || null,
      averageDepth: String(body.averageDepth || "").trim() || null,
      bottomType: String(body.bottomType || "").trim() || null,
      waterType: String(body.waterType || "").trim() || null,

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

      contactName: String(body.contactName || "").trim() || null,
      contactPhone: String(body.contactPhone || "").trim() || null,
      contactEmail: String(body.contactEmail || "").trim() || null,
      contactWebsite: String(body.contactWebsite || "").trim() || null,
    },
    include: {
      images: true,
    },
  });

  return NextResponse.json({
    message: "Zgłoszenie zostało zaktualizowane.",
    submission: updatedSubmission,
  });
}