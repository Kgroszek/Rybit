import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { Button } from "@/components/ui/Button";

export function TripsHeader({
  onCreate,
}: {
  onCreate: () => void;
}) {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
          Moje wyprawy
        </p>

        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.035em] text-text sm:text-4xl">
          Centrum wypraw
        </h1>

        <p className="mt-3 max-w-2xl text-[15px] leading-6 text-text-secondary">
          Planuj wyjazdy, przygotowuj sprzęt i checklisty oraz prowadź całą
          wyprawę w jednym miejscu.
        </p>
      </div>

      <Button
        type="button"
        size="lg"
        onClick={onCreate}
        className="w-full lg:w-auto"
      >
        <AddCircleIcon className="h-4.5 w-4.5" />
        Zaplanuj wyprawę
      </Button>
    </header>
  );
}
