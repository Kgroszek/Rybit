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
  caughtAt: string;
};

type RecentCatchesProps = {
  catches: RecentCatch[];
};

export function RecentCatches({ catches }: RecentCatchesProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-slate-950">Ostatnie połowy</h2>
        </div>

        <Link
          href="/polowy"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Zobacz
        </Link>
      </div>

      {catches.length > 0 ? (
        <div className="space-y-4">
          {catches.map((item) => (
            <Link
              key={item.id}
              href="/polowy"
              className="flex items-center gap-3 rounded-2xl transition hover:bg-slate-50"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                🐟
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-950">
                  {item.fishName}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                  {item.length && <span>{item.length.toFixed(0)} cm</span>}

                  {item.length && item.weight && <span>•</span>}

                  {item.weight && <span>{item.weight.toFixed(2)} kg</span>}

                  {!item.length && !item.weight && (
                    <span>{getMethodLabel(item.method)}</span>
                  )}
                </div>
              </div>

              <div className="max-w-[110px] shrink-0 text-right">
                <p className="truncate text-xs font-medium text-slate-500">
                  {item.lakeName || item.tripTitle || formatDate(item.caughtAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 p-5 text-center">
          <p className="font-semibold text-slate-950">Brak połowów</p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Dodaj pierwszy połów, a pojawi się tutaj.
          </p>

          <Link
            href="/polowy"
            className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Dodaj połów
          </Link>
        </div>
      )}
    </section>
  );
}

function getMethodLabel(value: string) {
  const methods: Record<string, string> = {
    spinning: "Spinning",
    feeder: "Feeder",
    method_feeder: "Method feeder",
    carp: "Karpiówka",
    float: "Spławik",
    fly: "Muchówka",
    other: "Inna",
  };

  return methods[value] || value;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}