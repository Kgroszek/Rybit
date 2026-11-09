import Link from "next/link";

import { CheckListIcon } from "@/components/icons/CheckListIcon";
import { HookIcon } from "@/components/icons/HookIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { TripActionPopup } from "@/components/dashboard/TripActionPopup";
import {
  TripChecklistPackedToggle,
  TripGearPackedToggle,
} from "@/components/dashboard/TripInlineActions";
import { Badge } from "@/components/ui/Badge";
import {
  buttonClassName,
} from "@/components/ui/Button";
import { TripDetailsSection } from "@/components/trips/details/TripDetailsSection";
import type { TripDetailsData } from "@/lib/trips/details-query";
import type { TripPreparationTab } from "@/lib/trips/details-utils";
import {
  getChecklistCategoryLabel,
  groupChecklistItems,
} from "@/lib/trips/details-utils";
import { cn } from "@/lib/cn";

export function TripPreparation({
  trip,
  activeView,
  canEdit,
  checklistProgress,
  gearProgress,
  packedItemsCount,
  importantItemsCount,
  packedImportantItemsCount,
  packedRequiredGearCount,
  requiredGearCount,
}: {
  trip: TripDetailsData;
  activeView: TripPreparationTab;
  canEdit: boolean;
  checklistProgress: number;
  gearProgress: number;
  packedItemsCount: number;
  importantItemsCount: number;
  packedImportantItemsCount: number;
  packedRequiredGearCount: number;
  requiredGearCount: number;
}) {
  return (
    <div className="space-y-5">
      <div
        className="grid max-w-md grid-cols-2 gap-1.5 rounded-control bg-surface-muted p-1.5"
        role="tablist"
        aria-label="Przygotowanie wyprawy"
      >
        <PreparationTab
          href={`/wyprawy/${trip.id}?tab=przygotowanie&prep=checklista`}
          active={activeView === "checklista"}
          label="Checklista"
        />

        <PreparationTab
          href={`/wyprawy/${trip.id}?tab=przygotowanie&prep=sprzet`}
          active={activeView === "sprzet"}
          label="Sprzęt"
        />
      </div>

      {activeView === "checklista" ? (
        <ChecklistView
          trip={trip}
          canEdit={canEdit}
          progress={checklistProgress}
          packedItemsCount={packedItemsCount}
          importantItemsCount={importantItemsCount}
          packedImportantItemsCount={
            packedImportantItemsCount
          }
        />
      ) : (
        <GearView
          trip={trip}
          canEdit={canEdit}
          progress={gearProgress}
          packedRequiredGearCount={
            packedRequiredGearCount
          }
          requiredGearCount={requiredGearCount}
        />
      )}
    </div>
  );
}

function PreparationTab({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={cn(
        "flex h-10 items-center justify-center rounded-xl px-4 text-sm font-bold transition",
        active
          ? "bg-surface text-primary-700 shadow-[0_1px_3px_rgba(13,30,51,0.08)]"
          : "text-text-secondary hover:text-text"
      )}
    >
      {label}
    </Link>
  );
}

function ChecklistView({
  trip,
  canEdit,
  progress,
  packedItemsCount,
  importantItemsCount,
  packedImportantItemsCount,
}: {
  trip: TripDetailsData;
  canEdit: boolean;
  progress: number;
  packedItemsCount: number;
  importantItemsCount: number;
  packedImportantItemsCount: number;
}) {
  const items = trip.checklist?.items ?? [];
  const groups = groupChecklistItems(items);

  return (
    <TripDetailsSection
      title="Checklista wyprawy"
      description="Rzeczy do przygotowania przed wyjazdem, pogrupowane według kategorii."
      action={
        <TripActionPopup
          tripId={trip.id}
          action="checklist"
          canEdit={canEdit}
          icon={
            <CheckListIcon className="h-4 w-4 shrink-0" />
          }
          label={
            trip.checklist
              ? "Edytuj checklistę"
              : "Utwórz checklistę"
          }
          tripStartsAt={trip.startsAt}
          tripEndsAt={trip.endsAt}
          tripType={trip.tripType}
          lakeGearRequirements={
            trip.lake?.gearRequirements.map(
              (item) => item.text
            ) ?? []
          }
          className={buttonClassName({
            variant: "secondary",
            size: "md",
          })}
        />
      }
    >
      {trip.checklist ? (
        <div>
          <PreparationSummary
            progress={progress}
            items={[
              {
                label: "Spakowane",
                value: `${packedItemsCount}/${items.length}`,
              },
              {
                label: "Ważne",
                value: `${packedImportantItemsCount}/${importantItemsCount}`,
              },
            ]}
          />

          {groups.length > 0 ? (
            <div className="mt-7 space-y-4">
              {groups.map((group) => (
                <details
                  key={group.category}
                  open={group.unpackedCount > 0}
                  className="group overflow-hidden rounded-card border border-border bg-surface"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-surface-muted px-4 py-4 [&::-webkit-details-marker]:hidden">
                    <div>
                      <p className="text-sm font-bold text-text">
                        {getChecklistCategoryLabel(
                          group.category
                        )}
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        {group.packedCount}/
                        {group.items.length} spakowane
                      </p>
                    </div>

                    <Badge
                      variant={
                        group.unpackedCount > 0
                          ? "warning"
                          : "success"
                      }
                    >
                      {group.unpackedCount > 0
                        ? `${group.unpackedCount} do spakowania`
                        : "Gotowe"}
                    </Badge>
                  </summary>

                  <div className="grid gap-3 p-3 lg:grid-cols-2">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-start justify-between gap-4 rounded-control border p-4",
                          item.isPacked
                            ? "border-success-border bg-success-subtle"
                            : item.isImportant
                              ? "border-warning-border bg-warning-subtle"
                              : "border-border bg-surface-muted"
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p
                              className={cn(
                                "break-words text-sm font-bold",
                                item.isPacked
                                  ? "text-success-foreground line-through"
                                  : "text-text"
                              )}
                            >
                              {item.name}
                            </p>

                            {item.isImportant && (
                              <Badge variant="warning">
                                Ważne
                              </Badge>
                            )}

                            {item.source ===
                              "template" && (
                              <Badge variant="primary">
                                Podpowiedź Rybio
                              </Badge>
                            )}
                          </div>

                          <p className="mt-2 text-xs text-text-muted">
                            {item.quantity}{" "}
                            {item.unit || ""}
                          </p>

                          {item.note && (
                            <p className="mt-2 text-xs leading-5 text-text-secondary">
                              {item.note}
                            </p>
                          )}
                        </div>

                        <TripChecklistPackedToggle
                          tripId={trip.id}
                          itemId={item.id}
                          isPacked={item.isPacked}
                          canEdit={canEdit}
                        />
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <EmptyPreparation
              title="Checklista jest pusta"
              description="Dodaj rekomendowany szablon albo własne elementy."
            />
          )}
        </div>
      ) : (
        <EmptyPreparation
          title="Brak checklisty"
          description="Utwórz checklistę, aby uporządkować przygotowania do wyjazdu."
        />
      )}
    </TripDetailsSection>
  );
}

function GearView({
  trip,
  canEdit,
  progress,
  packedRequiredGearCount,
  requiredGearCount,
}: {
  trip: TripDetailsData;
  canEdit: boolean;
  progress: number;
  packedRequiredGearCount: number;
  requiredGearCount: number;
}) {
  return (
    <TripDetailsSection
      title="Sprzęt na wyprawę"
      description="Sprzęt przypisany do tej wyprawy i jego status spakowania."
      action={
        <>
          <TripActionPopup
            tripId={trip.id}
            action="gear"
            canEdit={canEdit}
            icon={
              <PencilIcon className="h-4 w-4 shrink-0" />
            }
            label="Edytuj sprzęt"
            className={buttonClassName({
              variant: "secondary",
              size: "md",
            })}
          />

          <Link
            href="/ekwipunek"
            className={buttonClassName({
              variant: "outline",
              size: "md",
            })}
          >
            <HookIcon className="h-4 w-4" />
            Mój ekwipunek
          </Link>
        </>
      }
    >
      <PreparationSummary
        progress={progress}
        items={[
          {
            label: "Wymagany sprzęt",
            value: `${packedRequiredGearCount}/${requiredGearCount}`,
          },
          {
            label: "Wszystkie pozycje",
            value: String(trip.gearItems.length),
          },
        ]}
      />

      {trip.gearItems.length > 0 ? (
        <div className="mt-7 grid gap-3 lg:grid-cols-2">
          {trip.gearItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "rounded-control border p-4",
                item.isPacked
                  ? "border-success-border bg-success-subtle"
                  : item.isRequired
                    ? "border-warning-border bg-warning-subtle"
                    : "border-border bg-surface-muted"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    {item.isRequired && (
                      <Badge variant="warning">
                        Wymagany
                      </Badge>
                    )}

                    {item.isPacked && (
                      <Badge variant="success">
                        Spakowany
                      </Badge>
                    )}
                  </div>

                  <h3 className="mt-3 break-words text-sm font-bold text-text">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-xs text-text-muted">
                    {item.category} ·{" "}
                    {item.quantity}{" "}
                    {item.unit || "szt."}
                  </p>

                  {item.gear && (
                    <p className="mt-2 text-xs font-bold text-primary-700">
                      Z ekwipunku:{" "}
                      {[
                        item.gear.brand,
                        item.gear.model ||
                          item.gear.name,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  )}

                  {item.note && (
                    <p className="mt-2 text-xs leading-5 text-text-secondary">
                      {item.note}
                    </p>
                  )}
                </div>

                <TripGearPackedToggle
                  tripId={trip.id}
                  itemId={item.id}
                  isPacked={item.isPacked}
                  canEdit={canEdit}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPreparation
          title="Brak przypisanego sprzętu"
          description="Dodaj sprzęt z ekwipunku albo własną pozycję."
        />
      )}
    </TripDetailsSection>
  );
}

function PreparationSummary({
  progress,
  items,
}: {
  progress: number;
  items: Array<{
    label: string;
    value: string;
  }>;
}) {
  return (
    <div className="rounded-card bg-surface-muted px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-text">
              Postęp przygotowania
            </p>

            <span className="text-lg font-extrabold text-primary-700">
              {progress}%
            </span>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-strong">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(progress, 100)
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="flex gap-5">
          {items.map((item) => (
            <div key={item.label}>
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-text-muted">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-extrabold text-text">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyPreparation({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-6 rounded-card border border-dashed border-border bg-surface-muted px-5 py-8 text-center">
      <p className="text-sm font-bold text-text">
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-text-muted">
        {description}
      </p>
    </div>
  );
}
