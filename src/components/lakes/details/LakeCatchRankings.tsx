"use client";

import Link from "next/link";
import { useState } from "react";

import { CatchReportButton } from "@/components/dashboard/CatchReportButton";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { LakeDto } from "@/lib/lakes";
import { LakeSection } from "./LakeSection";
import type { LakeDetailsMode } from "./types";
import { formatRankingDate } from "./utils";

type RankingItem = LakeDto["catchRankings"]["byWeight"][number];

type LakeCatchRankingsProps = {
  lake: LakeDto;
  mode: LakeDetailsMode;
};

export function LakeCatchRankings({ lake, mode }: LakeCatchRankingsProps) {
  const [preview, setPreview] = useState<RankingItem | null>(null);
  const hasWeight = lake.catchRankings.byWeight.length > 0;
  const hasLength = lake.catchRankings.byLength.length > 0;

  return (
    <>
      <LakeSection
        id="ranking"
        title="Ranking połowów"
        description="Publiczne i zatwierdzone połowy przypisane do tego łowiska."
        action={
          mode === "authenticated" ? (
            <ButtonLink href={`/polowy?new=1`} variant="secondary" size="sm">
              Dodaj połów
            </ButtonLink>
          ) : (
            <ButtonLink href="/register" variant="secondary" size="sm">
              Dołącz do Rybio
            </ButtonLink>
          )
        }
      >
        {!hasWeight && !hasLength ? (
          <EmptyState
            icon={<FishIcon className="h-6 w-6" />}
            title="Brak połowów w rankingu"
            description="Gdy pojawią się zatwierdzone publiczne połowy z wagą lub długością, zobaczysz je właśnie tutaj."
            className="min-h-44"
          />
        ) : (
          <div className="grid gap-5 2xl:grid-cols-2">
            <RankingList
              title="Najcięższe ryby"
              subtitle="TOP 5 według wagi"
              type="weight"
              items={lake.catchRankings.byWeight}
              mode={mode}
              onPreview={setPreview}
            />
            <RankingList
              title="Najdłuższe ryby"
              subtitle="TOP 5 według długości"
              type="length"
              items={lake.catchRankings.byLength}
              mode={mode}
              onPreview={setPreview}
            />
          </div>
        )}
      </LakeSection>

      {preview && (
        <div
          className="fixed inset-0 z-[1250] flex items-center justify-center bg-navy-950/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Połów: ${preview.fishName}`}
          onClick={() => setPreview(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-surface/95 text-text shadow-card hover:bg-surface"
              aria-label="Zamknij zdjęcie połowu"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            <img
              src={preview.imageUrl}
              alt={`Połów: ${preview.fishName}`}
              className="max-h-[88vh] max-w-full rounded-card object-contain shadow-card-hover"
            />
          </div>
        </div>
      )}
    </>
  );
}

type RankingListProps = {
  title: string;
  subtitle: string;
  type: "weight" | "length";
  items: RankingItem[];
  mode: LakeDetailsMode;
  onPreview: (item: RankingItem) => void;
};

function RankingList({ title, subtitle, type, items, mode, onPreview }: RankingListProps) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface-muted">
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <h3 className="font-display text-base font-bold text-text">{title}</h3>
        <p className="mt-1 text-xs font-semibold text-text-muted">{subtitle}</p>
      </div>

      {items.length > 0 ? (
        <div className="divide-y divide-border">
          {items.map((item, index) => (
            <RankingRow
              key={`${item.id}-${type}`}
              item={item}
              place={index + 1}
              type={type}
              mode={mode}
              onPreview={() => onPreview(item)}
            />
          ))}
        </div>
      ) : (
        <p className="px-5 py-8 text-center text-sm text-text-muted">Brak wyników w tej kategorii.</p>
      )}
    </div>
  );
}

type RankingRowProps = {
  item: RankingItem;
  place: number;
  type: "weight" | "length";
  mode: LakeDetailsMode;
  onPreview: () => void;
};

function RankingRow({ item, place, type, mode, onPreview }: RankingRowProps) {
  const value =
    type === "weight"
      ? item.weight !== null
        ? `${item.weight.toFixed(2).replace(".", ",")} kg`
        : "—"
      : item.length !== null
        ? `${item.length.toFixed(0)} cm`
        : "—";

  return (
    <article className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 bg-surface px-3 py-3 sm:grid-cols-[84px_minmax(0,1fr)] sm:px-4">
      <button
        type="button"
        onClick={onPreview}
        className="relative h-20 overflow-hidden rounded-xl bg-surface-muted sm:h-24"
        aria-label={`Powiększ zdjęcie połowu ${item.fishName}`}
      >
        <img src={item.imageUrl} alt={`Połów: ${item.fishName}`} className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-navy-950/85 px-1.5 text-[11px] font-bold text-white">
          {place}
        </span>
      </button>

      <div className="min-w-0 py-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-text">{item.fishName}</h4>
            <p className="mt-1 truncate text-xs text-text-muted">
              {item.userName || "Użytkownik"} · {formatRankingDate(item.caughtAt)}
            </p>
          </div>
          <Badge variant={place === 1 ? "warning" : "primary"} className="shrink-0 font-display">
            {value}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          {item.weight !== null && <span>{item.weight.toFixed(2).replace(".", ",")} kg</span>}
          {item.length !== null && <span>· {item.length.toFixed(0)} cm</span>}
          {item.bait && <span>· {item.bait}</span>}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <Link
            href={`/wedkarze/${item.userId}`}
            className="text-xs font-bold text-primary hover:underline"
          >
            Profil wędkarza
          </Link>
          {mode === "authenticated" && <CatchReportButton catchId={item.id} />}
        </div>
      </div>
    </article>
  );
}
