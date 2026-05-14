import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type TripDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TripDetailsPage({ params }: TripDetailsPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const trip = await prisma.fishingTrip.findUnique({
    where: {
      id,
    },
  });

  if (!trip || trip.userId !== user.id) {
    notFound();
  }

  const [lake, checklist, catches] = await Promise.all([
    trip.lakeId
      ? prisma.lake.findUnique({
          where: {
            id: trip.lakeId,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            voivodeship: true,
            street: true,
            postalCode: true,
            rating: true,
            fish: true,
            lat: true,
            lng: true,
          },
        })
      : null,

    trip.checklistId
      ? prisma.tripChecklist.findUnique({
          where: {
            id: trip.checklistId,
          },
          include: {
            items: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        })
      : null,

    prisma.fishingCatch.findMany({
      where: {
        userId: user.id,
        tripId: trip.id,
      },
      orderBy: {
        caughtAt: "desc",
      },
    }),
  ]);

  const packedItemsCount =
    checklist?.items.filter((item) => item.isPacked).length ?? 0;

  const allItemsCount = checklist?.items.length ?? 0;

  const checklistProgress =
    allItemsCount > 0
      ? Math.round((packedItemsCount / allItemsCount) * 100)
      : 0;

  const totalWeight = catches.reduce((sum, item) => {
    return sum + (item.weight || 0);
  }, 0);

  const biggestCatch = catches.reduce<null | (typeof catches)[number]>(
    (biggest, item) => {
      if (!item.weight) {
        return biggest;
      }

      if (!biggest || item.weight > (biggest.weight || 0)) {
        return item;
      }

      return biggest;
    },
    null
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link
          href="/wyprawy"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Wróć do wypraw
        </Link>
      </div>

      <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-emerald-50 p-6 lg:p-8">
          <div className="mb-4 flex flex-wrap gap-2">
            <StatusBadge status={trip.status} />

            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
              {getTripTypeLabel(trip.tripType)}
            </span>

            {trip.checklistId && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                Checklista przypisana
              </span>
            )}
          </div>

          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {trip.title}
              </h1>

              <p className="mt-3 text-slate-600">
                {formatDateTime(trip.startsAt)}
              </p>

              {trip.note && (
                <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                  {trip.note}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {trip.checklistId && (
                <Link
                  href={`/checklisty?active=${trip.checklistId}`}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Otwórz checklistę
                </Link>
              )}

              <Link
                href={`/polowy?tripId=${trip.id}`}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                Dodaj połów
                </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Status" value={getStatusLabel(trip.status)} />
        <StatCard label="Połowy" value={String(catches.length)} />
        <StatCard
          label="Łączna waga"
          value={totalWeight > 0 ? `${totalWeight.toFixed(2)} kg` : "Brak"}
        />
        <StatCard
          label="Największa ryba"
          value={
            biggestCatch?.weight
              ? `${biggestCatch.fishName} ${biggestCatch.weight.toFixed(2)} kg`
              : "Brak"
          }
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <main className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Checklista wyprawy
            </h2>

            {checklist ? (
              <div className="mt-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-slate-950">
                      {checklist.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Spakowane: {packedItemsCount}/{allItemsCount}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-blue-50 px-4 py-3 text-lg font-bold text-blue-700">
                    {checklistProgress}%
                  </div>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>

                {checklist.items.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {checklist.items.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-4 rounded-2xl p-4 ${
                          item.isPacked ? "bg-emerald-50" : "bg-slate-50"
                        }`}
                      >
                        <div>
                          <p
                            className={`font-semibold ${
                              item.isPacked
                                ? "text-emerald-700 line-through"
                                : "text-slate-800"
                            }`}
                          >
                            {item.name}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Ilość: {item.quantity} {item.unit || ""}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            item.isPacked
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-white text-slate-500"
                          }`}
                        >
                          {item.isPacked ? "Spakowane" : "Brakuje"}
                        </span>
                      </div>
                    ))}

                    {checklist.items.length > 6 && (
                      <p className="text-center text-sm text-slate-500">
                        I jeszcze {checklist.items.length - 6} elementów...
                      </p>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    title="Checklista jest pusta"
                    description="Dodaj elementy w module checklist."
                  />
                )}

                <div className="mt-5 flex justify-end">
                  <Link
                    href={`/checklisty?active=${trip.checklistId}`}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Przejdź do checklist
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Brak checklisty"
                description="Ta wyprawa nie ma jeszcze przypisanej checklisty."
              />
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Połowy z tej wyprawy
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Ryby przypisane do tej konkretnej wyprawy.
                </p>
              </div>

              <Link
                  href={`/polowy?tripId=${trip.id}`}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Dodaj połów
              </Link>
            </div>

            {catches.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {catches.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                          {getMethodLabel(item.method)}
                        </p>

                        <h3 className="mt-2 text-lg font-bold text-slate-950">
                          {item.fishName}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatDateTime(item.caughtAt)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white px-3 py-2 text-sm font-bold text-blue-700">
                        🎣
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <InfoTile
                        label="Waga"
                        value={
                          item.weight ? `${item.weight.toFixed(2)} kg` : "Brak"
                        }
                      />

                      <InfoTile
                        label="Długość"
                        value={
                          item.length ? `${item.length.toFixed(0)} cm` : "Brak"
                        }
                      />
                    </div>

                    {item.bait && (
                      <p className="mt-4 text-sm text-slate-600">
                        <span className="font-semibold">Przynęta:</span>{" "}
                        {item.bait}
                      </p>
                    )}

                    {item.note && (
                      <p className="mt-3 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">
                        {item.note}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Brak połowów"
                description="Po zakończeniu wyprawy dodaj złowione ryby i przypisz je do tej wyprawy."
              />
            )}
          </section>
        </main>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Informacje o wyprawie
            </h2>

            <div className="mt-5 space-y-4">
              <DetailRow label="Data" value={formatDateTime(trip.startsAt)} />
              <DetailRow label="Typ" value={getTripTypeLabel(trip.tripType)} />
              <DetailRow label="Status" value={getStatusLabel(trip.status)} />
              <DetailRow
                label="Checklista"
                value={trip.checklistId ? "Przypisana" : "Brak"}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Łowisko</h2>

            {lake ? (
              <div className="mt-5">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-950">{lake.name}</p>

                  <p className="mt-1 text-sm text-slate-500">
                    {lake.street}, {lake.postalCode} {lake.city}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    woj. {lake.voivodeship}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      ★ {lake.rating.toFixed(1)}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                      {lake.fish}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <Link
                    href={`/lowiska/${lake.slug}`}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Zobacz łowisko
                  </Link>

                  <a
                    href={getNavigationUrl(lake.lat, lake.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Prowadź w Google Maps
                  </a>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Brak łowiska"
                description="Ta wyprawa nie ma przypisanego łowiska."
              />
            )}
          </section>
        </aside>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-none last:pb-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-right text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "finished") {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        Zakończona
      </span>
    );
  }

  if (status === "cancelled") {
    return (
      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
        Anulowana
      </span>
    );
  }

  return (
    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
      Planowana
    </span>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 text-center">
      <p className="font-bold text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function getTripTypeLabel(value: string) {
  const tripTypes: Record<string, string> = {
    custom: "Własna",
    spinning: "Spinning",
    feeder: "Feeder",
    method_feeder: "Method feeder",
    carp: "Karpiówka",
    float: "Spławik",
    night: "Nocka",
    competition: "Zawody",
  };

  return tripTypes[value] || value;
}

function getStatusLabel(value: string) {
  const statuses: Record<string, string> = {
    planned: "Planowana",
    finished: "Zakończona",
    cancelled: "Anulowana",
  };

  return statuses[value] || value;
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

function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getNavigationUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}