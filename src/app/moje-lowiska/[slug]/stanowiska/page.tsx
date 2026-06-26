import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OwnerLakeSpotsPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    created?: string | string[];
    updated?: string | string[];
    deleted?: string | string[];
    deactivated?: string | string[];
    reordered?: string | string[];
    error?: string | string[];
  }>;
};

export default async function OwnerLakeSpotsPage({
  params,
  searchParams,
}: OwnerLakeSpotsPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const created = getSearchParamValue(resolvedSearchParams.created) === "1";
  const updated = getSearchParamValue(resolvedSearchParams.updated) === "1";
  const deleted = getSearchParamValue(resolvedSearchParams.deleted) === "1";
  const deactivated =
    getSearchParamValue(resolvedSearchParams.deactivated) === "1";
  const reordered =
    getSearchParamValue(resolvedSearchParams.reordered) === "1";
  const error = getSearchParamValue(resolvedSearchParams.error);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const ownerLake = await prisma.lakeOwner.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      lake: {
        slug,
      },
    },
    include: {
      lake: {
        include: {
          spots: {
            orderBy: [
              {
                sortOrder: "asc",
              },
              {
                createdAt: "asc",
              },
            ],
            include: {
              _count: {
                select: {
                  reservations: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!ownerLake) {
    notFound();
  }

  const lake = ownerLake.lake;

  const activeSpotsCount = lake.spots.filter((spot) => spot.isActive).length;
  const onlineSpotsCount = lake.spots.filter(
    (spot) => spot.isReservableOnline
  ).length;

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
              Panel właściciela
            </p>

            <h1 className="mt-2 break-words text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Stanowiska łowiska
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
              Dodawaj i zarządzaj stanowiskami, pomostami, domkami lub strefami
              łowiska. Te stanowiska będą później używane w systemie
              rezerwacji.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-auto">
            <Link
              href={`/moje-lowiska/${lake.slug}/edytuj`}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Edytuj dane
            </Link>

            <Link
              href={`/moje-lowiska/${lake.slug}/zdjecia`}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Zdjęcia
            </Link>

            <Link
              href={`/lowiska-w-polsce/${lake.slug}`}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
            >
              Podgląd
            </Link>
          </div>
        </div>

        {created && (
          <Alert
            variant="success"
            title="Stanowisko zostało dodane"
            description="Możesz już używać go później przy tworzeniu rezerwacji."
          />
        )}

        {updated && (
          <Alert
            variant="success"
            title="Stanowisko zostało zaktualizowane"
            description="Zmiany zostały zapisane."
          />
        )}

        {deleted && (
          <Alert
            variant="success"
            title="Stanowisko zostało usunięte"
            description="Usunięto stanowisko, które nie miało jeszcze rezerwacji."
          />
        )}

        {deactivated && (
          <Alert
            variant="success"
            title="Stanowisko zostało wyłączone"
            description="Nie usunęliśmy go całkowicie, ponieważ ma już historię rezerwacji. Zostało oznaczone jako nieaktywne."
          />
        )}

        {reordered && (
          <Alert
            variant="success"
            title="Kolejność stanowisk została zmieniona"
            description="Nowa kolejność będzie używana w panelu właściciela i później w rezerwacjach."
          />
        )}

        {error && (
          <Alert
            variant="danger"
            title="Nie udało się wykonać akcji"
            description={getErrorMessage(error)}
          />
        )}

        {!ownerLake.canManageSpots ? (
          <NoAccessCard lakeSlug={lake.slug} />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <section className="min-w-0 space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="Wszystkie stanowiska"
                  value={lake.spots.length}
                  description="Łączna liczba utworzonych stanowisk."
                />

                <StatCard
                  label="Aktywne"
                  value={activeSpotsCount}
                  description="Widoczne i dostępne w panelu."
                />

                <StatCard
                  label="Online"
                  value={onlineSpotsCount}
                  description="Gotowe pod przyszłe rezerwacje online."
                />
              </div>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950">
                      Lista stanowisk
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Pierwsze stanowiska na liście będą pokazywane wyżej w
                      systemie rezerwacji.
                    </p>
                  </div>

                  <Link
                    href="/moje-lowiska"
                    className="w-fit rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    Wróć do moich łowisk
                  </Link>
                </div>

                {lake.spots.length > 0 ? (
                  <div className="mt-6 grid gap-4">
                    {lake.spots.map((spot, index) => {
                      const isFirst = index === 0;
                      const isLast = index === lake.spots.length - 1;

                      return (
                        <article
                          key={spot.id}
                          className={`rounded-3xl border p-4 shadow-sm sm:p-5 ${
                            spot.isActive
                              ? "border-slate-200 bg-white"
                              : "border-slate-200 bg-slate-50 opacity-75"
                          }`}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                                  #{index + 1}
                                </span>

                                {spot.isActive ? (
                                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                                    Aktywne
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600">
                                    Nieaktywne
                                  </span>
                                )}

                                {spot.isReservableOnline && (
                                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                                    Rezerwacje online
                                  </span>
                                )}

                                {spot._count.reservations > 0 && (
                                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                                    Rezerwacje: {spot._count.reservations}
                                  </span>
                                )}
                              </div>

                              <h3 className="mt-3 break-words text-xl font-black text-slate-950">
                                {spot.name}
                              </h3>

                              {spot.description ? (
                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500">
                                  {spot.description}
                                </p>
                              ) : (
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                  Brak opisu stanowiska.
                                </p>
                              )}

                              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <InfoPill
                                  label="Maks. osób"
                                  value={`${spot.maxPeople}`}
                                />

                                <InfoPill
                                  label="Dzień"
                                  value={formatPrice(spot.pricePerDay)}
                                />

                                <InfoPill
                                  label="Nocka"
                                  value={formatPrice(spot.pricePerNight)}
                                />

                                <InfoPill
                                  label="Doba"
                                  value={formatPrice(spot.pricePer24h)}
                                />
                              </div>
                            </div>

                            <form
                              action={reorderLakeSpot}
                              className="grid grid-cols-2 gap-2 lg:w-48"
                            >
                              <input
                                type="hidden"
                                name="lakeId"
                                value={lake.id}
                              />

                              <input
                                type="hidden"
                                name="slug"
                                value={lake.slug}
                              />

                              <input
                                type="hidden"
                                name="spotId"
                                value={spot.id}
                              />

                              <button
                                type="submit"
                                name="direction"
                                value="up"
                                disabled={isFirst}
                                className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                ↑ Wyżej
                              </button>

                              <button
                                type="submit"
                                name="direction"
                                value="down"
                                disabled={isLast}
                                className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                ↓ Niżej
                              </button>
                            </form>
                          </div>

                          <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <summary className="cursor-pointer text-sm font-black text-slate-700">
                              Edytuj stanowisko
                            </summary>

                            <form
                              action={updateLakeSpot}
                              className="mt-5 grid gap-4"
                            >
                              <input
                                type="hidden"
                                name="lakeId"
                                value={lake.id}
                              />

                              <input
                                type="hidden"
                                name="slug"
                                value={lake.slug}
                              />

                              <input
                                type="hidden"
                                name="spotId"
                                value={spot.id}
                              />

                              <FormField label="Nazwa stanowiska">
                                <input
                                  name="name"
                                  type="text"
                                  required
                                  defaultValue={spot.name}
                                  className={inputClassName}
                                />
                              </FormField>

                              <FormField label="Opis">
                                <textarea
                                  name="description"
                                  rows={4}
                                  defaultValue={spot.description || ""}
                                  className={textareaClassName}
                                />
                              </FormField>

                              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <FormField label="Maks. liczba osób">
                                  <input
                                    name="maxPeople"
                                    type="number"
                                    min="1"
                                    max="99"
                                    defaultValue={spot.maxPeople}
                                    className={inputClassName}
                                  />
                                </FormField>

                                <FormField label="Cena za dzień">
                                  <input
                                    name="pricePerDay"
                                    type="text"
                                    inputMode="decimal"
                                    defaultValue={formatNumberInput(
                                      spot.pricePerDay
                                    )}
                                    placeholder="np. 50"
                                    className={inputClassName}
                                  />
                                </FormField>

                                <FormField label="Cena za nockę">
                                  <input
                                    name="pricePerNight"
                                    type="text"
                                    inputMode="decimal"
                                    defaultValue={formatNumberInput(
                                      spot.pricePerNight
                                    )}
                                    placeholder="np. 70"
                                    className={inputClassName}
                                  />
                                </FormField>

                                <FormField label="Cena za dobę">
                                  <input
                                    name="pricePer24h"
                                    type="text"
                                    inputMode="decimal"
                                    defaultValue={formatNumberInput(
                                      spot.pricePer24h
                                    )}
                                    placeholder="np. 100"
                                    className={inputClassName}
                                  />
                                </FormField>
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2">
                                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                                  <input
                                    name="isActive"
                                    type="checkbox"
                                    defaultChecked={spot.isActive}
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />

                                  <span>
                                    <span className="block text-sm font-black text-slate-800">
                                      Stanowisko aktywne
                                    </span>

                                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                                      Nieaktywne stanowiska zostają w historii,
                                      ale nie powinny być używane w nowych
                                      rezerwacjach.
                                    </span>
                                  </span>
                                </label>

                                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                                  <input
                                    name="isReservableOnline"
                                    type="checkbox"
                                    defaultChecked={spot.isReservableOnline}
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />

                                  <span>
                                    <span className="block text-sm font-black text-slate-800">
                                      Rezerwacje online
                                    </span>

                                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                                      Przygotowane pod późniejszą publiczną
                                      rezerwację przez wędkarzy.
                                    </span>
                                  </span>
                                </label>
                              </div>

                              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                <button
                                  type="submit"
                                  className="rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700"
                                >
                                  Zapisz zmiany
                                </button>
                              </div>
                            </form>

                            <form action={deleteLakeSpot} className="mt-3">
                              <input
                                type="hidden"
                                name="lakeId"
                                value={lake.id}
                              />

                              <input
                                type="hidden"
                                name="slug"
                                value={lake.slug}
                              />

                              <input
                                type="hidden"
                                name="spotId"
                                value={spot.id}
                              />

                              <button
                                type="submit"
                                className="w-full rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700 transition hover:bg-red-100"
                              >
                                {spot._count.reservations > 0
                                  ? "Wyłącz stanowisko"
                                  : "Usuń stanowisko"}
                              </button>
                            </form>
                          </details>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                    <p className="text-2xl font-black text-slate-950">
                      Nie masz jeszcze stanowisk
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      Dodaj pierwsze stanowisko, pomost, domek albo strefę.
                      Dopiero później będziemy mogli przypinać do nich
                      rezerwacje.
                    </p>
                  </div>
                )}
              </section>
            </section>

            <aside className="min-w-0 space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
                  Nowe stanowisko
                </p>

                <h2 className="mt-3 break-words text-2xl font-black text-slate-950">
                  {lake.name}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Dodaj stanowiska, które właściciel będzie mógł później
                  rezerwować w kalendarzu.
                </p>

                <form action={createLakeSpot} className="mt-5 space-y-4">
                  <input type="hidden" name="lakeId" value={lake.id} />
                  <input type="hidden" name="slug" value={lake.slug} />

                  <FormField label="Nazwa stanowiska">
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="np. Stanowisko 1, Pomost 3, Domek VIP"
                      className={inputClassName}
                    />
                  </FormField>

                  <FormField label="Opis">
                    <textarea
                      name="description"
                      rows={4}
                      placeholder="Np. stanowisko blisko parkingu, miejsce na namiot, wygodny pomost..."
                      className={textareaClassName}
                    />
                  </FormField>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Maks. liczba osób">
                      <input
                        name="maxPeople"
                        type="number"
                        min="1"
                        max="99"
                        defaultValue="2"
                        className={inputClassName}
                      />
                    </FormField>

                    <FormField label="Cena za dobę">
                      <input
                        name="pricePer24h"
                        type="text"
                        inputMode="decimal"
                        placeholder="np. 100"
                        className={inputClassName}
                      />
                    </FormField>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Cena za dzień">
                      <input
                        name="pricePerDay"
                        type="text"
                        inputMode="decimal"
                        placeholder="np. 50"
                        className={inputClassName}
                      />
                    </FormField>

                    <FormField label="Cena za nockę">
                      <input
                        name="pricePerNight"
                        type="text"
                        inputMode="decimal"
                        placeholder="np. 70"
                        className={inputClassName}
                      />
                    </FormField>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <input
                        name="isActive"
                        type="checkbox"
                        defaultChecked
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />

                      <span>
                        <span className="block text-sm font-black text-slate-800">
                          Aktywne
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          Stanowisko będzie dostępne w panelu rezerwacji.
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <input
                        name="isReservableOnline"
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />

                      <span>
                        <span className="block text-sm font-black text-slate-800">
                          Rezerwacje online
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          Na razie tylko zapisujemy ustawienie. Publiczne
                          rezerwacje dodamy w kolejnym etapie.
                        </span>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700"
                  >
                    Dodaj stanowisko
                  </button>
                </form>
              </section>

              <section className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <h2 className="text-xl font-black text-blue-950">
                  Po co dodajemy stanowiska?
                </h2>

                <div className="mt-4 space-y-3 text-sm leading-6 text-blue-800">
                  <p>
                    ✓ rezerwacje będą przypisane do konkretnych stanowisk,
                  </p>
                  <p>✓ system wykryje konflikty terminów,</p>
                  <p>✓ później pokażemy dostępność w kalendarzu,</p>
                  <p>✓ zawody będą mogły blokować całe łowisko.</p>
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

async function createLakeSpot(formData: FormData) {
  "use server";

  const lakeId = getString(formData, "lakeId");
  const slug = getString(formData, "slug");
  const name = getString(formData, "name");

  if (!lakeId || !slug) {
    redirect("/moje-lowiska");
  }

  if (!name) {
    redirect(`/moje-lowiska/${slug}/stanowiska?error=name`);
  }

  const ownerLake = await getOwnerLakeWithSpotPermission(lakeId);

  const lastSpot = await prisma.lakeSpot.findFirst({
    where: {
      lakeId: ownerLake.lake.id,
    },
    orderBy: [
      {
        sortOrder: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      sortOrder: true,
    },
  });

  const sortOrder = (lastSpot?.sortOrder ?? -1) + 1;
  const spotSlug = await createSpotSlug(ownerLake.lake.id, name);

  await prisma.lakeSpot.create({
    data: {
      lakeId: ownerLake.lake.id,
      name,
      slug: spotSlug,
      description: getOptionalString(formData, "description"),
      maxPeople: getPositiveInt(formData, "maxPeople", 2),
      pricePerDay: getOptionalPrice(formData, "pricePerDay"),
      pricePerNight: getOptionalPrice(formData, "pricePerNight"),
      pricePer24h: getOptionalPrice(formData, "pricePer24h"),
      isActive: formData.get("isActive") === "on",
      isReservableOnline: formData.get("isReservableOnline") === "on",
      sortOrder,
    },
  });

  revalidateLakeSpotPaths(ownerLake.lake.slug);

  redirect(`/moje-lowiska/${ownerLake.lake.slug}/stanowiska?created=1`);
}

async function updateLakeSpot(formData: FormData) {
  "use server";

  const lakeId = getString(formData, "lakeId");
  const slug = getString(formData, "slug");
  const spotId = getString(formData, "spotId");
  const name = getString(formData, "name");

  if (!lakeId || !slug || !spotId) {
    redirect("/moje-lowiska");
  }

  if (!name) {
    redirect(`/moje-lowiska/${slug}/stanowiska?error=name`);
  }

  const ownerLake = await getOwnerLakeWithSpotPermission(lakeId);

  const existingSpot = await prisma.lakeSpot.findFirst({
    where: {
      id: spotId,
      lakeId: ownerLake.lake.id,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!existingSpot) {
    redirect(`/moje-lowiska/${ownerLake.lake.slug}/stanowiska?error=not-found`);
  }

  const shouldUpdateSlug = existingSpot.name !== name;
  const spotSlug = shouldUpdateSlug
    ? await createSpotSlug(ownerLake.lake.id, name, existingSpot.id)
    : existingSpot.slug;

  await prisma.lakeSpot.update({
    where: {
      id: existingSpot.id,
    },
    data: {
      name,
      slug: spotSlug,
      description: getOptionalString(formData, "description"),
      maxPeople: getPositiveInt(formData, "maxPeople", 2),
      pricePerDay: getOptionalPrice(formData, "pricePerDay"),
      pricePerNight: getOptionalPrice(formData, "pricePerNight"),
      pricePer24h: getOptionalPrice(formData, "pricePer24h"),
      isActive: formData.get("isActive") === "on",
      isReservableOnline: formData.get("isReservableOnline") === "on",
    },
  });

  revalidateLakeSpotPaths(ownerLake.lake.slug);

  redirect(`/moje-lowiska/${ownerLake.lake.slug}/stanowiska?updated=1`);
}

async function reorderLakeSpot(formData: FormData) {
  "use server";

  const lakeId = getString(formData, "lakeId");
  const slug = getString(formData, "slug");
  const spotId = getString(formData, "spotId");
  const direction = getString(formData, "direction");

  if (!lakeId || !slug || !spotId) {
    redirect("/moje-lowiska");
  }

  if (direction !== "up" && direction !== "down") {
    redirect(`/moje-lowiska/${slug}/stanowiska`);
  }

  const ownerLake = await getOwnerLakeWithSpotPermission(lakeId);

  const spots = await prisma.lakeSpot.findMany({
    where: {
      lakeId: ownerLake.lake.id,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    select: {
      id: true,
    },
  });

  const currentIndex = spots.findIndex((spot) => spot.id === spotId);

  if (currentIndex === -1) {
    redirect(`/moje-lowiska/${ownerLake.lake.slug}/stanowiska?error=not-found`);
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= spots.length) {
    redirect(`/moje-lowiska/${ownerLake.lake.slug}/stanowiska`);
  }

  const reorderedSpots = [...spots];

  [reorderedSpots[currentIndex], reorderedSpots[targetIndex]] = [
    reorderedSpots[targetIndex],
    reorderedSpots[currentIndex],
  ];

  await saveSpotsOrder(reorderedSpots);

  revalidateLakeSpotPaths(ownerLake.lake.slug);

  redirect(`/moje-lowiska/${ownerLake.lake.slug}/stanowiska?reordered=1`);
}

async function deleteLakeSpot(formData: FormData) {
  "use server";

  const lakeId = getString(formData, "lakeId");
  const slug = getString(formData, "slug");
  const spotId = getString(formData, "spotId");

  if (!lakeId || !slug || !spotId) {
    redirect("/moje-lowiska");
  }

  const ownerLake = await getOwnerLakeWithSpotPermission(lakeId);

  const spot = await prisma.lakeSpot.findFirst({
    where: {
      id: spotId,
      lakeId: ownerLake.lake.id,
    },
    select: {
      id: true,
    },
  });

  if (!spot) {
    redirect(`/moje-lowiska/${ownerLake.lake.slug}/stanowiska?error=not-found`);
  }

  const reservationsCount = await prisma.lakeReservation.count({
    where: {
      spotId: spot.id,
    },
  });

  if (reservationsCount > 0) {
    await prisma.lakeSpot.update({
      where: {
        id: spot.id,
      },
      data: {
        isActive: false,
        isReservableOnline: false,
      },
    });

    revalidateLakeSpotPaths(ownerLake.lake.slug);

    redirect(`/moje-lowiska/${ownerLake.lake.slug}/stanowiska?deactivated=1`);
  }

  await prisma.lakeSpot.delete({
    where: {
      id: spot.id,
    },
  });

  const remainingSpots = await prisma.lakeSpot.findMany({
    where: {
      lakeId: ownerLake.lake.id,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    select: {
      id: true,
    },
  });

  await saveSpotsOrder(remainingSpots);

  revalidateLakeSpotPaths(ownerLake.lake.slug);

  redirect(`/moje-lowiska/${ownerLake.lake.slug}/stanowiska?deleted=1`);
}

async function getOwnerLakeWithSpotPermission(lakeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const ownerLake = await prisma.lakeOwner.findFirst({
    where: {
      lakeId,
      userId: user.id,
      isActive: true,
      canManageSpots: true,
    },
    include: {
      lake: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  });

  if (!ownerLake) {
    redirect("/moje-lowiska");
  }

  return ownerLake;
}

async function saveSpotsOrder(spots: { id: string }[]) {
  if (spots.length === 0) {
    return;
  }

  await prisma.$transaction(
    spots.map((spot, index) =>
      prisma.lakeSpot.update({
        where: {
          id: spot.id,
        },
        data: {
          sortOrder: index,
        },
      })
    )
  );
}

async function createSpotSlug(
  lakeId: string,
  name: string,
  currentSpotId?: string
) {
  const baseSlug = slugify(name) || `stanowisko-${Date.now()}`;

  const existingSpots = await prisma.lakeSpot.findMany({
    where: {
      lakeId,
      slug: {
        startsWith: baseSlug,
      },
      ...(currentSpotId
        ? {
            NOT: {
              id: currentSpotId,
            },
          }
        : {}),
    },
    select: {
      slug: true,
    },
  });

  if (!existingSpots.some((spot) => spot.slug === baseSlug)) {
    return baseSlug;
  }

  let counter = existingSpots.length + 1;
  let nextSlug = `${baseSlug}-${counter}`;

  while (existingSpots.some((spot) => spot.slug === nextSlug)) {
    counter += 1;
    nextSlug = `${baseSlug}-${counter}`;
  }

  return nextSlug;
}

function revalidateLakeSpotPaths(slug: string) {
  revalidatePath("/moje-lowiska");
  revalidatePath(`/moje-lowiska/${slug}/stanowiska`);
  revalidatePath(`/moje-lowiska/${slug}/rezerwacje`);
  revalidatePath(`/lowiska-w-polsce/${slug}`);
}

function NoAccessCard({ lakeSlug }: { lakeSlug: string }) {
  return (
    <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-700">
        Brak uprawnień
      </p>

      <h2 className="mt-3 text-2xl font-black text-amber-950">
        Nie możesz zarządzać stanowiskami tego łowiska
      </h2>

      <p className="mt-3 text-sm leading-6 text-amber-800">
        Twoje konto jest przypisane do tego łowiska, ale nie ma aktywnego
        uprawnienia do zarządzania stanowiskami.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/moje-lowiska"
          className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-amber-800 transition hover:bg-amber-100"
        >
          Wróć do moich łowisk
        </Link>

        <Link
          href={`/lowiska-w-polsce/${lakeSlug}`}
          className="rounded-2xl bg-amber-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-amber-700"
        >
          Podgląd publiczny
        </Link>
      </div>
    </div>
  );
}

function Alert({
  variant,
  title,
  description,
}: {
  variant: "success" | "danger";
  title: string;
  description: string;
}) {
  const classes =
    variant === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-800"
      : "border-red-100 bg-red-50 text-red-800";

  const titleClass =
    variant === "success" ? "text-emerald-950" : "text-red-950";

  return (
    <div className={`mb-6 rounded-3xl border p-5 ${classes}`}>
      <p className={`text-lg font-black ${titleClass}`}>{title}</p>
      <p className="mt-2 text-sm leading-6">{description}</p>
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
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-4xl font-black text-slate-950">{value}</p>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}

const inputClassName =
  "block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

const textareaClassName =
  "block w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);

  return value.length > 0 ? value : null;
}

function getPositiveInt(formData: FormData, key: string, fallback: number) {
  const rawValue = getString(formData, key);
  const value = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(value) || value < 1) {
    return fallback;
  }

  return value;
}

function getOptionalPrice(formData: FormData, key: string) {
  const rawValue = getString(formData, key)
    .replace(/\s/g, "")
    .replace(",", ".");

  if (!rawValue) {
    return null;
  }

  const value = Number.parseFloat(rawValue);

  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  return value;
}

function formatPrice(value: number | null) {
  if (value === null) {
    return "Nie podano";
  }

  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumberInput(value: number | null) {
  if (value === null) {
    return "";
  }

  return String(value).replace(".", ",");
}

function getSearchParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

function getErrorMessage(error: string) {
  if (error === "name") {
    return "Nazwa stanowiska jest wymagana.";
  }

  if (error === "not-found") {
    return "Nie znaleziono stanowiska.";
  }

  return "Spróbuj ponownie za chwilę.";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}