import { randomUUID } from "node:crypto";

import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { isAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const BLOG_BUCKET = "blog-images";
const MAX_FILE_SIZE = 8 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    return NextResponse.json(
      { message: "Brak uprawnień." },
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
      {
        message:
          "Obsługiwane formaty zdjęć to JPG, PNG, WebP i AVIF.",
      },
      { status: 400 }
    );
  }

  if (image.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { message: "Zdjęcie może mieć maksymalnie 8 MB." },
      { status: 400 }
    );
  }

  const extension = getFileExtension(image);
  const now = new Date();
  const path = `${now.getFullYear()}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${randomUUID()}.${extension}`;

  try {
    const adminClient = getStorageClient();

    await ensureBlogBucket(adminClient);

    const { error } = await adminClient.storage
      .from(BLOG_BUCKET)
      .upload(path, image, {
        cacheControl: "31536000",
        contentType: image.type,
        upsert: false,
      });

    if (error) {
      console.error("[blog/upload]", error);

      return NextResponse.json(
        {
          message:
            "Nie udało się zapisać zdjęcia w Supabase Storage.",
        },
        { status: 500 }
      );
    }

    const { data } = adminClient.storage
      .from(BLOG_BUCKET)
      .getPublicUrl(path);

    return NextResponse.json({
      url: data.publicUrl,
      path,
    });
  } catch (error) {
    console.error("[blog/upload]", error);

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
      "Dodaj SUPABASE_SERVICE_ROLE_KEY do .env.local. Klucz jest używany wyłącznie po stronie serwera do uploadu zdjęć bloga."
    );
  }

  return createSupabaseAdminClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function ensureBlogBucket(
  client: ReturnType<typeof getStorageClient>
) {
  const { data: buckets, error: listError } =
    await client.storage.listBuckets();

  if (listError) {
    throw new Error("Nie udało się sprawdzić bucketu blog-images.");
  }

  if (buckets.some((bucket) => bucket.name === BLOG_BUCKET)) {
    return;
  }

  const { error } = await client.storage.createBucket(BLOG_BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: [...ALLOWED_TYPES],
  });

  if (error) {
    throw new Error(
      "Nie udało się utworzyć publicznego bucketu blog-images."
    );
  }
}

function getFileExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/avif") return "avif";
  return "jpg";
}