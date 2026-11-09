import {
  Card,
} from "@/components/ui/Card";

export function AdminOverviewSummary({
  pendingTotal,
}: {
  pendingTotal: number;
}) {
  return (
    <Card variant="dark" className="p-5 sm:p-6">
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-aqua-200">
            Priorytet
          </p>

          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl">
            {pendingTotal > 0
              ? "Są sprawy wymagające decyzji"
              : "Kolejka moderacji jest pusta"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-text-on-dark-muted">
            {pendingTotal > 0
              ? "Najpierw obsłuż oczekujące zgłoszenia. Pozostałe statystyki są niżej jako kontekst stanu platformy."
              : "Wszystkie aktualne zgłoszenia administracyjne zostały obsłużone."}
          </p>
        </div>

        <div className="shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-on-dark-muted">
            Oczekujące sprawy
          </p>

          <p className="mt-1 font-display text-5xl font-extrabold tracking-[-0.045em] text-white">
            {pendingTotal}
          </p>
        </div>
      </div>
    </Card>
  );
}
