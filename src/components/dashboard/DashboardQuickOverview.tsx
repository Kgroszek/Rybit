import Link from "next/link";

type UpcomingTrip = {
  id: string;
  title: string;
  lakeName: string | null;
  startsAt: string;
  checklistId: string | null;
  status: string;
};

type GearItem = {
  id: string;
  name: string;
  category: string;
  fishingMethod: string;
  quantity: number;
};

type DashboardQuickOverviewProps = {
  upcomingTrip: UpcomingTrip | null;
  gearCount: number;
  recentGear: GearItem[];
};

export function DashboardQuickOverview({
  upcomingTrip,
  gearCount,
  recentGear,
}: DashboardQuickOverviewProps) {
  return (
    <section className="grid items-stretch gap-5 lg:grid-cols-2">
      <div className="flex h-full min-h-[360px] flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-500">
              Planowanie
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-950">
              Najbliższa wyprawa
            </h2>
          </div>

          <Link
            href="/wyprawy"
            className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
          >
            Zobacz
          </Link>
        </div>

        {upcomingTrip ? (
          <div className="mt-5 flex flex-1 flex-col">
            <h3 className="text-2xl font-bold tracking-tight text-slate-950">
              {upcomingTrip.title}
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoTile
                label="Data"
                value={formatDateTime(upcomingTrip.startsAt)}
              />

              <InfoTile
                label="Łowisko"
                value={upcomingTrip.lakeName || "Nie przypisano"}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                Planowana
              </span>

              {upcomingTrip.checklistId ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Checklista gotowa
                </span>
              ) : (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  Brak checklisty
                </span>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
              <Link
                href={`/wyprawy/${upcomingTrip.id}`}
                className="flex flex-1 items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Szczegóły wyprawy
              </Link>

              {upcomingTrip.checklistId ? (
                <Link
                  href={`/checklisty?active=${upcomingTrip.checklistId}`}
                  className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Otwórz checklistę
                </Link>
              ) : (
                <Link
                  href="/checklisty"
                  className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Utwórz checklistę
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-1 flex-col rounded-3xl bg-slate-50 p-6">
            <p className="text-lg font-bold text-slate-950">
              Nie masz jeszcze zaplanowanej wyprawy
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Zaplanuj wyjazd, przypisz łowisko i przygotuj checklistę sprzętu.
            </p>

            <div className="mt-auto pt-6">
              <Link
                href="/wyprawy"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
              >
                + Zaplanuj wyprawę
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-full min-h-[360px] flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-500">
              Sprzęt
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-950">
              Mój ekwipunek
            </h2>
          </div>

          <Link
            href="/ekwipunek"
            className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600 transition hover:bg-emerald-100"
          >
            Zobacz
          </Link>
        </div>

        <div className="mt-5 flex flex-1 flex-col">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">
              Wszystkie rzeczy w ekwipunku
            </p>

            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
              {gearCount}
            </p>
          </div>

          {recentGear.length > 0 ? (
            <div className="mt-5 space-y-3">
              {recentGear.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950">
                      {item.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {getCategoryLabel(item.category)} ·{" "}
                      {getFishingMethodLabel(item.fishingMethod)}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    x{item.quantity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl bg-slate-50 p-6">
              <p className="text-lg font-bold text-slate-950">
                Nie masz jeszcze sprzętu
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Dodaj wędki, kołowrotki, przynęty i akcesoria, żeby łatwiej
                przygotowywać wyprawy.
              </p>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
            <Link
              href="/ekwipunek"
              className="flex flex-1 items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Przejdź do ekwipunku
            </Link>

            <Link
              href="/ekwipunek"
              className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              + Dodaj sprzęt
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getCategoryLabel(category: string) {
  if (category === "rod") return "Wędka";
  if (category === "reel") return "Kołowrotek";
  if (category === "bait") return "Przynęta";
  if (category === "line") return "Żyłka / plecionka";
  if (category === "hook") return "Haczyki";
  if (category === "accessory") return "Akcesoria";
  if (category === "clothing") return "Odzież";
  if (category === "bag") return "Torba / plecak";
  return category;
}

function getFishingMethodLabel(method: string) {
  if (method === "spinning") return "Spinning";
  if (method === "feeder") return "Feeder";
  if (method === "method_feeder") return "Method feeder";
  if (method === "carp") return "Karpiówka";
  if (method === "float") return "Spławik";
  if (method === "fly") return "Muchówka";
  if (method === "universal") return "Uniwersalne";
  return method;
}