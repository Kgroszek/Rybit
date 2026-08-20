"use client";

import type { FormEvent } from "react";

import { CATCH_METHODS, FISH_SPECIES_OPTIONS } from "@/components/catches/constants";
import { CatchPhotoField } from "@/components/catches/forms/CatchPhotoField";
import { CatchInput, CatchSelect } from "@/components/catches/forms/FormField";
import { LakeSearchSelect } from "@/components/catches/forms/LakeSearchSelect";
import type {
  CatchFieldChange,
  CatchFormState,
  LakeOption,
  TripOption,
} from "@/components/catches/types";
import { formatDateTime, formatShortDate } from "@/components/catches/utils";
import { FormIcon } from "@/components/icons/FormIcon";
import { Button } from "@/components/ui/Button";

export function QuickCatchForm({
  form,
  selectedImage,
  lakes,
  trips,
  autoTripId,
  isLoading,
  onSubmit,
  onCancel,
  onSwitchToFull,
  onFieldChange,
  onImageChange,
}: {
  form: CatchFormState;
  selectedImage: File | null;
  lakes: LakeOption[];
  trips: TripOption[];
  autoTripId: string | null;
  isLoading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onSwitchToFull: () => void;
  onFieldChange: CatchFieldChange;
  onImageChange: (file: File | null) => void;
}) {
  const selectedTrip = trips.find((trip) => trip.id === form.tripId) ?? null;

  return (
    <form onSubmit={onSubmit} className="flex min-h-full flex-col gap-5">
      <div className="flex items-center justify-between gap-4 rounded-control border border-primary-200 bg-primary-50 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-primary">
            Data połowu
          </p>
          <p className="mt-0.5 truncate text-sm font-bold text-primary-900">
            {form.caughtAt ? formatDateTime(form.caughtAt) : "Teraz"}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold text-primary shadow-sm">
          automatycznie
        </span>
      </div>

      <div className="grid gap-y-4 gap-x-6 sm:grid-cols-2">
        <CatchSelect
          label="Gatunek ryby"
          value={form.fishName}
          onChange={(value) => onFieldChange("fishName", value)}
          options={[
            { label: "Wybierz gatunek", value: "" },
            ...FISH_SPECIES_OPTIONS.map((value) => ({ label: value, value })),
            { label: "Inny gatunek", value: "other" },
          ]}
          required
        />

        <CatchSelect
          label="Metoda"
          value={form.method}
          onChange={(value) => onFieldChange("method", value)}
          options={CATCH_METHODS.map((item) => ({ ...item }))}
          required
        />

        {form.fishName === "other" && (
          <div className="sm:col-span-2">
            <CatchInput
              label="Wpisz gatunek"
              value={form.customFishName}
              onChange={(value) => onFieldChange("customFishName", value)}
              placeholder="np. inny gatunek"
              required
            />
          </div>
        )}

        <CatchInput
          label="Waga w kg"
          value={form.weight}
          onChange={(value) => onFieldChange("weight", value)}
          placeholder="np. 3.25"
          type="number"
        />

        <CatchInput
          label="Długość w cm"
          value={form.length}
          onChange={(value) => onFieldChange("length", value)}
          placeholder="np. 72"
          type="number"
        />
      </div>

      {selectedTrip && (
        <div className="rounded-control border border-success-border bg-success-subtle px-4 py-3">
          <p className="text-sm font-bold text-success-foreground">
            {selectedTrip.id === autoTripId
              ? "Przypisano trwającą wyprawę"
              : "Połów przypisany do wyprawy"}
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            {selectedTrip.title}
            {selectedTrip.lakeId
              ? " · łowisko i metoda zostały uzupełnione z wyprawy"
              : " · metoda została uzupełniona z wyprawy"}
          </p>
        </div>
      )}

      <div className="grid gap-y-4 gap-x-6 sm:grid-cols-2">
        <LakeSearchSelect
          lakes={lakes}
          value={form.lakeId}
          onChange={(value) => onFieldChange("lakeId", value)}
        />

        {trips.length > 0 ? (
          <CatchSelect
            label="Wyprawa (opcjonalnie)"
            value={form.tripId}
            onChange={(value) => onFieldChange("tripId", value)}
            options={[
              { label: "Bez przypisanej wyprawy", value: "" },
              ...trips.map((trip) => ({
                label: `${trip.title} — ${formatShortDate(trip.startsAt)}`,
                value: trip.id,
              })),
            ]}
          />
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>

      <CatchPhotoField
        selectedImage={selectedImage}
        onImageChange={onImageChange}
        compact
      />

      <div className="rounded-control bg-surface-muted px-4 py-3 text-xs leading-5 text-text-secondary">
        Szybki zapis tworzy prywatny wpis. Ranking, przynętę, notatkę i dokładną datę możesz uzupełnić później.
      </div>

      <button
        type="button"
        onClick={onSwitchToFull}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-primary-50 disabled:opacity-50"
      >
        <FormIcon className="h-4 w-4" />
        Otwórz pełny formularz
      </button>

      <div className="mt-auto flex gap-3 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          Anuluj
        </Button>
        <Button
          type="submit"
          className="flex-1"
          isLoading={isLoading}
          loadingLabel="Zapisywanie…"
        >
          Zapisz połów
        </Button>
      </div>
    </form>
  );
}
