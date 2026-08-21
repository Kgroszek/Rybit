import { TripActionPopup } from "@/components/dashboard/TripActionPopup";
import { TripDeleteButton } from "@/components/dashboard/TripInlineActions";
import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { TripDetailsSection } from "@/components/trips/details/TripDetailsSection";
import type { TripDetailsData } from "@/lib/trips/details-query";
import {
  calculateCostSettlement,
  formatMoney,
  getCostCategoryLabel,
} from "@/lib/trips/details-utils";
import { cn } from "@/lib/cn";

export function TripCostsTab({
  trip,
  currentUserId,
  isOwner,
  canEdit,
  participants,
}: {
  trip: TripDetailsData;
  currentUserId: string;
  isOwner: boolean;
  canEdit: boolean;
  participants: Array<{
    id: string;
    name: string;
  }>;
}) {
  const total = trip.costs.reduce(
    (sum, cost) => sum + cost.amount,
    0
  );

  const settlement =
    calculateCostSettlement(
      trip.costs,
      participants
    );

  return (
    <TripDetailsSection
      title="Budżet i koszty"
      description="Wspólne wydatki oraz automatyczne rozliczenie między zarejestrowanymi uczestnikami."
      action={
        <TripActionPopup
          tripId={trip.id}
          action="cost"
          canEdit={canEdit}
          participants={participants}
          label="Dodaj koszt"
          className={buttonClassName({
            variant: "primary",
            size: "md",
          })}
        />
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Łącznie"
          value={formatMoney(total)}
          primary
        />

        <MetricCard
          label="Uczestnicy"
          value={String(participants.length)}
        />

        <MetricCard
          label="Udział na osobę"
          value={formatMoney(
            settlement.sharePerPerson
          )}
        />
      </div>

      {trip.costs.length > 0 ? (
        <>
          <div className="mt-7 overflow-hidden rounded-card border border-border">
            {trip.costs.map((cost) => (
              <div
                key={cost.id}
                className="grid gap-3 border-b border-border p-4 last:border-none sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text">
                    {cost.label}
                  </p>

                  <p className="mt-1 text-xs text-text-muted">
                    {getCostCategoryLabel(
                      cost.category
                    )}
                    {" · "}
                    zapłacił(a):{" "}
                    {cost.paidByName ||
                      "Użytkownik"}
                  </p>

                  {cost.note && (
                    <p className="mt-2 text-xs leading-5 text-text-secondary">
                      {cost.note}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <p className="text-sm font-extrabold text-text">
                    {formatMoney(
                      cost.amount,
                      cost.currency
                    )}
                  </p>

                  {(isOwner ||
                    cost.paidByUserId ===
                      currentUserId) && (
                    <TripDeleteButton
                      tripId={trip.id}
                      resource="costs"
                      entityId={cost.id}
                      confirmText={`Czy na pewno chcesz usunąć koszt „${cost.label}”?`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 grid gap-5 xl:grid-cols-2">
            <div className="rounded-card border border-border bg-surface-muted p-5">
              <h3 className="font-display text-lg font-extrabold text-text">
                Kto ile zapłacił
              </h3>

              <div className="mt-4 space-y-2.5">
                {settlement.balances.map(
                  (participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between gap-4 rounded-control bg-surface px-3.5 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-text">
                          {participant.name}
                        </p>

                        <p className="mt-0.5 text-xs text-text-muted">
                          Zapłacono:{" "}
                          {formatMoney(
                            participant.paid
                          )}
                        </p>
                      </div>

                      <BalanceBadge
                        value={
                          participant.balance
                        }
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="rounded-card border border-primary-200 bg-primary-50 p-5">
              <h3 className="font-display text-lg font-extrabold text-text">
                Proponowane rozliczenie
              </h3>

              <p className="mt-2 text-xs leading-5 text-text-secondary">
                Równy udział pomiędzy zarejestrowanymi uczestnikami wyprawy.
              </p>

              {settlement.transfers.length >
              0 ? (
                <div className="mt-4 space-y-2.5">
                  {settlement.transfers.map(
                    (transfer, index) => (
                      <div
                        key={`${transfer.from}-${transfer.to}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-control bg-surface px-3.5 py-3"
                      >
                        <p className="min-w-0 text-sm font-bold text-text-secondary">
                          <span className="text-text">
                            {transfer.from}
                          </span>
                          {" → "}
                          {transfer.to}
                        </p>

                        <span className="shrink-0 text-sm font-extrabold text-primary-700">
                          {formatMoney(
                            transfer.amount
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-4 rounded-control bg-surface px-4 py-3 text-sm font-bold text-success-foreground">
                  Wszyscy są rozliczeni.
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-7 rounded-card border border-dashed border-border bg-surface-muted px-5 py-10 text-center">
          <p className="font-display text-lg font-extrabold text-text">
            Brak kosztów
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
            Dodaj pierwszy wydatek, a Rybio policzy udział na osobę i rozliczenie uczestników.
          </p>
        </div>
      )}
    </TripDetailsSection>
  );
}

function MetricCard({
  label,
  value,
  primary = false,
}: {
  label: string;
  value: string;
  primary?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-control px-4 py-4",
        primary
          ? "bg-primary-50"
          : "bg-surface-muted"
      )}
    >
      <p
        className={cn(
          "text-[10px] font-black uppercase tracking-[0.1em]",
          primary
            ? "text-primary-700"
            : "text-text-muted"
        )}
      >
        {label}
      </p>

      <p className="mt-1.5 font-display text-xl font-extrabold text-text">
        {value}
      </p>
    </div>
  );
}

function BalanceBadge({
  value,
}: {
  value: number;
}) {
  if (value > 0.009) {
    return (
      <Badge variant="success">
        +{formatMoney(value)}
      </Badge>
    );
  }

  if (value < -0.009) {
    return (
      <Badge variant="warning">
        -{formatMoney(Math.abs(value))}
      </Badge>
    );
  }

  return (
    <Badge variant="neutral">
      Rozliczone
    </Badge>
  );
}
