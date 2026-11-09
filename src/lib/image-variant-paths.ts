export type ImageVariantName = "thumb" | "medium";

export const IMAGE_VARIANT_SPECS = {
  thumb: {
    width: 320,
    quality: 70,
  },
  medium: {
    width: 768,
    quality: 75,
  },
} as const;

export function getImageVariantObjectPath(
  originalPath: string,
  variant: ImageVariantName
) {
  const cleanPath = originalPath.replace(/^\/+/, "");
  const withoutExtension = cleanPath.replace(/\.[^/.]+$/, "");

  return `_variants/${variant}/${withoutExtension}.webp`;
}

export function getAllImageVariantObjectPaths(originalPath: string) {
  return (Object.keys(IMAGE_VARIANT_SPECS) as ImageVariantName[]).map(
    (variant) => getImageVariantObjectPath(originalPath, variant)
  );
}

export function getImageVariantUrl(
  publicUrl: string,
  variant: ImageVariantName
) {
  try {
    const url = new URL(publicUrl);
    const marker = "/storage/v1/object/public/";
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex < 0) {
      return publicUrl;
    }

    const prefix = url.pathname.slice(0, markerIndex + marker.length);
    const storagePath = url.pathname.slice(markerIndex + marker.length);
    const firstSlash = storagePath.indexOf("/");

    if (firstSlash <= 0) {
      return publicUrl;
    }

    const bucket = storagePath.slice(0, firstSlash);
    const objectPath = storagePath.slice(firstSlash + 1);

    /**
     * Zdjęcia oczekujących zgłoszeń nie mają gwarantowanych wariantów.
     * Warianty są przygotowywane przy akceptacji łowiska.
     *
     * Nie próbujemy więc pobierać:
     * _variants/thumb/submissions/...
     *
     * Dzięki temu nie generujemy zbędnego requestu 400 przed fallbackiem.
     */
    if (
      objectPath.startsWith("submissions/") ||
      objectPath.startsWith("_variants/")
    ) {
      return publicUrl;
    }

    url.pathname = `${prefix}${bucket}/${getImageVariantObjectPath(
      objectPath,
      variant
    )}`;

    return url.toString();
  } catch {
    return publicUrl;
  }
}
