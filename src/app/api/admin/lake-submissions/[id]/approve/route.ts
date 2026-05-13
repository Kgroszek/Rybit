import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function splitFishNames(fish: string) {
  return fish
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(_request: Request, { params }: RouteProps) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { message: "Brak uprawnień administratora." },
      { status: 403 }
    );
  }

  const { id } = await params;

  const submission = await prisma.lakeSubmission.findUnique({
    where: {
      id,
    },
  });

  if (!submission) {
    return NextResponse.json(
      { message: "Nie znaleziono zgłoszenia." },
      { status: 404 }
    );
  }

  if (submission.status !== "pending") {
    return NextResponse.json(
      { message: "To zgłoszenie zostało już obsłużone." },
      { status: 400 }
    );
  }

  const createdLake = await prisma.lake.create({
    data: {
      name: submission.name,
      slug: submission.slug,
      description: submission.description,
      rating: 0,

      ownerType: submission.ownerType,
      fishingType: submission.fishingType,
      fish: submission.fish,

      lat: submission.lat,
      lng: submission.lng,

      street: submission.street,
      city: submission.city,
      postalCode: submission.postalCode,
      voivodeship: submission.voivodeship,

      area: submission.area || "Brak danych",
      averageDepth: submission.averageDepth || "Brak danych",
      bottomType: submission.bottomType || "Brak danych",
      waterType: submission.waterType || "Brak danych",

      cottages: submission.cottages,
      campfire: submission.campfire,
      noKill: submission.noKill,
      tent: submission.tent,
      parking: submission.parking,
      pier: submission.pier,
      toilet: submission.toilet,
      shop: submission.shop,
      nightFishing: submission.nightFishing,
      boatRental: submission.boatRental,

      contactName: submission.contactName || "Brak danych",
      contactPhone: submission.contactPhone || "Brak danych",
      contactEmail: submission.contactEmail || "Brak danych",
      contactWebsite: submission.contactWebsite || "Brak danych",

      fishSpecies: {
        create: splitFishNames(submission.fish).map((fishName) => ({
          name: fishName,
        })),
      },

      priceList: {
        create: [{ text: "Brak dodanego cennika." }],
      },

      rules: {
        create: [{ text: "Brak dodanych zasad łowiska." }],
      },

      images: {
        create: [{ url: "/images/lakes/lake-placeholder-1.jpg" }],
      },
    },
  });

  await prisma.lakeSubmission.update({
    where: {
      id,
    },
    data: {
      status: "approved",
    },
  });

  return NextResponse.json({
    message: "Zgłoszenie zostało zaakceptowane.",
    lake: createdLake,
  });
}