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

function splitTextLines(text: string | null) {
  if (!text) {
    return [];
  }

  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function createUniqueLakeSlug(baseSlug: string) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingLake = await prisma.lake.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!existingLake) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
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
    include: {
      images: true,
      fishRecords: true,
      gearRequirements: true,
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

  const lakeSlug = await createUniqueLakeSlug(submission.slug);

  const priceListItems = splitTextLines(submission.priceListText);
  const rulesItems = splitTextLines(submission.rulesText);

  if (submission.priceListUrl) {
    priceListItems.push(`Link do cennika: ${submission.priceListUrl}`);
  }

  if (submission.rulesUrl) {
    rulesItems.push(`Link do regulaminu: ${submission.rulesUrl}`);
  }

  const createdLake = await prisma.$transaction(async (tx) => {
    const lake = await tx.lake.create({
      data: {
        name: submission.name,
        slug: lakeSlug,
        description: submission.description,
        rating: 0,

        ownerType: submission.ownerType,
        fishingType: submission.fishingType,
        fishingMethods: submission.fishingMethods,
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
        sanitaryFacilities: submission.sanitaryFacilities,
        shop: submission.shop,
        nightFishing: submission.nightFishing,
        boatRental: submission.boatRental,
        camperCaravan: submission.camperCaravan,
        electricityHookup: submission.electricityHookup,

        gearRental: submission.gearRental,
        shelter: submission.shelter,
        coveredSpots: submission.coveredSpots,
        playground: submission.playground,
        cardPayment: submission.cardPayment,

        priceListText: submission.priceListText,
        priceListUrl: submission.priceListUrl,
        rulesText: submission.rulesText,
        rulesUrl: submission.rulesUrl,

        isOpenAllDay: submission.isOpenAllDay,
        openingHours: submission.openingHours,

        contactName: submission.contactName || "Brak danych",
        contactPhone: submission.contactPhone || "Brak danych",
        contactEmail: submission.contactEmail || "Brak danych",
        contactWebsite: submission.contactWebsite || "Brak danych",

        fishSpecies: {
          create: splitFishNames(submission.fish).map((fishName) => ({
            name: fishName,
          })),
        },

        ...(submission.fishRecords.length > 0
          ? {
              fishRecords: {
                create: submission.fishRecords.map((record) => ({
                  fishName: record.fishName,
                  weightKg: record.weightKg,
                })),
              },
            }
          : {}),

        ...(submission.gearRequirements.length > 0
          ? {
              gearRequirements: {
                create: submission.gearRequirements.map((requirement) => ({
                  text: requirement.text,
                })),
              },
            }
          : {}),

        priceList: {
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

        ...(submission.images.length > 0
          ? {
              images: {
                create: submission.images.map((image) => ({
                  url: image.url,
                  imagePath: image.imagePath,
                })),
              },
            }
          : {}),
      },
      include: {
        images: true,
        fishSpecies: true,
        fishRecords: true,
        gearRequirements: true,
        priceList: true,
        rules: true,
      },
    });

    await tx.lakeSubmission.update({
      where: {
        id,
      },
      data: {
        status: "approved",
      },
    });

    if (submission.userId) {
      await tx.userNotification.create({
        data: {
          userId: submission.userId,
          title: "Twoje zgłoszenie łowiska zostało zaakceptowane",
          message: `Łowisko ${submission.name} zostało zaakceptowane i dodane do bazy Rybio.`,
          href: `/lowiska-w-polsce/${lake.slug}`,
          type: "lake_submission_approved",
        },
      });
    }

    return lake;
  });

  return NextResponse.json({
    message: "Zgłoszenie zostało zaakceptowane.",
    lake: createdLake,
  });
}