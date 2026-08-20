import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FISHING_METHOD_OPTIONS } from "@/lib/fishing-methods";
import type { LakeDto } from "@/lib/lakes";
import { LAKE_AMENITIES } from "./constants";
import { LakeCatchRankings } from "./LakeCatchRankings";
import { LakeSection } from "./LakeSection";
import type { LakeDetailsMode } from "./types";
import { formatWeight, getCleanList } from "./utils";

type LakeDetailsContentProps = {
  lake: LakeDto;
  mode: LakeDetailsMode;
};

export function LakeDetailsContent({ lake, mode }: LakeDetailsContentProps) {
  const fishingMethods = FISHING_METHOD_OPTIONS.filter((method) =>
    lake.fishingMethods.includes(method.value)
  );
  const amenities = LAKE_AMENITIES.filter((item) => lake.amenities[item.key]);
  const cleanPriceList = getCleanList(lake.priceList, "link do cennika");
  const cleanRules = getCleanList(lake.rules, "link do regulaminu");

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <LakeSection id="informacje" title="O łowisku">
        <p className="whitespace-pre-line text-[15px] leading-7 text-text-secondary sm:text-base">
          {lake.description?.trim() || "Brak dodanego opisu łowiska."}
        </p>
      </LakeSection>

      <LakeSection
        id="ryby"
        title="Ryby"
        description="Gatunki zgłoszone jako występujące w tym łowisku."
      >
        {lake.fishSpecies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {lake.fishSpecies.map((fish) => (
              <Badge key={fish} variant="primary" size="md" className="text-sm">
                {fish}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-text-secondary">
            {lake.fish || "Brak informacji o gatunkach ryb."}
          </p>
        )}

        {lake.fishRecords.length > 0 && (
          <div className="mt-6 border-t border-border pt-6">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-bold text-text">Rekordy łowiska</h3>
                <p className="mt-1 text-sm text-text-secondary">Największe wpisane rekordy dla poszczególnych gatunków.</p>
              </div>
              <Badge variant="success">{lake.fishRecords.length}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {lake.fishRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between gap-4 rounded-control border border-success-border bg-success-subtle px-4 py-3"
                >
                  <p className="min-w-0 truncate text-sm font-bold text-text">{record.fishName}</p>
                  <span className="shrink-0 font-display text-sm font-bold text-success-foreground">
                    {formatWeight(record.weightKg)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </LakeSection>

      {(fishingMethods.length > 0 || amenities.length > 0) && (
        <LakeSection title="Warunki i możliwości">
          {fishingMethods.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-text">Metody łowienia</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {fishingMethods.map((method) => (
                  <Badge key={method.value} variant="neutral" size="md" className="text-sm">
                    {method.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {amenities.length > 0 && (
            <div className={fishingMethods.length > 0 ? "mt-6 border-t border-border pt-6" : ""}>
              <h3 className="text-sm font-bold text-text">Udogodnienia</h3>
              <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {amenities.map((amenity) => (
                  <div key={amenity.key} className="flex items-center gap-3 text-sm text-text-secondary">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-subtle text-xs font-bold text-success-foreground">
                      ✓
                    </span>
                    <span className="font-medium text-text">{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </LakeSection>
      )}

      {lake.gearRequirements.length > 0 && (
        <LakeSection
          title="Wymagania sprzętowe"
          description="Sprzęt i akcesoria wymagane podczas wędkowania na tym łowisku."
        >
          <div className="space-y-2">
            {lake.gearRequirements.map((requirement) => (
              <div
                key={requirement}
                className="flex gap-3 rounded-control border border-border bg-surface-muted px-4 py-3"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary">
                  ✓
                </span>
                <p className="text-sm font-medium leading-6 text-text-secondary">{requirement}</p>
              </div>
            ))}
          </div>
        </LakeSection>
      )}

      <LakeSection
        id="cennik"
        title="Cennik"
        action={
          lake.priceListUrl ? (
            <a
              href={lake.priceListUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              Otwórz pełny cennik
            </a>
          ) : null
        }
      >
        {cleanPriceList.length > 0 ? (
          <div className="divide-y divide-border overflow-hidden rounded-control border border-border">
            {cleanPriceList.map((item) => (
              <div key={item} className="bg-surface px-4 py-3 text-sm font-medium leading-6 text-text-secondary">
                {item}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Brak dodanego cennika"
            description={lake.priceListUrl ? "Skorzystaj z przycisku, aby otworzyć zewnętrzny cennik łowiska." : "W profilu łowiska nie uzupełniono jeszcze informacji o cenach."}
            className="min-h-40"
          />
        )}
      </LakeSection>

      <LakeSection
        id="zasady"
        title="Zasady na łowisku"
        action={
          lake.rulesUrl ? (
            <a
              href={lake.rulesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              Otwórz regulamin
            </a>
          ) : null
        }
      >
        {cleanRules.length > 0 ? (
          <div className="space-y-2">
            {cleanRules.map((rule, index) => (
              <div key={`${rule}-${index}`} className="flex gap-3 rounded-control bg-surface-muted px-4 py-3">
                <span className="shrink-0 text-sm font-bold text-primary">{index + 1}.</span>
                <p className="text-sm font-medium leading-6 text-text-secondary">{rule}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Brak dodanych zasad"
            description={lake.rulesUrl ? "Pełny regulamin jest dostępny pod przyciskiem powyżej." : "W profilu nie uzupełniono jeszcze zasad obowiązujących na łowisku."}
            className="min-h-40"
          />
        )}
      </LakeSection>

      <LakeCatchRankings lake={lake} mode={mode} />
    </div>
  );
}
