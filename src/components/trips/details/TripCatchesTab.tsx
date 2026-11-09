import { FishIcon } from "@/components/icons/FishIcon";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TripDetailsSection } from "@/components/trips/details/TripDetailsSection";
import type { TripDetailsData } from "@/lib/trips/details-query";
import {
  formatDateTime,
  getMethodLabel,
} from "@/lib/trips/details-utils";

export function TripCatchesTab({
  trip,
  canEdit,
}: {
  trip: TripDetailsData;
  canEdit: boolean;
}) {
  return (
    <TripDetailsSection
      title="Połowy z wyprawy"
      description="Ryby zapisane przez uczestników i przypisane do tej wyprawy."
      action={
        canEdit ? (
          <ButtonLink
            href={`/polowy?new=1&tripId=${trip.id}`}
          >
            <FishIcon className="h-4 w-4" />
            Dodaj połów
          </ButtonLink>
        ) : undefined
      }
    >
      {trip.catches.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trip.catches.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-card border border-border bg-surface"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={`Połów: ${item.fishName}`}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="flex h-32 items-center justify-center bg-primary-50 text-primary">
                  <FishIcon className="h-8 w-8" />
                </div>
              )}

              <div className="p-5">
                <Badge variant="neutral">
                  {getMethodLabel(item.method)}
                </Badge>

                <h3 className="mt-3 font-display text-xl font-extrabold text-text">
                  {item.fishName}
                </h3>

                <p className="mt-1 text-xs leading-5 text-text-muted">
                  {item.userName || "Użytkownik"}
                  {" · "}
                  {formatDateTime(
                    item.caughtAt
                  )}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <CatchMetric
                    label="Waga"
                    value={
                      item.weight !== null
                        ? `${item.weight.toFixed(
                            2
                          )} kg`
                        : "Brak"
                    }
                  />

                  <CatchMetric
                    label="Długość"
                    value={
                      item.length !== null
                        ? `${item.length.toFixed(
                            0
                          )} cm`
                        : "Brak"
                    }
                  />
                </div>

                {item.bait && (
                  <p className="mt-4 text-xs leading-5 text-text-secondary">
                    <span className="font-bold text-text">
                      Przynęta:
                    </span>{" "}
                    {item.bait}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-border bg-surface-muted px-5 py-10 text-center">
          <FishIcon className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-4 font-display text-lg font-extrabold text-text">
            Brak połowów
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
            Dodaj złowioną rybę przez wspólny formularz Połowów i przypisz ją do tej wyprawy.
          </p>
        </div>
      )}
    </TripDetailsSection>
  );
}

function CatchMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-control bg-surface-muted px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.09em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-extrabold text-text">
        {value}
      </p>
    </div>
  );
}
