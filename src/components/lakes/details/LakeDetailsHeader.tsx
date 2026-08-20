import Link from "next/link";

import { StarIcon } from "@/components/icons/StarIcon";
import { Badge } from "@/components/ui/Badge";
import type { LakeDto } from "@/lib/lakes";
import { formatRating, getFishingTypeLabel, getOwnerTypeLabel } from "./utils";
import type { LakeDetailsMode } from "./types";

type LakeDetailsHeaderProps = {
  lake: LakeDto;
  mode: LakeDetailsMode;
  isAdmin?: boolean;
};

export function LakeDetailsHeader({
  lake,
  mode,
  isAdmin = false,
}: LakeDetailsHeaderProps) {
  const backHref = mode === "public" ? "/lowiska-w-polsce" : "/lowiska";
  const backLabel = mode === "public" ? "Wróć do bazy łowisk" : "Wróć do łowisk";

  return (
    <header className="mb-6">
      <Link
        href={backHref}
        className="inline-flex items-center text-sm font-semibold text-text-secondary transition-colors hover:text-primary"
      >
        ← {backLabel}
      </Link>

      <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Badge variant={lake.type === "commercial" ? "success" : "primary"} size="md">
              {getOwnerTypeLabel(lake.type)}
            </Badge>
            <Badge variant="neutral" size="md">
              {getFishingTypeLabel(lake.fishingType)}
            </Badge>
            {isAdmin && (
              <Badge variant="dark" size="md">
                Widok administratora
              </Badge>
            )}
          </div>

          <h1 className="mt-4 break-words font-display text-3xl font-extrabold tracking-[-0.04em] text-text sm:text-4xl lg:text-5xl">
            {lake.name}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary sm:text-base">
            {[lake.address.street, `${lake.address.postalCode} ${lake.address.city}`.trim()]
              .filter(Boolean)
              .join(", ")}
            {lake.address.voivodeship ? ` · woj. ${lake.address.voivodeship}` : ""}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
            <span className="inline-flex items-center gap-2 font-semibold text-text">
              <StarIcon className="h-4 w-4 text-warning" />
              Ocena {formatRating(lake.rating)}
            </span>
            {lake.fishSpecies.length > 0 && (
              <span>{lake.fishSpecies.length} gatunków ryb</span>
            )}
            {lake.openingHours.isOpenAllDay && <span>Otwarte całodobowo</span>}
          </div>
        </div>
      </div>
    </header>
  );
}
