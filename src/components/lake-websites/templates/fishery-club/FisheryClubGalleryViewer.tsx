"use client";

import {
  useEffect,
  useState,
} from "react";

import styles from "@/components/lake-websites/templates/fishery-club/FisheryClub.module.css";

export function FisheryClubGalleryViewer({
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

  const visible = cleanImages.slice(0, 4);

  return (
    <>
      <div
        className={[
          styles.galleryGrid,
          visible.length === 1
            ? styles.galleryGridSingle
            : visible.length === 2
              ? styles.galleryGridDouble
              : "",
        ].join(" ")}
      >
        {visible.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            className={styles.galleryItem}
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
              )}{" "}
              / VIEW
            </span>

            {index === 3 &&
            cleanImages.length > 4 ? (
              <strong
                className={
                  styles.galleryMore
                }
              >
                +{cleanImages.length - 4}
              </strong>
            ) : null}
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
              className={styles.lightboxClose}
              onClick={close}
              aria-label="Zamknij galerię"
            >
              ×
            </button>

            {cleanImages.length > 1 ? (
              <>
                <button
                  type="button"
                  className={`${styles.lightboxArrow} ${styles.lightboxPrev}`}
                  onClick={previous}
                  aria-label="Poprzednie zdjęcie"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className={`${styles.lightboxArrow} ${styles.lightboxNext}`}
                  onClick={next}
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
