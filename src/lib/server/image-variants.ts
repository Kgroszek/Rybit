import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  IMAGE_VARIANT_SPECS,
  getAllImageVariantObjectPaths,
  getImageVariantObjectPath,
  type ImageVariantName,
} from "@/lib/image-variant-paths";

type ImageSource = Blob | Buffer | Uint8Array;

async function toBuffer(source: ImageSource) {
  if (Buffer.isBuffer(source)) {
    return source;
  }

  if (source instanceof Uint8Array) {
    return Buffer.from(source);
  }

  return Buffer.from(await source.arrayBuffer());
}

export async function uploadImageVariants({
  supabase,
  bucket,
  originalPath,
  source,
}: {
  supabase: SupabaseClient;
  bucket: string;
  originalPath: string;
  source: ImageSource;
}) {
  const input = await toBuffer(source);
  const uploaded: string[] = [];

  for (const [variant, spec] of Object.entries(IMAGE_VARIANT_SPECS) as Array<
    [ImageVariantName, (typeof IMAGE_VARIANT_SPECS)[ImageVariantName]]
  >) {
    try {
      const output = await sharp(input, { failOn: "none" })
        .rotate()
        .resize({
          width: spec.width,
          height: spec.width,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: spec.quality })
        .toBuffer();

      const variantPath = getImageVariantObjectPath(originalPath, variant);

      const { error } = await supabase.storage
        .from(bucket)
        .upload(variantPath, output, {
          cacheControl: "31536000",
          upsert: true,
          contentType: "image/webp",
        });

      if (error) {
        console.warn(
          `[image-variants] Nie udało się zapisać ${variantPath}:`,
          error.message
        );
        continue;
      }

      uploaded.push(variantPath);
    } catch (error) {
      console.warn(
        `[image-variants] Nie udało się przygotować wariantu ${variant}:`,
        error
      );
    }
  }

  return uploaded;
}

export async function removeImageVariants({
  supabase,
  bucket,
  originalPath,
}: {
  supabase: SupabaseClient;
  bucket: string;
  originalPath: string;
}) {
  const paths = getAllImageVariantObjectPaths(originalPath);
  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    console.warn(
      `[image-variants] Nie udało się usunąć wariantów ${originalPath}:`,
      error.message
    );
  }
}
