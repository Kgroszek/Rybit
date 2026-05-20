"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PublicProfileImagePreviewProps = {
  imageUrl: string;
  alt: string;
  className?: string;
  imageClassName?: string;
};

export function PublicProfileImagePreview({
  imageUrl,
  alt,
  className = "",
  imageClassName = "h-full w-full object-cover",
}: PublicProfileImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const modal =
    isOpen && isMounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/90 p-4"
            onClick={() => setIsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl font-black text-white transition hover:bg-white/20"
              aria-label="Zamknij podgląd zdjęcia"
            >
              ×
            </button>

            <img
              src={imageUrl}
              alt={alt}
              className="max-h-[90vh] max-w-[95vw] rounded-3xl object-contain shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            />
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`group block overflow-hidden text-left ${className}`}
        aria-label="Otwórz zdjęcie na pełnym ekranie"
      >
        <img
          src={imageUrl}
          alt={alt}
          className={`${imageClassName} transition duration-300 group-hover:scale-105`}
        />
      </button>

      {modal}
    </>
  );
}