export function StatsSection() {
  return (
    <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-4">
      <Stat value="12" label="Odbyte wyprawy" />
      <Stat value="27" label="Złowionych gatunków" />
      <Stat value="89" label="Zapisanych łowisk" />
      <Stat value="156" label="Złowionych ryb" />
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}