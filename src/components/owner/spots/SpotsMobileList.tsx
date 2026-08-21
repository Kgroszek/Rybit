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

export function SpotsMobileList({
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
    <div className="divide-y divide-border xl:hidden">
      {spots.map((spot) => {
        const originalIndex =
          allSpots.findIndex(
            (item) => item.id === spot.id
          );
        const contact =
          getSpotReservationContact(spot);

        return (
          <article
            key={spot.id}
            className="px-4 py-5 sm:px-5"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted px-2 text-xs font-extrabold tabular-nums text-text-secondary">
                {String(
                  originalIndex + 1
                ).padStart(2, "0")}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-extrabold tracking-[-0.02em] text-text">
                      {spot.name}
                    </h3>

                    <div className="mt-2">
                      <SpotStatusBadge
                        spot={spot}
                      />
                    </div>
                  </div>

                  {canManage && (
                    <SpotActionsMenu
                      lakeSlug={lakeSlug}
                      spot={spot}
                      open={
                        openMenuId ===
                        spot.id
                      }
                      busy={
                        actionId === spot.id
                      }
                      isFirst={
                        originalIndex === 0
                      }
                      isLast={
                        originalIndex ===
                        allSpots.length - 1
                      }
                      onOpenChange={(open) =>
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
                  )}
                </div>

                {spot.description && (
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-secondary">
                    {spot.description}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <InfoTile
                    icon={
                      <UsersIcon className="h-4 w-4" />
                    }
                    label="Pojemność"
                    value={`${spot.maxPeople} os.`}
                  />

                  <InfoTile
                    icon={
                      <CalendarIcon className="h-4 w-4" />
                    }
                    label="Historia"
                    value={`${spot.reservationsCount} rez.`}
                  />
                </div>

                <div className="mt-3 rounded-control bg-surface-muted px-3.5 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.09em] text-text-muted">
                    Najbliższa rezerwacja
                  </p>

                  <p className="mt-1.5 text-sm font-bold leading-5 text-text-secondary">
                    {getSpotReservationLabel(
                      spot
                    )}
                  </p>

                  {contact && (
                    <p className="mt-1 text-xs text-text-muted">
                      {contact}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-control border border-border bg-surface px-3 py-3">
      <div className="flex items-center gap-2 text-text-muted">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-[0.08em]">
          {label}
        </span>
      </div>

      <p className="mt-1.5 text-sm font-extrabold text-text">
        {value}
      </p>
    </div>
  );
}
