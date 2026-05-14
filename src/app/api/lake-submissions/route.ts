import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "lake-images";
const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

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
  return fileName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
}

function isValidImage(file: File) {
  return file.type.startsWith("image/") && file.size <= MAX_IMAGE_SIZE;
}

export async function POST(request: Request) {
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

  const formData = await request.formData();

  const name = getFormValue(formData, "name");
  const description = getFormValue(formData, "description");
  const ownerType = getFormValue(formData, "ownerType");
  const fishingType = getFormValue(formData, "fishingType");
  const fish = getFormValue(formData, "fish");

  const lat = getFormValue(formData, "lat");
  const lng = getFormValue(formData, "lng");

  const street = getFormValue(formData, "street");
  const city = getFormValue(formData, "city");
  const postalCode = getFormValue(formData, "postalCode");
  const voivodeship = getFormValue(formData, "voivodeship");

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

  const latitude = Number(lat);
  const longitude = Number(lng);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return NextResponse.json(
      { message: "Szerokość i długość geograficzna muszą być liczbami." },
      { status: 400 }
    );
  }

  const images = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File);

  if (images.length > MAX_IMAGES) {
    return NextResponse.json(
      { message: "Możesz dodać maksymalnie 10 zdjęć." },
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

  const submission = await prisma.lakeSubmission.create({
    data: {
      userId: user.id,
      status: "pending",

      name,
      slug: `${createSlug(name)}-${Date.now()}`,
      description,

      ownerType,
      fishingType,
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

      cottages: getFormBoolean(formData, "cottages"),
      campfire: getFormBoolean(formData, "campfire"),
      noKill: getFormBoolean(formData, "noKill"),
      tent: getFormBoolean(formData, "tent"),
      parking: getFormBoolean(formData, "parking"),
      pier: getFormBoolean(formData, "pier"),
      toilet: getFormBoolean(formData, "toilet"),
      shop: getFormBoolean(formData, "shop"),
      nightFishing: getFormBoolean(formData, "nightFishing"),
      boatRental: getFormBoolean(formData, "boatRental"),

      gearRental: getFormBoolean(formData, "gearRental"),
      shelter: getFormBoolean(formData, "shelter"),
      coveredSpots: getFormBoolean(formData, "coveredSpots"),
      playground: getFormBoolean(formData, "playground"),
      cardPayment: getFormBoolean(formData, "cardPayment"),

      contactName: getFormValue(formData, "contactName") || null,
      contactPhone: getFormValue(formData, "contactPhone") || null,
      contactEmail: getFormValue(formData, "contactEmail") || null,
      contactWebsite: getFormValue(formData, "contactWebsite") || null,
    },
  });

  const uploadedImages: {
    imagePath: string;
    url: string;
  }[] = [];

  try {
    for (const image of images) {
      const cleanFileName = sanitizeFileName(image.name);

      const imagePath = `submissions/${user.id}/${submission.id}/${Date.now()}-${cleanFileName}`;

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

      uploadedImages.push({
        imagePath,
        url: publicUrl,
      });
    }

    if (uploadedImages.length > 0) {
      await prisma.lakeSubmissionImage.createMany({
        data: uploadedImages.map((image) => ({
          submissionId: submission.id,
          imagePath: image.imagePath,
          url: image.url,
        })),
      });
    }
  } catch (error) {
    if (uploadedImages.length > 0) {
      await supabase.storage
        .from(BUCKET_NAME)
        .remove(uploadedImages.map((image) => image.imagePath));
    }

    await prisma.lakeSubmission.delete({
      where: {
        id: submission.id,
      },
    });

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Nie udało się zapisać zdjęć zgłoszenia.",
      },
      { status: 500 }
    );
  }

  const submissionWithImages = await prisma.lakeSubmission.findUnique({
    where: {
      id: submission.id,
    },
    include: {
      images: true,
    },
  });

  return NextResponse.json(submissionWithImages, { status: 201 });
}