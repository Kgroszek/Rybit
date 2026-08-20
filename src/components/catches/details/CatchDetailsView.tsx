import type { ReactNode } from "react";
import Link from "next/link";

import type { CatchDetailsData, CatchDetailsMode } from "@/components/catches/types";
import { CatchDetailsActions } from "@/components/catches/details/CatchDetailsActions";
import { CatchScoreBadge } from "@/components/catches/CatchScoreBadge";
import { getMethodLabel, formatCatchDateLong } from "@/components/catches/utils";
import { resolveStoredCatchScore } from "@/lib/catch-score";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FishIcon } from "@/components/icons/FishIcon";

export function CatchDetailsView({
  fishingCatch,
  mode,
}: {
  fishingCatch: CatchDetailsData;
  mode: CatchDetailsMode;
}) {
  const score = resolveStoredCatchScore({
    ...fishingCatch,
    catchScoreVersion: fishingCatch.catchScoreVersion ?? null,
  });
  const backHref = mode === "authenticated" ? "/polowy" : "/";
  const backLabel = mode === "authenticated" ? "Wróć do połowów" : "Wróć do Rybio";

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link href={backHref} className="inline-flex text-sm font-bold text-primary transition hover:text-primary-hover">
        ← {backLabel}
      </Link>

      <article className="mt-5 overflow-hidden rounded-panel border border-border bg-surface shadow-card">
        <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)]">
          <div className="relative min-h-[360px] bg-surface-muted sm:min-h-[480px] lg:min-h-[680px]">
            {fishingCatch.imageUrl ? (
              <img
                src={fishingCatch.imageUrl}
                alt={`Połów: ${fishingCatch.fishName}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(145deg,var(--rybio-primary-50),var(--rybio-surface-muted))] text-primary">
                <FishIcon className="h-20 w-20 -scale-x-100 opacity-65" />
              </div>
            )}

            <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
              <CatchStatus fishingCatch={fishingCatch} />
            </div>

            <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
              <CatchScoreBadge fishingCatch={fishingCatch} size="lg" />
            </div>
          </div>

          <div className="flex min-w-0 flex-col p-5 sm:p-7 lg:p-9">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                {mode === "public" ? "Publiczny połów" : "Szczegóły połowu"}
              </p>

              <h1 className="mt-2 font-display text-4xl font-extrabold tracking-[-0.04em] text-text sm:text-5xl">
                {fishingCatch.fishName}
              </h1>

              <p className="mt-3 text-sm font-medium text-text-muted">
                {formatCatchDateLong(fishingCatch.caughtAt)}
              </p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <Metric label="Waga" value={fishingCatch.weight !== null ? `${fishingCatch.weight.toFixed(2)} kg` : "Brak danych"} emphasized />
              <Metric label="Długość" value={fishingCatch.length !== null ? `${fishingCatch.length.toFixed(0)} cm` : "Brak danych"} />
            </div>

            <Card variant="dark" className="mt-6 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-aqua-300">Rybio Score</p>
                  <p className="mt-2 font-display text-4xl font-extrabold text-white">
                    {score.score ?? "—"}<span className="ml-1 text-base text-text-on-dark-muted">/100</span>
                  </p>
                  <p className="mt-1 text-sm font-bold text-aqua-200">{score.tierLabel}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-text-on-dark-muted">{score.explanation}</p>
            </Card>

            <div className="mt-6 divide-y divide-border">
              <InfoRow label="Metoda" value={getMethodLabel(fishingCatch.method)} />
              {fishingCatch.bait && <InfoRow label="Przynęta" value={fishingCatch.bait} />}
              {fishingCatch.lakeName && (
                <InfoRow
                  label="Łowisko"
                  value={
                    fishingCatch.lakeSlug ? (
                      <Link
                        href={mode === "authenticated" ? `/lowiska/${fishingCatch.lakeSlug}` : `/lowiska-w-polsce/${fishingCatch.lakeSlug}`}
                        className="text-primary transition hover:text-primary-hover hover:underline"
                      >
                        {fishingCatch.lakeName}
                      </Link>
                    ) : fishingCatch.lakeName
                  }
                />
              )}
              {mode === "authenticated" && fishingCatch.tripTitle && <InfoRow label="Wyprawa" value={fishingCatch.tripTitle} />}
              {fishingCatch.userName && (
                <InfoRow
                  label="Wędkarz"
                  value={
                    <Link href={`/wedkarze/${fishingCatch.userId}`} className="text-primary transition hover:text-primary-hover hover:underline">
                      {fishingCatch.userName}
                    </Link>
                  }
                />
              )}
            </div>

            {mode === "authenticated" && fishingCatch.note && (
              <div className="mt-6 rounded-control border border-border bg-surface-muted p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-text-muted">Prywatna notatka</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-text-secondary">{fishingCatch.note}</p>
              </div>
            )}

            <div className="mt-auto pt-7">
              <CatchDetailsActions fishingCatch={fishingCatch} mode={mode} />
            </div>
          </div>
        </div>
      </article>

      {mode === "public" && (
        <Card className="mt-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="font-display text-lg font-bold text-text">Zapisuj własne połowy w Rybio</p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">Buduj dziennik, generuj karty połowów i porównuj wyniki dzięki Rybio Score.</p>
          </div>
          <Link href="/register" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-control bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-hover">
            Załóż darmowe konto
          </Link>
        </Card>
      )}
    </div>
  );
}

function CatchStatus({ fishingCatch }: { fishingCatch: CatchDetailsData }) {
  if (!fishingCatch.isPublic) return <Badge variant="neutral" size="md">Prywatny</Badge>;
  if (fishingCatch.rankingStatus === "approved") return <Badge variant="success" size="md">W rankingu</Badge>;
  if (["hidden", "rejected"].includes(fishingCatch.rankingStatus)) return <Badge variant="danger" size="md">Odrzucony</Badge>;
  return <Badge variant="warning" size="md">Weryfikacja</Badge>;
}

function Metric({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className={`rounded-card border p-4 ${emphasized ? "border-primary bg-primary text-white" : "border-border bg-surface-muted text-text"}`}>
      <p className={`text-[11px] font-bold uppercase tracking-[0.13em] ${emphasized ? "text-primary-100" : "text-text-muted"}`}>{label}</p>
      <p className="mt-2 font-display text-xl font-extrabold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <p className="text-sm text-text-muted">{label}</p>
      <div className="max-w-[65%] break-words text-right text-sm font-bold text-text">{value}</div>
    </div>
  );
}
