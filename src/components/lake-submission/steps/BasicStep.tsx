"use client";

import {
  FISHING_METHOD_OPTIONS,
  type FishingMethod,
} from "@/lib/fishing-methods";
import type {
  LakeSubmissionFieldUpdater,
  LakeSubmissionFormErrors,
  LakeSubmissionFormState,
} from "@/lib/lake-submission/lake-submission-types";

import {
  SubmissionChoice,
  SubmissionInput,
  SubmissionSelect,
  SubmissionTextarea,
} from "@/components/lake-submission/SubmissionFields";

export function BasicStep({
  form,
  errors,
  updateField,
}: {
  form: LakeSubmissionFormState;
  errors: LakeSubmissionFormErrors;
  updateField:
    LakeSubmissionFieldUpdater;
}) {
  function toggleMethod(
    method: FishingMethod,
    checked: boolean
  ) {
    updateField(
      "fishingMethods",
      checked
        ? Array.from(
            new Set([
              ...form.fishingMethods,
              method,
            ])
          )
        : form.fishingMethods.filter(
            (item) =>
              item !== method
          )
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        <SubmissionInput
          label="Nazwa łowiska"
          required
          value={form.name}
          onChange={(event) =>
            updateField(
              "name",
              event.target.value
            )
          }
          placeholder="np. Jezioro Ukiel"
          error={errors.name}
          maxLength={160}
        />

        <SubmissionSelect
          label="Rodzaj łowiska"
          value={
            form.ownerType
          }
          onChange={(event) =>
            updateField(
              "ownerType",
              event.target.value
            )
          }
        >
          <option value="pzw">
            PZW
          </option>
          <option value="commercial">
            Komercyjne
          </option>
        </SubmissionSelect>

        <SubmissionSelect
          label="Typ łowiska"
          value={
            form.fishingType
          }
          onChange={(event) =>
            updateField(
              "fishingType",
              event.target.value
            )
          }
          hint="Ogólny charakter łowienia na tym akwenie."
        >
          <option value="general">
            Ogólne
          </option>
          <option value="spinning">
            Spinningowe
          </option>
          <option value="carp">
            Karpiowe
          </option>
        </SubmissionSelect>

        <SubmissionInput
          label="Ryby występujące na łowisku"
          required
          value={form.fish}
          onChange={(event) =>
            updateField(
              "fish",
              event.target.value
            )
          }
          placeholder="np. Karp, Szczupak, Okoń"
          error={errors.fish}
          hint="Wpisz gatunki oddzielone przecinkami."
        />
      </div>

      <div className="border-t border-border pt-6">
        <p className="text-sm font-extrabold text-text">
          Metody łowienia
        </p>

        <p className="mt-1 text-sm leading-6 text-text-secondary">
          Zaznacz wszystkie metody, które są dozwolone lub praktykowane na łowisku.
        </p>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {FISHING_METHOD_OPTIONS.map(
            (method) => (
              <SubmissionChoice
                key={
                  method.value
                }
                label={
                  method.label
                }
                checked={form.fishingMethods.includes(
                  method.value
                )}
                onChange={(
                  checked
                ) =>
                  toggleMethod(
                    method.value,
                    checked
                  )
                }
              />
            )
          )}
        </div>

        <p className="mt-3 text-xs leading-5 text-text-muted">
          Zwykły feeder jest w Rybio traktowany jako metoda gruntowa. Method feeder pozostaje osobną metodą.
        </p>
      </div>

      <div className="border-t border-border pt-6">
        <SubmissionTextarea
          label="Opis łowiska"
          required
          value={
            form.description
          }
          onChange={(event) =>
            updateField(
              "description",
              event.target.value
            )
          }
          rows={6}
          placeholder="Opisz charakter miejsca, dostęp, warunki i najważniejsze informacje dla wędkarza..."
          error={
            errors.description
          }
          maxLength={5000}
        />
      </div>
    </div>
  );
}
