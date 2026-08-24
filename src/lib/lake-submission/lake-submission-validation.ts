import {
  STEP_FIELDS,
} from "@/lib/lake-submission/lake-submission-options";
import type {
  LakeSubmissionFormErrors,
  LakeSubmissionFormState,
  LakeSubmissionStepKey,
} from "@/lib/lake-submission/lake-submission-types";

const REQUIRED_FIELDS: Array<{
  key:
    keyof LakeSubmissionFormState;
  label: string;
  step:
    LakeSubmissionStepKey;
}> = [
  {
    key: "name",
    label: "Nazwa łowiska",
    step: "basic",
  },
  {
    key: "fish",
    label:
      "Ryby występujące na łowisku",
    step: "basic",
  },
  {
    key: "description",
    label: "Opis łowiska",
    step: "basic",
  },
  {
    key: "street",
    label:
      "Ulica / miejsce",
    step: "location",
  },
  {
    key: "city",
    label: "Miejscowość",
    step: "location",
  },
  {
    key: "postalCode",
    label: "Kod pocztowy",
    step: "location",
  },
  {
    key: "voivodeship",
    label: "Województwo",
    step: "location",
  },
  {
    key: "lat",
    label:
      "Szerokość geograficzna",
    step: "location",
  },
  {
    key: "lng",
    label:
      "Długość geograficzna",
    step: "location",
  },
];

export function getLakeSubmissionValidationErrors(
  form:
    LakeSubmissionFormState,
  scope:
    | "all"
    | LakeSubmissionStepKey =
    "all"
) {
  const errors: LakeSubmissionFormErrors =
    {};

  for (
    const field of
    REQUIRED_FIELDS
  ) {
    if (
      scope !== "all" &&
      field.step !== scope
    ) {
      continue;
    }

    const value =
      form[field.key];

    if (
      typeof value ===
        "string" &&
      !value.trim()
    ) {
      errors[field.key] =
        `Pole „${field.label}” jest wymagane.`;
    }
  }

  const shouldValidate = (
    field:
      keyof LakeSubmissionFormState
  ) =>
    scope === "all" ||
    STEP_FIELDS[
      scope
    ].includes(field);

  if (
    shouldValidate("lat") &&
    form.lat.trim()
  ) {
    const latitude =
      parseDecimal(
        form.lat
      );

    if (
      latitude === null
    ) {
      errors.lat =
        "Szerokość geograficzna musi być liczbą.";
    } else if (
      latitude < -90 ||
      latitude > 90
    ) {
      errors.lat =
        "Szerokość geograficzna musi mieścić się w zakresie od -90 do 90.";
    }
  }

  if (
    shouldValidate("lng") &&
    form.lng.trim()
  ) {
    const longitude =
      parseDecimal(
        form.lng
      );

    if (
      longitude === null
    ) {
      errors.lng =
        "Długość geograficzna musi być liczbą.";
    } else if (
      longitude < -180 ||
      longitude > 180
    ) {
      errors.lng =
        "Długość geograficzna musi mieścić się w zakresie od -180 do 180.";
    }
  }

  if (
    shouldValidate(
      "contactEmail"
    ) &&
    form.contactEmail.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      form.contactEmail.trim()
    )
  ) {
    errors.contactEmail =
      "Podaj poprawny adres e-mail.";
  }

  for (const field of [
    "priceListUrl",
    "rulesUrl",
    "contactWebsite",
  ] as const) {
    if (
      !shouldValidate(field)
    ) {
      continue;
    }

    const value =
      form[field].trim();

    if (
      value &&
      !isHttpUrl(value)
    ) {
      errors[field] =
        "Link powinien zaczynać się od http:// lub https://.";
    }
  }

  return errors;
}

export function getFirstInvalidStepIndex(
  errors:
    LakeSubmissionFormErrors,
  steps:
    Array<{
      key:
        LakeSubmissionStepKey;
    }>
) {
  return steps.findIndex(
    (step) =>
      Object.keys(errors).some(
        (field) =>
          STEP_FIELDS[
            step.key
          ].includes(
            field as keyof LakeSubmissionFormState
          )
      )
  );
}

export function mergeStepErrors(
  current:
    LakeSubmissionFormErrors,
  next:
    LakeSubmissionFormErrors,
  step:
    LakeSubmissionStepKey
) {
  const merged = {
    ...current,
  };

  for (
    const field of
    STEP_FIELDS[step]
  ) {
    delete merged[field];
  }

  return {
    ...merged,
    ...next,
  };
}

function parseDecimal(
  value: string
) {
  const parsed = Number(
    value.replace(
      ",",
      "."
    )
  );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : null;
}

function isHttpUrl(
  value: string
) {
  return (
    value.startsWith(
      "http://"
    ) ||
    value.startsWith(
      "https://"
    )
  );
}
