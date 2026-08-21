import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function TripsEmptyState({
  hasFilters,
  onCreate,
  onClear,
}: {
  hasFilters: boolean;
  onCreate: () => void;
  onClear: () => void;
}) {
  return (
    <Card>
      <div className="px-6 py-12 text-center sm:py-16">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-control bg-primary-100 text-primary-700">
          <AddCircleIcon className="h-5 w-5" />
        </div>

        <h2 className="mt-5 font-display text-xl font-extrabold text-text">
          {hasFilters
            ? "Nie znaleźliśmy takich wypraw"
            : "Zaplanuj pierwszą wyprawę"}
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
          {hasFilters
            ? "Zmień kryteria lub wyczyść filtry, aby zobaczyć pozostałe wyprawy."
            : "Dodaj termin i łowisko. Później przygotujesz checklistę, sprzęt i zaprosisz uczestników."}
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={onCreate}>
            Zaplanuj wyprawę
          </Button>

          {hasFilters && (
            <Button
              type="button"
              variant="outline"
              onClick={onClear}
            >
              Wyczyść filtry
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
