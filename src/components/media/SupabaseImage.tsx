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

export function SupabaseImage({
  src,
  variant,
  onError,
  ...props
}: SupabaseImageProps) {
  const preferredSrc = useMemo(
    () => (variant ? getImageVariantUrl(src, variant) : src),
    [src, variant]
  );

  const [fallbackToOriginal, setFallbackToOriginal] = useState(false);

  useEffect(() => {
    setFallbackToOriginal(false);
  }, [preferredSrc]);

  const finalSrc = fallbackToOriginal ? src : preferredSrc;

  return (
    <Image
      {...props}
      src={finalSrc}
      onError={(event) => {
        if (!fallbackToOriginal && preferredSrc !== src) {
          setFallbackToOriginal(true);
        }

        onError?.(event);
      }}
    />
  );
}
