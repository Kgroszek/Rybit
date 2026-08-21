"use client";

import type { ReactNode } from "react";

import { GearActionsMenu } from "@/components/gear/GearActionsMenu";
import {
  GearConditionBadge,
  GearUsageStatusBadge,
} from "@/components/gear/GearStatusBadge";
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
} from "@/lib/gear/gear-options";

export function GearDesktopTable({
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
    <div className="hidden xl:block">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="border-b border-border bg-surface-muted text-left">
            <HeaderCell>
              Sprzęt
            </HeaderCell>
            <HeaderCell className="w-[190px]">
              Kategoria / metoda
            </HeaderCell>
            <HeaderCell className="w-[145px]">
              Stan
            </HeaderCell>
            <HeaderCell className="w-[145px]">
              Status
            </HeaderCell>
            <HeaderCell className="w-[90px]">
              Ilość
            </HeaderCell>
            <HeaderCell className="w-[130px]">
              Wartość
            </HeaderCell>
            <HeaderCell className="w-[130px]">
              Wyprawy
            </HeaderCell>
            <HeaderCell className="w-[72px] text-right">
              Akcje
            </HeaderCell>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-border last:border-b-0 hover:bg-primary-50/25"
            >
              <Cell>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-text">
                    {item.name}
                  </p>

                  <p className="mt-1 truncate text-xs text-text-muted">
                    {[
                      item.brand,
                      item.model,
                    ]
                      .filter(Boolean)
                      .join(" · ") ||
                      "Bez producenta i modelu"}
                  </p>
                </div>
              </Cell>

              <Cell>
                <p className="text-sm font-bold text-text-secondary">
                  {getGearCategoryLabel(
                    item.category
                  )}
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  {getGearMethodLabel(
                    item.fishingMethod
                  )}
                </p>
              </Cell>

              <Cell>
                <GearConditionBadge
                  condition={
                    item.condition
                  }
                />
              </Cell>

              <Cell>
                <GearUsageStatusBadge
                  status={item.status}
                />
              </Cell>

              <Cell>
                <span className="text-sm font-extrabold tabular-nums text-text">
                  {item.quantity}
                </span>
              </Cell>

              <Cell>
                <span className="text-sm font-extrabold text-text">
                  {item.price !== null
                    ? formatGearCurrency(
                        gearTotalValue(
                          item
                        )
                      )
                    : "—"}
                </span>
              </Cell>

              <Cell>
                {item.isDefault ? (
                  <Badge variant="aqua">
                    Na wyprawę
                  </Badge>
                ) : (
                  <span className="text-xs font-semibold text-text-muted">
                    Standard
                  </span>
                )}
              </Cell>

              <Cell className="text-right">
                <div className="flex justify-end">
                  <GearActionsMenu
                    item={item}
                    open={
                      openMenuId ===
                      item.id
                    }
                    disabled={
                      deletingId ===
                      item.id
                    }
                    onOpenChange={(
                      open
                    ) =>
                      onOpenMenuChange(
                        open
                          ? item.id
                          : null
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
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HeaderCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.12em] text-text-muted first:pl-5 last:pr-5 ${className}`}
    >
      {children}
    </th>
  );
}

function Cell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`px-4 py-4 align-middle first:pl-5 last:pr-5 ${className}`}
    >
      {children}
    </td>
  );
}
