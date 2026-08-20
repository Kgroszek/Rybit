"use client";

import type { ReactNode } from "react";

import { CATCH_METHODS, FISH_SPECIES_OPTIONS } from "@/components/catches/constants";
import { CatchPhotoField } from "@/components/catches/forms/CatchPhotoField";
import { CatchVisibilityField } from "@/components/catches/forms/CatchVisibilityField";
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
import { Textarea } from "@/components/ui/Textarea";

type FullCatchFormProps = {
  form: CatchFormState;
  editingCatch: FishingCatch | null;
  selectedImage: File | null;
  lakes: LakeOption[];
  trips: TripOption[];
  onFieldChange: CatchFieldChange;
  onImageChange: (file: File | null) => void;
};

export function FullCatchForm({
  form,
  editingCatch,
  selectedImage,
  lakes,
  trips,
  onFieldChange,
  onImageChange,
}: FullCatchFormProps) {
  const hasImage = Boolean(
    selectedImage ||
      editingCatch?.imageUrl ||
      editingCatch?.imagePath
  );

  return (
    <div>
      <FormSection
        title="Podstawowe"
        description="Co złowiłeś i kiedy."
      >
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
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

          <div className="sm:col-span-2">
            <CatchInput
              label="Data i godzina"
              value={form.caughtAt}
              onChange={(value) => onFieldChange("caughtAt", value)}
              type="datetime-local"
              required
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Wynik"
        description="Pomiary ryby i użyta przynęta."
      >
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
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
      </FormSection>

      <FormSection
        title="Miejsce"
        description="Połącz połów z łowiskiem lub wyprawą."
      >
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <LakeSearchSelect
            lakes={lakes}
            value={form.lakeId}
            onChange={(value) => onFieldChange("lakeId", value)}
          />

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
        </div>
      </FormSection>

      <FormSection
        title="Zdjęcie"
        description="Fotografia ryby będzie częścią wpisu i karty połowu."
      >
        <CatchPhotoField
          selectedImage={selectedImage}
          existingImageUrl={editingCatch?.imageUrl}
          onImageChange={onImageChange}
          compact
          showLabel={false}
        />
      </FormSection>

      <FormSection
        title="Widoczność"
        description="Zdecyduj, czy połów pozostaje prywatny, czy trafia do rankingu."
      >
        <CatchVisibilityField
          isPublic={form.isPublic}
          hasLake={Boolean(form.lakeId)}
          hasImage={hasImage}
          hasMetric={Boolean(form.weight || form.length)}
          onChange={(isPublic) =>
            onFieldChange("isPublic", isPublic)
          }
        />
      </FormSection>

      <FormSection
        title="Notatka"
        description="Prywatne informacje tylko dla Ciebie."
        isLast
      >
        <label className="block">
          <FieldLabel>
            Treść notatki
          </FieldLabel>

          <Textarea
            value={form.note}
            onChange={(event) =>
              onFieldChange("note", event.target.value)
            }
            rows={4}
            placeholder="np. Branie przy trzcinach około 6:20 rano."
            className="min-h-28"
          />
        </label>
      </FormSection>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
  isLast = false,
}: {
  title: string;
  description: string;
  children: ReactNode;
  isLast?: boolean;
}) {
  return (
    <section
      className={
        isLast
          ? "py-8 first:pt-0"
          : "border-b border-border py-8 first:pt-0"
      }
    >
      <div className="grid gap-5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-8">
        <div>
          <h3 className="font-display text-base font-bold text-text sm:text-[17px]">
            {title}
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-text-secondary sm:text-sm">
            {description}
          </p>
        </div>

        <div className="min-w-0">
          {children}
        </div>
      </div>
    </section>
  );
}
