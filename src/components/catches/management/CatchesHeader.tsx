import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

export function CatchesHeader({ onAddCatch }: { onAddCatch: () => void }) {
  return (
    <PageHeader
      eyebrow="Moje połowy"
      title="Dziennik połowów"
      description="Zapisuj wyniki, buduj historię nad wodą i porównuj swoje najlepsze ryby dzięki Rybio Score."
      actions={
        <Button onClick={onAddCatch}>
          <AddCircleIcon className="h-4 w-4" />
          Dodaj połów
        </Button>
      }
    />
  );
}
