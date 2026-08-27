"use client";

import {
  useEffect,
  useState,
} from "react";

import styles from "@/components/lake-websites/templates/wild-water/WildWater.module.css";

export function WildWaterGalleryViewer({
  images,
}: {
  images: string[];
}) {
  const cleanImages = images.filter(Boolean);
  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);

  const activeImage =
    activeIndex === null
      ? null
      : cleanImages[activeIndex];

  function close() {
    setActiveIndex(null);
  }

  function previous() {
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

  function next() {
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
        previous();
      }

      if (event.key === "ArrowRight") {
        next();
      }
    }

    const oldOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        oldOverflow;
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [activeIndex, cleanImages.length]);

  if (cleanImages.length === 0) {
    return null;
  }

  return (
    <>
      <div className={styles.filmstrip}>
        {cleanImages
          .slice(0, 12)
          .map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={styles.film}
              onClick={() =>
                setActiveIndex(index)
              }
              aria-label={`Otwórz zdjęcie ${
                index + 1
              }`}
            >
              <img src={image} alt="" />
              <span>
                {String(index + 1).padStart(
                  2,
                  "0"
                )}
              </span>
            </button>
          ))}
      </div>

      {activeImage &&
      activeIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Zdjęcie ${
            activeIndex + 1
          } z ${cleanImages.length}`}
          className={styles.lightbox}
          onMouseDown={close}
        >
          <div
            className={styles.lightboxInner}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={activeImage}
              alt=""
              className={styles.lightboxImage}
            />

            <button
              type="button"
              onClick={close}
              className={styles.lightboxClose}
              aria-label="Zamknij galerię"
            >
              ×
            </button>

            {cleanImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={previous}
                  className={`${styles.lightboxArrow} ${styles.lightboxPrev}`}
                  aria-label="Poprzednie zdjęcie"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={next}
                  className={`${styles.lightboxArrow} ${styles.lightboxNext}`}
                  aria-label="Następne zdjęcie"
                >
                  ›
                </button>
              </>
            ) : null}

            <span className={styles.lightboxCount}>
              {activeIndex + 1} /{" "}
              {cleanImages.length}
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}
