"use client";

import { useMemo, useState } from "react";

import { resolveStoredCatchScore } from "@/lib/catch-score";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { Button } from "@/components/ui/Button";

type ShareCatch = {
  id: string;
  fishName: string;
  weight: number | null;
  length: number | null;
  isPublic: boolean;
  catchScore?: number | null;
  catchScoreTier?: string | null;
  catchScoreSource?: string | null;
  catchScoreVersion?: number | null;
};

type CatchCardFormat = "post" | "story";
type CatchCardVariant = "collector" | "clean";

export function CatchShareDialog({
  fishingCatch,
  onClose,
}: {
  fishingCatch: ShareCatch;
  onClose: () => void;
}) {
  const [format, setFormat] = useState<CatchCardFormat>("post");
  const [variant, setVariant] = useState<CatchCardVariant>("collector");
  const [isWorking, setIsWorking] = useState(false);
  const [message, setMessage] = useState("");

  const score = useMemo(
    () => resolveStoredCatchScore({ ...fishingCatch, catchScoreVersion: fishingCatch.catchScoreVersion ?? null }),
    [fishingCatch]
  );

  const cardUrl = useMemo(
    () => `/api/catches/${fishingCatch.id}/card?format=${format}&variant=${variant}`,
    [fishingCatch.id, format, variant]
  );
  const publicSharePath = `/polowy/publiczne/${fishingCatch.id}`;

  async function getCardFile() {
    const response = await fetch(cardUrl, { credentials: "include", cache: "no-store" });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(typeof data?.message === "string" ? data.message : "Nie udało się wygenerować karty.");
    }

    const blob = await response.blob();
    const safeFishName = fishingCatch.fishName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ł/g, "l")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return new File([blob], `rybio-${safeFishName || "polow"}-${variant}-${format}.png`, { type: "image/png" });
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
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setMessage("Karta PNG została przygotowana.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udało się pobrać karty.");
    } finally {
      setIsWorking(false);
    }
  }

  async function handleShare() {
    setIsWorking(true);
    setMessage("");

    try {
      const file = await getCardFile();
      const absolutePublicUrl = new URL(publicSharePath, window.location.origin).toString();

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${fishingCatch.fishName} — Rybio Score ${score.score ?? "—"}/100`,
          text: fishingCatch.isPublic ? "Zobacz mój połów zapisany w Rybio." : "Mój połów zapisany w Rybio.",
          files: [file],
          ...(fishingCatch.isPublic ? { url: absolutePublicUrl } : {}),
        });
        return;
      }

      if (fishingCatch.isPublic && navigator.share) {
        await navigator.share({
          title: `${fishingCatch.fishName} — Rybio Score ${score.score ?? "—"}/100`,
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
      setMessage("Przeglądarka nie obsługuje bezpośredniego udostępniania. Karta została pobrana.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage(error instanceof Error ? error.message : "Nie udało się udostępnić karty.");
    } finally {
      setIsWorking(false);
    }
  }

  async function handleCopyLink() {
    if (!fishingCatch.isPublic) return;

    try {
      const absolutePublicUrl = new URL(publicSharePath, window.location.origin).toString();
      await navigator.clipboard.writeText(absolutePublicUrl);
      setMessage("Link został skopiowany.");
    } catch {
      setMessage("Nie udało się skopiować linku.");
    }
  }

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-navy-950/75 p-3 backdrop-blur-sm sm:p-5" onMouseDown={onClose}>
      <div className="max-h-[94dvh] w-full max-w-6xl overflow-y-auto rounded-modal border border-border bg-surface shadow-2xl" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Karta połowu">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-surface/95 p-5 backdrop-blur sm:p-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">Rybio Catch Card</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] text-text">{fishingCatch.fishName}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-navy-950 px-3 py-1.5 text-sm font-bold text-white">Rybio Score {score.score ?? "—"}/100</span>
              <span className="rounded-full border border-primary-200 bg-primary-100 px-3 py-1.5 text-xs font-bold text-primary-800">{score.tierLabel}</span>
            </div>
            <p className="mt-3 max-w-2xl text-xs leading-5 text-text-secondary">{score.explanation}</p>
          </div>

          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-muted text-text-secondary transition hover:bg-surface-hover hover:text-text" aria-label="Zamknij">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              <SegmentedControl
                value={variant}
                options={[{ value: "collector", label: "Kolekcjonerska" }, { value: "clean", label: "Klasyczna" }]}
                onChange={(value) => setVariant(value as CatchCardVariant)}
              />
              <SegmentedControl
                value={format}
                options={[{ value: "post", label: "Post 4:5" }, { value: "story", label: "Story 9:16" }]}
                onChange={(value) => setFormat(value as CatchCardFormat)}
              />
            </div>

            <div className={`mx-auto overflow-hidden rounded-card border border-border bg-surface-muted shadow-card ${format === "story" ? "max-w-[360px]" : "max-w-[610px]"}`}>
              <img key={cardUrl} src={cardUrl} alt={`Karta połowu: ${fishingCatch.fishName}`} className="h-auto w-full" />
            </div>
          </div>

          <aside>
            <div className="rounded-card border border-border bg-surface-muted p-5">
              <h3 className="font-display text-lg font-bold text-text">Gotowe do publikacji</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {format === "post" ? "1080 × 1350 px — format 4:5 do postów." : "1080 × 1920 px — format 9:16 do relacji i Stories."}
              </p>

              <div className="mt-4 rounded-control border border-primary-200 bg-primary-100 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-primary">Punktacja</p>
                <p className="mt-2 font-display text-3xl font-extrabold text-primary-950">{score.score ?? "—"}<span className="text-base text-primary-500"> / 100</span></p>
                <p className="mt-1 text-sm font-bold text-primary-700">{score.tierLabel}</p>
              </div>

              <div className="mt-5 space-y-3">
                <Button fullWidth onClick={handleShare} isLoading={isWorking} loadingLabel="Przygotowywanie…">Udostępnij</Button>
                <Button fullWidth variant="outline" onClick={handleDownload} disabled={isWorking}>Pobierz PNG</Button>
                {fishingCatch.isPublic && (
                  <Button fullWidth variant="secondary" onClick={handleCopyLink}>Kopiuj link do połowu</Button>
                )}
              </div>

              {!fishingCatch.isPublic && (
                <div className="mt-5 rounded-control border border-warning-border bg-warning-subtle p-4">
                  <p className="text-sm font-bold text-warning-foreground">Połów jest prywatny</p>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">Kartę możesz pobrać lub wysłać jako plik. Publiczny link jest dostępny tylko dla publicznych połowów.</p>
                </div>
              )}

              {message && <p className="mt-4 rounded-control bg-surface p-3 text-xs font-semibold leading-5 text-text-secondary">{message}</p>}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex rounded-control bg-surface-muted p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`min-h-9 flex-1 rounded-xl px-3 text-xs font-bold transition ${value === option.value ? "bg-surface text-primary shadow-sm" : "text-text-muted hover:text-text"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
