import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MyOwnerLakesPageProps = {
  searchParams?: Promise<{
    select?: string | string[];
  }>;
};

export default async function MyOwnerLakesPage({
  searchParams,
}: MyOwnerLakesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const forceSelector = getSearchParam(resolvedSearchParams.select) === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const ownedLakes = await prisma.lakeOwner.findMany({
    where: {
      userId: user.id,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      lake: {
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          voivodeship: true,
          ownerType: true,
          images: {
            take: 1,
            orderBy: [
              { sortOrder: "asc" },
              { createdAt: "asc" },
            ],
            select: {
              url: true,
            },
          },
          _count: {
            select: {
              spots: true,
              reservations: true,
            },
          },
        },
      },
    },
  });

  if (ownedLakes.length === 1 && !forceSelector) {
    redirect(`/moje-lowiska/${ownedLakes[0].lake.slug}`);
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Panel właściciela
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Wybierz łowisko
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Każde łowisko ma osobny pulpit, kalendarz rezerwacji i listę stanowisk.
            </p>
          </div>

          <Link
            href="/lowiska-w-polsce"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Publiczna baza łowisk
          </Link>
        </div>

        {ownedLakes.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {ownedLakes.map((ownerLake) => {
              const image = ownerLake.lake.images[0]?.url;

              return (
                <Link
                  key={ownerLake.id}
                  href={`/moje-lowiska/${ownerLake.lake.slug}`}
                  className="group overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    {image ? (
                      <img
                        src={image}
                        alt={`${ownerLake.lake.name} – zdjęcie łowiska`}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,.18),transparent_35%),linear-gradient(145deg,#eff6ff,#f8fafc)]" />
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/75 to-transparent" />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-black text-slate-700 shadow-sm backdrop-blur">
                        {ownerLake.lake.ownerType === "commercial" ? "Komercyjne" : "PZW"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-black text-slate-950">
                          {ownerLake.lake.name}
                        </h2>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                          {ownerLake.lake.city}, woj. {ownerLake.lake.voivodeship}
                        </p>
                      </div>

                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-black text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                        →
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <MiniStat
                        label="Stanowiska"
                        value={ownerLake.lake._count.spots}
                      />
                      <MiniStat
                        label="Rezerwacje"
                        value={ownerLake.lake._count.reservations}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[28px] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/80 sm:p-12">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Brak przypisanych łowisk
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-950">
              Nie masz jeszcze dostępu właścicielskiego
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Przejdź do publicznej bazy i zgłoś przejęcie profilu swojego łowiska. Po zatwierdzeniu pojawi się tutaj.
            </p>
            <Link
              href="/lowiska-w-polsce"
              className="mt-6 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
            >
              Znajdź swoje łowisko
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
