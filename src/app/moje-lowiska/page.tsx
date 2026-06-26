import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyOwnerLakesPage() {
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
          fishingType: true,
          rating: true,
          images: {
            take: 1,
            orderBy: [
              {
                sortOrder: "asc",
              },
              {
                createdAt: "asc",
              },
            ],
            select: {
              url: true,
            },
          },
          _count: {
            select: {
              images: true,
              fishSpecies: true,
              correctionReports: true,
              catches: true,
            },
          },
        },
      },
    },
  });

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
              Panel właściciela
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Moje łowiska
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
              Tutaj znajdziesz łowiska, do których masz nadany dostęp
              właścicielski. W kolejnych krokach dodamy edycję profilu,
              stanowiska i kalendarz rezerwacji.
            </p>
          </div>

          <Link
            href="/lowiska-w-polsce"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Przeglądaj publiczną bazę
          </Link>
        </div>

        {ownedLakes.length > 0 ? (
          <>
            <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Przypisane łowiska"
                value={ownedLakes.length}
                description="aktywne dostępy"
              />

              <StatCard
                label="Zdjęcia"
                value={ownedLakes.reduce(
                  (sum, item) => sum + item.lake._count.images,
                  0
                )}
                description="łącznie w profilach"
              />

              <StatCard
                label="Gatunki ryb"
                value={ownedLakes.reduce(
                  (sum, item) => sum + item.lake._count.fishSpecies,
                  0
                )}
                description="uzupełnione dane"
              />

              <StatCard
                label="Połowy"
                value={ownedLakes.reduce(
                  (sum, item) => sum + item.lake._count.catches,
                  0
                )}
                description="powiązane z łowiskami"
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {ownedLakes.map((ownerLake) => (
                <OwnerLakeCard
                  key={ownerLake.id}
                  lake={ownerLake.lake}
                  canEditLake={ownerLake.canEditLake}
                  canManageReservations={ownerLake.canManageReservations}
                  canManageSpots={ownerLake.canManageSpots}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyOwnerState />
        )}
      </div>
    </DashboardLayout>
  );
}

function OwnerLakeCard({
  lake,
  canEditLake,
  canManageReservations,
  canManageSpots,
}: {
  lake: {
    id: string;
    name: string;
    slug: string;
    city: string;
    voivodeship: string;
    ownerType: string;
    fishingType: string;
    rating: number;
    images: {
      url: string;
    }[];
    _count: {
      images: number;
      fishSpecies: number;
      correctionReports: number;
      catches: number;
    };
  };
  canEditLake: boolean;
  canManageReservations: boolean;
  canManageSpots: boolean;
}) {
  const imageUrl = lake.images[0]?.url;

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="h-48 bg-slate-100 md:h-full">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${lake.name} – zdjęcie łowiska`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-48 flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50 px-5 text-center">
              <p className="text-sm font-black text-slate-700">
                Brak zdjęcia
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Dodasz je później w edycji profilu.
              </p>
            </div>
          )}
        </div>

        <div className="min-w-0 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge>{getOwnerTypeLabel(lake.ownerType)}</Badge>
                <Badge>{getFishingTypeLabel(lake.fishingType)}</Badge>
              </div>

              <h2 className="mt-3 break-words text-2xl font-black text-slate-950">
                {lake.name}
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                {lake.city}, woj. {lake.voivodeship}
              </p>
            </div>

            <div className="w-fit rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700">
              ★ {Number(lake.rating || 0).toFixed(1)}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <SmallInfo label="Zdjęcia" value={lake._count.images} />
            <SmallInfo label="Ryby" value={lake._count.fishSpecies} />
            <SmallInfo label="Połowy" value={lake._count.catches} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Uprawnienia
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <PermissionBadge
                isEnabled={canEditLake}
                label="Edycja łowiska"
              />
              <PermissionBadge
                isEnabled={canManageSpots}
                label="Stanowiska"
              />
              <PermissionBadge
                isEnabled={canManageReservations}
                label="Rezerwacje"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Link
              href={`/lowiska-w-polsce/${lake.slug}`}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Podgląd
            </Link>

            {canEditLake ? (
              <>
                <Link
                  href={`/moje-lowiska/${lake.slug}/edytuj`}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Edytuj dane
                </Link>

                <Link
                  href={`/moje-lowiska/${lake.slug}/zdjecia`}
                  className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3 text-center text-sm font-black text-blue-700 transition hover:bg-blue-100"
                >
                  Zdjęcia
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-2xl bg-slate-100 px-5 py-3 text-center text-sm font-black text-slate-400"
                >
                  Edycja niedostępna
                </button>

                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-2xl bg-slate-100 px-5 py-3 text-center text-sm font-black text-slate-400"
                >
                  Zdjęcia niedostępne
                </button>
              </>
            )}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {canManageSpots ? (
              <Link
                href={`/moje-lowiska/${lake.slug}/stanowiska`}
                className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3 text-center text-sm font-black text-blue-700 transition hover:bg-blue-100"
              >
                Stanowiska
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-2xl bg-slate-100 px-5 py-3 text-center text-sm font-black text-slate-400"
              >
                Stanowiska niedostępne
              </button>
            )}

            {canManageReservations ? (
              <Link
                href={`/moje-lowiska/${lake.slug}/rezerwacje`}
                className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3 text-center text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
              >
                Rezerwacje
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-2xl bg-slate-100 px-5 py-3 text-center text-sm font-black text-slate-400"
              >
                Rezerwacje niedostępne
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyOwnerState() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 p-6 sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
          Brak przypisanych łowisk
        </p>

        <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
          Nie masz jeszcze dostępu właścicielskiego
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
          Aby zarządzać łowiskiem, najpierw przejdź na publiczny profil swojego
          łowiska i kliknij „Przejmij profil łowiska”. Po zatwierdzeniu przez
          administrację Rybio pojawi się ono w tym miejscu.
        </p>

        <div className="mt-6 grid gap-3 sm:max-w-xl sm:grid-cols-2">
          <Link
            href="/lowiska-w-polsce"
            className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
          >
            Znajdź swoje łowisko
          </Link>

          <Link
            href="/kontakt"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Skontaktuj się z Rybio
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>

      <p className="mt-1 text-sm font-semibold text-slate-500">
        {description}
      </p>
    </div>
  );
}

function SmallInfo({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
      {children}
    </span>
  );
}

function PermissionBadge({
  isEnabled,
  label,
}: {
  isEnabled: boolean;
  label: string;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        isEnabled
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-400"
      }`}
    >
      {isEnabled ? "✓" : "–"} {label}
    </span>
  );
}

function getOwnerTypeLabel(type: string) {
  if (type === "commercial") {
    return "Komercyjne";
  }

  if (type === "pzw") {
    return "PZW";
  }

  return "Inne";
}

function getFishingTypeLabel(type: string) {
  if (type === "carp") {
    return "Karpiowe";
  }

  if (type === "spinning") {
    return "Spinningowe";
  }

  return "Ogólne";
}