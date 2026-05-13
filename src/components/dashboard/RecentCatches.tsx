import { catches } from "@/data/dashboardData";

export function RecentCatches() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-bold">Ostatnie połowy</h2>

        <button className="text-sm font-semibold text-blue-600">Zobacz</button>
      </div>

      <div className="space-y-4">
        {catches.map((catchItem) => (
          <div
            key={catchItem.fish}
            className="flex items-center gap-3 border-b border-slate-100 pb-4 last:border-none last:pb-0"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-2xl">
              🐟
            </div>

            <div className="flex-1">
              <p className="font-semibold">{catchItem.fish}</p>
              <p className="text-sm text-slate-500">{catchItem.details}</p>
            </div>

            <p className="text-right text-sm text-slate-500">
              {catchItem.place}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}