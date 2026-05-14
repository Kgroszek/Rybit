type DashboardStatsProps = {
  completedTripsCount: number;
  completedTripsThisWeekCount: number;
  uniqueSpeciesCount: number;
  uniqueSpeciesThisWeekCount: number;
  savedLakesCount: number;
  savedLakesThisWeekCount: number;
  catchesCount: number;
  catchesThisWeekCount: number;
};

export function DashboardStats({
  completedTripsCount,
  completedTripsThisWeekCount,
  uniqueSpeciesCount,
  uniqueSpeciesThisWeekCount,
  savedLakesCount,
  savedLakesThisWeekCount,
  catchesCount,
  catchesThisWeekCount,
}: DashboardStatsProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatBox
          value={completedTripsCount}
          label="Odbyte wyprawy"
          weeklyValue={completedTripsThisWeekCount}
          weeklyLabel="w tym tygodniu"
        />

        <StatBox
          value={uniqueSpeciesCount}
          label="Złowionych gatunków"
          weeklyValue={uniqueSpeciesThisWeekCount}
          weeklyLabel="nowe w tym tygodniu"
        />

        <StatBox
          value={savedLakesCount}
          label="Zapisanych łowisk"
          weeklyValue={savedLakesThisWeekCount}
          weeklyLabel="dodane w tym tygodniu"
        />

        <StatBox
          value={catchesCount}
          label="Złowionych ryb"
          weeklyValue={catchesThisWeekCount}
          weeklyLabel="w tym tygodniu"
        />
      </div>
    </section>
  );
}

function StatBox({
  value,
  label,
  weeklyValue,
  weeklyLabel,
}: {
  value: number;
  label: string;
  weeklyValue: number;
  weeklyLabel: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-5 py-6">
      <p className="text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>

      <p
        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
          weeklyValue > 0
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {weeklyValue > 0 ? `+${weeklyValue}` : "0"} {weeklyLabel}
      </p>
    </div>
  );
}