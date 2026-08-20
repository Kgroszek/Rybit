"use client";

import { CATCH_METHODS, FISH_SPECIES_OPTIONS } from "@/components/catches/constants";
import {
  CatchFormSection,
  CatchFormStack,
} from "@/components/catches/forms/CatchFormSection";
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

type QuickCatchFormProps = {
  form: CatchFormState;
  selectedImage: File | null;
  lakes: LakeOption[];
  trips: TripOption[];
  autoTripId: string | null;
  onFieldChange: CatchFieldChange;
  onImageChange: (file: File | null) => void;
};

export function QuickCatchForm({
  form,
  selectedImage,
  lakes,
  trips,
  autoTripId,
  onFieldChange,
  onImageChange,
}: QuickCatchFormProps) {
  const selectedTrip =
    trips.find((trip) => trip.id === form.tripId) ?? null;

  return (
    <CatchFormStack>
      <CatchFormSection
        number="01"
        title="Dane połowu"
        description="Wybierz gatunek i metodę."
      >
        <div
          className="grid sm:grid-cols-2"
          style={{
            columnGap: "24px",
            rowGap: "24px",
          }}
        >
          <CatchSelect
            label="Gatunek ryby"
            value={form.fishName}
            onChange={(value) => onFieldChange("fishName", value)}
            options={[
              { label: "Wybierz gatunek", value: "" },
              ...FISH_SPECIES_OPTIONS.map((value) => ({
                label: value,
                value,
              })),
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
                onChange={(value) =>
                  onFieldChange("customFishName", value)
                }
                placeholder="np. inny gatunek"
                required
              />
            </div>
          )}
        </div>
      </CatchFormSection>

      <CatchFormSection
        number="02"
        title="Wynik"
        description="Podaj wagę, długość lub oba pomiary."
      >
        <div
          className="grid sm:grid-cols-2"
          style={{
            columnGap: "24px",
            rowGap: "24px",
          }}
        >
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
      </CatchFormSection>

      <CatchFormSection
        number="03"
        title="Miejsce"
        description="Przypisz łowisko lub wyprawę."
      >
        <div
          className="grid sm:grid-cols-2"
          style={{
            columnGap: "24px",
            rowGap: "24px",
          }}
        >
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
                  label: `${trip.title} — ${formatShortDate(
                    trip.startsAt
                  )}`,
                  value: trip.id,
                })),
              ]}
            />
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>

        {selectedTrip && (
          <div
            className="flex items-start rounded-control border border-success-border bg-success-subtle px-4 py-4"
            style={{ marginTop: "20px" }}
          >
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-success"
              aria-hidden="true"
            />

            <div className="min-w-0" style={{ marginLeft: "12px" }}>
              <p className="text-sm font-bold text-success-foreground">
                {selectedTrip.id === autoTripId
                  ? "Przypisano trwającą wyprawę"
                  : "Połów przypisany do wyprawy"}
              </p>

              <p className="mt-1 text-xs leading-5 text-text-secondary">
                {selectedTrip.title}
              </p>
            </div>
          </div>
        )}
      </CatchFormSection>

      <CatchFormSection
        number="04"
        title="Zdjęcie"
        description="Opcjonalne w szybkim zapisie."
      >
        <CatchPhotoField
          selectedImage={selectedImage}
          onImageChange={onImageChange}
          compact
          showLabel={false}
        />
      </CatchFormSection>
    </CatchFormStack>
  );
}
