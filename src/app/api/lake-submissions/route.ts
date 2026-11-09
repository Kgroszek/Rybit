import { NextResponse } from "next/server";

import { checkAndUnlockAchievements } from "@/lib/achievements";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { normalizeFishName } from "@/lib/fish-names";
import { normalizeFishingMethods } from "@/lib/fishing-methods";

const BUCKET_NAME = "lake-images";
const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const MAX_FISH_RECORDS = 30;
const MAX_GEAR_REQUIREMENTS = 30;

const FISH_RECORD_OPTIONS = new Set([
  "Amur",
  "Boleń",
  "Brzana",
  "Jaź",
  "Jesiotr",
  "Karaś",
  "Karp",
  "Kleń",
  "Leszcz",
  "Lin",
  "Miętus",
  "Okoń",
  "Płoć",
  "Sandacz",
  "Sielawa",
  "Sum",
  "Szczupak",
  "Tołpyga",
  "Troć",
  "Węgorz",
  "Wzdręga",
]);

type UploadedImage = {
  imagePath: string;
  url: string;
};

type FishRecordInput = {
  fishName: string;
  weightKg: number;
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

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getFormBoolean(formData: FormData, key: string) {
  return getFormValue(formData, key) === "true";
}

function sanitizeFileName(fileName: string) {
  const sanitizedFileName = fileName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");

  return sanitizedFileName || "image.jpg";
}

function isValidImage(file: File) {
  return file.type.startsWith("image/") && file.size <= MAX_IMAGE_SIZE;
}

function getNumberValue(value: string) {
  return Number(value.replace(",", "."));
}

function parseJsonArray(formData: FormData, key: string) {
  const rawValue = getFormValue(formData, key);

  if (!rawValue) {
    return [] as unknown[];
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [] as unknown[];
    }

    return parsedValue;
  } catch {
    return [] as unknown[];
  }
}

function getFishRecords(formData: FormData) {
  const rawRecords = parseJsonArray(formData, "fishRecords");

  return rawRecords
    .map((record) => {
      if (!record || typeof record !== "object") {
        return null;
      }

      const fishName =
        "fishName" in record && typeof record.fishName === "string"
          ? record.fishName.trim()
          : "";

      const weightValue =
        "weightKg" in record
          ? typeof record.weightKg === "number"
            ? record.weightKg
            : typeof record.weightKg === "string"
              ? getNumberValue(record.weightKg)
              : Number.NaN
          : Number.NaN;

      if (!fishName || !FISH_RECORD_OPTIONS.has(fishName)) {
        return null;
      }

      if (Number.isNaN(weightValue) || weightValue <= 0) {
        return null;
      }

      return {
        fishName,
        weightKg: weightValue,
      } satisfies FishRecordInput;
    })
    .filter((record): record is FishRecordInput => record !== null)
    .slice(0, MAX_FISH_RECORDS);
}

function getGearRequirements(formData: FormData) {
  const rawRequirements = parseJsonArray(formData, "gearRequirements");

  return rawRequirements
    .map((requirement) => {
      if (typeof requirement === "string") {
        return requirement.trim();
      }

      if (
        requirement &&
        typeof requirement === "object" &&
        "text" in requirement &&
        typeof requirement.text === "string"
      ) {
        return requirement.text.trim();
      }

      return "";
    })
    .filter(Boolean)
    .slice(0, MAX_GEAR_REQUIREMENTS);
}

async function removeUploadedImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  uploadedImages: UploadedImage[]
) {
  if (uploadedImages.length === 0) {
    return;
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(uploadedImages.map((image) => image.imagePath));

  if (error) {
    console.error("[lake-submissions] Nie udało się usunąć zdjęć:", error);
  }
}

function checkAchievementsInBackground(userId: string) {
  void checkAndUnlockAchievements(userId).catch((error) => {
    console.error(
      "[lake-submissions] Nie udało się sprawdzić osiągnięć:",
      error
    );
  });
}

export async function POST(request: Request) {
  const startedAt = performance.now();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany, aby zgłosić łowisko." },
      { status: 401 }
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Nie udało się odczytać danych formularza." },
      { status: 400 }
    );
  }

  const name = getFormValue(formData, "name");
  const description = getFormValue(formData, "description");
  const ownerType = getFormValue(formData, "ownerType");
  const fishingType = getFormValue(formData, "fishingType");
  const fishingMethods = normalizeFishingMethods(
    getFormValue(formData, "fishingMethods")
  );
  const fish = normalizeFishName(getFormValue(formData, "fish"));

  const lat = getFormValue(formData, "lat");
  const lng = getFormValue(formData, "lng");

  const street = getFormValue(formData, "street");
  const city = getFormValue(formData, "city");
  const postalCode = getFormValue(formData, "postalCode");
  const voivodeship = getFormValue(formData, "voivodeship");

  const isOpenAllDay = getFormBoolean(formData, "isOpenAllDay");
  const openingHours = isOpenAllDay
    ? null
    : getFormValue(formData, "openingHours") || null;

  const fishRecords = getFishRecords(formData);
  const gearRequirements = getGearRequirements(formData);

  if (!name || !description) {
    return NextResponse.json(
      { message: "Nazwa i opis łowiska są wymagane." },
      { status: 400 }
    );
  }

  if (!fish) {
    return NextResponse.json(
      { message: "Podaj ryby występujące na łowisku." },
      { status: 400 }
    );
  }

  if (!lat || !lng) {
    return NextResponse.json(
      { message: "Podaj współrzędne łowiska." },
      { status: 400 }
    );
  }

  if (!street || !city || !postalCode || !voivodeship) {
    return NextResponse.json(
      { message: "Uzupełnij dane adresowe łowiska." },
      { status: 400 }
    );
  }

  const latitude = getNumberValue(lat);
  const longitude = getNumberValue(lng);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return NextResponse.json(
      { message: "Szerokość i długość geograficzna muszą być liczbami." },
      { status: 400 }
    );
  }

  const images = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (images.length > MAX_IMAGES) {
    return NextResponse.json(
      { message: `Możesz dodać maksymalnie ${MAX_IMAGES} zdjęć.` },
      { status: 400 }
    );
  }

  const invalidImage = images.find((image) => !isValidImage(image));

  if (invalidImage) {
    return NextResponse.json(
      {
        message:
          "Zdjęcia muszą być plikami graficznymi i mieć maksymalnie 5 MB.",
      },
      { status: 400 }
    );
  }

  let submissionId: string | null = null;
  let uploadedImages: UploadedImage[] = [];

  try {
    const submission = await prisma.lakeSubmission.create({
      data: {
        userId: user.id,
        status: "pending",
        name,
        slug: `${createSlug(name)}-${Date.now()}`,
        description,
        ownerType,
        fishingType,
        fishingMethods,
        fish,
        lat: latitude,
        lng: longitude,
        street,
        city,
        postalCode,
        voivodeship,
        area: getFormValue(formData, "area") || null,
        averageDepth: getFormValue(formData, "averageDepth") || null,
        bottomType: getFormValue(formData, "bottomType") || null,
        waterType: getFormValue(formData, "waterType") || null,
        priceListText: getFormValue(formData, "priceListText") || null,
        priceListUrl: getFormValue(formData, "priceListUrl") || null,
        rulesText: getFormValue(formData, "rulesText") || null,
        rulesUrl: getFormValue(formData, "rulesUrl") || null,
        isOpenAllDay,
        openingHours,
        cottages: getFormBoolean(formData, "cottages"),
        campfire: getFormBoolean(formData, "campfire"),
        noKill: getFormBoolean(formData, "noKill"),
        tent: getFormBoolean(formData, "tent"),
        parking: getFormBoolean(formData, "parking"),
        pier: getFormBoolean(formData, "pier"),
        toilet: getFormBoolean(formData, "toilet"),
        sanitaryFacilities: getFormBoolean(formData, "sanitaryFacilities"),
        shop: getFormBoolean(formData, "shop"),
        nightFishing: getFormBoolean(formData, "nightFishing"),
        boatRental: getFormBoolean(formData, "boatRental"),
        camperCaravan: getFormBoolean(formData, "camperCaravan"),
        electricityHookup: getFormBoolean(formData, "electricityHookup"),
        gearRental: getFormBoolean(formData, "gearRental"),
        shelter: getFormBoolean(formData, "shelter"),
        coveredSpots: getFormBoolean(formData, "coveredSpots"),
        playground: getFormBoolean(formData, "playground"),
        cardPayment: getFormBoolean(formData, "cardPayment"),
        contactName: getFormValue(formData, "contactName") || null,
        contactPhone: getFormValue(formData, "contactPhone") || null,
        contactEmail: getFormValue(formData, "contactEmail") || null,
        contactWebsite: getFormValue(formData, "contactWebsite") || null,
        fishRecords:
          fishRecords.length > 0
            ? {
                create: fishRecords.map((record) => ({
                  fishName: record.fishName,
                  weightKg: record.weightKg,
                })),
              }
            : undefined,
        gearRequirements:
          gearRequirements.length > 0
            ? {
                create: gearRequirements.map((requirement) => ({
                  text: requirement,
                })),
              }
            : undefined,
      },
    });

    submissionId = submission.id;

    uploadedImages = await Promise.all(
      images.map(async (image, index) => {
        const cleanFileName = sanitizeFileName(image.name);
        const imagePath = `submissions/${user.id}/${
          submission.id
        }/${Date.now()}-${index}-${cleanFileName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(imagePath, image, {
            cacheControl: "3600",
            upsert: false,
            contentType: image.type,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(BUCKET_NAME).getPublicUrl(imagePath);

        return {
          imagePath,
          url: publicUrl,
        };
      })
    );

    if (uploadedImages.length > 0) {
      await prisma.lakeSubmissionImage.createMany({
        data: uploadedImages.map((image) => ({
          submissionId: submission.id,
          imagePath: image.imagePath,
          url: image.url,
        })),
      });
    }

    const submissionWithImages = await prisma.lakeSubmission.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        images: true,
        fishRecords: true,
        gearRequirements: true,
      },
    });

    checkAchievementsInBackground(user.id);

    console.info(
      `[lake-submissions] Zgłoszenie zapisane w ${Math.round(
        performance.now() - startedAt
      )} ms`
    );

    return NextResponse.json(submissionWithImages, { status: 201 });
  } catch (error) {
    console.error("[lake-submissions] Błąd zapisu zgłoszenia:", error);

    await removeUploadedImages(supabase, uploadedImages);

    if (submissionId) {
      await prisma.lakeSubmission.delete({
        where: {
          id: submissionId,
        },
      });
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Nie udało się zapisać zgłoszenia łowiska.",
      },
      { status: 500 }
    );
  }
}
