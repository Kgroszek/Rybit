"use client";

import { useEffect, useMemo, useState } from "react";

import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type LakeGalleryProps = {
  lakeName: string;
  images: string[];
};

export function LakeGallery({ lakeName, images }: LakeGalleryProps) {
  const [brokenImages, setBrokenImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const visibleImages = useMemo(
    () => images.filter((image) => !brokenImages.includes(image)),
    [brokenImages, images]
  );

  const previewImage =
    previewIndex !== null ? visibleImages[previewIndex] ?? null : null;

  function markImageAsBroken(image: string) {
    setBrokenImages((current) =>
      current.includes(image) ? current : [...current, image]
    );
  }

  function closePreview() {
    setPreviewIndex(null);
  }

  function showPrevious() {
    setPreviewIndex((current) => {
      if (current === null || visibleImages.length === 0) return null;
      return current === 0 ? visibleImages.length - 1 : current - 1;
    });
  }

  function showNext() {
    setPreviewIndex((current) => {
      if (current === null || visibleImages.length === 0) return null;
      return current === visibleImages.length - 1 ? 0 : current + 1;
    });
  }

  useEffect(() => {
    if (previewIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePreview();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewIndex, visibleImages.length]);

  if (visibleImages.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-panel border border-border bg-surface-muted sm:min-h-[380px]">
        <div className="max-w-sm px-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary">
            <FishIcon className="h-7 w-7" />
          </div>
          <p className="mt-4 font-display text-lg font-bold text-text">
            Brak zdjęć łowiska
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Do profilu nie dodano jeszcze zdjęć. Pozostałe informacje są dostępne poniżej.
          </p>
        </div>
      </div>
    );
  }

  const secondaryImages = visibleImages.slice(1, 3);

  return (
    <>
      <section className="relative overflow-hidden rounded-panel border border-border bg-surface shadow-card">
        <div
          className={cn(
            "grid min-h-[300px] gap-1 bg-surface-muted sm:min-h-[420px]",
            secondaryImages.length > 0 && "lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]"
          )}
        >
          <GalleryButton
            image={visibleImages[0]}
            alt={`Główne zdjęcie łowiska ${lakeName}`}
            onClick={() => setPreviewIndex(0)}
            onError={() => markImageAsBroken(visibleImages[0])}
            className="h-[300px] sm:h-[420px] lg:h-full"
          />

          {secondaryImages.length > 0 && (
            <div className="hidden gap-1 lg:grid lg:grid-rows-2">
              {secondaryImages.map((image, index) => (
                <GalleryButton
                  key={image}
                  image={image}
                  alt={`Zdjęcie ${index + 2} łowiska ${lakeName}`}
                  onClick={() => setPreviewIndex(index + 1)}
                  onError={() => markImageAsBroken(image)}
                  className="min-h-0"
                />
              ))}
            </div>
          )}
        </div>

        <div className="absolute bottom-4 right-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewIndex(0)}
            className="bg-surface/95 backdrop-blur"
          >
            Zobacz zdjęcia
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-text-secondary">
              {visibleImages.length}
            </span>
          </Button>
        </div>
      </section>

      {previewImage && previewIndex !== null && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-navy-950/90 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria łowiska ${lakeName}`}
          onClick={closePreview}
        >
          <div
            className="relative flex max-h-[94vh] w-full max-w-7xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closePreview}
              className="absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-surface/95 text-text shadow-card transition hover:bg-surface sm:right-4 sm:top-4"
              aria-label="Zamknij galerię"
            >
              <CloseIcon className="h-5 w-5" />
            </button>

            {visibleImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/95 text-text shadow-card transition hover:bg-surface sm:left-4"
                  aria-label="Poprzednie zdjęcie"
                >
                  <ArrowSmallRightIcon className="h-5 w-5 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/95 text-text shadow-card transition hover:bg-surface sm:right-4"
                  aria-label="Następne zdjęcie"
                >
                  <ArrowSmallRightIcon className="h-5 w-5" />
                </button>
              </>
            )}

            <img
              src={previewImage}
              alt={`Zdjęcie ${previewIndex + 1} łowiska ${lakeName}`}
              onError={() => markImageAsBroken(previewImage)}
              className="max-h-[90vh] max-w-full rounded-card object-contain shadow-card-hover"
            />

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-navy-950/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              {previewIndex + 1} / {visibleImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type GalleryButtonProps = {
  image: string;
  alt: string;
  onClick: () => void;
  onError: () => void;
  className?: string;
};

function GalleryButton({
  image,
  alt,
  onClick,
  onError,
  className,
}: GalleryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("group relative overflow-hidden bg-surface-muted text-left", className)}
    >
      <img
        src={image}
        alt={alt}
        onError={onError}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
      />
      <span className="absolute inset-0 bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/10" />
    </button>
  );
}
