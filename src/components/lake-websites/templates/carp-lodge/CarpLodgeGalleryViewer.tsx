"use client";

import {
  useEffect,
  useState,
} from "react";

import styles from "@/components/lake-websites/templates/carp-lodge/CarpLodge.module.css";

export function CarpLodgeGalleryViewer({
  images,
}: {
  images: string[];
}) {
  const cleanImages =
    images.filter(Boolean);

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

    function onKeyDown(
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
      onKeyDown
    );

    return () => {
      document.body.style.overflow =
        oldOverflow;
      window.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [activeIndex, cleanImages.length]);

  if (cleanImages.length === 0) {
    return null;
  }

  return (
    <>
      <div className={styles.galleryTop}>
        <button
          type="button"
          className={styles.galleryBig}
          onClick={() => setActiveIndex(0)}
          aria-label="Otwórz pierwsze zdjęcie"
        >
          <img
            src={cleanImages[0]}
            alt=""
          />
          <span className={styles.galleryZoom}>
            Powiększ
          </span>
        </button>

        {cleanImages.length > 1 ? (
          <div className={styles.galleryStack}>
            {[1, 2].map((index) => {
              const image =
                cleanImages[index] ||
                cleanImages[1];

              return (
                <button
                  key={index}
                  type="button"
                  className={styles.gallerySmall}
                  onClick={() =>
                    setActiveIndex(
                      cleanImages[index]
                        ? index
                        : 1
                    )
                  }
                  aria-label={`Otwórz zdjęcie ${
                    index + 1
                  }`}
                >
                  <img src={image} alt="" />

                  {index === 2 &&
                  cleanImages.length > 3 ? (
                    <span
                      className={
                        styles.galleryAll
                      }
                    >
                      Zobacz wszystkie
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {activeImage &&
      activeIndex !== null ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Zdjęcie ${
            activeIndex + 1
          } z ${cleanImages.length}`}
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
