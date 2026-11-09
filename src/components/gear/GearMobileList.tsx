"use client";

import { GearActionsMenu } from "@/components/gear/GearActionsMenu";
import { GearConditionBadge } from "@/components/gear/GearStatusBadge";
import type {
  FishingGearDto,
} from "@/components/gear/types";
import {
  formatGearCurrency,
  gearTotalValue,
} from "@/components/gear/gear-utils";
import { Badge } from "@/components/ui/Badge";
import {
  getGearCategoryLabel,
  getGearMethodLabel,
  getGearStatusLabel,
} from "@/lib/gear/gear-options";

export function GearMobileList({
  items,
  openMenuId,
  deletingId,
  onOpenMenuChange,
  onEdit,
  onDelete,
}: {
  items: FishingGearDto[];
  openMenuId: string | null;
  deletingId: string | null;
  onOpenMenuChange: (
    id: string | null
  ) => void;
  onEdit: (
    item: FishingGearDto
  ) => void;
  onDelete: (
    item: FishingGearDto
  ) => void;
}) {
  return (
    <div className="divide-y divide-border xl:hidden">
      {items.map((item) => (
        <article
          key={item.id}
          className="px-4 py-5 sm:px-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-primary">
                {getGearCategoryLabel(
                  item.category
                )}
              </p>

              <h3 className="mt-1.5 break-words font-display text-lg font-extrabold tracking-[-0.02em] text-text">
                {item.name}
              </h3>

              {(item.brand ||
                item.model) && (
                <p className="mt-1 text-sm leading-5 text-text-muted">
                  {[
                    item.brand,
                    item.model,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>

            <GearActionsMenu
              item={item}
              open={
                openMenuId === item.id
              }
              disabled={
                deletingId === item.id
              }
              onOpenChange={(open) =>
                onOpenMenuChange(
                  open ? item.id : null
                )
              }
              onEdit={() =>
                onEdit(item)
              }
              onDelete={() =>
                onDelete(item)
              }
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <GearConditionBadge
              condition={
                item.condition
              }
            />

            {item.isDefault && (
              <Badge variant="aqua">
                Na wyprawę
              </Badge>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoTile
              label="Metoda"
              value={getGearMethodLabel(
                item.fishingMethod
              )}
            />

            <InfoTile
              label="Status"
              value={getGearStatusLabel(
                item.status
              )}
            />

            <InfoTile
              label="Ilość"
              value={`${item.quantity} szt.`}
            />

            <InfoTile
              label="Wartość"
              value={
                item.price !== null
                  ? formatGearCurrency(
                      gearTotalValue(
                        item
                      )
                    )
                  : "Brak"
              }
            />
          </div>

          {item.note && (
            <p className="mt-3 line-clamp-2 rounded-control bg-surface-muted px-3.5 py-3 text-sm leading-6 text-text-secondary">
              {item.note}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

function InfoTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-control border border-border bg-surface px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-text-muted">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-extrabold text-text">
        {value}
      </p>
    </div>
  );
}
