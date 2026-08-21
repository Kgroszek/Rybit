"use client";

import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { UsersIcon } from "@/components/icons/UsersIcon";
import { SpotActionsMenu } from "@/components/owner/spots/SpotActionsMenu";
import { SpotStatusBadge } from "@/components/owner/spots/SpotStatusBadge";
import {
  getSpotReservationContact,
  getSpotReservationLabel,
} from "@/components/owner/spots/spot-utils";
import type { SpotDto } from "@/components/owner/spots/types";

export function SpotsDesktopTable({
  lakeSlug,
  allSpots,
  spots,
  canManage,
  actionId,
  openMenuId,
  onOpenMenuChange,
  onEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  lakeSlug: string;
  allSpots: SpotDto[];
  spots: SpotDto[];
  canManage: boolean;
  actionId: string | null;
  openMenuId: string | null;
  onOpenMenuChange: (
    spotId: string | null
  ) => void;
  onEdit: (spot: SpotDto) => void;
  onMoveUp: (spot: SpotDto) => void;
  onMoveDown: (spot: SpotDto) => void;
  onDelete: (spot: SpotDto) => void;
}) {
  return (
    <div className="hidden xl:block">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="border-b border-border bg-surface-muted text-left">
            <HeaderCell className="w-[72px]">
              #
            </HeaderCell>
            <HeaderCell>
              Stanowisko
            </HeaderCell>
            <HeaderCell className="w-[150px]">
              Status
            </HeaderCell>
            <HeaderCell className="w-[120px]">
              Pojemność
            </HeaderCell>
            <HeaderCell className="w-[270px]">
              Najbliższa rezerwacja
            </HeaderCell>
            <HeaderCell className="w-[120px]">
              Historia
            </HeaderCell>
            {canManage && (
              <HeaderCell className="w-[72px] text-right">
                Akcje
              </HeaderCell>
            )}
          </tr>
        </thead>

        <tbody>
          {spots.map((spot) => {
            const originalIndex =
              allSpots.findIndex(
                (item) => item.id === spot.id
              );
            const contact =
              getSpotReservationContact(spot);

            return (
              <tr
                key={spot.id}
                className="border-b border-border last:border-b-0 hover:bg-primary-50/25"
              >
                <Cell>
                  <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-surface-muted px-2 text-xs font-extrabold tabular-nums text-text-secondary">
                    {String(
                      originalIndex + 1
                    ).padStart(2, "0")}
                  </span>
                </Cell>

                <Cell>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-text">
                      {spot.name}
                    </p>

                    <p className="mt-1 line-clamp-1 text-xs leading-5 text-text-muted">
                      {spot.description ||
                        "Bez dodatkowego opisu"}
                    </p>
                  </div>
                </Cell>

                <Cell>
                  <SpotStatusBadge
                    spot={spot}
                  />
                </Cell>

                <Cell>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary">
                    <UsersIcon className="h-4 w-4 text-text-muted" />
                    {spot.maxPeople} os.
                  </span>
                </Cell>

                <Cell>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-text-secondary">
                      {getSpotReservationLabel(
                        spot
                      )}
                    </p>

                    {contact && (
                      <p className="mt-1 truncate text-xs text-text-muted">
                        {contact}
                      </p>
                    )}
                  </div>
                </Cell>

                <Cell>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary">
                    <CalendarIcon className="h-4 w-4 text-text-muted" />
                    {spot.reservationsCount}
                  </span>
                </Cell>

                {canManage && (
                  <Cell className="text-right">
                    <div className="flex justify-end">
                      <SpotActionsMenu
                        lakeSlug={lakeSlug}
                        spot={spot}
                        open={
                          openMenuId ===
                          spot.id
                        }
                        busy={
                          actionId ===
                          spot.id
                        }
                        isFirst={
                          originalIndex === 0
                        }
                        isLast={
                          originalIndex ===
                          allSpots.length - 1
                        }
                        onOpenChange={(
                          open
                        ) =>
                          onOpenMenuChange(
                            open
                              ? spot.id
                              : null
                          )
                        }
                        onEdit={() =>
                          onEdit(spot)
                        }
                        onMoveUp={() =>
                          onMoveUp(spot)
                        }
                        onMoveDown={() =>
                          onMoveDown(spot)
                        }
                        onDelete={() =>
                          onDelete(spot)
                        }
                      />
                    </div>
                  </Cell>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HeaderCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
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
  children: React.ReactNode;
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
