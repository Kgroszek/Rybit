import Link from "next/link";

import { FishIcon } from "@/components/icons/FishIcon";
import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { LakeDetailsMode, RecommendedLake } from "./types";
import { formatDistance, formatRating, getFishingTypeLabel, getOwnerTypeLabel } from "./utils";

type LakeNearbyLakesProps = {
  lakeCity: string;
  lakes: RecommendedLake[];
  mode: LakeDetailsMode;
};

export function LakeNearbyLakes({ lakeCity, lakes, mode }: LakeNearbyLakesProps) {
  if (lakes.length === 0) return null;

  const basePath = mode === "public" ? "/lowiska-w-polsce" : "/lowiska";

  return (
    <section className="mt-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Łowiska w pobliżu</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.03em] text-text sm:text-3xl">
            Inne miejsca w okolicy{lakeCity ? ` ${lakeCity}` : ""}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Porównaj pobliskie łowiska przed wyborem kolejnej wyprawy.
          </p>
        </div>
        <Link
          href={basePath}
          className={buttonClassName({ variant: "outline", size: "sm" })}
        >
          Zobacz wszystkie
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {lakes.map((lake) => {
          const image = lake.images[0];
          const distance = formatDistance(lake.nearbyDistanceInKm);

          return (
            <Card key={lake.id} variant="interactive" className="overflow-hidden">
              <Link href={`${basePath}/${lake.slug}`} className="block h-full">
                <div className="relative h-44 bg-surface-muted">
                  {image ? (
                    <img src={image} alt={`${lake.name} – łowisko w ${lake.address.city}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-primary">
                      <FishIcon className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <Badge variant={lake.type === "commercial" ? "success" : "primary"}>
                      {getOwnerTypeLabel(lake.type)}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="line-clamp-2 font-display text-lg font-bold text-text">{lake.name}</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {lake.address.city}, woj. {lake.address.voivodeship}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-text-secondary">
                    <span>Ocena {formatRating(lake.rating)}</span>
                    <span>{getFishingTypeLabel(lake.fishingType)}</span>
                    {distance && <span>{distance}</span>}
                  </div>

                  {lake.fishSpecies.length > 0 && (
                    <p className="mt-3 line-clamp-1 text-sm text-text-muted">
                      {lake.fishSpecies.slice(0, 5).join(" · ")}
                    </p>
                  )}
                </div>
              </Link>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
