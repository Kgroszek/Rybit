import { FilterChip } from "@/components/ui/FilterChip";
import { cn } from "@/lib/cn";

export type LakeOwnerFilter =
  | "all"
  | "pzw"
  | "commercial";

export type LakeFishingFilter =
  | "all"
  | "general"
  | "spinning"
  | "carp";

type DashboardMapFiltersProps = {
  ownerType: LakeOwnerFilter;
  fishingType: LakeFishingFilter;
  resultsCount: number;
  onOwnerTypeChange: (
    value: LakeOwnerFilter
  ) => void;
  onFishingTypeChange: (
    value: LakeFishingFilter
  ) => void;
  onClear: () => void;
};

export function DashboardMapFilters({
  ownerType,
  fishingType,
  resultsCount,
  onOwnerTypeChange,
  onFishingTypeChange,
  onClear,
}: DashboardMapFiltersProps) {
  const hasFilters =
    ownerType !== "all" ||
    fishingType !== "all";

  return (
    <div className="rounded-card border border-border bg-surface px-4 py-3 shadow-card sm:px-5 sm:py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <FilterGroup
          label="Rodzaj"
          ariaLabel="Filtr rodzaju łowiska"
        >
          <FilterChip
            active={ownerType === "all"}
            onClick={() =>
              onOwnerTypeChange("all")
            }
          >
            Wszystkie
          </FilterChip>

          <FilterChip
            active={ownerType === "pzw"}
            onClick={() =>
              onOwnerTypeChange("pzw")
            }
          >
            PZW
          </FilterChip>

          <FilterChip
            active={
              ownerType === "commercial"
            }
            onClick={() =>
              onOwnerTypeChange(
                "commercial"
              )
            }
          >
            Komercyjne
          </FilterChip>
        </FilterGroup>

        <div
          aria-hidden="true"
          className="hidden h-8 w-px shrink-0 bg-border lg:block"
        />

        <FilterGroup
          label="Typ łowiska"
          ariaLabel="Filtr typu łowiska"
          className="lg:min-w-0 lg:flex-1"
        >
          <FilterChip
            active={fishingType === "all"}
            onClick={() =>
              onFishingTypeChange("all")
            }
          >
            Wszystkie
          </FilterChip>

          <FilterChip
            active={
              fishingType === "general"
            }
            onClick={() =>
              onFishingTypeChange(
                "general"
              )
            }
          >
            Ogólne
          </FilterChip>

          <FilterChip
            active={
              fishingType === "spinning"
            }
            onClick={() =>
              onFishingTypeChange(
                "spinning"
              )
            }
          >
            Spinningowe
          </FilterChip>

          <FilterChip
            active={
              fishingType === "carp"
            }
            onClick={() =>
              onFishingTypeChange("carp")
            }
          >
            Karpiowe
          </FilterChip>
        </FilterGroup>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border pt-3 lg:ml-auto lg:border-t-0 lg:pt-0">
          <span className="whitespace-nowrap text-xs font-bold tabular-nums text-text-secondary">
            {resultsCount}{" "}
            {resultsCount === 1
              ? "łowisko"
              : "łowisk"}
          </span>

          <button
            type="button"
            onClick={onClear}
            disabled={!hasFilters}
            className={cn(
              "min-w-[78px] text-right text-xs font-bold text-primary transition-colors hover:text-primary-hover disabled:pointer-events-none disabled:opacity-0"
            )}
          >
            Wyczyść
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  ariaLabel,
  children,
  className,
}: {
  label: string;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3",
        className
      )}
    >
      <span className="w-[76px] shrink-0 text-[10px] font-black uppercase tracking-[0.13em] text-text-muted lg:w-auto">
        {label}
      </span>

      <div
        role="group"
        aria-label={ariaLabel}
        className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}
