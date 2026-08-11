import Link from "next/link";

type RecentCatch = {
  id: string;
  fishName: string;
  weight: number | null;
  length: number | null;
  method: string;
  bait: string | null;
  lakeName: string | null;
  tripTitle: string | null;
  caughtAt: string | Date;
};

export function RecentCatches({
  catches,
}: {
  catches: RecentCatch[];
}) {
  return (
    <section className="h-full overflow-hidden rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Dziennik
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            Ostatnie połowy
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Najnowsze wpisy z Twojego dziennika połowów.
          </p>
        </div>

        <Link
          href="/polowy"
          className="hidden shrink-0 text-sm font-black text-blue-600 transition hover:text-blue-700 sm:block"
        >
          Zobacz wszystkie →
        </Link>
      </div>

      {catches.length > 0 ? (
        <div className="mt-5 divide-y divide-slate-100">
          {catches.map((item) => (
            <Link
              key={item.id}
              href="/polowy"
              className="group grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-4 py-3.5 first:pt-0 last:pb-0"
            >
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-xl transition duration-300 group-hover:scale-105">
                🐟
              </div>

              <div className="min-w-0">
                <p className="truncate font-black text-slate-950 transition group-hover:text-blue-600">
                  {item.fishName}
                </p>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {formatCatchResult(item)}
                </p>

                <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                  {item.lakeName ||
                    item.tripTitle ||
                    getMethodLabel(item.method)}
                </p>
              </div>

              <div className="text-right">
                <p className="whitespace-nowrap text-xs font-bold text-slate-400">
                  {formatShortDate(item.caughtAt)}
                </p>
                <span className="mt-2 inline-block text-sm font-black text-slate-300 transition duration-300 group-hover:translate-x-0.5 group-hover:text-blue-600">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <p className="font-black text-slate-950">
            Twój dziennik jest jeszcze pusty
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Dodaj pierwszy połów, aby zacząć budować historię swoich wyników
            nad wodą.
          </p>
          <Link
            href="/polowy"
            className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
          >
            Dodaj połów
          </Link>
        </div>
      )}

      <Link
        href="/polowy"
        className="mt-5 flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-blue-600 sm:hidden"
      >
        Zobacz wszystkie połowy
      </Link>
    </section>
  );
}

function formatCatchResult(item: {
  weight: number | null;
  length: number | null;
  bait: string | null;
}) {
  const parts: string[] = [];

  if (item.length !== null) {
    parts.push(`${Math.round(item.length)} cm`);
  }

  if (item.weight !== null) {
    parts.push(`${Number(item.weight).toFixed(2)} kg`);
  }

  if (item.bait) {
    parts.push(item.bait);
  }

  return parts.length > 0
    ? parts.join(" • ")
    : "Bez dodatkowych parametrów";
}

function formatShortDate(date: string | Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

function getMethodLabel(value: string) {
  if (value === "spinning") return "Spinning";
  if (value === "feeder") return "Feeder";
  if (value === "method_feeder") return "Method feeder";
  if (value === "carp") return "Karpiówka";
  if (value === "float") return "Spławik";
  if (value === "fly") return "Muchówka";
  if (value === "other") return "Inna metoda";
  return value || "Bez przypisanego miejsca";
}
