"use client";

import {
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { AlertIcon } from "@/components/icons/AlertIcon";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { MobileReservationsList } from "@/components/owner/reservations/MobileReservationsList";
import { ReservationDialog } from "@/components/owner/reservations/ReservationDialog";
import { ReservationsStats } from "@/components/owner/reservations/ReservationsStats";
import { ReservationsTimeline } from "@/components/owner/reservations/ReservationsTimeline";
import { ReservationsToolbar } from "@/components/owner/reservations/ReservationsToolbar";
import {
  addDays,
  canonicalReservationsUrl,
  createEmptyForm,
  formFromReservation,
  formatDay,
  getWarsawDateKey,
} from "@/components/owner/reservations/reservation-utils";
import type {
  OwnerReservationItem,
  OwnerReservationsManagerProps,
  ReservationFormState,
} from "@/components/owner/reservations/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export function OwnerReservationsManager({
  lakeSlug,
  lakeName,
  from,
  days,
  activeNow,
  pendingCount,
  spots,
  settings,
  reservations,
  initialNew = false,
  initialSpotId = null,
  initialReservationId = null,
}: OwnerReservationsManagerProps) {
  const router = useRouter();

  const [form, setForm] =
    useState<ReservationFormState | null>(
      () => {
        if (initialReservationId) {
          const reservation =
            reservations.find(
              (item) =>
                item.id ===
                initialReservationId
            );

          return reservation
            ? formFromReservation(
                reservation
              )
            : null;
        }

        if (initialNew) {
          return createEmptyForm(
            from,
            settings,
            initialSpotId ??
              spots[0]?.id ??
              ""
          );
        }

        return null;
      }
    );

  const [sourceReservation, setSourceReservation] =
    useState<OwnerReservationItem | null>(
      () =>
        initialReservationId
          ? reservations.find(
              (item) =>
                item.id ===
                initialReservationId
            ) ?? null
          : null
    );

  const dateKeys = useMemo(
    () =>
      Array.from(
        { length: days },
        (_, index) =>
          addDays(from, index)
      ),
    [days, from]
  );

  const upcomingCount = useMemo(
    () => {
      const now = Date.now();

      return reservations.filter(
        (reservation) =>
          reservation.status !==
            "cancelled" &&
          new Date(
            reservation.endsAt
          ).getTime() > now
      ).length;
    },
    [reservations]
  );

  const rangeLabel = useMemo(() => {
    const start = formatDay(from).date;
    const end = formatDay(
      addDays(from, days - 1)
    ).date;

    return `${start} – ${end}`;
  }, [days, from]);

  function navigate(
    nextFrom: string,
    nextDays = days
  ) {
    setForm(null);
    setSourceReservation(null);

    router.push(
      canonicalReservationsUrl(
        lakeSlug,
        nextFrom,
        nextDays
      )
    );
  }

  function openNew(
    dateKey = from,
    spotId = spots[0]?.id ?? ""
  ) {
    setSourceReservation(null);
    setForm(
      createEmptyForm(
        dateKey,
        settings,
        spotId
      )
    );
  }

  function openExisting(
    reservation: OwnerReservationItem
  ) {
    setSourceReservation(reservation);
    setForm(
      formFromReservation(reservation)
    );
  }

  function closeDialog() {
    setForm(null);
    setSourceReservation(null);

    if (
      initialNew ||
      initialReservationId ||
      initialSpotId
    ) {
      router.replace(
        canonicalReservationsUrl(
          lakeSlug,
          from,
          days
        )
      );
    }
  }

  function handleSaved() {
    setForm(null);
    setSourceReservation(null);

    router.replace(
      canonicalReservationsUrl(
        lakeSlug,
        from,
        days
      )
    );
    router.refresh();
  }

  return (
    <div className="space-y-6 lg:space-y-7">
      <PageHeader
        eyebrow="Zarządzanie rezerwacjami"
        title="Kalendarz rezerwacji"
        description={`Obsługuj rezerwacje stanowisk, zawody i blokady całego łowiska ${lakeName} w jednym widoku.`}
        actions={
          <Button
            type="button"
            onClick={() => openNew()}
          >
            <AddCircleIcon className="h-4 w-4" />
            Nowa rezerwacja
          </Button>
        }
      />

      <ReservationsStats
        activeNow={activeNow}
        pendingCount={pendingCount}
        upcomingCount={upcomingCount}
        spotsCount={spots.length}
      />

      {pendingCount > 0 && (
        <Card className="border-warning-border bg-warning-subtle shadow-none">
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface text-warning-foreground shadow-sm">
                <AlertIcon className="h-5 w-5" />
              </span>

              <div>
                <p className="text-sm font-bold text-warning-foreground">
                  {pendingCount}{" "}
                  {pendingCount === 1
                    ? "rezerwacja wymaga"
                    : "rezerwacje wymagają"}{" "}
                  decyzji
                </p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Potwierdź lub anuluj oczekujące terminy, aby kalendarz odzwierciedlał faktyczną dostępność.
                </p>
              </div>
            </div>

            {from !== getWarsawDateKey() && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(
                    getWarsawDateKey(),
                    14
                  )
                }
              >
                Wróć do bieżącego okresu
              </Button>
            )}
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <ReservationsToolbar
          from={from}
          days={days}
          rangeLabel={rangeLabel}
          onPrevious={() =>
            navigate(
              addDays(from, -days)
            )
          }
          onToday={() =>
            navigate(
              getWarsawDateKey()
            )
          }
          onNext={() =>
            navigate(
              addDays(from, days)
            )
          }
          onRangeChange={(nextDays) =>
            navigate(from, nextDays)
          }
        />

        <div className="hidden lg:block">
          <ReservationsTimeline
            dateKeys={dateKeys}
            spots={spots}
            reservations={reservations}
            onOpenNew={openNew}
            onOpenReservation={
              openExisting
            }
          />
        </div>

        <div className="lg:hidden">
          <MobileReservationsList
            reservations={reservations}
            onOpenReservation={
              openExisting
            }
          />
        </div>

        <div className="border-t border-border px-4 py-3.5 sm:px-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-text-muted">
            <Legend
              className="bg-success"
              label="Potwierdzona"
            />
            <Legend
              className="bg-warning"
              label="Do potwierdzenia"
            />
            <Legend
              className="bg-text-muted"
              label="Zakończona"
            />
            <Legend
              className="bg-danger"
              label="Anulowana"
            />

            <span className="hidden lg:inline">
              Kliknij wolne pole w kalendarzu, aby od razu dodać rezerwację.
            </span>
          </div>
        </div>
      </Card>

      {spots.length === 0 && (
        <Card
          variant="subtle"
          className="px-5 py-5 sm:px-6"
        >
          <div className="flex items-start gap-3">
            <CalendarIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-bold text-text">
                Brak aktywnych stanowisk
              </p>
              <p className="mt-1 text-xs leading-5 text-text-muted">
                Nadal możesz dodawać wydarzenia i blokady całego łowiska. Rezerwacje pojedynczych stanowisk będą dostępne po utworzeniu stanowisk.
              </p>
            </div>
          </div>
        </Card>
      )}

      {form && (
        <ReservationDialog
          lakeSlug={lakeSlug}
          form={form}
          spots={spots}
          settings={settings}
          sourceReservation={
            sourceReservation
          }
          onChange={setForm}
          onClose={closeDialog}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function Legend({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${className}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
