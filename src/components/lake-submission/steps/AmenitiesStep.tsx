"use client";

import {
  SubmissionChoice,
} from "@/components/lake-submission/SubmissionFields";
import {
  AMENITY_OPTIONS,
} from "@/lib/lake-submission/lake-submission-options";
import type {
  LakeSubmissionFieldUpdater,
  LakeSubmissionFormState,
} from "@/lib/lake-submission/lake-submission-types";

export function AmenitiesStep({
  form,
  updateField,
}: {
  form: LakeSubmissionFormState;
  updateField:
    LakeSubmissionFieldUpdater;
}) {
  const selectedCount =
    AMENITY_OPTIONS.filter(
      (item) =>
        Boolean(form[item.key])
    ).length;

  return (
    <div>
      <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-text">
            Dostępne udogodnienia
          </p>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Zaznacz wyłącznie elementy, które faktycznie są dostępne dla wędkarzy.
          </p>
        </div>

        <span className="text-xs font-bold text-text-muted">
          Wybrano{" "}
          {selectedCount}
        </span>
      </div>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {AMENITY_OPTIONS.map(
          (item) => (
            <SubmissionChoice
              key={item.key}
              label={item.label}
              description={
                item.description
              }
              checked={Boolean(
                form[item.key]
              )}
              onChange={(
                checked
              ) =>
                updateField(
                  item.key,
                  checked
                )
              }
            />
          )
        )}
      </div>
    </div>
  );
}
