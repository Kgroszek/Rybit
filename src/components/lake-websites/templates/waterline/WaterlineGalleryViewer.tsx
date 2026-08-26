"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import styles from "@/components/lake-websites/templates/waterline/WaterlineGallery.module.css";

export function WaterlineGalleryViewer({
  images,
}: {
  images: string[];
}) {
  const cleanImages = useMemo(
    () => images.filter(Boolean),
    [images]
  );

  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);

  const activeImage =
    activeIndex === null
      ? null
      : cleanImages[activeIndex];

  function close() {
    setActiveIndex(null);
  }

  function showPrevious() {
    setActiveIndex((current) => {
      if (
        current === null ||
        cleanImages.length === 0
      ) {
        return null;
      }

      return (
        (current - 1 + cleanImages.length) %
        cleanImages.length
      );
    });
  }

  function showNext() {
    setActiveIndex((current) => {
      if (
        current === null ||
        cleanImages.length === 0
      ) {
        return null;
      }

      return (
        (current + 1) %
        cleanImages.length
      );
    });
  }

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        close();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [activeIndex, cleanImages.length]);

  if (cleanImages.length === 0) {
    return null;
  }

  const mainImage = cleanImages[0];
  const secondImage = cleanImages[1];
  const thirdImage =
    cleanImages[2] || cleanImages[1];

  return (
    <>
      {cleanImages.length === 1 ? (
        <div className={styles.single}>
          <GalleryButton
            src={mainImage}
            label="Otwórz zdjęcie"
            onClick={() =>
              setActiveIndex(0)
            }
          />
        </div>
      ) : (
        <div className={styles.gallery}>
          <div className={styles.main}>
            <GalleryButton
              src={mainImage}
              label="Otwórz zdjęcie główne"
              onClick={() =>
                setActiveIndex(0)
              }
              showZoom
            />
          </div>

          <div className={styles.side}>
            <div className={styles.sideTile}>
              <GalleryButton
                src={secondImage}
                label="Otwórz drugie zdjęcie"
                onClick={() =>
                  setActiveIndex(1)
                }
              />
            </div>

            <div className={styles.sideTile}>
              <GalleryButton
                src={thirdImage}
                label="Otwórz kolejne zdjęcie"
                onClick={() =>
                  setActiveIndex(
                    cleanImages.length > 2
                      ? 2
                      : 1
                  )
                }
              />

              {cleanImages.length > 3 ? (
                <span
                  className={styles.allPhotos}
                >
                  Zobacz wszystkie zdjęcia
                </span>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {activeImage &&
      activeIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Zdjęcie ${
            activeIndex + 1
          } z ${cleanImages.length}`}
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#08100D]/95 p-4 backdrop-blur-sm sm:p-7"
          onMouseDown={close}
        >
          <div
            className="relative flex h-full max-h-[92vh] w-full max-w-[1400px] items-center justify-center"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={activeImage}
              alt=""
              className="max-h-full max-w-full object-contain"
            />

            <button
              type="button"
              onClick={close}
              aria-label="Zamknij galerię"
              className="absolute right-0 top-0 grid h-11 w-11 place-items-center rounded-full bg-white text-[24px] leading-none text-[#16211D] shadow-xl sm:right-2 sm:top-2"
            >
              ×
            </button>

            {cleanImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  aria-label="Poprzednie zdjęcie"
                  className="absolute left-0 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-2xl text-[#16211D] shadow-xl sm:left-2"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Następne zdjęcie"
                  className="absolute right-0 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-2xl text-[#16211D] shadow-xl sm:right-2"
                >
                  ›
                </button>
              </>
            ) : null}

            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-bold text-white/90">
              {activeIndex + 1} /{" "}
              {cleanImages.length}
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}

function GalleryButton({
  src,
  label,
  onClick,
  showZoom = false,
}: {
  src: string;
  label: string;
  onClick: () => void;
  showZoom?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={styles.imageButton}
    >
      <img
        src={src}
        alt=""
        className={styles.image}
      />

      {showZoom ? (
        <span
          className={styles.zoomPill}
        >
          Powiększ
        </span>
      ) : null}
    </button>
  );
}
