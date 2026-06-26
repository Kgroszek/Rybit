import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ReactNode } from "react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const TIME_ZONE = "Europe/Warsaw";

const blockingReservationStatuses = ["pending", "confirmed", "paid"];

type BookingSettingsForReservations = {
  defaultStartTime: string;
  defaultEndTime: string;

  fullDayStartTime: string;
  fullDayEndTime: string;

  dayStartTime: string;
  dayEndTime: string;

  nightStartTime: string;
  nightEndTime: string;
};

const defaultBookingSettings: BookingSettingsForReservations = {
  defaultStartTime: "12:00",
  defaultEndTime: "10:00",

  fullDayStartTime: "06:00",
  fullDayEndTime: "07:00",

  dayStartTime: "08:00",
  dayEndTime: "16:00",

  nightStartTime: "16:00",
  nightEndTime: "06:00",
};

type OwnerLakeReservationsPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    startsAt?: string | string[];
    endsAt?: string | string[];
    spotId?: string | string[];
    reservationId?: string | string[];
    mode?: string | string[];
    created?: string | string[];
    eventCreated?: string | string[];
    updated?: string | string[];
    cancelled?: string | string[];
    error?: string | string[];
  }>;
};

export default async function OwnerLakeReservationsPage({
  params,
  searchParams,
}: OwnerLakeReservationsPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

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
          bookingSettings: true,
          spots: {
            orderBy: [
              {
                sortOrder: "asc",
              },
              {
                createdAt: "asc",
              },
            ],
          },
        },
      },
    },
  });

  if (!ownerLake) {
    notFound();
  }

  const lake = ownerLake.lake;
  const settings: BookingSettingsForReservations =
    lake.bookingSettings || defaultBookingSettings;

  const defaultRange = getDefaultDateRangeInputs(settings);

  let startsAtInput =
    getSearchParamValue(resolvedSearchParams.startsAt) ||
    defaultRange.startsAtInput;

  let endsAtInput =
    getSearchParamValue(resolvedSearchParams.endsAt) ||
    defaultRange.endsAtInput;

  let startsAt = parseWarsawDateTime(startsAtInput);
  let endsAt = parseWarsawDateTime(endsAtInput);

  if (!startsAt || !endsAt || endsAt <= startsAt) {
    startsAtInput = defaultRange.startsAtInput;
    endsAtInput = defaultRange.endsAtInput;
    startsAt = parseWarsawDateTime(startsAtInput);
    endsAt = parseWarsawDateTime(endsAtInput);
  }

  if (!startsAt || !endsAt) {
    redirect("/moje-lowiska");
  }

  const reservations = await prisma.lakeReservation.findMany({
    where: {
      lakeId: lake.id,
      startsAt: {
        lt: endsAt,
      },
      endsAt: {
        gt: startsAt,
      },
    },
    orderBy: [
      {
        startsAt: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    include: {
      spot: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const selectedSpotId = getSearchParamValue(resolvedSearchParams.spotId);
  const selectedReservationId = getSearchParamValue(
    resolvedSearchParams.reservationId
  );
  const selectedMode = getSearchParamValue(resolvedSearchParams.mode);

  const created = getSearchParamValue(resolvedSearchParams.created) === "1";
  const eventCreated =
    getSearchParamValue(resolvedSearchParams.eventCreated) === "1";
  const updated = getSearchParamValue(resolvedSearchParams.updated) === "1";
  const cancelled =
    getSearchParamValue(resolvedSearchParams.cancelled) === "1";
  const error = getSearchParamValue(resolvedSearchParams.error);

  const activeSpots = lake.spots.filter((spot) => spot.isActive);

  const blockingReservations = reservations.filter((reservation) =>
    blockingReservationStatuses.includes(reservation.status)
  );

  const lakeWideConflict = blockingReservations.find(
    (reservation) => reservation.scope === "lake"
  );

  const selectedSpot = lake.spots.find((spot) => spot.id === selectedSpotId);
  const selectedReservation = reservations.find(
    (reservation) => reservation.id === selectedReservationId
  );

  const selectedSpotConflict = selectedSpot
    ? getSpotConflict(selectedSpot.id, blockingReservations)
    : null;

  const freeSpotsCount = activeSpots.filter((spot) => {
    if (lakeWideConflict) {
      return false;
    }

    return !getSpotConflict(spot.id, blockingReservations);
  }).length;

  const activeReservationsCount = blockingReservations.length;

  const competitionsCount = reservations.filter(
    (reservation) =>
      reservation.type === "competition" && reservation.status !== "cancelled"
  ).length;

  const canCreateLakeWideReservation = blockingReservations.length === 0;

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
              Panel właściciela
            </p>

            <h1 className="mt-2 break-words text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Rezerwacje łowiska
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
              Wybierz termin albo użyj szybkich zakresów: doba, dzień lub noc.
              Potem kliknij stanowisko albo całe łowisko.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link
              href={`/moje-lowiska/${lake.slug}/rezerwacje/ustawienia`}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
            >
              Ustawienia
            </Link>

            <Link
              href={`/moje-lowiska/${lake.slug}/stanowiska`}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Stanowiska
            </Link>

            <Link
              href={`/moje-lowiska/${lake.slug}/edytuj`}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Edytuj dane
            </Link>

            <Link
              href={`/lowiska-w-polsce/${lake.slug}`}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Podgląd
            </Link>
          </div>
        </div>

        {created && (
          <Alert
            variant="success"
            title="Rezerwacja została dodana"
            description="Termin został zablokowany dla wybranego stanowiska."
          />
        )}

        {eventCreated && (
          <Alert
            variant="success"
            title="Wydarzenie zostało dodane"
            description="Całe łowisko zostało zablokowane w wybranym terminie."
          />
        )}

        {updated && (
          <Alert
            variant="success"
            title="Rezerwacja została zaktualizowana"
            description="Zmiany zostały zapisane, a dostępność została przeliczona ponownie."
          />
        )}

        {cancelled && (
          <Alert
            variant="success"
            title="Rezerwacja została anulowana"
            description="Termin został zwolniony i nie blokuje już dostępności."
          />
        )}

        {error && (
          <Alert
            variant="danger"
            title="Nie udało się wykonać akcji"
            description={getErrorMessage(error)}
          />
        )}

        {!ownerLake.canManageReservations ? (
          <NoAccessCard lakeSlug={lake.slug} />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
            <section className="min-w-0 space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950">
                      Wybierz termin
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Kafelki poniżej pokazują dostępność dokładnie dla tego
                      zakresu dat.
                    </p>
                  </div>

                  <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
                    {formatDateTime(startsAt)} — {formatDateTime(endsAt)}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <QuickRangeButton
                    label="Doba"
                    lakeSlug={lake.slug}
                    currentStartsAtInput={startsAtInput}
                    currentEndsAtInput={endsAtInput}
                    dateSourceInput={startsAtInput}
                    startTime={settings.fullDayStartTime}
                    endTime={settings.fullDayEndTime}
                  />

                  <QuickRangeButton
                    label="Dzień"
                    lakeSlug={lake.slug}
                    currentStartsAtInput={startsAtInput}
                    currentEndsAtInput={endsAtInput}
                    dateSourceInput={startsAtInput}
                    startTime={settings.dayStartTime}
                    endTime={settings.dayEndTime}
                  />

                  <QuickRangeButton
                    label="Noc"
                    lakeSlug={lake.slug}
                    currentStartsAtInput={startsAtInput}
                    currentEndsAtInput={endsAtInput}
                    dateSourceInput={startsAtInput}
                    startTime={settings.nightStartTime}
                    endTime={settings.nightEndTime}
                  />
                </div>

                <form
                  method="get"
                  className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto]"
                >
                  <FormField label="Od">
                    <input
                      name="startsAt"
                      type="datetime-local"
                      defaultValue={startsAtInput}
                      required
                      className={inputClassName}
                    />
                  </FormField>

                  <FormField label="Do">
                    <input
                      name="endsAt"
                      type="datetime-local"
                      defaultValue={endsAtInput}
                      required
                      className={inputClassName}
                    />
                  </FormField>

                  <button
                    type="submit"
                    className="rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white transition hover:bg-blue-700 lg:mt-7"
                  >
                    Pokaż dostępność
                  </button>
                </form>
              </section>

              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="Wolne stanowiska"
                  value={freeSpotsCount}
                  description="Aktywne stanowiska dostępne w wybranym terminie."
                />

                <StatCard
                  label="Zajęte / blokady"
                  value={activeReservationsCount}
                  description="Aktywne rezerwacje i blokady w tym terminie."
                />

                <StatCard
                  label="Zawody"
                  value={competitionsCount}
                  description="Wydarzenia oznaczone jako zawody w tym terminie."
                />
              </div>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950">
                      Dostępność
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Kliknij wolne stanowisko, żeby dopisać rezerwację. Kliknij
                      zajęte, żeby zobaczyć szczegóły i edytować dane.
                    </p>
                  </div>

                  <Link
                    href="/moje-lowiska"
                    className="w-fit rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    Moje łowiska
                  </Link>
                </div>

                <div className="mt-6 grid gap-4">
                  <LakeWideTile
                    lakeSlug={lake.slug}
                    startsAtInput={startsAtInput}
                    endsAtInput={endsAtInput}
                    canCreate={canCreateLakeWideReservation}
                    conflict={blockingReservations[0] || null}
                    isSelected={selectedMode === "lake"}
                  />

                  {lake.spots.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                      {lake.spots.map((spot) => {
                        const spotConflict = getSpotConflict(
                          spot.id,
                          blockingReservations
                        );

                        return (
                          <SpotTile
                            key={spot.id}
                            lakeSlug={lake.slug}
                            spot={spot}
                            startsAtInput={startsAtInput}
                            endsAtInput={endsAtInput}
                            lakeWideConflict={lakeWideConflict || null}
                            spotConflict={spotConflict}
                            isSelected={selectedSpotId === spot.id}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                      <p className="text-2xl font-black text-slate-950">
                        Brak stanowisk
                      </p>

                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        Najpierw dodaj stanowiska, żeby móc przypisywać do nich
                        rezerwacje.
                      </p>

                      <Link
                        href={`/moje-lowiska/${lake.slug}/stanowiska`}
                        className="mt-5 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                      >
                        Dodaj stanowiska
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-2xl font-black text-slate-950">
                  Rezerwacje w wybranym terminie
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Anulowane rezerwacje zostają w historii, ale nie blokują
                  dostępności.
                </p>

                {reservations.length > 0 ? (
                  <div className="mt-6 grid gap-4">
                    {reservations.map((reservation) => (
                      <ReservationListCard
                        key={reservation.id}
                        reservation={reservation}
                        lakeId={lake.id}
                        lakeSlug={lake.slug}
                        startsAtInput={startsAtInput}
                        endsAtInput={endsAtInput}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                    <p className="text-2xl font-black text-slate-950">
                      Brak rezerwacji w tym terminie
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      Wszystkie aktywne stanowiska są wolne, o ile nie są
                      oznaczone jako nieaktywne.
                    </p>
                  </div>
                )}
              </section>
            </section>

            <aside className="min-w-0 space-y-6">
              {selectedReservation ? (
                <ReservationDetailsPanel
                  reservation={selectedReservation}
                  lakeId={lake.id}
                  lakeSlug={lake.slug}
                  startsAtInput={startsAtInput}
                  endsAtInput={endsAtInput}
                  spots={lake.spots}
                />
              ) : selectedMode === "lake" ? (
                <LakeWideReservationForm
                  lakeId={lake.id}
                  lakeSlug={lake.slug}
                  startsAtInput={startsAtInput}
                  endsAtInput={endsAtInput}
                  canCreate={canCreateLakeWideReservation}
                  conflict={blockingReservations[0] || null}
                />
              ) : selectedSpot ? (
                <SpotReservationForm
                  lakeId={lake.id}
                  lakeSlug={lake.slug}
                  spot={selectedSpot}
                  startsAtInput={startsAtInput}
                  endsAtInput={endsAtInput}
                  lakeWideConflict={lakeWideConflict || null}
                  spotConflict={selectedSpotConflict}
                />
              ) : (
                <EmptyActionPanel startsAt={startsAt} endsAt={endsAt} />
              )}

              <section className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <h2 className="text-xl font-black text-blue-950">
                  Jak to działa?
                </h2>

                <div className="mt-4 space-y-3 text-sm leading-6 text-blue-800">
                  <p>1. Użyj przycisku Doba, Dzień albo Noc.</p>
                  <p>2. Kliknij wolne stanowisko albo całe łowisko.</p>
                  <p>3. Uzupełnij formularz i dodaj rezerwację.</p>
                  <p>4. Kliknij zajętą rezerwację, żeby edytować dane.</p>
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function QuickRangeButton({
  label,
  lakeSlug,
  currentStartsAtInput,
  currentEndsAtInput,
  dateSourceInput,
  startTime,
  endTime,
}: {
  label: string;
  lakeSlug: string;
  currentStartsAtInput: string;
  currentEndsAtInput: string;
  dateSourceInput: string;
  startTime: string;
  endTime: string;
}) {
  const dateInput = getDatePartFromDateTimeInput(dateSourceInput);
  const range = buildDateRangeInputsForDate(dateInput, startTime, endTime);

  const isActive =
    range.startsAtInput === currentStartsAtInput &&
    range.endsAtInput === currentEndsAtInput;

  return (
    <Link
      href={buildReservationsHref(lakeSlug, range.startsAtInput, range.endsAtInput)}
      className={`rounded-2xl border px-4 py-4 transition ${
        isActive
          ? "border-blue-300 bg-blue-50 text-blue-700 ring-4 ring-blue-100"
          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
      }`}
    >
      <span className="block text-sm font-black">{label}</span>

      <span className="mt-1 block text-xs font-bold">
        {startTime} — {endTime}
        {shouldEndNextDay(startTime, endTime) ? " +1 dzień" : ""}
      </span>
    </Link>
  );
}

function LakeWideTile({
  lakeSlug,
  startsAtInput,
  endsAtInput,
  canCreate,
  conflict,
  isSelected,
}: {
  lakeSlug: string;
  startsAtInput: string;
  endsAtInput: string;
  canCreate: boolean;
  conflict: ReservationForTile | null;
  isSelected: boolean;
}) {
  if (!canCreate && conflict) {
    return (
      <Link
        href={buildReservationsHref(lakeSlug, startsAtInput, endsAtInput, {
          reservationId: conflict.id,
        })}
        className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm transition hover:bg-amber-100"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
              Całe łowisko
            </p>

            <h3 className="mt-2 text-2xl font-black text-amber-950">
              Nie można zablokować całego łowiska
            </h3>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              W tym terminie istnieje już rezerwacja, blokada albo zawody.
            </p>
          </div>

          <span className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-amber-800 shadow-sm">
            Zobacz kolizję
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={buildReservationsHref(lakeSlug, startsAtInput, endsAtInput, {
        mode: "lake",
      })}
      className={`rounded-3xl border p-5 shadow-sm transition ${
        isSelected
          ? "border-blue-300 bg-blue-50 ring-4 ring-blue-100"
          : "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
      }`}
    >
      <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
        Całe łowisko
      </p>

      <h3 className="mt-2 text-2xl font-black text-emerald-950">
        Wolne całe łowisko
      </h3>

      <p className="mt-2 text-sm leading-6 text-emerald-800">
        Kliknij, żeby dodać zawody, blokadę techniczną albo prywatną rezerwację
        całego łowiska.
      </p>

      <span className="mt-4 inline-flex rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">
        Zablokuj całe łowisko
      </span>
    </Link>
  );
}

function SpotTile({
  lakeSlug,
  spot,
  startsAtInput,
  endsAtInput,
  lakeWideConflict,
  spotConflict,
  isSelected,
}: {
  lakeSlug: string;
  spot: SpotForTile;
  startsAtInput: string;
  endsAtInput: string;
  lakeWideConflict: ReservationForTile | null;
  spotConflict: ReservationForTile | null;
  isSelected: boolean;
}) {
  if (!spot.isActive) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 opacity-75">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
          Nieaktywne
        </p>

        <h3 className="mt-2 break-words text-xl font-black text-slate-700">
          {spot.name}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          To stanowisko jest wyłączone i nie można dodać do niego nowej
          rezerwacji.
        </p>
      </div>
    );
  }

  if (lakeWideConflict) {
    return (
      <Link
        href={buildReservationsHref(lakeSlug, startsAtInput, endsAtInput, {
          reservationId: lakeWideConflict.id,
        })}
        className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm transition hover:bg-amber-100"
      >
        <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
          Zablokowane
        </p>

        <h3 className="mt-2 break-words text-xl font-black text-amber-950">
          {spot.name}
        </h3>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          Całe łowisko jest zajęte:{" "}
          <span className="font-black">
            {getReservationTitle(lakeWideConflict)}
          </span>
        </p>
      </Link>
    );
  }

  if (spotConflict) {
    return (
      <Link
        href={buildReservationsHref(lakeSlug, startsAtInput, endsAtInput, {
          reservationId: spotConflict.id,
        })}
        className="rounded-3xl border border-red-100 bg-red-50 p-5 shadow-sm transition hover:bg-red-100"
      >
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">
          Zajęte
        </p>

        <h3 className="mt-2 break-words text-xl font-black text-red-950">
          {spot.name}
        </h3>

        <p className="mt-2 text-sm leading-6 text-red-800">
          {getReservationTitle(spotConflict)}
        </p>

        <p className="mt-3 text-xs font-bold text-red-700">
          {formatDateTime(spotConflict.startsAt)} —{" "}
          {formatDateTime(spotConflict.endsAt)}
        </p>
      </Link>
    );
  }

  return (
    <Link
      href={buildReservationsHref(lakeSlug, startsAtInput, endsAtInput, {
        spotId: spot.id,
      })}
      className={`rounded-3xl border p-5 shadow-sm transition ${
        isSelected
          ? "border-blue-300 bg-blue-50 ring-4 ring-blue-100"
          : "border-emerald-100 bg-white hover:bg-emerald-50"
      }`}
    >
      <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
        Wolne
      </p>

      <h3 className="mt-2 break-words text-xl font-black text-slate-950">
        {spot.name}
      </h3>

      <div className="mt-4 grid gap-2">
        <InfoPill label="Maks. osób" value={`${spot.maxPeople}`} />
        <InfoPill label="Doba" value={formatPrice(spot.pricePer24h)} />
      </div>

      <span className="mt-4 inline-flex rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">
        Dodaj rezerwację
      </span>
    </Link>
  );
}

function SpotReservationForm({
  lakeId,
  lakeSlug,
  spot,
  startsAtInput,
  endsAtInput,
  lakeWideConflict,
  spotConflict,
}: {
  lakeId: string;
  lakeSlug: string;
  spot: SpotForTile;
  startsAtInput: string;
  endsAtInput: string;
  lakeWideConflict: ReservationForTile | null;
  spotConflict: ReservationForTile | null;
}) {
  if (!spot.isActive) {
    return (
      <PanelCard title="Stanowisko nieaktywne" eyebrow="Rezerwacja">
        <p className="text-sm leading-6 text-slate-500">
          Tego stanowiska nie można aktualnie rezerwować.
        </p>
      </PanelCard>
    );
  }

  if (lakeWideConflict || spotConflict) {
    const conflict = lakeWideConflict || spotConflict;

    return (
      <PanelCard title="Termin zajęty" eyebrow="Rezerwacja">
        <p className="text-sm leading-6 text-slate-500">
          Nie można dodać rezerwacji dla tego stanowiska, bo termin nachodzi na
          inną aktywną rezerwację.
        </p>

        {conflict && (
          <Link
            href={buildReservationsHref(lakeSlug, startsAtInput, endsAtInput, {
              reservationId: conflict.id,
            })}
            className="mt-5 inline-flex rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
          >
            Zobacz kolizję
          </Link>
        )}
      </PanelCard>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
        Rezerwacja stanowiska
      </p>

      <h2 className="mt-3 break-words text-2xl font-black text-slate-950">
        {spot.name}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Termin: {startsAtInput.replace("T", " ")} —{" "}
        {endsAtInput.replace("T", " ")}
      </p>

      <form action={createSpotReservation} className="mt-5 space-y-4">
        <input type="hidden" name="lakeId" value={lakeId} />
        <input type="hidden" name="slug" value={lakeSlug} />
        <input type="hidden" name="spotId" value={spot.id} />
        <input type="hidden" name="startsAt" value={startsAtInput} />
        <input type="hidden" name="endsAt" value={endsAtInput} />

        <ReservationCommonFields typeOptions="spot" />

        <button
          type="submit"
          className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700"
        >
          Dodaj rezerwację
        </button>
      </form>
    </section>
  );
}

function LakeWideReservationForm({
  lakeId,
  lakeSlug,
  startsAtInput,
  endsAtInput,
  canCreate,
  conflict,
}: {
  lakeId: string;
  lakeSlug: string;
  startsAtInput: string;
  endsAtInput: string;
  canCreate: boolean;
  conflict: ReservationForTile | null;
}) {
  if (!canCreate) {
    return (
      <PanelCard
        title="Nie można zablokować całego łowiska"
        eyebrow="Całe łowisko"
      >
        <p className="text-sm leading-6 text-slate-500">
          W tym terminie istnieje już aktywna rezerwacja, blokada albo zawody.
          Najpierw anuluj kolizję.
        </p>

        {conflict && (
          <Link
            href={buildReservationsHref(lakeSlug, startsAtInput, endsAtInput, {
              reservationId: conflict.id,
            })}
            className="mt-5 inline-flex rounded-2xl bg-amber-600 px-5 py-3 text-sm font-black text-white transition hover:bg-amber-700"
          >
            Zobacz kolizję
          </Link>
        )}
      </PanelCard>
    );
  }

  return (
    <section className="rounded-3xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-700">
        Całe łowisko
      </p>

      <h2 className="mt-3 text-2xl font-black text-amber-950">
        Zawody lub blokada
      </h2>

      <p className="mt-2 text-sm leading-6 text-amber-800">
        Termin: {startsAtInput.replace("T", " ")} —{" "}
        {endsAtInput.replace("T", " ")}
      </p>

      <form action={createLakeWideReservation} className="mt-5 space-y-4">
        <input type="hidden" name="lakeId" value={lakeId} />
        <input type="hidden" name="slug" value={lakeSlug} />
        <input type="hidden" name="startsAt" value={startsAtInput} />
        <input type="hidden" name="endsAt" value={endsAtInput} />

        <ReservationCommonFields typeOptions="lake" />

        <button
          type="submit"
          className="w-full rounded-2xl bg-amber-600 px-5 py-4 text-sm font-black text-white transition hover:bg-amber-700"
        >
          Zablokuj całe łowisko
        </button>
      </form>
    </section>
  );
}

function ReservationCommonFields({
  typeOptions,
  reservation,
}: {
  typeOptions: "spot" | "lake";
  reservation?: ReservationForTile;
}) {
  const isLakeWide = typeOptions === "lake";

  return (
    <>
      <FormField label={isLakeWide ? "Typ wydarzenia" : "Typ"}>
        <select
          name="type"
          defaultValue={reservation?.type || (isLakeWide ? "competition" : "reservation")}
          className={inputClassName}
        >
          {isLakeWide ? (
            <>
              <option value="competition">Zawody wędkarskie</option>
              <option value="block">Blokada całego łowiska</option>
              <option value="private">Prywatna rezerwacja</option>
            </>
          ) : (
            <>
              <option value="reservation">Rezerwacja klienta</option>
              <option value="block">Blokada stanowiska</option>
              <option value="private">Prywatna rezerwacja</option>
            </>
          )}
        </select>
      </FormField>

      {isLakeWide ? (
        <>
          <FormField label="Nazwa">
            <input
              name="title"
              type="text"
              required
              defaultValue={reservation?.title || ""}
              placeholder="np. Zawody feederowe Rybio Cup"
              className={inputClassName}
            />
          </FormField>

          <FormField label="Organizator">
            <input
              name="organizerName"
              type="text"
              defaultValue={reservation?.organizerName || ""}
              placeholder="np. Koło PZW / Jan Kowalski"
              className={inputClassName}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Telefon">
              <input
                name="organizerPhone"
                type="tel"
                defaultValue={reservation?.organizerPhone || ""}
                placeholder="np. 600 000 000"
                className={inputClassName}
              />
            </FormField>

            <FormField label="E-mail">
              <input
                name="organizerEmail"
                type="email"
                defaultValue={reservation?.organizerEmail || ""}
                placeholder="np. kontakt@email.pl"
                className={inputClassName}
              />
            </FormField>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4">
            <input
              name="isPublicEvent"
              type="checkbox"
              defaultChecked={reservation?.isPublicEvent || false}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />

            <span>
              <span className="block text-sm font-black text-slate-800">
                Pokaż publicznie
              </span>

              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Przyda się przy zawodach. Później pokażemy tę informację na
                publicznym profilu łowiska.
              </span>
            </span>
          </label>
        </>
      ) : (
        <>
          <FormField label="Imię i nazwisko klienta">
            <input
              name="customerName"
              type="text"
              defaultValue={reservation?.customerName || ""}
              placeholder="np. Jan Kowalski"
              className={inputClassName}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Telefon">
              <input
                name="customerPhone"
                type="tel"
                defaultValue={reservation?.customerPhone || ""}
                placeholder="np. 600 000 000"
                className={inputClassName}
              />
            </FormField>

            <FormField label="E-mail">
              <input
                name="customerEmail"
                type="email"
                defaultValue={reservation?.customerEmail || ""}
                placeholder="np. klient@email.pl"
                className={inputClassName}
              />
            </FormField>
          </div>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Liczba osób">
          <input
            name="peopleCount"
            type="number"
            min="1"
            max="999"
            defaultValue={reservation?.peopleCount || 1}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Status płatności">
          <select
            name="paymentStatus"
            defaultValue={reservation?.paymentStatus || "unpaid"}
            className={inputClassName}
          >
            <option value="unpaid">Nieopłacone</option>
            <option value="deposit_paid">Zaliczka opłacona</option>
            <option value="paid">Opłacone</option>
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Cena łączna">
          <input
            name="totalPrice"
            type="text"
            inputMode="decimal"
            defaultValue={formatNumberInput(reservation?.totalPrice ?? null)}
            placeholder="np. 150"
            className={inputClassName}
          />
        </FormField>

        <FormField label="Zaliczka">
          <input
            name="depositAmount"
            type="text"
            inputMode="decimal"
            defaultValue={formatNumberInput(reservation?.depositAmount ?? null)}
            placeholder="np. 50"
            className={inputClassName}
          />
        </FormField>
      </div>

      <FormField label="Notatka">
        <textarea
          name="note"
          rows={3}
          defaultValue={reservation?.note || ""}
          placeholder="Np. klient przyjedzie po 18:00..."
          className={textareaClassName}
        />
      </FormField>

      <FormField label="Notatka wewnętrzna">
        <textarea
          name="internalNote"
          rows={3}
          defaultValue={reservation?.internalNote || ""}
          placeholder="Widoczna tylko dla właściciela."
          className={textareaClassName}
        />
      </FormField>
    </>
  );
}

function EmptyActionPanel({
  startsAt,
  endsAt,
}: {
  startsAt: Date;
  endsAt: Date;
}) {
  return (
    <PanelCard title="Wybierz kafelek" eyebrow="Akcja">
      <p className="text-sm leading-6 text-slate-500">Wybrany termin:</p>

      <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">
        {formatDateTime(startsAt)} — {formatDateTime(endsAt)}
      </p>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        Kliknij wolne stanowisko, żeby dodać rezerwację, albo kafelek całego
        łowiska, żeby dodać zawody lub blokadę.
      </p>
    </PanelCard>
  );
}

function ReservationDetailsPanel({
  reservation,
  lakeId,
  lakeSlug,
  startsAtInput,
  endsAtInput,
  spots,
}: {
  reservation: ReservationForTile;
  lakeId: string;
  lakeSlug: string;
  startsAtInput: string;
  endsAtInput: string;
  spots: SpotForTile[];
}) {
  const isCancelled = reservation.status === "cancelled";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
        Szczegóły
      </p>

      <h2 className="mt-3 break-words text-2xl font-black text-slate-950">
        {getReservationTitle(reservation)}
      </h2>

      <div className="mt-5 grid gap-3">
        <InfoPill
          label="Typ"
          value={getReservationTypeLabel(reservation.type)}
        />
        <InfoPill
          label="Zakres"
          value={getReservationScopeLabel(reservation.scope)}
        />
        <InfoPill
          label="Status"
          value={getReservationStatusLabel(reservation.status)}
        />
        <InfoPill label="Od" value={formatDateTime(reservation.startsAt)} />
        <InfoPill label="Do" value={formatDateTime(reservation.endsAt)} />
        <InfoPill
          label="Stanowisko"
          value={
            reservation.scope === "lake"
              ? "Całe łowisko"
              : reservation.spot?.name || "Brak stanowiska"
          }
        />
        <InfoPill
          label="Klient / organizator"
          value={
            reservation.customerName ||
            reservation.organizerName ||
            "Nie podano"
          }
        />
        <InfoPill
          label="Telefon"
          value={
            reservation.customerPhone ||
            reservation.organizerPhone ||
            "Nie podano"
          }
        />
        <InfoPill label="Cena" value={formatPrice(reservation.totalPrice)} />
        <InfoPill
          label="Zaliczka"
          value={formatPrice(reservation.depositAmount)}
        />
      </div>

      {reservation.note && (
        <p className="mt-4 whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          {reservation.note}
        </p>
      )}

      {reservation.internalNote && (
        <p className="mt-4 whitespace-pre-line rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-600">
          <span className="font-black">Notatka wewnętrzna:</span>{" "}
          {reservation.internalNote}
        </p>
      )}

      <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer text-sm font-black text-slate-700">
          Edytuj rezerwację
        </summary>

        <form action={updateLakeReservation} className="mt-5 space-y-4">
          <input type="hidden" name="lakeId" value={lakeId} />
          <input type="hidden" name="slug" value={lakeSlug} />
          <input type="hidden" name="reservationId" value={reservation.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Od">
              <input
                name="startsAt"
                type="datetime-local"
                required
                defaultValue={formatDateTimeInput(reservation.startsAt)}
                className={inputClassName}
              />
            </FormField>

            <FormField label="Do">
              <input
                name="endsAt"
                type="datetime-local"
                required
                defaultValue={formatDateTimeInput(reservation.endsAt)}
                className={inputClassName}
              />
            </FormField>
          </div>

          {reservation.scope === "spot" && (
            <FormField label="Stanowisko">
              <select
                name="spotId"
                required
                defaultValue={reservation.spotId || ""}
                className={inputClassName}
              >
                <option value="">Wybierz stanowisko</option>

                {spots
                  .filter(
                    (spot) => spot.isActive || spot.id === reservation.spotId
                  )
                  .map((spot) => (
                    <option key={spot.id} value={spot.id}>
                      {spot.name}
                      {!spot.isActive ? " — nieaktywne" : ""}
                    </option>
                  ))}
              </select>
            </FormField>
          )}

          <FormField label="Status rezerwacji">
            <select
              name="status"
              defaultValue={reservation.status}
              className={inputClassName}
            >
              <option value="pending">Oczekuje</option>
              <option value="confirmed">Potwierdzona</option>
              <option value="paid">Opłacona</option>
              <option value="cancelled">Anulowana</option>
              <option value="completed">Zakończona</option>
              <option value="no_show">Nie pojawił się</option>
            </select>
          </FormField>

          <ReservationCommonFields
            typeOptions={reservation.scope === "lake" ? "lake" : "spot"}
            reservation={reservation}
          />

          <button
            type="submit"
            className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700"
          >
            Zapisz zmiany
          </button>
        </form>
      </details>

      {!isCancelled && (
        <form action={cancelLakeReservation} className="mt-5">
          <input type="hidden" name="lakeId" value={lakeId} />
          <input type="hidden" name="slug" value={lakeSlug} />
          <input type="hidden" name="reservationId" value={reservation.id} />
          <input type="hidden" name="startsAt" value={startsAtInput} />
          <input type="hidden" name="endsAt" value={endsAtInput} />

          <button
            type="submit"
            className="w-full rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700 transition hover:bg-red-100"
          >
            Anuluj rezerwację
          </button>
        </form>
      )}
    </section>
  );
}

function ReservationListCard({
  reservation,
  lakeId,
  lakeSlug,
  startsAtInput,
  endsAtInput,
}: {
  reservation: ReservationForTile;
  lakeId: string;
  lakeSlug: string;
  startsAtInput: string;
  endsAtInput: string;
}) {
  const isCancelled = reservation.status === "cancelled";
  const isLakeWide = reservation.scope === "lake";

  return (
    <article
      className={`rounded-3xl border p-4 shadow-sm sm:p-5 ${
        isCancelled
          ? "border-slate-200 bg-slate-50 opacity-75"
          : isLakeWide
            ? "border-amber-100 bg-amber-50"
            : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{getReservationScopeLabel(reservation.scope)}</Badge>
            <Badge>{getReservationTypeLabel(reservation.type)}</Badge>
            <Badge>{getReservationStatusLabel(reservation.status)}</Badge>
            <Badge>{getPaymentStatusLabel(reservation.paymentStatus)}</Badge>

            {reservation.isPublicEvent && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                Publiczne
              </span>
            )}
          </div>

          <h3 className="mt-3 break-words text-xl font-black text-slate-950">
            {getReservationTitle(reservation)}
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoPill label="Od" value={formatDateTime(reservation.startsAt)} />
            <InfoPill label="Do" value={formatDateTime(reservation.endsAt)} />
            <InfoPill
              label="Stanowisko"
              value={
                reservation.scope === "lake"
                  ? "Całe łowisko"
                  : reservation.spot?.name || "Brak stanowiska"
              }
            />
            <InfoPill label="Osoby" value={`${reservation.peopleCount}`} />
          </div>
        </div>

        <div className="grid gap-2 lg:w-44">
          <Link
            href={buildReservationsHref(lakeSlug, startsAtInput, endsAtInput, {
              reservationId: reservation.id,
            })}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Szczegóły
          </Link>

          {!isCancelled && (
            <form action={cancelLakeReservation}>
              <input type="hidden" name="lakeId" value={lakeId} />
              <input type="hidden" name="slug" value={lakeSlug} />
              <input type="hidden" name="reservationId" value={reservation.id} />
              <input type="hidden" name="startsAt" value={startsAtInput} />
              <input type="hidden" name="endsAt" value={endsAtInput} />

              <button
                type="submit"
                className="w-full rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-black text-red-700 transition hover:bg-red-100"
              >
                Anuluj
              </button>
            </form>
          )}
        </div>
      </div>
    </article>
  );
}

async function createSpotReservation(formData: FormData) {
  "use server";

  const lakeId = getString(formData, "lakeId");
  const slug = getString(formData, "slug");
  const spotId = getString(formData, "spotId");
  const startsAtInput = getString(formData, "startsAt");
  const endsAtInput = getString(formData, "endsAt");
  const type = getReservationType(formData, ["reservation", "block", "private"]);

  if (!lakeId || !slug || !spotId) {
    redirect("/moje-lowiska");
  }

  const startsAt = parseWarsawDateTime(startsAtInput);
  const endsAt = parseWarsawDateTime(endsAtInput);

  if (!startsAt || !endsAt) {
    redirect(
      buildReservationsHref(slug, startsAtInput, endsAtInput, {
        error: "date",
      })
    );
  }

  if (endsAt <= startsAt) {
    redirect(
      buildReservationsHref(slug, startsAtInput, endsAtInput, {
        error: "date-order",
      })
    );
  }

  const ownerLake = await getOwnerLakeWithReservationPermission(lakeId);

  const spot = await prisma.lakeSpot.findFirst({
    where: {
      id: spotId,
      lakeId: ownerLake.lake.id,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!spot) {
    redirect(
      buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
        error: "spot",
      })
    );
  }

  const customerName = getOptionalString(formData, "customerName");

  if (type === "reservation" && !customerName) {
    redirect(
      buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
        spotId,
        error: "customer",
      })
    );
  }

  const conflict = await findReservationConflict({
    lakeId: ownerLake.lake.id,
    spotId: spot.id,
    scope: "spot",
    startsAt,
    endsAt,
  });

  if (conflict) {
    redirect(
      buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
        error: "conflict",
      })
    );
  }

  await prisma.lakeReservation.create({
    data: {
      lakeId: ownerLake.lake.id,
      spotId: spot.id,
      scope: "spot",
      type,
      status: "confirmed",
      title:
        type === "block"
          ? `Blokada - ${spot.name}`
          : type === "private"
            ? `Prywatna rezerwacja - ${spot.name}`
            : null,
      startsAt,
      endsAt,
      customerName,
      customerPhone: getOptionalString(formData, "customerPhone"),
      customerEmail: getOptionalString(formData, "customerEmail"),
      peopleCount: getPositiveInt(formData, "peopleCount", 1),
      totalPrice: getOptionalPrice(formData, "totalPrice"),
      depositAmount: getOptionalPrice(formData, "depositAmount"),
      paymentStatus: getPaymentStatus(formData),
      note: getOptionalString(formData, "note"),
      internalNote: getOptionalString(formData, "internalNote"),
      createdByUserId: ownerLake.userId,
    },
  });

  revalidateLakeReservationPaths(ownerLake.lake.slug);

  redirect(
    buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
      created: "1",
    })
  );
}

async function createLakeWideReservation(formData: FormData) {
  "use server";

  const lakeId = getString(formData, "lakeId");
  const slug = getString(formData, "slug");
  const startsAtInput = getString(formData, "startsAt");
  const endsAtInput = getString(formData, "endsAt");
  const type = getReservationType(formData, ["competition", "block", "private"]);
  const title = getString(formData, "title");

  if (!lakeId || !slug) {
    redirect("/moje-lowiska");
  }

  if (!title) {
    redirect(
      buildReservationsHref(slug, startsAtInput, endsAtInput, {
        mode: "lake",
        error: "title",
      })
    );
  }

  const startsAt = parseWarsawDateTime(startsAtInput);
  const endsAt = parseWarsawDateTime(endsAtInput);

  if (!startsAt || !endsAt) {
    redirect(
      buildReservationsHref(slug, startsAtInput, endsAtInput, {
        error: "date",
      })
    );
  }

  if (endsAt <= startsAt) {
    redirect(
      buildReservationsHref(slug, startsAtInput, endsAtInput, {
        mode: "lake",
        error: "date-order",
      })
    );
  }

  const ownerLake = await getOwnerLakeWithReservationPermission(lakeId);

  const conflict = await findReservationConflict({
    lakeId: ownerLake.lake.id,
    scope: "lake",
    startsAt,
    endsAt,
  });

  if (conflict) {
    redirect(
      buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
        error: "conflict",
      })
    );
  }

  await prisma.lakeReservation.create({
    data: {
      lakeId: ownerLake.lake.id,
      spotId: null,
      scope: "lake",
      type,
      status: "confirmed",
      title,
      startsAt,
      endsAt,
      organizerName: getOptionalString(formData, "organizerName"),
      organizerPhone: getOptionalString(formData, "organizerPhone"),
      organizerEmail: getOptionalString(formData, "organizerEmail"),
      peopleCount: getPositiveInt(formData, "peopleCount", 1),
      totalPrice: getOptionalPrice(formData, "totalPrice"),
      depositAmount: getOptionalPrice(formData, "depositAmount"),
      paymentStatus: getPaymentStatus(formData),
      note: getOptionalString(formData, "note"),
      internalNote: getOptionalString(formData, "internalNote"),
      isPublicEvent: formData.get("isPublicEvent") === "on",
      createdByUserId: ownerLake.userId,
    },
  });

  revalidateLakeReservationPaths(ownerLake.lake.slug);

  redirect(
    buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
      eventCreated: "1",
    })
  );
}

async function updateLakeReservation(formData: FormData) {
  "use server";

  const lakeId = getString(formData, "lakeId");
  const slug = getString(formData, "slug");
  const reservationId = getString(formData, "reservationId");
  const startsAtInput = getString(formData, "startsAt");
  const endsAtInput = getString(formData, "endsAt");

  if (!lakeId || !slug || !reservationId) {
    redirect("/moje-lowiska");
  }

  const startsAt = parseWarsawDateTime(startsAtInput);
  const endsAt = parseWarsawDateTime(endsAtInput);

  if (!startsAt || !endsAt) {
    redirect(
      buildReservationsHref(slug, startsAtInput, endsAtInput, {
        reservationId,
        error: "date",
      })
    );
  }

  if (endsAt <= startsAt) {
    redirect(
      buildReservationsHref(slug, startsAtInput, endsAtInput, {
        reservationId,
        error: "date-order",
      })
    );
  }

  const ownerLake = await getOwnerLakeWithReservationPermission(lakeId);

  const reservation = await prisma.lakeReservation.findFirst({
    where: {
      id: reservationId,
      lakeId: ownerLake.lake.id,
    },
    select: {
      id: true,
      scope: true,
      spotId: true,
    },
  });

  if (!reservation) {
    redirect(
      buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
        error: "not-found",
      })
    );
  }

  const status = getReservationStatus(formData);
  const isBlockingStatus = blockingReservationStatuses.includes(status);

  if (reservation.scope === "spot") {
    const spotId = getString(formData, "spotId");
    const type = getReservationType(formData, [
      "reservation",
      "block",
      "private",
    ]);

    if (!spotId) {
      redirect(
        buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
          reservationId,
          error: "spot",
        })
      );
    }

    const spot = await prisma.lakeSpot.findFirst({
      where: {
        id: spotId,
        lakeId: ownerLake.lake.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!spot) {
      redirect(
        buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
          reservationId,
          error: "spot",
        })
      );
    }

    const customerName = getOptionalString(formData, "customerName");

    if (type === "reservation" && !customerName) {
      redirect(
        buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
          reservationId,
          error: "customer",
        })
      );
    }

    if (isBlockingStatus) {
      const conflict = await findReservationConflict({
        lakeId: ownerLake.lake.id,
        spotId: spot.id,
        scope: "spot",
        startsAt,
        endsAt,
        excludeReservationId: reservation.id,
      });

      if (conflict) {
        redirect(
          buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
            reservationId,
            error: "conflict",
          })
        );
      }
    }

    await prisma.lakeReservation.update({
      where: {
        id: reservation.id,
      },
      data: {
        spotId: spot.id,
        type,
        status,
        title:
          type === "block"
            ? `Blokada - ${spot.name}`
            : type === "private"
              ? `Prywatna rezerwacja - ${spot.name}`
              : null,
        startsAt,
        endsAt,
        customerName,
        customerPhone: getOptionalString(formData, "customerPhone"),
        customerEmail: getOptionalString(formData, "customerEmail"),
        organizerName: null,
        organizerPhone: null,
        organizerEmail: null,
        peopleCount: getPositiveInt(formData, "peopleCount", 1),
        totalPrice: getOptionalPrice(formData, "totalPrice"),
        depositAmount: getOptionalPrice(formData, "depositAmount"),
        paymentStatus: getPaymentStatus(formData),
        note: getOptionalString(formData, "note"),
        internalNote: getOptionalString(formData, "internalNote"),
        isPublicEvent: false,
      },
    });
  } else {
    const type = getReservationType(formData, [
      "competition",
      "block",
      "private",
    ]);
    const title = getString(formData, "title");

    if (!title) {
      redirect(
        buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
          reservationId,
          error: "title",
        })
      );
    }

    if (isBlockingStatus) {
      const conflict = await findReservationConflict({
        lakeId: ownerLake.lake.id,
        scope: "lake",
        startsAt,
        endsAt,
        excludeReservationId: reservation.id,
      });

      if (conflict) {
        redirect(
          buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
            reservationId,
            error: "conflict",
          })
        );
      }
    }

    await prisma.lakeReservation.update({
      where: {
        id: reservation.id,
      },
      data: {
        spotId: null,
        type,
        status,
        title,
        startsAt,
        endsAt,
        customerName: null,
        customerPhone: null,
        customerEmail: null,
        organizerName: getOptionalString(formData, "organizerName"),
        organizerPhone: getOptionalString(formData, "organizerPhone"),
        organizerEmail: getOptionalString(formData, "organizerEmail"),
        peopleCount: getPositiveInt(formData, "peopleCount", 1),
        totalPrice: getOptionalPrice(formData, "totalPrice"),
        depositAmount: getOptionalPrice(formData, "depositAmount"),
        paymentStatus: getPaymentStatus(formData),
        note: getOptionalString(formData, "note"),
        internalNote: getOptionalString(formData, "internalNote"),
        isPublicEvent: formData.get("isPublicEvent") === "on",
      },
    });
  }

  revalidateLakeReservationPaths(ownerLake.lake.slug);

  redirect(
    buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
      reservationId,
      updated: "1",
    })
  );
}

async function cancelLakeReservation(formData: FormData) {
  "use server";

  const lakeId = getString(formData, "lakeId");
  const slug = getString(formData, "slug");
  const reservationId = getString(formData, "reservationId");
  const startsAtInput = getString(formData, "startsAt");
  const endsAtInput = getString(formData, "endsAt");

  if (!lakeId || !slug || !reservationId) {
    redirect("/moje-lowiska");
  }

  const ownerLake = await getOwnerLakeWithReservationPermission(lakeId);

  const reservation = await prisma.lakeReservation.findFirst({
    where: {
      id: reservationId,
      lakeId: ownerLake.lake.id,
    },
    select: {
      id: true,
    },
  });

  if (!reservation) {
    redirect(
      buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
        error: "not-found",
      })
    );
  }

  await prisma.lakeReservation.update({
    where: {
      id: reservation.id,
    },
    data: {
      status: "cancelled",
    },
  });

  revalidateLakeReservationPaths(ownerLake.lake.slug);

  redirect(
    buildReservationsHref(ownerLake.lake.slug, startsAtInput, endsAtInput, {
      cancelled: "1",
    })
  );
}

async function getOwnerLakeWithReservationPermission(lakeId: string) {
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
      canManageReservations: true,
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

async function findReservationConflict({
  lakeId,
  spotId,
  scope,
  startsAt,
  endsAt,
  excludeReservationId,
}: {
  lakeId: string;
  spotId?: string;
  scope: "spot" | "lake";
  startsAt: Date;
  endsAt: Date;
  excludeReservationId?: string;
}) {
  return prisma.lakeReservation.findFirst({
    where: {
      lakeId,
      ...(excludeReservationId
        ? {
            NOT: {
              id: excludeReservationId,
            },
          }
        : {}),
      status: {
        in: blockingReservationStatuses,
      },
      startsAt: {
        lt: endsAt,
      },
      endsAt: {
        gt: startsAt,
      },
      ...(scope === "spot"
        ? {
            OR: [
              {
                scope: "lake",
              },
              {
                spotId,
              },
            ],
          }
        : {}),
    },
    select: {
      id: true,
    },
  });
}

function getSpotConflict(spotId: string, reservations: ReservationForTile[]) {
  return (
    reservations.find((reservation) => reservation.spotId === spotId) || null
  );
}

function revalidateLakeReservationPaths(slug: string) {
  revalidatePath("/moje-lowiska");
  revalidatePath(`/moje-lowiska/${slug}/rezerwacje`);
  revalidatePath(`/moje-lowiska/${slug}/rezerwacje/ustawienia`);
  revalidatePath(`/moje-lowiska/${slug}/stanowiska`);
  revalidatePath(`/lowiska-w-polsce/${slug}`);
}

function NoAccessCard({ lakeSlug }: { lakeSlug: string }) {
  return (
    <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-700">
        Brak uprawnień
      </p>

      <h2 className="mt-3 text-2xl font-black text-amber-950">
        Nie możesz zarządzać rezerwacjami tego łowiska
      </h2>

      <p className="mt-3 text-sm leading-6 text-amber-800">
        Twoje konto jest przypisane do tego łowiska, ale nie ma aktywnego
        uprawnienia do zarządzania rezerwacjami.
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

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200">
      {children}
    </span>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}

function PanelCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
        {eyebrow}
      </p>

      <h2 className="mt-3 break-words text-2xl font-black text-slate-950">
        {title}
      </h2>

      <div className="mt-4">{children}</div>
    </section>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
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

function getPaymentStatus(formData: FormData) {
  const value = getString(formData, "paymentStatus");

  if (value === "paid" || value === "deposit_paid") {
    return value;
  }

  return "unpaid";
}

function getReservationStatus(formData: FormData) {
  const value = getString(formData, "status");

  if (
    value === "pending" ||
    value === "confirmed" ||
    value === "paid" ||
    value === "cancelled" ||
    value === "completed" ||
    value === "no_show"
  ) {
    return value;
  }

  return "confirmed";
}

function getReservationType(formData: FormData, allowedTypes: string[]) {
  const value = getString(formData, "type");

  if (allowedTypes.includes(value)) {
    return value;
  }

  return allowedTypes[0];
}

function parseWarsawDateTime(value: string) {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
  );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null;
  }

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset = getTimeZoneOffsetMs(TIME_ZONE, utcGuess);

  return new Date(utcGuess.getTime() - offset);
}

function getTimeZoneOffsetMs(timeZone: string, date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );

  return asUtc - date.getTime();
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateTimeInput(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
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

function getReservationScopeLabel(scope: string) {
  if (scope === "lake") {
    return "Całe łowisko";
  }

  return "Stanowisko";
}

function getReservationTypeLabel(type: string) {
  if (type === "competition") {
    return "Zawody";
  }

  if (type === "block") {
    return "Blokada";
  }

  if (type === "private") {
    return "Prywatne";
  }

  return "Rezerwacja";
}

function getReservationStatusLabel(status: string) {
  if (status === "pending") {
    return "Oczekuje";
  }

  if (status === "paid") {
    return "Opłacona";
  }

  if (status === "cancelled") {
    return "Anulowana";
  }

  if (status === "completed") {
    return "Zakończona";
  }

  if (status === "no_show") {
    return "Nie pojawił się";
  }

  return "Potwierdzona";
}

function getPaymentStatusLabel(status: string) {
  if (status === "paid") {
    return "Opłacone";
  }

  if (status === "deposit_paid") {
    return "Zaliczka";
  }

  return "Nieopłacone";
}

function getReservationTitle(reservation: {
  scope: string;
  type: string;
  title: string | null;
  customerName: string | null;
  organizerName: string | null;
  spot?: {
    name: string;
  } | null;
}) {
  if (reservation.title) {
    return reservation.title;
  }

  if (reservation.type === "competition") {
    return "Zawody wędkarskie";
  }

  if (reservation.scope === "lake") {
    return "Blokada całego łowiska";
  }

  if (reservation.customerName) {
    return reservation.customerName;
  }

  if (reservation.organizerName) {
    return reservation.organizerName;
  }

  return reservation.spot?.name || "Rezerwacja stanowiska";
}

function getErrorMessage(error: string) {
  if (error === "date") {
    return "Podaj poprawną datę rozpoczęcia i zakończenia.";
  }

  if (error === "date-order") {
    return "Data zakończenia musi być późniejsza niż data rozpoczęcia.";
  }

  if (error === "spot") {
    return "Nie znaleziono aktywnego stanowiska.";
  }

  if (error === "customer") {
    return "Dla rezerwacji klienta podaj imię i nazwisko.";
  }

  if (error === "title") {
    return "Podaj nazwę zawodów lub blokady.";
  }

  if (error === "conflict") {
    return "Ten termin jest już zajęty. Rezerwacja nachodzi na inną aktywną rezerwację, zawody albo blokadę.";
  }

  if (error === "not-found") {
    return "Nie znaleziono rezerwacji.";
  }

  return "Spróbuj ponownie za chwilę.";
}

function buildReservationsHref(
  slug: string,
  startsAtInput: string,
  endsAtInput: string,
  extraParams?: Record<string, string | undefined>
) {
  const params = new URLSearchParams();

  if (startsAtInput) {
    params.set("startsAt", startsAtInput);
  }

  if (endsAtInput) {
    params.set("endsAt", endsAtInput);
  }

  if (extraParams) {
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
  }

  const query = params.toString();

  return query
    ? `/moje-lowiska/${slug}/rezerwacje?${query}`
    : `/moje-lowiska/${slug}/rezerwacje`;
}

function getDefaultDateRangeInputs(settings: BookingSettingsForReservations) {
  const today = getWarsawCalendarDate(new Date());

  return buildDateRangeInputsForDate(
    formatCalendarDate(today),
    settings.defaultStartTime,
    settings.defaultEndTime
  );
}

function buildDateRangeInputsForDate(
  dateInput: string,
  startTime: string,
  endTime: string
) {
  const date = parseCalendarDateInput(dateInput) || getWarsawCalendarDate(new Date());
  const endDate = shouldEndNextDay(startTime, endTime)
    ? addDaysToCalendarDate(date, 1)
    : date;

  return {
    startsAtInput: `${formatCalendarDate(date)}T${startTime}`,
    endsAtInput: `${formatCalendarDate(endDate)}T${endTime}`,
  };
}

function shouldEndNextDay(startTime: string, endTime: string) {
  return getTimeInMinutes(endTime) <= getTimeInMinutes(startTime);
}

function getTimeInMinutes(time: string) {
  const [hour, minute] = time.split(":").map((value) => Number(value));

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return 0;
  }

  return hour * 60 + minute;
}

function getDatePartFromDateTimeInput(value: string) {
  return value.split("T")[0] || formatCalendarDate(getWarsawCalendarDate(new Date()));
}

function parseCalendarDateInput(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function getWarsawCalendarDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function addDaysToCalendarDate(
  date: {
    year: number;
    month: number;
    day: number;
  },
  days: number
) {
  const nextDate = new Date(Date.UTC(date.year, date.month - 1, date.day + days));

  return {
    year: nextDate.getUTCFullYear(),
    month: nextDate.getUTCMonth() + 1,
    day: nextDate.getUTCDate(),
  };
}

function formatCalendarDate(date: {
  year: number;
  month: number;
  day: number;
}) {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(
    date.day
  ).padStart(2, "0")}`;
}

type SpotForTile = {
  id: string;
  name: string;
  description: string | null;
  maxPeople: number;
  pricePerDay: number | null;
  pricePerNight: number | null;
  pricePer24h: number | null;
  isActive: boolean;
  isReservableOnline: boolean;
};

type ReservationForTile = {
  id: string;
  lakeId: string;
  spotId: string | null;
  scope: string;
  type: string;
  status: string;
  title: string | null;
  startsAt: Date;
  endsAt: Date;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  organizerName: string | null;
  organizerPhone: string | null;
  organizerEmail: string | null;
  peopleCount: number;
  totalPrice: number | null;
  depositAmount: number | null;
  paymentStatus: string;
  note: string | null;
  internalNote: string | null;
  isPublicEvent: boolean;
  spot: {
    id: string;
    name: string;
  } | null;
};