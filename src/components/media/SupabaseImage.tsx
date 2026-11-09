"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";

import {
  getImageVariantUrl,
  type ImageVariantName,
} from "@/lib/image-variant-paths";

type SupabaseImageProps = Omit<ImageProps, "src"> & {
  src: string;
  variant?: ImageVariantName;
};

/**
 * Zapamiętujemy niedostępne warianty podczas bieżącej sesji strony.
 * Jeżeli ten sam stary obraz pojawia się np. na kilku kartach,
 * nie próbujemy pobierać brakującego wariantu wielokrotnie.
 */
const unavailableVariantUrls = new Set<string>();

export function SupabaseImage({
  src,
  variant,
  onError,
  unoptimized,
  ...props
}: SupabaseImageProps) {
  const preferredSrc = useMemo(
    () => (variant ? getImageVariantUrl(src, variant) : src),
    [src, variant]
  );

  const hasSeparateVariant = preferredSrc !== src;

  const [fallbackToOriginal, setFallbackToOriginal] = useState(() =>
    hasSeparateVariant && unavailableVariantUrls.has(preferredSrc)
  );

  useEffect(() => {
    setFallbackToOriginal(
      hasSeparateVariant && unavailableVariantUrls.has(preferredSrc)
    );
  }, [hasSeparateVariant, preferredSrc]);

  const finalSrc = fallbackToOriginal ? src : preferredSrc;

  /**
   * Wariant thumb/medium jest już wcześniej:
   * - zmniejszony,
   * - skompresowany,
   * - zapisany jako WebP.
   *
   * Nie ma sensu przepuszczać go jeszcze raz przez /_next/image.
   * Co ważniejsze: gdy stary wariant nie istnieje, błąd 400 pochodzi
   * bezpośrednio z Supabase i nie generuje w terminalu Next.js komunikatu
   * "upstream image response failed".
   *
   * Po fallbacku do oryginału wracamy do zwykłego zachowania Next/Image.
   */
  const usePreparedVariant =
    hasSeparateVariant && !fallbackToOriginal;

  return (
    <Image
      {...props}
      src={finalSrc}
      unoptimized={usePreparedVariant ? true : unoptimized}
      onError={(event) => {
        if (usePreparedVariant) {
          unavailableVariantUrls.add(preferredSrc);
          setFallbackToOriginal(true);
          return;
        }

        onError?.(event);
      }}
    />
  );
}
