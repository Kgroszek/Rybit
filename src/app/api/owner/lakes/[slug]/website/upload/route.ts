import { randomUUID } from "node:crypto";

import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "lake-website-images";
const MAX_FILE_SIZE = 8 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: RouteProps
) {
  const { slug } = await params;

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

  const ownerLake = await prisma.lakeOwner.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      canEditLake: true,
      lake: {
        slug,
      },
    },
    select: {
      lakeId: true,
    },
  });

  if (!ownerLake) {
    return NextResponse.json(
      { message: "Brak uprawnień do tego łowiska." },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json(
      { message: "Nie wybrano zdjęcia." },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.has(image.type)) {
    return NextResponse.json(
      { message: "Dozwolone formaty: JPG, PNG, WebP, AVIF." },
      { status: 400 }
    );
  }

  if (image.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { message: "Zdjęcie może mieć maksymalnie 8 MB." },
      { status: 400 }
    );
  }

  try {
    const storage = getStorageClient();
    await ensureBucket(storage);

    const extension = getExtension(image.type);
    const path = `${ownerLake.lakeId}/${randomUUID()}.${extension}`;

    const { error } = await storage.storage
      .from(BUCKET)
      .upload(path, image, {
        contentType: image.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      console.error("[lake-website-upload]", error);

      return NextResponse.json(
        { message: "Nie udało się przesłać zdjęcia." },
        { status: 500 }
      );
    }

    const { data } = storage.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return NextResponse.json({
      url: data.publicUrl,
      path,
    });
  } catch (error) {
    console.error("[lake-website-upload]", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Nie udało się przesłać zdjęcia.",
      },
      { status: 500 }
    );
  }
}

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Brakuje NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createSupabaseAdminClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function ensureBucket(
  client: ReturnType<typeof getStorageClient>
) {
  const { data: buckets, error: listError } =
    await client.storage.listBuckets();

  if (listError) {
    throw new Error("Nie udało się sprawdzić bucketu zdjęć stron.");
  }

  if (buckets.some((bucket) => bucket.name === BUCKET)) {
    return;
  }

  const { error } = await client.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: [...ALLOWED_TYPES],
  });

  if (error) {
    throw new Error("Nie udało się utworzyć bucketu zdjęć stron.");
  }
}

function getExtension(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/avif") return "avif";
  return "jpg";
}
