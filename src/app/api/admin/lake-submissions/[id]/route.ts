import {
  NextResponse,
} from "next/server";

import {
  normalizeFishingMethods,
} from "@/lib/fishing-methods";
import {
  requireAdmin,
} from "@/lib/auth";
import {
  prisma,
} from "@/lib/prisma";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

type FishRecordInput = {
  fishName: string;
  weightKg: number;
};

function createSlug(
  text: string
) {
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
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

export async function PUT(
  request: Request,
  {
    params,
  }: RouteProps
) {
  const admin =
    await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      {
        message:
          "Brak uprawnień administratora.",
      },
      {
        status: 403,
      }
    );
  }

  const { id } =
    await params;

  let body: Record<
    string,
    unknown
  >;

  try {
    const parsed =
      await request.json();

    if (
      !parsed ||
      typeof parsed !==
        "object" ||
      Array.isArray(parsed)
    ) {
      throw new Error(
        "invalid"
      );
    }

    body =
      parsed as Record<
        string,
        unknown
      >;
  } catch {
    return NextResponse.json(
      {
        message:
          "Nieprawidłowy format danych.",
      },
      {
        status: 400,
      }
    );
  }

  const existingSubmission =
    await prisma.lakeSubmission.findUnique(
      {
        where: {
          id,
        },
        select: {
          id: true,
          status: true,
        },
      }
    );

  if (
    !existingSubmission
  ) {
    return NextResponse.json(
      {
        message:
          "Nie znaleziono zgłoszenia.",
      },
      {
        status: 404,
      }
    );
  }

  if (
    existingSubmission.status !==
    "pending"
  ) {
    return NextResponse.json(
      {
        message:
          "Można edytować tylko oczekujące zgłoszenia.",
      },
      {
        status: 400,
      }
    );
  }

  const name =
    cleanText(body.name);

  const description =
    cleanText(
      body.description
    );

  const fish =
    cleanText(body.fish);

  const street =
    cleanText(body.street);

  const city =
    cleanText(body.city);

  const postalCode =
    cleanText(
      body.postalCode
    );

  const voivodeship =
    cleanText(
      body.voivodeship
    );

  if (
    !name ||
    !description ||
    !fish
  ) {
    return NextResponse.json(
      {
        message:
          "Nazwa, opis i ryby są wymagane.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    !street ||
    !city ||
    !postalCode ||
    !voivodeship
  ) {
    return NextResponse.json(
      {
        message:
          "Uzupełnij pełne dane adresowe.",
      },
      {
        status: 400,
      }
    );
  }

  const lat =
    parseDecimal(body.lat);

  const lng =
    parseDecimal(body.lng);

  if (
    lat === null ||
    lat < -90 ||
    lat > 90
  ) {
    return NextResponse.json(
      {
        message:
          "Szerokość geograficzna musi być liczbą od -90 do 90.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    lng === null ||
    lng < -180 ||
    lng > 180
  ) {
    return NextResponse.json(
      {
        message:
          "Długość geograficzna musi być liczbą od -180 do 180.",
      },
      {
        status: 400,
      }
    );
  }

  const fishRecordsResult =
    parseFishRecords(
      body.fishRecords
    );

  if (
    !fishRecordsResult.ok
  ) {
    return NextResponse.json(
      {
        message:
          fishRecordsResult.message,
      },
      {
        status: 400,
      }
    );
  }

  const gearRequirements =
    parseStringList(
      body.gearRequirements,
      30,
      240
    );

  if (
    gearRequirements ===
    null
  ) {
    return NextResponse.json(
      {
        message:
          "Nieprawidłowe wymagania sprzętowe.",
      },
      {
        status: 400,
      }
    );
  }

  const fishingMethods =
    normalizeFishingMethods(
      body.fishingMethods
    );

  const isOpenAllDay =
    toBoolean(
      body.isOpenAllDay
    );

  const updatedSubmission =
    await prisma.$transaction(
      async (tx) => {
        await tx.lakeSubmissionFishRecord.deleteMany(
          {
            where: {
              submissionId:
                id,
            },
          }
        );

        await tx.lakeSubmissionGearRequirement.deleteMany(
          {
            where: {
              submissionId:
                id,
            },
          }
        );

        return tx.lakeSubmission.update(
          {
            where: {
              id,
            },
            data: {
              name,
              slug: `${createSlug(
                name
              )}-${Date.now()}`,
              description,

              ownerType:
                cleanText(
                  body.ownerType
                ) ||
                "pzw",
              fishingType:
                cleanText(
                  body.fishingType
                ) ||
                "general",
              fishingMethods,
              fish,

              lat,
              lng,

              street,
              city,
              postalCode,
              voivodeship,

              area:
                cleanText(
                  body.area
                ) || null,
              averageDepth:
                cleanText(
                  body.averageDepth
                ) || null,
              bottomType:
                cleanText(
                  body.bottomType
                ) || null,
              waterType:
                cleanText(
                  body.waterType
                ) || null,

              priceListText:
                cleanText(
                  body.priceListText
                ) || null,
              priceListUrl:
                cleanText(
                  body.priceListUrl
                ) || null,
              rulesText:
                cleanText(
                  body.rulesText
                ) || null,
              rulesUrl:
                cleanText(
                  body.rulesUrl
                ) || null,

              isOpenAllDay,
              openingHours:
                isOpenAllDay
                  ? null
                  : cleanText(
                        body.openingHours
                      ) ||
                    null,

              cottages:
                toBoolean(
                  body.cottages
                ),
              campfire:
                toBoolean(
                  body.campfire
                ),
              noKill:
                toBoolean(
                  body.noKill
                ),
              tent:
                toBoolean(
                  body.tent
                ),
              parking:
                toBoolean(
                  body.parking
                ),
              pier:
                toBoolean(
                  body.pier
                ),
              toilet:
                toBoolean(
                  body.toilet
                ),
              sanitaryFacilities:
                toBoolean(
                  body.sanitaryFacilities
                ),
              shop:
                toBoolean(
                  body.shop
                ),
              nightFishing:
                toBoolean(
                  body.nightFishing
                ),
              boatRental:
                toBoolean(
                  body.boatRental
                ),
              camperCaravan:
                toBoolean(
                  body.camperCaravan
                ),
              electricityHookup:
                toBoolean(
                  body.electricityHookup
                ),
              gearRental:
                toBoolean(
                  body.gearRental
                ),
              shelter:
                toBoolean(
                  body.shelter
                ),
              coveredSpots:
                toBoolean(
                  body.coveredSpots
                ),
              playground:
                toBoolean(
                  body.playground
                ),
              cardPayment:
                toBoolean(
                  body.cardPayment
                ),

              contactName:
                cleanText(
                  body.contactName
                ) || null,
              contactPhone:
                cleanText(
                  body.contactPhone
                ) || null,
              contactEmail:
                cleanText(
                  body.contactEmail
                ) || null,
              contactWebsite:
                cleanText(
                  body.contactWebsite
                ) || null,

              ...(fishRecordsResult.records.length >
              0
                ? {
                    fishRecords:
                      {
                        create:
                          fishRecordsResult.records,
                      },
                  }
                : {}),

              ...(gearRequirements.length >
              0
                ? {
                    gearRequirements:
                      {
                        create:
                          gearRequirements.map(
                            (
                              text
                            ) => ({
                              text,
                            })
                          ),
                      },
                  }
                : {}),
            },
            include: {
              images: true,
              fishRecords:
                true,
              gearRequirements:
                true,
            },
          }
        );
      }
    );

  return NextResponse.json({
    message:
      "Zgłoszenie zostało zaktualizowane.",
    submission:
      updatedSubmission,
  });
}

function cleanText(
  value: unknown
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function parseDecimal(
  value: unknown
) {
  const parsed =
    Number(
      String(
        value ?? ""
      ).replace(
        ",",
        "."
      )
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : null;
}

function toBoolean(
  value: unknown
) {
  if (
    typeof value ===
    "boolean"
  ) {
    return value;
  }

  return (
    String(value).toLowerCase() ===
    "true"
  );
}

function parseStringList(
  value: unknown,
  maxItems: number,
  maxLength: number
) {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  if (
    value.length >
    maxItems
  ) {
    return null;
  }

  const result: string[] =
    [];

  for (
    const item of value
  ) {
    if (
      typeof item !==
      "string"
    ) {
      return null;
    }

    const text =
      item.trim();

    if (!text) {
      continue;
    }

    if (
      text.length >
      maxLength
    ) {
      return null;
    }

    result.push(text);
  }

  return result;
}

function parseFishRecords(
  value: unknown
):
  | {
      ok: true;
      records:
        FishRecordInput[];
    }
  | {
      ok: false;
      message: string;
    } {
  if (
    !Array.isArray(value)
  ) {
    return {
      ok: true,
      records: [],
    };
  }

  if (
    value.length > 30
  ) {
    return {
      ok: false,
      message:
        "Można zapisać maksymalnie 30 rekordowych ryb.",
    };
  }

  const records: FishRecordInput[] =
    [];

  for (
    const raw of value
  ) {
    if (
      !raw ||
      typeof raw !==
        "object" ||
      Array.isArray(raw)
    ) {
      return {
        ok: false,
        message:
          "Nieprawidłowe dane rekordowych ryb.",
      };
    }

    const record =
      raw as Record<
        string,
        unknown
      >;

    const fishName =
      cleanText(
        record.fishName
      );

    const weightKg =
      parseDecimal(
        record.weightKg
      );

    if (
      !fishName ||
      weightKg === null ||
      weightKg <= 0
    ) {
      return {
        ok: false,
        message:
          "Każda rekordowa ryba musi mieć gatunek i wagę większą od zera.",
      };
    }

    records.push({
      fishName,
      weightKg,
    });
  }

  return {
    ok: true,
    records,
  };
}
