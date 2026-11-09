"use client";

import { useMemo, useState } from "react";

import { DashboardMap } from "@/components/dashboard/DashboardMap";
import { NearestLakes } from "@/components/dashboard/NearestLakes";
import {
  DashboardMapFilters,
  type LakeFishingFilter,
  type LakeOwnerFilter,
} from "@/components/dashboard/home/DashboardMapFilters";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { isValidLocation } from "@/lib/location";
import type { LakeListDto } from "@/lib/lakes";

export function DashboardMapSection({ lakes }: { lakes: LakeListDto[] }) {
  const [ownerType, setOwnerType] = useState<LakeOwnerFilter>("all");
  const [fishingType, setFishingType] = useState<LakeFishingFilter>("all");

  const filteredLakes = useMemo(
    () =>
      lakes.filter((lake) => {
        if (!isValidLocation({ lat: lake.lat, lng: lake.lng })) return false;

        const ownerMatches = ownerType === "all" || lake.type === ownerType;
        const fishingMatches =
          fishingType === "all" || lake.fishingType === fishingType;

        return ownerMatches && fishingMatches;
      }),
    [lakes, ownerType, fishingType]
  );

  const hasFilters = ownerType !== "all" || fishingType !== "all";

  function clearFilters() {
    setOwnerType("all");
    setFishingType("all");
  }

  return (
    <section>
      <SectionHeader
        eyebrow="Mapa łowisk"
        title="Znajdź miejsce na kolejny wyjazd"
        description="Przeglądaj łowiska, filtruj je według rodzaju i typu oraz sprawdzaj miejsca najbliżej Twojej lokalizacji."
        action={
          <ButtonLink href="/lowiska" variant="outline" size="sm">
            Zobacz wszystkie
          </ButtonLink>
        }
      />

      <div className="mt-5">
        <DashboardMapFilters
          ownerType={ownerType}
          fishingType={fishingType}
          resultsCount={filteredLakes.length}
          onOwnerTypeChange={setOwnerType}
          onFishingTypeChange={setFishingType}
          onClear={clearFilters}
        />
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <DashboardMap lakes={filteredLakes} fitToResults={hasFilters} />
        </div>

        <aside className="min-h-0 xl:h-[520px]">
          <NearestLakes lakes={lakes} limit={5} fullHeight />
        </aside>
      </div>
    </section>
  );
}
