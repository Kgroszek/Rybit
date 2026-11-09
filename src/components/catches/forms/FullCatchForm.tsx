"use client";

import { CATCH_METHODS, FISH_SPECIES_OPTIONS } from "@/components/catches/constants";
import {
  CatchFormSection,
  CatchFormStack,
} from "@/components/catches/forms/CatchFormSection";
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
    <CatchFormStack>
      <CatchFormSection
        number="01"
        title="Podstawowe"
        description="Najważniejsze informacje o połowie."
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
      </CatchFormSection>

      <CatchFormSection
        number="02"
        title="Wynik"
        description="Pomiary ryby i użyta przynęta."
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

          <div className="sm:col-span-2">
            <CatchInput
              label="Przynęta"
              value={form.bait}
              onChange={(value) => onFieldChange("bait", value)}
              placeholder="np. guma 10 cm / kulka 20 mm"
            />
          </div>
        </div>
      </CatchFormSection>

      <CatchFormSection
        number="03"
        title="Miejsce"
        description="Powiąż połów z łowiskiem lub wyprawą."
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
        </div>
      </CatchFormSection>

      <CatchFormSection
        number="04"
        title="Zdjęcie i widoczność"
        description="Dodaj fotografię i zdecyduj, gdzie połów będzie widoczny."
      >
        <CatchPhotoField
          selectedImage={selectedImage}
          existingImageUrl={editingCatch?.imageUrl}
          onImageChange={onImageChange}
          compact
          showLabel={false}
        />

        <div
          className="border-t border-border"
          style={{
            marginTop: "24px",
            paddingTop: "24px",
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <FieldLabel>Widoczność połowu</FieldLabel>
          </div>

          <CatchVisibilityField
            isPublic={form.isPublic}
            hasLake={Boolean(form.lakeId)}
            hasImage={hasImage}
            hasMetric={Boolean(form.weight || form.length)}
            onChange={(isPublic) =>
              onFieldChange("isPublic", isPublic)
            }
          />
        </div>
      </CatchFormSection>

      <CatchFormSection
        number="05"
        title="Notatka"
        description="Prywatne informacje, które zobaczysz tylko Ty."
      >
        <label
          className="grid"
          style={{
            rowGap: "10px",
          }}
        >
          <FieldLabel>Treść notatki</FieldLabel>

          <Textarea
            value={form.note}
            onChange={(event) =>
              onFieldChange("note", event.target.value)
            }
            rows={4}
            placeholder="np. Branie przy trzcinach około 6:20 rano."
            className="min-h-28 px-4 py-3.5 text-[15px]"
          />
        </label>
      </CatchFormSection>
    </CatchFormStack>
  );
}
