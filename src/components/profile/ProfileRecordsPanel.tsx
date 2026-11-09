"use client";

import { useMemo, useState } from "react";

import { SearchIcon } from "@/components/icons/SearchIcon";
import { ProfileEmptyState } from "@/components/profile/ProfileEmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { UserFishRecord } from "@/lib/fish-records";
import { formatProfileShortDate } from "@/lib/profile/profile-utils";

const INITIAL_VISIBLE_RECORDS = 6;

export function ProfileRecordsPanel({
  records,
}: {
  records: UserFishRecord[];
}) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pl-PL");

    if (!query) {
      return records;
    }

    return records.filter((record) =>
      record.fishName.toLocaleLowerCase("pl-PL").includes(query)
    );
  }, [records, search]);

  const visibleRecords = showAll
    ? filteredRecords
    : filteredRecords.slice(0, INITIAL_VISIBLE_RECORDS);

  const hiddenCount = Math.max(0, filteredRecords.length - visibleRecords.length);

  if (records.length === 0) {
    return (
      <ProfileEmptyState
        title="Brak rekordów gatunków"
        description="Dodaj połowy z wagą lub długością, a najlepsze wyniki dla poszczególnych gatunków pojawią się tutaj."
      />
    );
  }

  return (
    <div>
      <div className="relative max-w-lg">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setShowAll(false);
          }}
          placeholder="Szukaj gatunku..."
          className="pl-10"
        />
      </div>

      {visibleRecords.length > 0 ? (
        <>
          <div className="mt-5 divide-y divide-border border-y border-border">
            {visibleRecords.map((record) => (
              <FishRecordRow key={record.fishName} record={record} />
            ))}
          </div>

          {filteredRecords.length > INITIAL_VISIBLE_RECORDS && (
            <div className="mt-5 flex flex-col gap-3 rounded-control bg-surface-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-text-muted">
                {showAll
                  ? `Wyświetlasz wszystkie ${filteredRecords.length} rekordów.`
                  : `Ukryto jeszcze ${hiddenCount} rekordów.`}
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAll((current) => !current)}
              >
                {showAll ? "Pokaż mniej" : "Pokaż wszystkie"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <ProfileEmptyState
          className="mt-5"
          title="Brak pasujących gatunków"
          description="Zmień wyszukiwaną frazę, aby zobaczyć inne rekordy."
        />
      )}
    </div>
  );
}

function FishRecordRow({
  record,
}: {
  record: UserFishRecord;
}) {
  return (
    <article className="grid gap-4 py-5 lg:grid-cols-[minmax(180px,.75fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.13em] text-text-muted">
          Gatunek
        </p>

        <h3 className="mt-1.5 truncate font-display text-lg font-extrabold tracking-[-0.02em] text-text">
          {record.fishName}
        </h3>

        <p className="mt-1 text-xs font-semibold text-text-muted">
          {record.catchesCount} {getCatchCountLabel(record.catchesCount)}
        </p>
      </div>

      <RecordValue
        label="Największa waga"
        value={
          record.bestWeight !== null
            ? `${record.bestWeight.toFixed(2)} kg`
            : "Brak danych"
        }
        date={record.bestWeightDate}
        lakeName={record.bestWeightLakeName}
      />

      <RecordValue
        label="Największa długość"
        value={
          record.bestLength !== null
            ? `${record.bestLength.toFixed(0)} cm`
            : "Brak danych"
        }
        date={record.bestLengthDate}
        lakeName={record.bestLengthLakeName}
      />
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
    <div className="min-w-0 rounded-control bg-surface-muted px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-text-muted">
        {label}
      </p>

      <p className="mt-1.5 font-display text-lg font-extrabold tracking-[-0.025em] text-text">
        {value}
      </p>

      {(lakeName || date) && (
        <p className="mt-1 truncate text-xs leading-5 text-text-muted">
          {lakeName || "Nieznane łowisko"}
          {date ? ` · ${formatProfileShortDate(date)}` : ""}
        </p>
      )}
    </div>
  );
}

function getCatchCountLabel(count: number) {
  if (count === 1) {
    return "połów";
  }

  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 12 && lastTwo <= 14) {
    return "połowów";
  }

  if (last >= 2 && last <= 4) {
    return "połowy";
  }

  return "połowów";
}
