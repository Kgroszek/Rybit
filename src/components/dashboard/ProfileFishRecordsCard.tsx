"use client";

import { useMemo, useState } from "react";
import type { UserFishRecord } from "@/lib/fish-records";

type ProfileFishRecordsCardProps = {
  records: UserFishRecord[];
};

const INITIAL_VISIBLE_COUNT = 6;

export function ProfileFishRecordsCard({
  records,
}: ProfileFishRecordsCardProps) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredRecords = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return records;
    }

    return records.filter((record) =>
      record.fishName.toLowerCase().includes(searchValue)
    );
  }, [records, search]);

  const visibleRecords = showAll
    ? filteredRecords
    : filteredRecords.slice(0, INITIAL_VISIBLE_COUNT);

  const hiddenRecordsCount = filteredRecords.length - visibleRecords.length;

  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Rekordy gatunków
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Twoje najlepsze wyniki dla poszczególnych ryb. Ta sekcja jest
            widoczna tylko na prywatnym profilu.
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          {records.length} gatunków
        </span>
      </div>

      {records.length > 0 && (
        <div className="mt-5">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setShowAll(false);
            }}
            placeholder="Szukaj gatunku, np. leszcz, karp, szczupak..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          />
        </div>
      )}

      {visibleRecords.length > 0 ? (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {visibleRecords.map((record) => (
              <FishRecordCard key={record.fishName} record={record} />
            ))}
          </div>

          {filteredRecords.length > INITIAL_VISIBLE_COUNT && (
            <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-3xl bg-slate-50 p-5 sm:flex-row">
              <p className="text-sm font-semibold text-slate-500">
                {showAll
                  ? "Wyświetlasz wszystkie rekordy gatunków."
                  : `Ukryto jeszcze ${hiddenRecordsCount} rekordów.`}
              </p>

              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {showAll ? "Pokaż mniej" : "Pokaż wszystkie"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 rounded-3xl bg-slate-50 p-8 text-center">
          <p className="text-lg font-bold text-slate-950">
            Brak rekordów gatunków
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Dodaj połowy z wagą lub długością, aby pojawiły się tutaj Twoje
            rekordy.
          </p>
        </div>
      )}
    </section>
  );
}

function FishRecordCard({ record }: { record: UserFishRecord }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            Gatunek
          </p>

          <h3 className="mt-2 text-2xl font-black text-slate-950">
            {record.fishName}
          </h3>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Liczba połowów: {record.catchesCount}
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700">
          Rekord
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <RecordValue
          label="Największa waga"
          value={
            record.bestWeight !== null
              ? `${record.bestWeight.toFixed(2)} kg`
              : "Brak"
          }
          date={record.bestWeightDate}
          lakeName={record.bestWeightLakeName}
        />

        <RecordValue
          label="Największa długość"
          value={
            record.bestLength !== null
              ? `${record.bestLength.toFixed(0)} cm`
              : "Brak"
          }
          date={record.bestLengthDate}
          lakeName={record.bestLengthLakeName}
        />
      </div>
    </article>
  );
}

function RecordValue({
  label,
  value,
  date,
  lakeName,
}: {
  label: string;
  value: string;
  date: Date | null;
  lakeName: string | null;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>

      {lakeName && (
        <p className="mt-2 text-sm font-semibold text-slate-600">
          {lakeName}
        </p>
      )}

      {date && (
        <p className="mt-1 text-xs font-semibold text-slate-400">
          {formatDate(date)}
        </p>
      )}
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}