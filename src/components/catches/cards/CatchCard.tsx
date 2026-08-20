import Link from "next/link";

import type { FishingCatch } from "@/components/catches/types";
import { CatchScoreBadge } from "@/components/catches/CatchScoreBadge";
import { CatchStatusBadge } from "@/components/catches/CatchStatusBadge";
import { getMethodLabel, formatDateTime } from "@/components/catches/utils";
import { CardsIcon } from "@/components/icons/CardsIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CatchActionsMenu } from "@/components/catches/cards/CatchActionsMenu";

export function CatchCard({
  item,
  onPreviewImage,
  onShare,
  onEdit,
  onDelete,
}: {
  item: FishingCatch;
  onPreviewImage: () => void;
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group flex h-full min-w-0 flex-col overflow-hidden p-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        {item.imageUrl ? (
          <button
            type="button"
            onClick={onPreviewImage}
            className="block h-full w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary-100"
            aria-label={`Powiększ zdjęcie połowu: ${item.fishName}`}
          >
            <img
              src={item.imageUrl}
              alt={`Zdjęcie połowu: ${item.fishName}`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
            />
          </button>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,var(--rybio-primary-50),var(--rybio-surface-muted))] text-primary">
            <FishIcon className="h-12 w-12 -scale-x-100 opacity-70" />
          </div>
        )}

        <div className="absolute left-3 top-3">
          <CatchStatusBadge fishingCatch={item} />
        </div>

        <div className="absolute right-3 top-3">
          <CatchScoreBadge fishingCatch={item} size="md" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-text-muted">
            {getMethodLabel(item.method)}
          </p>

          <Link
            href={`/polowy/${item.id}`}
            className="mt-1.5 block font-display text-xl font-bold tracking-[-0.025em] text-text transition hover:text-primary"
          >
            {item.fishName}
          </Link>

          <p className="mt-1 text-sm text-text-muted">{formatDateTime(item.caughtAt)}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Metric label="Waga" value={item.weight !== null ? `${item.weight.toFixed(2)} kg` : "—"} />
          <Metric label="Długość" value={item.length !== null ? `${item.length.toFixed(0)} cm` : "—"} />
        </div>

        {(item.lakeName || item.tripTitle) && (
          <div className="mt-4 space-y-1.5 text-sm">
            {item.lakeName && (
              <p className="line-clamp-1 font-semibold text-text-secondary">
                {item.lakeName}
              </p>
            )}
            {item.tripTitle && (
              <p className="line-clamp-1 text-text-muted">Wyprawa: {item.tripTitle}</p>
            )}
          </div>
        )}

        {item.note && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-secondary">
            {item.note}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-5">
          <Button onClick={onShare} size="sm" className="min-w-0 flex-1">
            <CardsIcon className="h-4 w-4" />
            Karta
          </Button>

          <Button onClick={onEdit} variant="secondary" size="sm" className="min-w-0 flex-1">
            <PencilIcon className="h-4 w-4" />
            Edytuj
          </Button>

          <CatchActionsMenu catchId={item.id} onDelete={onDelete} />
        </div>
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-control border border-border bg-surface-muted px-3 py-2.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <p className="mt-1 font-display text-base font-bold text-text">{value}</p>
    </div>
  );
}
