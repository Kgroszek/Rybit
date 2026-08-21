import Link from "next/link";

import type { FishingCatch } from "@/components/catches/types";
import { CatchScoreBadge } from "@/components/catches/CatchScoreBadge";
import { CatchStatusBadge } from "@/components/catches/CatchStatusBadge";
import { formatDateTime, getMethodLabel } from "@/components/catches/utils";
import { CardsIcon } from "@/components/icons/CardsIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { Button } from "@/components/ui/Button";
import { CatchActionsMenu } from "@/components/catches/cards/CatchActionsMenu";

export function CatchListRow({
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
    <article className="grid gap-4 px-4 py-4 transition hover:bg-surface-muted/60 sm:px-5 xl:grid-cols-[88px_minmax(0,1fr)_auto] xl:items-center">
      <div className="relative h-20 w-20 overflow-hidden rounded-control bg-surface-muted">
        {item.imageUrl ? (
          <button type="button" onClick={onPreviewImage} className="h-full w-full">
            <img src={item.imageUrl} alt={`Połów: ${item.fishName}`} className="h-full w-full object-cover" />
          </button>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary">
            <FishIcon className="h-8 w-8 -scale-x-100 opacity-70" />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <CatchStatusBadge fishingCatch={item} />
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-text-muted">
            {getMethodLabel(item.method)}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <Link href={`/polowy/${item.id}`} className="font-display text-lg font-bold text-text transition hover:text-primary">
            {item.fishName}
          </Link>
          <p className="text-sm text-text-muted">{formatDateTime(item.caughtAt)}</p>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-text-secondary">
          <span>{item.weight !== null ? `${item.weight.toFixed(2)} kg` : "Waga —"}</span>
          <span>{item.length !== null ? `${item.length.toFixed(0)} cm` : "Długość —"}</span>
          {item.lakeName && <span className="line-clamp-1">{item.lakeName}</span>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
        <CatchScoreBadge fishingCatch={item} size="md" showTier className="mr-1" />
        <Button onClick={onShare} size="sm">
          <CardsIcon className="h-4 w-4" />
          Karta
        </Button>
        <Button onClick={onEdit} variant="secondary" size="sm">
          <PencilIcon className="h-4 w-4" />
          Edytuj
        </Button>
        <CatchActionsMenu catchId={item.id} onDelete={onDelete} />
      </div>
    </article>
  );
}
