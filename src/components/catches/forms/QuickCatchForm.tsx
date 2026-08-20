"use client";

import { CATCH_METHODS, FISH_SPECIES_OPTIONS } from "@/components/catches/constants";
import { CatchPhotoField } from "@/components/catches/forms/CatchPhotoField";
import {
  CatchInput,
  CatchSelect,
} from "@/components/catches/forms/FormField";
import { LakeSearchSelect } from "@/components/catches/forms/LakeSearchSelect";
import type {
  CatchFieldChange,
  CatchFormState,
  LakeOption,
  TripOption,
} from "@/components/catches/types";
import { formatShortDate } from "@/components/catches/utils";
import { FormIcon } from "@/components/icons/FormIcon";

type QuickCatchFormProps = {
  form: CatchFormState;
  selectedImage: File | null;
  lakes: LakeOption[];
  trips: TripOption[];
  autoTripId: string | null;
  isLoading: boolean;
  onSwitchToFull: () => void;
  onFieldChange: CatchFieldChange;
  onImageChange: (file: File | null) => void;
};

export function QuickCatchForm({
  form,
  selectedImage,
  lakes,
  trips,
  autoTripId,
  isLoading,
  onSwitchToFull,
  onFieldChange,
  onImageChange,
}: QuickCatchFormProps) {
  const selectedTrip = trips.find((trip) => trip.id === form.tripId) ?? null;

  return (
    <div className="space-y-8">
      <section aria-labelledby="quick-catch-main">
        <SectionHeading
          id="quick-catch-main"
          title="Co złowiłeś?"
          description="Najważniejsze dane potrzebne do zapisania połowu."
        />

        <div className="grid gap-x-7 gap-y-5 sm:grid-cols-2">
          <CatchSelect
            label="Gatunek ryby"
            value={form.fishName}
            onChange={(value) => onFieldChange("fishName", value)}
            options={[
              {
                label: "Wybierz gatunek",
                value: "",
              },
              ...FISH_SPECIES_OPTIONS.map((value) => ({
                label: value,
                value,
              })),
              {
                label: "Inny gatunek",
                value: "other",
              },
            ]}
            required
          />

          <CatchSelect
            label="Metoda"
            value={form.method}
            onChange={(value) => onFieldChange("method", value)}
            options={CATCH_METHODS.map((item) => ({
              ...item,
            }))}
            required
          />

          {form.fishName === "other" && (
            <div className="sm:col-span-2">
              <CatchInput
                label="Wpisz gatunek"
                value={form.customFishName}
                onChange={(value) =>
                  onFieldChange("customFishName", value)
                }
                placeholder="np. inny gatunek"
                required
              />
            </div>
          )}
        </div>
      </section>

      <SectionDivider />

      <section aria-labelledby="quick-catch-result">
        <SectionHeading
          id="quick-catch-result"
          title="Wynik"
          description="Wystarczy waga, długość albo oba pomiary."
        />

        <div className="grid gap-x-7 gap-y-5 sm:grid-cols-2">
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
      </section>

      <SectionDivider />

      <section aria-labelledby="quick-catch-place">
        <SectionHeading
          id="quick-catch-place"
          title="Miejsce"
          description="Przypisz łowisko lub powiąż połów z wyprawą."
        />

        <div className="grid gap-x-7 gap-y-5 sm:grid-cols-2">
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
                {
                  label: "Bez przypisanej wyprawy",
                  value: "",
                },
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

        {selectedTrip && (
          <div className="mt-5 flex items-start gap-3 rounded-control border border-success-border bg-success-subtle px-4 py-3.5">
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-success"
              aria-hidden="true"
            />

            <div className="min-w-0">
              <p className="text-sm font-bold text-success-foreground">
                {selectedTrip.id === autoTripId
                  ? "Przypisano trwającą wyprawę"
                  : "Połów przypisany do wyprawy"}
              </p>

              <p className="mt-1 text-xs leading-5 text-text-secondary">
                {selectedTrip.title}
                {selectedTrip.lakeId
                  ? " · łowisko i metoda mogą zostać uzupełnione z wyprawy"
                  : " · metoda może zostać uzupełniona z wyprawy"}
              </p>
            </div>
          </div>
        )}
      </section>

      <SectionDivider />

      <section aria-labelledby="quick-catch-photo">
        <SectionHeading
          id="quick-catch-photo"
          title="Zdjęcie"
          description="Opcjonalne w szybkim zapisie."
        />

        <CatchPhotoField
          selectedImage={selectedImage}
          onImageChange={onImageChange}
          compact
          showLabel={false}
        />
      </section>

      <div className="flex flex-col gap-4 rounded-control bg-surface-muted px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-text-secondary">
          Szybki zapis tworzy prywatny wpis. Przynętę, notatkę, dokładną datę
          i ranking możesz uzupełnić w pełnym formularzu.
        </p>

        <button
          type="button"
          onClick={onSwitchToFull}
          disabled={isLoading}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-control px-3 py-2 text-sm font-bold text-primary transition hover:bg-primary-50 hover:text-primary-hover disabled:opacity-50 sm:self-auto"
        >
          <FormIcon className="h-4 w-4" />
          Pełny formularz
        </button>
      </div>
    </div>
  );
}

function SectionHeading({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <h3
        id={id}
        className="font-display text-base font-bold text-text sm:text-[17px]"
      >
        {title}
      </h3>

      <p className="mt-1.5 text-xs leading-5 text-text-secondary sm:text-sm">
        {description}
      </p>
    </div>
  );
}

function SectionDivider() {
  return <div className="border-t border-border" aria-hidden="true" />;
}
