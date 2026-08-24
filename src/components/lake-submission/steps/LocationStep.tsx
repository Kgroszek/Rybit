"use client";

import {
  SubmissionGroup,
  SubmissionInput,
  SubmissionSelect,
} from "@/components/lake-submission/SubmissionFields";
import {
  VOIVODESHIPS,
} from "@/lib/lake-submission/lake-submission-options";
import type {
  LakeSubmissionFieldUpdater,
  LakeSubmissionFormErrors,
  LakeSubmissionFormState,
} from "@/lib/lake-submission/lake-submission-types";

export function LocationStep({
  form,
  errors,
  updateField,
}: {
  form: LakeSubmissionFormState;
  errors: LakeSubmissionFormErrors;
  updateField:
    LakeSubmissionFieldUpdater;
}) {
  return (
    <div className="grid gap-7">
      <SubmissionGroup
        eyebrow="Adres"
        title="Dane adresowe"
        description="Podaj dane w formie, w jakiej użytkownik powinien zobaczyć je na stronie łowiska."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SubmissionInput
            label="Ulica / miejsce"
            required
            value={form.street}
            onChange={(event) =>
              updateField(
                "street",
                event.target.value
              )
            }
            placeholder="np. ul. Jeziorna 12"
            error={
              errors.street
            }
          />

          <SubmissionInput
            label="Miejscowość"
            required
            value={form.city}
            onChange={(event) =>
              updateField(
                "city",
                event.target.value
              )
            }
            placeholder="np. Olsztyn"
            error={errors.city}
          />

          <SubmissionInput
            label="Kod pocztowy"
            required
            value={
              form.postalCode
            }
            onChange={(event) =>
              updateField(
                "postalCode",
                event.target.value
              )
            }
            placeholder="np. 10-900"
            error={
              errors.postalCode
            }
          />

          <SubmissionSelect
            label="Województwo"
            required
            value={
              form.voivodeship
            }
            onChange={(event) =>
              updateField(
                "voivodeship",
                event.target.value
              )
            }
            error={
              errors.voivodeship
            }
          >
            <option
              value=""
              disabled
            >
              Wybierz województwo
            </option>

            {VOIVODESHIPS.map(
              (voivodeship) => (
                <option
                  key={
                    voivodeship
                  }
                  value={
                    voivodeship
                  }
                >
                  {
                    voivodeship
                  }
                </option>
              )
            )}
          </SubmissionSelect>
        </div>
      </SubmissionGroup>

      <SubmissionGroup
        eyebrow="Mapa"
        title="Dokładne położenie"
        description="Współrzędne są potrzebne, aby poprawnie umieścić łowisko na mapie Rybio."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SubmissionInput
            label="Szerokość geograficzna"
            required
            inputMode="decimal"
            value={form.lat}
            onChange={(event) =>
              updateField(
                "lat",
                event.target.value
              )
            }
            placeholder="np. 53.7856"
            error={errors.lat}
            hint="Zakres od -90 do 90."
          />

          <SubmissionInput
            label="Długość geograficzna"
            required
            inputMode="decimal"
            value={form.lng}
            onChange={(event) =>
              updateField(
                "lng",
                event.target.value
              )
            }
            placeholder="np. 20.4031"
            error={errors.lng}
            hint="Zakres od -180 do 180."
          />
        </div>

        <div className="mt-4 rounded-control border border-primary-200 bg-primary-50 px-4 py-3 text-xs leading-5 text-primary-800">
          Współrzędne możesz skopiować np. z zaznaczonego punktu w mapach. Użyj kropki lub przecinka jako separatora dziesiętnego.
        </div>
      </SubmissionGroup>
    </div>
  );
}
