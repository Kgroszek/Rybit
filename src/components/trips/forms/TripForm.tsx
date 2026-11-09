"use client";

import type {
  LakeOption,
  TripFormState,
} from "@/components/trips/types";
import { TRIP_TYPES } from "@/components/trips/constants";
import {
  TripInput,
  TripSelect,
  TripFieldLabel,
} from "@/components/trips/forms/TripFormField";
import {
  TripFormSection,
  TripFormStack,
} from "@/components/trips/forms/TripFormSection";
import { TripLakeSelect } from "@/components/trips/forms/TripLakeSelect";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";

export function TripForm({
  form,
  lakes,
  onFieldChange,
}: {
  form: TripFormState;
  lakes: LakeOption[];
  onFieldChange: <K extends keyof TripFormState>(
    field: K,
    value: TripFormState[K]
  ) => void;
}) {
  return (
    <TripFormStack>
      <TripFormSection
        number="01"
        title="Podstawowe"
        description="Nazwij wyprawę i wybierz sposób łowienia."
      >
        <div
          className="grid sm:grid-cols-2"
          style={{
            columnGap: "24px",
            rowGap: "24px",
          }}
        >
          <TripInput
            label="Nazwa wyprawy"
            value={form.title}
            onChange={(value) =>
              onFieldChange("title", value)
            }
            placeholder="np. Weekendowa karpiówka"
            required
          />

          <TripSelect
            label="Typ wyprawy"
            value={form.tripType}
            onChange={(value) =>
              onFieldChange("tripType", value)
            }
            required
          >
            {TRIP_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </TripSelect>
        </div>
      </TripFormSection>

      <TripFormSection
        number="02"
        title="Miejsce i termin"
        description="Wybierz łowisko oraz czas rozpoczęcia i zakończenia."
      >
        <div
          className="grid sm:grid-cols-2"
          style={{
            columnGap: "24px",
            rowGap: "24px",
          }}
        >
          <div className="sm:col-span-2">
            <TripLakeSelect
              lakes={lakes}
              value={form.lakeId}
              onChange={(value) =>
                onFieldChange("lakeId", value)
              }
            />
          </div>

          <TripInput
            label="Rozpoczęcie"
            value={form.startsAt}
            onChange={(value) =>
              onFieldChange("startsAt", value)
            }
            type="datetime-local"
            required
          />

          <TripInput
            label="Zakończenie"
            value={form.endsAt}
            onChange={(value) =>
              onFieldChange("endsAt", value)
            }
            type="datetime-local"
          />

          <TripInput
            label="Planowana liczba osób"
            value={form.peopleCount}
            onChange={(value) =>
              onFieldChange("peopleCount", value)
            }
            type="number"
            min="1"
            max="100"
            required
          />
        </div>
      </TripFormSection>

      <TripFormSection
        number="03"
        title="Przygotowanie"
        description="Zdecyduj, czy od razu utworzyć checklistę dla tej wyprawy."
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={form.createChecklist}
          onClick={() =>
            onFieldChange(
              "createChecklist",
              !form.createChecklist
            )
          }
          className={cn(
            "flex w-full items-start rounded-card border px-5 py-4 text-left transition-[background-color,border-color,box-shadow]",
            form.createChecklist
              ? "border-primary-300 bg-primary-50 shadow-[0_1px_2px_rgba(13,30,51,0.04)]"
              : "border-border bg-surface hover:border-primary-200 hover:bg-primary-50/30"
          )}
        >
          <span
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2",
              form.createChecklist
                ? "border-primary bg-primary"
                : "border-border-strong bg-surface"
            )}
            aria-hidden="true"
          >
            {form.createChecklist && (
              <span className="text-[12px] font-black leading-none text-white">
                ✓
              </span>
            )}
          </span>

          <span className="ml-4 min-w-0">
            <span className="block text-sm font-bold text-text">
              Utwórz checklistę przygotowań
            </span>

            <span className="mt-1.5 block max-w-xl text-xs leading-5 text-text-secondary">
              Po zapisaniu wyprawy od razu przejdziesz do przygotowania
              rzeczy i sprzętu potrzebnego na wyjazd.
            </span>
          </span>
        </button>
      </TripFormSection>

      <TripFormSection
        number="04"
        title="Notatka"
        description="Opcjonalne informacje organizacyjne dotyczące wyprawy."
      >
        <label
          className="grid"
          style={{ rowGap: "10px" }}
        >
          <TripFieldLabel>Notatka</TripFieldLabel>

          <Textarea
            value={form.note}
            onChange={(event) =>
              onFieldChange("note", event.target.value)
            }
            rows={4}
            maxLength={2000}
            placeholder="np. Rezerwacja stanowiska 7, wyjazd o 5:30..."
            className="min-h-28 text-[15px]"
          />
        </label>
      </TripFormSection>
    </TripFormStack>
  );
}
