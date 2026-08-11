"use client";

import { useMemo, useState } from "react";

type ShareCatch = {
  id: string;
  fishName: string;
  isPublic: boolean;
};

type CatchCardFormat = "post" | "story";

export function CatchShareDialog({
  fishingCatch,
  onClose,
}: {
  fishingCatch: ShareCatch;
  onClose: () => void;
}) {
  const [format, setFormat] = useState<CatchCardFormat>("post");
  const [isWorking, setIsWorking] = useState(false);
  const [message, setMessage] = useState("");

  const cardUrl = useMemo(
    () => `/api/catches/${fishingCatch.id}/card?format=${format}`,
    [fishingCatch.id, format]
  );

  const publicSharePath = `/polowy/publiczne/${fishingCatch.id}`;

  async function getCardFile() {
    const response = await fetch(cardUrl, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));

      throw new Error(
        typeof data?.message === "string"
          ? data.message
          : "Nie udało się wygenerować karty."
      );
    }

    const blob = await response.blob();
    const safeFishName = fishingCatch.fishName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ł/g, "l")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return new File(
      [blob],
      `rybio-${safeFishName || "polow"}-${format}.png`,
      {
        type: "image/png",
      }
    );
  }

  async function handleDownload() {
    setIsWorking(true);
    setMessage("");

    try {
      const file = await getCardFile();
      const objectUrl = URL.createObjectURL(file);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = file.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 1000);

      setMessage("Karta PNG została przygotowana.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się pobrać karty."
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function handleShare() {
    setIsWorking(true);
    setMessage("");

    try {
      const file = await getCardFile();
      const absolutePublicUrl = new URL(
        publicSharePath,
        window.location.origin
      ).toString();

      if (
        navigator.share &&
        navigator.canShare?.({
          files: [file],
        })
      ) {
        await navigator.share({
          title: `${fishingCatch.fishName} — mój połów w Rybio`,
          text: fishingCatch.isPublic
            ? "Zobacz mój połów zapisany w Rybio."
            : "Mój połów zapisany w Rybio.",
          files: [file],
          ...(fishingCatch.isPublic
            ? {
                url: absolutePublicUrl,
              }
            : {}),
        });

        return;
      }

      if (fishingCatch.isPublic && navigator.share) {
        await navigator.share({
          title: `${fishingCatch.fishName} — mój połów w Rybio`,
          text: "Zobacz mój połów zapisany w Rybio.",
          url: absolutePublicUrl,
        });

        return;
      }

      if (fishingCatch.isPublic && navigator.clipboard) {
        await navigator.clipboard.writeText(absolutePublicUrl);
        setMessage("Link do publicznego połowu został skopiowany.");
        return;
      }

      await handleDownload();
      setMessage(
        "Twoja przeglądarka nie obsługuje bezpośredniego udostępniania. Karta została pobrana."
      );
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      setMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się udostępnić karty."
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function handleCopyLink() {
    if (!fishingCatch.isPublic) {
      return;
    }

    setMessage("");

    try {
      const absolutePublicUrl = new URL(
        publicSharePath,
        window.location.origin
      ).toString();

      await navigator.clipboard.writeText(absolutePublicUrl);
      setMessage("Link został skopiowany.");
    } catch {
      setMessage("Nie udało się skopiować linku.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-[30px] bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 p-5 backdrop-blur sm:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
              Karta połowu
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Pochwal się swoim połowem
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Pobierz gotową grafikę albo udostępnij ją bezpośrednio z telefonu.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 transition hover:bg-slate-200"
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0">
            <div className="mb-4 flex rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setFormat("post")}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                  format === "post"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Post 4:5
              </button>

              <button
                type="button"
                onClick={() => setFormat("story")}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                  format === "story"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Story 9:16
              </button>
            </div>

            <div
              className={`mx-auto overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm ${
                format === "story"
                  ? "max-w-[360px]"
                  : "max-w-[560px]"
              }`}
            >
              <img
                key={cardUrl}
                src={cardUrl}
                alt={`Karta połowu: ${fishingCatch.fishName}`}
                className="h-auto w-full"
              />
            </div>
          </div>

          <aside>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-black text-slate-950">
                Gotowe do publikacji
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {format === "post"
                  ? "Format 1080 × 1350 px dobrze sprawdzi się jako post na Instagramie i Facebooku."
                  : "Format 1080 × 1920 px jest przygotowany pod relacje i Stories."}
              </p>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={isWorking}
                  className="flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {isWorking ? "Przygotowywanie…" : "Udostępnij"}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isWorking}
                  className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
                >
                  Pobierz PNG
                </button>

                {fishingCatch.isPublic && (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex w-full items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-100"
                  >
                    Kopiuj link do połowu
                  </button>
                )}
              </div>

              {!fishingCatch.isPublic && (
                <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-sm font-black text-amber-800">
                    Połów jest prywatny
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    Możesz pobrać lub wysłać samą grafikę. Publiczny link nie
                    zostanie utworzony, dopóki połów pozostaje prywatny.
                  </p>
                </div>
              )}

              {message && (
                <p className="mt-4 rounded-2xl bg-white p-3 text-xs font-bold leading-5 text-slate-600">
                  {message}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
