"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type OwnerSpotOption = {
  id: string;
  name: string;
  maxPeople: number;
};

export type OwnerReservationItem = {
  id: string;
  spotId: string | null;
  scope: string;
  type: string;
  status: string;
  title: string | null;
  startsAt: string;
  endsAt: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  organizerName: string | null;
  organizerPhone: string | null;
  organizerEmail: string | null;
  peopleCount: number;
  note: string | null;
  internalNote: string | null;
  isPublicEvent: boolean;
  spot: { id: string; name: string } | null;
};

type BookingTimes = {
  defaultStartTime: string;
  defaultEndTime: string;
  fullDayStartTime: string;
  fullDayEndTime: string;
  dayStartTime: string;
  dayEndTime: string;
  nightStartTime: string;
  nightEndTime: string;
};

type OwnerReservationsBoardProps = {
  lakeSlug: string;
  lakeName: string;
  from: string;
  days: number;
  activeNow: number;
  pendingCount: number;
  spots: OwnerSpotOption[];
  settings: BookingTimes;
  reservations: OwnerReservationItem[];
  initialNew?: boolean;
  initialSpotId?: string | null;
  initialReservationId?: string | null;
};

type ReservationFormState = {
  id: string | null;
  scope: "spot" | "lake";
  type: string;
  status: string;
  spotId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  peopleCount: string;
  note: string;
  internalNote: string;
  isPublicEvent: boolean;
};

const statusMeta: Record<string, { label: string; className: string; bar: string }> = {
  pending: {
    label: "Do potwierdzenia",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    bar: "bg-amber-400 text-amber-950",
  },
  confirmed: {
    label: "Potwierdzona",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    bar: "bg-emerald-500 text-white",
  },
  completed: {
    label: "Zakończona",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
    bar: "bg-slate-400 text-white",
  },
  no_show: {
    label: "Nie przyjechał",
    className: "bg-orange-50 text-orange-700 ring-orange-200",
    bar: "bg-orange-500 text-white",
  },
  cancelled: {
    label: "Anulowana",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
    bar: "bg-rose-400 text-white",
  },
};

const typeLabels: Record<string, string> = {
  reservation: "Rezerwacja",
  competition: "Zawody",
  maintenance: "Prace / serwis",
  private_event: "Wydarzenie prywatne",
  block: "Blokada łowiska",
};

function addDays(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return date.toISOString().slice(0, 10);
}

function dateKeyFromIso(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function formatDay(dateKey: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${dateKey}T12:00:00Z`));
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatShortDateTime(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function toDateTimeLocal(iso: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date(iso))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function reservationName(item: OwnerReservationItem) {
  return (
    item.title ||
    (item.scope === "lake" ? item.organizerName : item.customerName) ||
    typeLabels[item.type] ||
    "Rezerwacja"
  );
}

function getContact(item: OwnerReservationItem) {
  return item.scope === "lake"
    ? {
        name: item.organizerName ?? "",
        phone: item.organizerPhone ?? "",
        email: item.organizerEmail ?? "",
      }
    : {
        name: item.customerName ?? "",
        phone: item.customerPhone ?? "",
        email: item.customerEmail ?? "",
      };
}

export function OwnerReservationsBoard({
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
}: OwnerReservationsBoardProps) {
  const router = useRouter();
  const dateKeys = useMemo(
    () => Array.from({ length: days }, (_, index) => addDays(from, index)),
    [from, days]
  );
  const [drawer, setDrawer] = useState<ReservationFormState | null>(() => {
    if (initialReservationId) {
      const reservation = reservations.find((item) => item.id === initialReservationId);
      return reservation ? formFromReservation(reservation) : null;
    }
    if (initialNew) {
      return createEmptyForm(from, settings, initialSpotId ?? spots[0]?.id ?? "");
    }
    return null;
  });

  const upcomingCount = reservations.filter(
    (reservation) =>
      reservation.status !== "cancelled" && new Date(reservation.endsAt) > new Date()
  ).length;

  function navigate(nextFrom: string, nextDays = days) {
    router.push(`/moje-lowiska/${lakeSlug}/rezerwacje?from=${nextFrom}&days=${nextDays}`);
  }

  function openNew(dateKey = from, spotId = spots[0]?.id ?? "") {
    setDrawer(createEmptyForm(dateKey, settings, spotId));
  }

  function openExisting(reservation: OwnerReservationItem) {
    setDrawer(formFromReservation(reservation));
  }

  return (
    <>
      <section className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-blue-600">
            Zarządzanie rezerwacjami
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Kalendarz rezerwacji
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            Jedno miejsce do obsługi rezerwacji stanowisk, zawodów i blokad całego łowiska {lakeName}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openNew()}
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          + Nowa rezerwacja
        </button>
      </section>

      <section className="mb-6 overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200/80">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Aktywne teraz"
            value={String(activeNow)}
            hint="trwające rezerwacje"
          />
          <Metric
            label="Do potwierdzenia"
            value={String(pendingCount)}
            hint="wymagają działania"
            tone="amber"
          />
          <Metric
            label="W widocznym okresie"
            value={String(upcomingCount)}
            hint={`${days} dni kalendarza`}
          />
          <Metric
            label="Stanowiska"
            value={String(spots.length)}
            hint="aktywne stanowiska"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200/80">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(addDays(from, -days))}
              className="h-10 rounded-xl bg-slate-100 px-4 text-sm font-black text-slate-700 transition-colors hover:bg-slate-200"
            >
              ← Poprzednie
            </button>
            <button
              type="button"
              onClick={() => navigate(new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Warsaw" }))}
              className="h-10 rounded-xl bg-blue-50 px-4 text-sm font-black text-blue-700 transition-colors hover:bg-blue-100"
            >
              Dzisiaj
            </button>
            <button
              type="button"
              onClick={() => navigate(addDays(from, days))}
              className="h-10 rounded-xl bg-slate-100 px-4 text-sm font-black text-slate-700 transition-colors hover:bg-slate-200"
            >
              Następne →
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="mr-1 hidden text-xs font-bold text-slate-400 sm:inline">Zakres</span>
            {[7, 14, 30].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => navigate(from, value)}
                className={`h-10 rounded-xl px-3 text-xs font-black transition-colors ${
                  days === value
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {value} dni
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:block">
          <Timeline
            dateKeys={dateKeys}
            spots={spots}
            reservations={reservations}
            onOpenNew={openNew}
            onOpenReservation={openExisting}
          />
        </div>

        <div className="lg:hidden">
          <MobileReservations
            reservations={reservations}
            onOpenReservation={openExisting}
            onOpenNew={() => openNew()}
          />
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 px-1 text-[11px] font-bold text-slate-500">
        <LegendDot className="bg-emerald-500" label="Potwierdzona" />
        <LegendDot className="bg-amber-400" label="Do potwierdzenia" />
        <LegendDot className="bg-slate-400" label="Zakończona" />
        <LegendDot className="bg-rose-400" label="Anulowana" />
        <span className="text-slate-400">Kliknij wolne pole, aby od razu dodać rezerwację.</span>
      </div>

      {drawer && (
        <ReservationDrawer
          lakeSlug={lakeSlug}
          form={drawer}
          setForm={setDrawer}
          spots={spots}
          settings={settings}
          onClose={() => setDrawer(null)}
          onSaved={() => {
            setDrawer(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function Timeline({
  dateKeys,
  spots,
  reservations,
  onOpenNew,
  onOpenReservation,
}: {
  dateKeys: string[];
  spots: OwnerSpotOption[];
  reservations: OwnerReservationItem[];
  onOpenNew: (dateKey: string, spotId?: string) => void;
  onOpenReservation: (reservation: OwnerReservationItem) => void;
}) {
  const first = dateKeys[0];
  const afterLast = addDays(dateKeys[dateKeys.length - 1], 1);
  const wholeLakeReservations = reservations.filter((item) => item.scope === "lake");

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div className="flex border-b border-slate-100 bg-slate-50/70">
          <div className="sticky left-0 z-30 flex w-48 shrink-0 items-center border-r border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
            Stanowisko
          </div>
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${dateKeys.length}, minmax(76px, 1fr))`, width: `${dateKeys.length * 84}px` }}
          >
            {dateKeys.map((dateKey) => (
              <div key={dateKey} className="border-r border-slate-100 px-2 py-3 text-center">
                <p className="text-[11px] font-black uppercase text-slate-400">{formatDay(dateKey).split(",")[0]}</p>
                <p className="mt-1 text-xs font-black text-slate-700">{formatDay(dateKey).split(",").slice(1).join(",")}</p>
              </div>
            ))}
          </div>
        </div>

        <TimelineRow
          label="Całe łowisko"
          sublabel="Zawody / blokady"
          dateKeys={dateKeys}
          reservations={wholeLakeReservations}
          first={first}
          afterLast={afterLast}
          onCellClick={(dateKey) => onOpenNew(dateKey, "")}
          onOpenReservation={onOpenReservation}
          isLakeRow
        />

        {spots.map((spot) => (
          <TimelineRow
            key={spot.id}
            label={spot.name}
            sublabel={`maks. ${spot.maxPeople} os.`}
            dateKeys={dateKeys}
            reservations={reservations.filter(
              (item) => item.scope === "spot" && item.spotId === spot.id
            )}
            blockedByReservations={wholeLakeReservations.filter(
              (item) => item.status === "pending" || item.status === "confirmed"
            )}
            first={first}
            afterLast={afterLast}
            onCellClick={(dateKey) => onOpenNew(dateKey, spot.id)}
            onOpenReservation={onOpenReservation}
          />
        ))}

        {spots.length === 0 && (
          <div className="p-8 text-center">
            <p className="font-black text-slate-900">Najpierw dodaj stanowiska</p>
            <p className="mt-1 text-sm text-slate-500">Rezerwacje pojedynczych stanowisk będą widoczne tutaj.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function reservationCoversDate(reservation: OwnerReservationItem, dateKey: string) {
  const start = dateKeyFromIso(reservation.startsAt);
  const end = dateKeyFromIso(reservation.endsAt);

  if (start === end) return dateKey === start;
  return dateKey >= start && dateKey < end;
}

function TimelineRow({
  label,
  sublabel,
  dateKeys,
  reservations,
  blockedByReservations = [],
  first,
  afterLast,
  onCellClick,
  onOpenReservation,
  isLakeRow = false,
}: {
  label: string;
  sublabel: string;
  dateKeys: string[];
  reservations: OwnerReservationItem[];
  blockedByReservations?: OwnerReservationItem[];
  first: string;
  afterLast: string;
  onCellClick: (dateKey: string) => void;
  onOpenReservation: (reservation: OwnerReservationItem) => void;
  isLakeRow?: boolean;
}) {
  return (
    <div className={`flex border-b border-slate-100 ${isLakeRow ? "bg-blue-50/30" : "bg-white"}`}>
      <div className={`sticky left-0 z-20 flex w-48 shrink-0 flex-col justify-center border-r border-slate-200 px-4 py-3 ${isLakeRow ? "bg-blue-50" : "bg-white"}`}>
        <p className="truncate text-sm font-black text-slate-900">{label}</p>
        <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400">{sublabel}</p>
      </div>

      <div
        className="relative grid min-h-[64px]"
        style={{ gridTemplateColumns: `repeat(${dateKeys.length}, minmax(76px, 1fr))`, width: `${dateKeys.length * 84}px` }}
      >
        {dateKeys.map((dateKey, index) => {
          const blocked = blockedByReservations.some((reservation) =>
            reservationCoversDate(reservation, dateKey)
          );

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => !blocked && onCellClick(dateKey)}
              disabled={blocked}
              className={`row-start-1 border-r border-slate-100 transition-colors ${
                blocked
                  ? "cursor-not-allowed bg-slate-100/80"
                  : "hover:bg-blue-50/80"
              }`}
              style={{ gridColumnStart: index + 1 }}
              aria-label={
                blocked
                  ? `Całe łowisko zablokowane: ${dateKey}`
                  : `Dodaj rezerwację: ${label}, ${dateKey}`
              }
            />
          );
        })}

        {reservations.map((reservation) => {
          const startKey = dateKeyFromIso(reservation.startsAt);
          const endKey = dateKeyFromIso(reservation.endsAt);
          const clippedStart = startKey < first ? first : startKey;
          const clippedEnd = endKey > afterLast ? afterLast : endKey;
          const startIndex = Math.max(0, dateKeys.indexOf(clippedStart));
          let endIndex = dateKeys.indexOf(clippedEnd);
          if (endIndex < 0) endIndex = dateKeys.length;
          const span = Math.max(1, endIndex - startIndex);
          const meta = statusMeta[reservation.status] ?? statusMeta.confirmed;

          return (
            <button
              key={reservation.id}
              type="button"
              onClick={() => onOpenReservation(reservation)}
              className={`z-10 m-1 min-w-0 overflow-hidden rounded-xl px-2.5 py-2 text-left text-[11px] font-black shadow-sm transition hover:brightness-95 ${meta.bar}`}
              style={{
                gridColumn: `${startIndex + 1} / span ${span}`,
                gridRow: 1,
              }}
              title={`${reservationName(reservation)} • ${formatDateTime(reservation.startsAt)} – ${formatDateTime(reservation.endsAt)}`}
            >
              <span className="block truncate">{reservationName(reservation)}</span>
              <span className="mt-0.5 block truncate text-[10px] opacity-80">
                {formatShortDateTime(reservation.startsAt)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MobileReservations({
  reservations,
  onOpenReservation,
  onOpenNew,
}: {
  reservations: OwnerReservationItem[];
  onOpenReservation: (reservation: OwnerReservationItem) => void;
  onOpenNew: () => void;
}) {
  const visible = [...reservations]
    .filter((item) => item.status !== "cancelled")
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-black text-slate-950">Rezerwacje w okresie</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">Widok zoptymalizowany pod telefon.</p>
        </div>
        <button type="button" onClick={onOpenNew} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white">
          + Dodaj
        </button>
      </div>

      <div className="space-y-2">
        {visible.map((reservation) => {
          const meta = statusMeta[reservation.status] ?? statusMeta.confirmed;
          return (
            <button
              key={reservation.id}
              type="button"
              onClick={() => onOpenReservation(reservation)}
              className="w-full rounded-2xl bg-slate-50 p-4 text-left transition-colors hover:bg-slate-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{reservationName(reservation)}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {reservation.scope === "lake" ? "Całe łowisko" : reservation.spot?.name ?? "Stanowisko"}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${meta.className}`}>
                  {meta.label}
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-500">
                {formatDateTime(reservation.startsAt)} → {formatDateTime(reservation.endsAt)}
              </p>
            </button>
          );
        })}

        {visible.length === 0 && (
          <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
            Brak rezerwacji w tym okresie.
          </div>
        )}
      </div>
    </div>
  );
}

function ReservationDrawer({
  lakeSlug,
  form,
  setForm,
  spots,
  settings,
  onClose,
  onSaved,
}: {
  lakeSlug: string;
  form: ReservationFormState;
  setForm: (form: ReservationFormState | null) => void;
  spots: OwnerSpotOption[];
  settings: BookingTimes;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function patch<K extends keyof ReservationFormState>(key: K, value: ReservationFormState[K]) {
    setForm({ ...form, [key]: value });
  }

  function applyPreset(kind: "standard" | "fullDay" | "day" | "night") {
    const baseDate = (form.startsAt || new Date().toISOString()).slice(0, 10);

    if (kind === "day") {
      setForm({
        ...form,
        startsAt: `${baseDate}T${settings.dayStartTime || "08:00"}`,
        endsAt: `${baseDate}T${settings.dayEndTime || "16:00"}`,
      });
      return;
    }

    const nextDate = addDays(baseDate, 1);

    if (kind === "night") {
      setForm({
        ...form,
        startsAt: `${baseDate}T${settings.nightStartTime || "16:00"}`,
        endsAt: `${nextDate}T${settings.nightEndTime || "06:00"}`,
      });
      return;
    }

    if (kind === "fullDay") {
      setForm({
        ...form,
        startsAt: `${baseDate}T${settings.fullDayStartTime || "06:00"}`,
        endsAt: `${nextDate}T${settings.fullDayEndTime || "07:00"}`,
      });
      return;
    }

    setForm({
      ...form,
      startsAt: `${baseDate}T${settings.defaultStartTime || "12:00"}`,
      endsAt: `${nextDate}T${settings.defaultEndTime || "10:00"}`,
    });
  }

  async function save() {
    setIsSaving(true);
    setError("");

    try {
      const endpoint = form.id
        ? `/api/owner/lakes/${lakeSlug}/reservations/${form.id}`
        : `/api/owner/lakes/${lakeSlug}/reservations`;
      const response = await fetch(endpoint, {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(data?.message || "Nie udało się zapisać rezerwacji.");
      onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Nie udało się zapisać rezerwacji.");
    } finally {
      setIsSaving(false);
    }
  }

  async function cancelReservation() {
    if (!form.id || !window.confirm("Anulować tę rezerwację? Pozostanie w historii.")) return;
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/owner/lakes/${lakeSlug}/reservations/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "cancelled" }),
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(data?.message || "Nie udało się anulować rezerwacji.");
      onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Nie udało się anulować rezerwacji.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1400] bg-slate-950/40 backdrop-blur-[2px]" onMouseDown={onClose}>
      <aside
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">
              {form.id ? "Szczegóły rezerwacji" : "Nowa rezerwacja"}
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              {form.id ? form.title || form.contactName || "Rezerwacja" : "Dodaj termin"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-600 hover:bg-slate-200" aria-label="Zamknij">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {error && <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}

          <FieldGroup title="Zakres">
            <div className="grid grid-cols-2 gap-2">
              <Choice active={form.scope === "spot"} onClick={() => patch("scope", "spot")} label="Stanowisko" />
              <Choice active={form.scope === "lake"} onClick={() => patch("scope", "lake")} label="Całe łowisko" />
            </div>

            {form.scope === "spot" ? (
              <label className="block">
                <FieldLabel>Stanowisko</FieldLabel>
                <select value={form.spotId} onChange={(event) => patch("spotId", event.target.value)} className="form-control">
                  <option value="">Wybierz stanowisko</option>
                  {spots.map((spot) => <option key={spot.id} value={spot.id}>{spot.name} · maks. {spot.maxPeople} os.</option>)}
                </select>
              </label>
            ) : (
              <label className="block">
                <FieldLabel>Rodzaj blokady / wydarzenia</FieldLabel>
                <select value={form.type} onChange={(event) => patch("type", event.target.value)} className="form-control">
                  <option value="competition">Zawody wędkarskie</option>
                  <option value="private_event">Wydarzenie prywatne</option>
                  <option value="maintenance">Prace / serwis</option>
                  <option value="block">Inna blokada</option>
                </select>
              </label>
            )}
          </FieldGroup>

          <FieldGroup title="Termin">
            <div className="flex flex-wrap gap-2">
              <PresetButton label="Standard" onClick={() => applyPreset("standard")} />
              <PresetButton label="Doba" onClick={() => applyPreset("fullDay")} />
              <PresetButton label="Dzień" onClick={() => applyPreset("day")} />
              <PresetButton label="Noc" onClick={() => applyPreset("night")} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <FieldLabel>Od</FieldLabel>
                <input type="datetime-local" value={form.startsAt} onChange={(event) => patch("startsAt", event.target.value)} className="form-control" />
              </label>
              <label>
                <FieldLabel>Do</FieldLabel>
                <input type="datetime-local" value={form.endsAt} onChange={(event) => patch("endsAt", event.target.value)} className="form-control" />
              </label>
            </div>
          </FieldGroup>

          <FieldGroup title="Rezerwacja">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <FieldLabel>{form.scope === "lake" ? "Nazwa wydarzenia / tytuł" : "Tytuł (opcjonalnie)"}</FieldLabel>
                <input value={form.title} onChange={(event) => patch("title", event.target.value)} placeholder={form.scope === "lake" ? "np. Zawody karpiowe" : "np. Rezerwacja weekendowa"} className="form-control" />
              </label>
              <label>
                <FieldLabel>Status</FieldLabel>
                <select value={form.status} onChange={(event) => patch("status", event.target.value)} className="form-control">
                  <option value="pending">Do potwierdzenia</option>
                  <option value="confirmed">Potwierdzona</option>
                  <option value="completed">Zakończona</option>
                  <option value="no_show">Nie przyjechał</option>
                  <option value="cancelled">Anulowana</option>
                </select>
              </label>
              <label>
                <FieldLabel>Liczba osób</FieldLabel>
                <input type="number" min="1" max="999" value={form.peopleCount} onChange={(event) => patch("peopleCount", event.target.value)} className="form-control" />
              </label>
            </div>
          </FieldGroup>

          <FieldGroup title={form.scope === "lake" ? "Organizator" : "Klient"}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <FieldLabel>Imię i nazwisko / nazwa</FieldLabel>
                <input value={form.contactName} onChange={(event) => patch("contactName", event.target.value)} className="form-control" />
              </label>
              <label>
                <FieldLabel>Telefon</FieldLabel>
                <input value={form.contactPhone} onChange={(event) => patch("contactPhone", event.target.value)} inputMode="tel" className="form-control" />
              </label>
              <label>
                <FieldLabel>E-mail</FieldLabel>
                <input value={form.contactEmail} onChange={(event) => patch("contactEmail", event.target.value)} type="email" className="form-control" />
              </label>
            </div>
          </FieldGroup>

          <FieldGroup title="Notatki">
            <label className="block">
              <FieldLabel>Informacje do rezerwacji</FieldLabel>
              <textarea value={form.note} onChange={(event) => patch("note", event.target.value)} rows={3} className="form-control resize-none" placeholder="np. przyjazd późnym wieczorem, 3 wędkarzy..." />
            </label>
            <label className="block">
              <FieldLabel>Notatka wewnętrzna</FieldLabel>
              <textarea value={form.internalNote} onChange={(event) => patch("internalNote", event.target.value)} rows={2} className="form-control resize-none" placeholder="Widoczna tylko w panelu właściciela." />
            </label>
          </FieldGroup>
        </div>

        <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {form.id && form.status !== "cancelled" && (
                <button type="button" onClick={cancelReservation} disabled={isSaving} className="w-full rounded-xl px-4 py-3 text-sm font-black text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50 sm:w-auto">
                  Anuluj rezerwację
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-200 sm:flex-none">Zamknij</button>
              <button type="button" onClick={save} disabled={isSaving} className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50 sm:flex-none">
                {isSaving ? "Zapisywanie..." : form.id ? "Zapisz zmiany" : "Dodaj rezerwację"}
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .form-control {
            margin-top: 0.4rem;
            min-height: 2.85rem;
            width: 100%;
            border-radius: 0.85rem;
            border: 1px solid rgb(226 232 240);
            background: white;
            padding: 0.7rem 0.85rem;
            color: rgb(15 23 42);
            font-size: 0.875rem;
            font-weight: 650;
            outline: none;
          }
          .form-control:focus {
            border-color: rgb(59 130 246);
            box-shadow: 0 0 0 3px rgb(219 234 254);
          }
        `}</style>
      </aside>
    </div>
  );
}

function formFromReservation(item: OwnerReservationItem): ReservationFormState {
  const contact = getContact(item);
  return {
    id: item.id,
    scope: item.scope === "lake" ? "lake" : "spot",
    type: item.type,
    status: item.status === "paid" ? "confirmed" : item.status,
    spotId: item.spotId ?? "",
    title: item.title ?? "",
    startsAt: toDateTimeLocal(item.startsAt),
    endsAt: toDateTimeLocal(item.endsAt),
    contactName: contact.name,
    contactPhone: contact.phone,
    contactEmail: contact.email,
    peopleCount: String(item.peopleCount || 1),
    note: item.note ?? "",
    internalNote: item.internalNote ?? "",
    isPublicEvent: item.isPublicEvent,
  };
}

function createEmptyForm(dateKey: string, settings: BookingTimes, spotId: string): ReservationFormState {
  const endDate = addDays(dateKey, 1);
  return {
    id: null,
    scope: spotId ? "spot" : "lake",
    type: spotId ? "reservation" : "block",
    status: "confirmed",
    spotId,
    title: "",
    startsAt: `${dateKey}T${settings.defaultStartTime || "12:00"}`,
    endsAt: `${endDate}T${settings.defaultEndTime || "10:00"}`,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    peopleCount: "1",
    note: "",
    internalNote: "",
    isPublicEvent: false,
  };
}

function Metric({
  label,
  value,
  hint,
  tone = "blue",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "blue" | "amber";
}) {
  return (
    <div className="px-5 py-5 sm:px-6 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-slate-100 sm:[&:not(:last-child)]:border-b-0 sm:[&:not(:last-child)]:border-r">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {hint}
          </p>
        </div>

        <span
          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
            tone === "amber" ? "bg-amber-400" : "bg-blue-500"
          }`}
        />
      </div>
    </div>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 rounded-2xl bg-slate-50 p-4">
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{title}</p>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="block text-xs font-black text-slate-600">{children}</span>;
}

function Choice({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-xl px-4 py-3 text-sm font-black transition-colors ${active ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"}`}>
      {label}
    </button>
  );
}

function PresetButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-200"
    >
      {label}
    </button>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${className}`} />
      {label}
    </span>
  );
}