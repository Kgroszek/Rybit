"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SpotDto = {
  id: string;
  name: string;
  description: string | null;
  maxPeople: number;
  isActive: boolean;
  sortOrder: number;
  reservationsCount: number;
  isOccupiedNow: boolean;
  nextReservation: {
    id: string;
    startsAt: string;
    endsAt: string;
    customerName: string | null;
    title: string | null;
  } | null;
};

type OwnerSpotsManagerProps = {
  lakeSlug: string;
  lakeName: string;
  spots: SpotDto[];
  canManage: boolean;
};

type SpotFormState = {
  id?: string;
  name: string;
  description: string;
  maxPeople: string;
  isActive: boolean;
};

const emptyForm: SpotFormState = {
  name: "",
  description: "",
  maxPeople: "2",
  isActive: true,
};

export function OwnerSpotsManager({
  lakeSlug,
  lakeName,
  spots,
  canManage,
}: OwnerSpotsManagerProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<SpotFormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visibleSpots = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pl");
    if (!normalized) return spots;

    return spots.filter((spot) =>
      `${spot.name} ${spot.description || ""}`
        .toLocaleLowerCase("pl")
        .includes(normalized)
    );
  }, [query, spots]);

  const activeCount = spots.filter((spot) => spot.isActive).length;
  const occupiedCount = spots.filter((spot) => spot.isOccupiedNow).length;

  function openNew() {
    setMessage(null);
    setForm({ ...emptyForm });
  }

  function openEdit(spot: SpotDto) {
    setMessage(null);
    setForm({
      id: spot.id,
      name: spot.name,
      description: spot.description || "",
      maxPeople: String(spot.maxPeople),
      isActive: spot.isActive,
    });
  }

  async function saveSpot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || !canManage) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const endpoint = form.id
        ? `/api/owner/lakes/${encodeURIComponent(lakeSlug)}/spots/${encodeURIComponent(form.id)}`
        : `/api/owner/lakes/${encodeURIComponent(lakeSlug)}/spots`;

      const response = await fetch(endpoint, {
        method: form.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          maxPeople: Number(form.maxPeople),
          isActive: form.isActive,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.message || "Nie udało się zapisać stanowiska.");
      }

      setForm(null);
      setMessage(form.id ? "Stanowisko zostało zapisane." : "Stanowisko zostało dodane.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udało się zapisać stanowiska.");
    } finally {
      setIsSaving(false);
    }
  }

  async function runSpotAction(spotId: string, action: "moveUp" | "moveDown" | "delete") {
    if (!canManage) return;

    setActionId(spotId);
    setMessage(null);

    try {
      const endpoint = `/api/owner/lakes/${encodeURIComponent(lakeSlug)}/spots/${encodeURIComponent(spotId)}`;
      const response = await fetch(endpoint, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: action === "delete" ? undefined : { "Content-Type": "application/json" },
        body: action === "delete" ? undefined : JSON.stringify({ action }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; deactivated?: boolean }
        | null;

      if (!response.ok) {
        throw new Error(data?.message || "Nie udało się wykonać akcji.");
      }

      setMessage(
        action === "delete"
          ? data?.deactivated
            ? "Stanowisko ma historię rezerwacji, dlatego zostało wyłączone zamiast usunięte."
            : "Stanowisko zostało usunięte."
          : "Kolejność stanowisk została zmieniona."
      );
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udało się wykonać akcji.");
    } finally {
      setActionId(null);
    }
  }

  return (
    <>
      <header className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Organizacja łowiska
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Stanowiska
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            Jedna prosta lista wszystkich miejsc. Ustaw kolejność, pojemność i aktywność stanowiska — kalendarz wykorzysta te dane automatycznie.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
          >
            + Dodaj stanowisko
          </button>
        )}
      </header>

      {message && (
        <div className="mb-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800 ring-1 ring-blue-100">
          {message}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Wszystkie" value={spots.length} />
        <Stat label="Aktywne" value={activeCount} />
        <Stat label="Zajęte teraz" value={occupiedCount} />
      </div>

      <section className="mt-6 rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">Lista stanowisk</h2>
            <p className="mt-1 text-sm text-slate-500">
              Kolejność tutaj jest taka sama jak w kalendarzu rezerwacji.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Szukaj stanowiska..."
              className="h-11 min-w-[240px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
            <Link
              href={`/moje-lowiska/${lakeSlug}/rezerwacje`}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-200"
            >
              Otwórz kalendarz
            </Link>
          </div>
        </div>

        {visibleSpots.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {visibleSpots.map((spot, index) => {
              const originalIndex = spots.findIndex((item) => item.id === spot.id);
              const isFirst = originalIndex === 0;
              const isLast = originalIndex === spots.length - 1;

              return (
                <article
                  key={spot.id}
                  className={`rounded-[22px] p-4 ring-1 transition sm:p-5 ${
                    spot.isActive
                      ? "bg-white ring-slate-200"
                      : "bg-slate-50 ring-slate-200 opacity-75"
                  }`}
                >
                  <div className="grid gap-4 lg:grid-cols-[52px_minmax(0,1fr)_auto] lg:items-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-black text-slate-600">
                      {String(originalIndex + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-black text-slate-950">
                          {spot.name}
                        </h3>
                        <StatusPill
                          label={spot.isOccupiedNow ? "Zajęte teraz" : spot.isActive ? "Aktywne" : "Nieaktywne"}
                          tone={spot.isOccupiedNow ? "blue" : spot.isActive ? "emerald" : "slate"}
                        />
                      </div>

                      <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                        {spot.description || "Bez dodatkowego opisu"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-slate-500">
                        <span>do {spot.maxPeople} os.</span>
                        <span>{spot.reservationsCount} rezerwacji w historii</span>
                        <span>
                          {spot.nextReservation
                            ? `Następna: ${formatDateRange(spot.nextReservation.startsAt, spot.nextReservation.endsAt)}`
                            : "Brak kolejnej rezerwacji"}
                        </span>
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <button
                          type="button"
                          disabled={isFirst || actionId === spot.id}
                          onClick={() => runSpotAction(spot.id, "moveUp")}
                          className="h-10 rounded-xl bg-slate-100 px-3 text-xs font-black text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-35"
                          title="Przesuń wyżej"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={isLast || actionId === spot.id}
                          onClick={() => runSpotAction(spot.id, "moveDown")}
                          className="h-10 rounded-xl bg-slate-100 px-3 text-xs font-black text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-35"
                          title="Przesuń niżej"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(spot)}
                          className="h-10 rounded-xl bg-blue-50 px-4 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                        >
                          Edytuj
                        </button>
                        <button
                          type="button"
                          disabled={actionId === spot.id}
                          onClick={() => {
                            if (window.confirm(`Usunąć stanowisko „${spot.name}”? Jeśli ma historię rezerwacji, zostanie tylko wyłączone.`)) {
                              void runSpotAction(spot.id, "delete");
                            }
                          }}
                          className="h-10 rounded-xl bg-red-50 px-4 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          Usuń
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-[22px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-lg font-black text-slate-950">
              {spots.length === 0 ? "Nie masz jeszcze stanowisk" : "Brak wyników"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {spots.length === 0
                ? "Dodaj pierwsze stanowisko. Od razu pojawi się w kalendarzu rezerwacji."
                : "Zmień wyszukiwaną frazę."}
            </p>
            {canManage && spots.length === 0 && (
              <button
                type="button"
                onClick={openNew}
                className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white"
              >
                + Dodaj stanowisko
              </button>
            )}
          </div>
        )}
      </section>

      {form && (
        <div
          className="fixed inset-0 z-[1200] flex justify-end bg-slate-950/50 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target && !isSaving) setForm(null);
          }}
        >
          <aside className="h-full w-full max-w-lg overflow-y-auto bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  {form.id ? "Edycja stanowiska" : "Nowe stanowisko"}
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  {form.id ? form.name || "Stanowisko" : lakeName}
                </h2>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setForm(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-600 transition hover:bg-slate-200"
                aria-label="Zamknij"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveSpot} className="mt-7 space-y-5">
              <Field label="Nazwa stanowiska" required>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="np. Stanowisko 7"
                  className={inputClassName}
                />
              </Field>

              <Field label="Maksymalna liczba osób">
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={form.maxPeople}
                  onChange={(event) => setForm({ ...form, maxPeople: event.target.value })}
                  className={inputClassName}
                />
              </Field>

              <Field label="Opis">
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Np. blisko parkingu, duży pomost, miejsce na namiot..."
                  className={`${inputClassName} min-h-32 resize-y py-3`}
                />
              </Field>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                  className="mt-1 h-4 w-4 accent-blue-600"
                />
                <span>
                  <span className="block text-sm font-black text-slate-800">
                    Stanowisko aktywne
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Nieaktywne stanowisko pozostaje w historii, ale nie jest dostępne dla nowych rezerwacji.
                  </span>
                </span>
              </label>

              <div className="flex gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setForm(null)}
                  className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSaving ? "Zapisywanie..." : form.id ? "Zapisz zmiany" : "Dodaj stanowisko"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[22px] bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function StatusPill({ label, tone }: { label: string; tone: "blue" | "emerald" | "slate" }) {
  const className =
    tone === "blue"
      ? "bg-blue-50 text-blue-700"
      : tone === "emerald"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-slate-100 text-slate-600";

  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${className}`}>{label}</span>;
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function formatDateRange(startsAt: string, endsAt: string) {
  const formatter = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
  });
  return `${formatter.format(new Date(startsAt))}–${formatter.format(new Date(endsAt))}`;
}

const inputClassName =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";
