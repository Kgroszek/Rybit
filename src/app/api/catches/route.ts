import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { checkAndUnlockAchievements } from "@/lib/achievements";

const CATCH_IMAGES_BUCKET = "catch-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const FUTURE_DATE_TOLERANCE_MS = 2 * 60 * 1000;

type SupabaseUserForDisplayName = {
  email?: string | null;
  user_metadata?: {
    full_name?: string;
    name?: string;
    display_name?: string;
    user_name?: string;
  };
};

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
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
}

function isValidImage(file: File) {
  return file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE;
}

function parseCaughtAt(value: string) {
  const caughtAt = new Date(value);

  if (Number.isNaN(caughtAt.getTime())) {
    return {
      date: null,
      error: "Podaj prawidłową datę połowu.",
    };
  }

  if (caughtAt.getTime() > Date.now() + FUTURE_DATE_TOLERANCE_MS) {
    return {
      date: null,
      error: "Nie możesz dodać połowu z przyszłości.",
    };
  }

  return {
    date: caughtAt,
    error: null,
  };
}

function getUserDisplayName(user: SupabaseUserForDisplayName) {
  const metadataName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.display_name ||
    user.user_metadata?.user_name;

  if (metadataName && metadataName.trim()) {
    return metadataName.trim();
  }

  if (user.email) {
    return user.email
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
      .join(" ");
  }

  return "Użytkownik";
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany." },
      { status: 401 }
    );
  }

  const catches = await prisma.fishingCatch.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      caughtAt: "desc",
    },
  });

  return NextResponse.json(catches);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Musisz być zalogowany, aby dodać połów." },
      { status: 401 }
    );
  }

  const userName = getUserDisplayName(user);
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    return handleMultipartCatchCreate(request, user.id, userName, supabase);
  }

  return handleJsonCatchCreate(request, user.id, userName);
}

async function handleJsonCatchCreate(
  request: Request,
  userId: string,
  userName: string
) {
  const body = await request.json();

  const fishName = String(body.fishName || "").trim();
  const method = String(body.method || "").trim();
  const caughtAtValue = String(body.caughtAt || "").trim();
  const lakeId = String(body.lakeId || "").trim();
  const isPublic = Boolean(body.isPublic);

  if (!fishName || !method || !caughtAtValue) {
    return NextResponse.json(
      { message: "Gatunek ryby, metoda i data połowu są wymagane." },
      { status: 400 }
    );
  }

  const caughtAtResult = parseCaughtAt(caughtAtValue);

  if (caughtAtResult.error || !caughtAtResult.date) {
    return NextResponse.json(
      { message: caughtAtResult.error },
      { status: 400 }
    );
  }

  const caughtAt = caughtAtResult.date;

  const weight =
    body.weight !== undefined && body.weight !== "" ? Number(body.weight) : null;

  const length =
    body.length !== undefined && body.length !== "" ? Number(body.length) : null;

  if (weight !== null && Number.isNaN(weight)) {
    return NextResponse.json(
      { message: "Waga musi być liczbą." },
      { status: 400 }
    );
  }

  if (length !== null && Number.isNaN(length)) {
    return NextResponse.json(
      { message: "Długość musi być liczbą." },
      { status: 400 }
    );
  }

  const imageUrl =
    typeof body.imageUrl === "string" && body.imageUrl.trim()
      ? body.imageUrl.trim()
      : null;

  const imagePath =
    typeof body.imagePath === "string" && body.imagePath.trim()
      ? body.imagePath.trim()
      : null;

  if (isPublic && !lakeId) {
    return NextResponse.json(
      {
        message:
          "Aby połów trafił do rankingu łowiska, musisz wybrać łowisko z bazy.",
      },
      { status: 400 }
    );
  }

  if (isPublic && !imageUrl) {
    return NextResponse.json(
      {
        message:
          "Aby połów trafił do rankingu łowiska, musisz dodać zdjęcie ryby.",
      },
      { status: 400 }
    );
  }

  if (isPublic && weight === null && length === null) {
    return NextResponse.json(
      {
        message:
          "Aby połów trafił do rankingu łowiska, wpisz wagę lub długość ryby.",
      },
      { status: 400 }
    );
  }

  let lakeName: string | null = null;
  let finalLakeId: string | null = null;

  if (lakeId) {
    const lake = await prisma.lake.findUnique({
      where: {
        id: lakeId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!lake) {
      return NextResponse.json(
        { message: "Wybrane łowisko nie istnieje." },
        { status: 400 }
      );
    }

    finalLakeId = lake.id;
    lakeName = lake.name;
  }

  const { tripId, tripTitle } = await getTripData(body.tripId, userId);

  const fishingCatch = await prisma.fishingCatch.create({
    data: {
      userId,
      userName,

      fishName,
      weight,
      length,

      method,
      bait: body.bait || null,
      caughtAt,

      lakeId: finalLakeId,
      lakeName,

      tripId,
      tripTitle,

      imageUrl,
      imagePath,

      note: body.note || null,

      isPublic,
      rankingStatus: isPublic ? "approved" : "pending",
    },
  });

  await checkAndUnlockAchievements(userId);

  return NextResponse.json(fishingCatch, { status: 201 });
}

async function handleMultipartCatchCreate(
  request: Request,
  userId: string,
  userName: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const formData = await request.formData();

  const fishName = getFormValue(formData, "fishName");
  const method = getFormValue(formData, "method");
  const caughtAtValue = getFormValue(formData, "caughtAt");
  const lakeId = getFormValue(formData, "lakeId");
  const tripIdFromForm = getFormValue(formData, "tripId");
  const isPublic = getFormBoolean(formData, "isPublic");

  if (!fishName || !method || !caughtAtValue) {
    return NextResponse.json(
      { message: "Gatunek ryby, metoda i data połowu są wymagane." },
      { status: 400 }
    );
  }

  const caughtAtResult = parseCaughtAt(caughtAtValue);

  if (caughtAtResult.error || !caughtAtResult.date) {
    return NextResponse.json(
      { message: caughtAtResult.error },
      { status: 400 }
    );
  }

  const caughtAt = caughtAtResult.date;

  const weightValue = getFormValue(formData, "weight");
  const lengthValue = getFormValue(formData, "length");

  const weight = weightValue ? Number(weightValue) : null;
  const length = lengthValue ? Number(lengthValue) : null;

  if (weight !== null && Number.isNaN(weight)) {
    return NextResponse.json(
      { message: "Waga musi być liczbą." },
      { status: 400 }
    );
  }

  if (length !== null && Number.isNaN(length)) {
    return NextResponse.json(
      { message: "Długość musi być liczbą." },
      { status: 400 }
    );
  }

  const imageFromForm = formData.get("image");
  const image = imageFromForm instanceof File ? imageFromForm : null;

  if (image && image.size > 0 && !isValidImage(image)) {
    return NextResponse.json(
      {
        message:
          "Zdjęcie musi być plikiem graficznym i mieć maksymalnie 5 MB.",
      },
      { status: 400 }
    );
  }

  if (isPublic && !lakeId) {
    return NextResponse.json(
      {
        message:
          "Aby połów trafił do rankingu łowiska, musisz wybrać łowisko z bazy.",
      },
      { status: 400 }
    );
  }

  if (isPublic && (!image || image.size === 0)) {
    return NextResponse.json(
      {
        message:
          "Aby połów trafił do rankingu łowiska, musisz dodać zdjęcie ryby.",
      },
      { status: 400 }
    );
  }

  if (isPublic && weight === null && length === null) {
    return NextResponse.json(
      {
        message:
          "Aby połów trafił do rankingu łowiska, wpisz wagę lub długość ryby.",
      },
      { status: 400 }
    );
  }

  let lakeName: string | null = null;
  let finalLakeId: string | null = null;

  if (lakeId) {
    const lake = await prisma.lake.findUnique({
      where: {
        id: lakeId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!lake) {
      return NextResponse.json(
        { message: "Wybrane łowisko nie istnieje." },
        { status: 400 }
      );
    }

    finalLakeId = lake.id;
    lakeName = lake.name;
  }

  const { tripId, tripTitle } = await getTripData(tripIdFromForm, userId);

  let imageUrl: string | null = null;
  let imagePath: string | null = null;

  try {
    if (image && image.size > 0) {
      const cleanFileName = sanitizeFileName(image.name);
      imagePath = `${userId}/${Date.now()}-${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(CATCH_IMAGES_BUCKET)
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
      } = supabase.storage.from(CATCH_IMAGES_BUCKET).getPublicUrl(imagePath);

      imageUrl = publicUrl;
    }

    const fishingCatch = await prisma.fishingCatch.create({
      data: {
        userId,
        userName,

        fishName,
        weight,
        length,

        method,
        bait: getFormValue(formData, "bait") || null,
        caughtAt,

        lakeId: finalLakeId,
        lakeName,

        tripId,
        tripTitle,

        imageUrl,
        imagePath,

        note: getFormValue(formData, "note") || null,

        isPublic,
        rankingStatus: isPublic ? "approved" : "pending",
      },
    });

    await checkAndUnlockAchievements(userId);

    return NextResponse.json(fishingCatch, { status: 201 });
  } catch (error) {
    if (imagePath) {
      await supabase.storage.from(CATCH_IMAGES_BUCKET).remove([imagePath]);
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Nie udało się zapisać połowu.",
      },
      { status: 500 }
    );
  }
}

async function getTripData(tripIdValue: unknown, userId: string) {
  const selectedTripId = String(tripIdValue || "").trim();

  if (!selectedTripId) {
    return {
      tripId: null,
      tripTitle: null,
    };
  }

  const trip = await prisma.fishingTrip.findUnique({
    where: {
      id: selectedTripId,
    },
    select: {
      id: true,
      title: true,
      userId: true,
    },
  });

  if (!trip || trip.userId !== userId) {
    return {
      tripId: null,
      tripTitle: null,
    };
  }

  return {
    tripId: trip.id,
    tripTitle: trip.title,
  };
}