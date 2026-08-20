"use client";

import type { FormEvent, ReactNode } from "react";

import { CATCH_METHODS, FISH_SPECIES_OPTIONS } from "@/components/catches/constants";
import { CatchPhotoField } from "@/components/catches/forms/CatchPhotoField";
import {
  CatchInput,
  CatchSelect,
  FieldLabel,
} from "@/components/catches/forms/FormField";
import { LakeSearchSelect } from "@/components/catches/forms/LakeSearchSelect";
import type {
  CatchFieldChange,
  CatchFormState,
  FishingCatch,
  LakeOption,
  TripOption,
} from "@/components/catches/types";
import { formatShortDate } from "@/components/catches/utils";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

export function FullCatchForm({
  form,
  editingCatch,
  selectedImage,
  lakes,
  trips,
  isLoading,
  onSubmit,
  onCancel,
  onFieldChange,
  onImageChange,
}: {
  form: CatchFormState;
  editingCatch: FishingCatch | null;
  selectedImage: File | null;
  lakes: LakeOption[];
  trips: TripOption[];
  isLoading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onFieldChange: CatchFieldChange;
  onImageChange: (file: File | null) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <FormPanel
          title="Podstawowe"
          description="Gatunek, metoda i data połowu."
        >
          <div className="grid gap-4">
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

            {form.fishName === "other" && (
              <CatchInput
                label="Wpisz gatunek"
                value={form.customFishName}
                onChange={(value) => onFieldChange("customFishName", value)}
                placeholder="np. inny gatunek"
                required
              />
            )}

            <CatchSelect
              label="Metoda"
              value={form.method}
              onChange={(value) => onFieldChange("method", value)}
              options={CATCH_METHODS.map((item) => ({ ...item }))}
              required
            />

            <CatchInput
              label="Data i godzina"
              value={form.caughtAt}
              onChange={(value) => onFieldChange("caughtAt", value)}
              type="datetime-local"
              required
            />
          </div>
        </FormPanel>

        <FormPanel
          title="Wynik"
          description="Parametry ryby i użyta przynęta."
        >
          <div className="grid gap-y-4 gap-x-5 sm:grid-cols-2">
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
            <div className="sm:col-span-2">
              <CatchInput
                label="Przynęta"
                value={form.bait}
                onChange={(value) => onFieldChange("bait", value)}
                placeholder="np. guma 10 cm / kulka 20 mm"
              />
            </div>
          </div>
        </FormPanel>
      </div>

      <FormPanel
        title="Miejsce"
        description="Połącz połów z łowiskiem lub zaplanowaną wyprawą."
      >
        <div className="grid gap-y-4 gap-x-6 sm:grid-cols-2">
          <LakeSearchSelect
            lakes={lakes}
            value={form.lakeId}
            onChange={(value) => onFieldChange("lakeId", value)}
          />

          <CatchSelect
            label="Wyprawa"
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
        </div>
      </FormPanel>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <FormPanel
          title="Ranking"
          description="Zdecyduj, czy połów ma być publiczny."
        >
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-control border p-3.5 transition ${
              form.isPublic
                ? "border-success-border bg-success-subtle"
                : "border-border bg-surface hover:border-primary-200"
            }`}
          >
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(event) =>
                onFieldChange("isPublic", event.target.checked)
              }
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-strong accent-[var(--rybio-success)]"
            />

            <span className="min-w-0">
              <span
                className={`block text-sm font-bold ${
                  form.isPublic ? "text-success-foreground" : "text-text"
                }`}
              >
                Pokaż w rankingu łowiska
              </span>
              <span className="mt-1 block text-xs leading-5 text-text-secondary">
                Wymagane: łowisko, zdjęcie oraz waga lub długość. Wpis trafi do weryfikacji.
              </span>
            </span>
          </label>
        </FormPanel>

        <FormPanel
          title="Zdjęcie"
          description="Dodaj fotografię ryby do wpisu."
        >
          <CatchPhotoField
            selectedImage={selectedImage}
            existingImageUrl={editingCatch?.imageUrl}
            onImageChange={onImageChange}
            compact
          />
        </FormPanel>
      </div>

      <FormPanel
        title="Notatka"
        description="Prywatna informacja — nie jest pokazywana publicznie."
      >
        <label className="block">
          <FieldLabel>Notatka</FieldLabel>
          <Textarea
            value={form.note}
            onChange={(event) => onFieldChange("note", event.target.value)}
            rows={3}
            placeholder="np. Branie przy trzcinach około 6:20 rano."
            className="min-h-20"
          />
        </label>
      </FormPanel>

      <div className="sticky -bottom-5 z-20 -mx-5 flex gap-3 border-t border-border bg-surface/95 px-5 pb-1 pt-4 backdrop-blur sm:-mx-6 sm:px-6">
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
          {editingCatch ? "Zapisz zmiany" : "Dodaj połów"}
        </Button>
      </div>
    </form>
  );
}

function FormPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card border border-border bg-surface-muted/45 p-4">
      <div className="mb-4">
        <h3 className="font-display text-sm font-bold text-text sm:text-base">
          {title}
        </h3>
        <p className="mt-0.5 text-xs leading-5 text-text-secondary">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
