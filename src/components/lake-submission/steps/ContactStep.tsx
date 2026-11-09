"use client";

import {
  SubmissionGroup,
  SubmissionInput,
} from "@/components/lake-submission/SubmissionFields";
import type {
  FishRecordFormItem,
  GearRequirementFormItem,
  LakeSubmissionFieldUpdater,
  LakeSubmissionFormErrors,
  LakeSubmissionFormState,
} from "@/lib/lake-submission/lake-submission-types";

export function ContactStep({
  form,
  errors,
  updateField,
  imageCount,
  fishRecords,
  gearRequirements,
}: {
  form: LakeSubmissionFormState;
  errors: LakeSubmissionFormErrors;
  updateField:
    LakeSubmissionFieldUpdater;
  imageCount: number;
  fishRecords:
    FishRecordFormItem[];
  gearRequirements:
    GearRequirementFormItem[];
}) {
  const amenitiesCount =
    [
      form.cottages,
      form.campfire,
      form.noKill,
      form.tent,
      form.parking,
      form.pier,
      form.toilet,
      form.sanitaryFacilities,
      form.shop,
      form.nightFishing,
      form.boatRental,
      form.camperCaravan,
      form.electricityHookup,
      form.gearRental,
      form.shelter,
      form.coveredSpots,
      form.playground,
      form.cardPayment,
    ].filter(Boolean).length;

  return (
    <div className="grid gap-7">
      <SubmissionGroup
        eyebrow="Opcjonalne"
        title="Kontakt do łowiska"
        description="Jeżeli znasz dane właściciela lub zarządcy, dodaj je. Ułatwi to weryfikację i późniejszy kontakt użytkowników z łowiskiem."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SubmissionInput
            label="Nazwa kontaktowa"
            value={
              form.contactName
            }
            onChange={(event) =>
              updateField(
                "contactName",
                event.target.value
              )
            }
            placeholder="np. Łowisko Karp Max"
            maxLength={160}
          />

          <SubmissionInput
            label="Telefon"
            value={
              form.contactPhone
            }
            onChange={(event) =>
              updateField(
                "contactPhone",
                event.target.value
              )
            }
            placeholder="+48 000 000 000"
            autoComplete="tel"
            maxLength={80}
          />

          <SubmissionInput
            label="E-mail"
            type="email"
            value={
              form.contactEmail
            }
            onChange={(event) =>
              updateField(
                "contactEmail",
                event.target.value
              )
            }
            placeholder="kontakt@example.pl"
            autoComplete="email"
            error={
              errors.contactEmail
            }
            maxLength={254}
          />

          <SubmissionInput
            label="Strona internetowa"
            type="url"
            value={
              form.contactWebsite
            }
            onChange={(event) =>
              updateField(
                "contactWebsite",
                event.target.value
              )
            }
            placeholder="https://example.pl"
            error={
              errors.contactWebsite
            }
          />
        </div>
      </SubmissionGroup>

      <SubmissionGroup
        eyebrow="Podsumowanie"
        title="Przed wysłaniem"
        description="Sprawdź najważniejsze elementy zgłoszenia. Po wysłaniu dane trafią do weryfikacji administratora."
      >
        <div className="grid gap-px overflow-hidden rounded-control border border-border bg-border sm:grid-cols-2">
          <SummaryItem
            label="Podstawowe dane"
            value={form.name || "Uzupełnione"}
            complete
          />

          <SummaryItem
            label="Lokalizacja"
            value={
              form.city
                ? `${form.city}, ${form.voivodeship}`
                : "Uzupełniona"
            }
            complete
          />

          <SummaryItem
            label="Zdjęcia"
            value={
              imageCount > 0
                ? `${imageCount} dodanych`
                : "Opcjonalne"
            }
            complete={
              imageCount > 0
            }
          />

          <SummaryItem
            label="Udogodnienia"
            value={`${amenitiesCount} wybranych`}
            complete={
              amenitiesCount > 0
            }
          />

          <SummaryItem
            label="Rekordowe ryby"
            value={`${fishRecords.length} dodanych`}
            complete={
              fishRecords.length > 0
            }
          />

          <SummaryItem
            label="Wymagania sprzętowe"
            value={`${gearRequirements.length} dodanych`}
            complete={
              gearRequirements.length > 0
            }
          />
        </div>

        <div className="mt-4 rounded-control border border-primary-200 bg-primary-50 px-4 py-3">
          <p className="text-sm font-extrabold text-primary-800">
            Zgłoszenie nie zostanie opublikowane automatycznie.
          </p>

          <p className="mt-1 text-xs leading-5 text-primary-700">
            Administrator sprawdzi dane przed dodaniem łowiska do publicznej bazy Rybio.
          </p>
        </div>
      </SubmissionGroup>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  complete,
}: {
  label: string;
  value: string;
  complete: boolean;
}) {
  return (
    <div className="bg-surface px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={
            complete
              ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-subtle text-[10px] font-black text-success-foreground"
              : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-strong text-[10px] font-black text-text-muted"
          }
        >
          {complete
            ? "✓"
            : "○"}
        </span>

        <div className="min-w-0">
          <p className="text-xs font-extrabold text-text-secondary">
            {label}
          </p>

          <p className="mt-1 truncate text-xs text-text-muted">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
