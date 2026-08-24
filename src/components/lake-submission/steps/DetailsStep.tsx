"use client";

import {
  AddCircleIcon,
} from "@/components/icons/AddCircleIcon";
import {
  TrashIcon,
} from "@/components/icons/TrashIcon";
import {
  SubmissionChoice,
  SubmissionGroup,
  SubmissionInput,
  SubmissionSelect,
  SubmissionTextarea,
} from "@/components/lake-submission/SubmissionFields";
import {
  Button,
} from "@/components/ui/Button";
import {
  FISH_RECORD_OPTIONS,
} from "@/lib/lake-submission/lake-submission-options";
import type {
  FishRecordFormItem,
  GearRequirementFormItem,
  LakeSubmissionFieldUpdater,
  LakeSubmissionFormErrors,
  LakeSubmissionFormState,
} from "@/lib/lake-submission/lake-submission-types";

const MAX_RECORDS = 30;
const MAX_REQUIREMENTS = 30;

export function DetailsStep({
  form,
  errors,
  updateField,
  fishRecords,
  gearRequirements,
  onAddFishRecord,
  onUpdateFishRecord,
  onRemoveFishRecord,
  onAddGearRequirement,
  onUpdateGearRequirement,
  onRemoveGearRequirement,
}: {
  form: LakeSubmissionFormState;
  errors: LakeSubmissionFormErrors;
  updateField:
    LakeSubmissionFieldUpdater;
  fishRecords:
    FishRecordFormItem[];
  gearRequirements:
    GearRequirementFormItem[];
  onAddFishRecord: () => void;
  onUpdateFishRecord: (
    id: string,
    field:
      | "fishName"
      | "weightKg",
    value: string
  ) => void;
  onRemoveFishRecord: (
    id: string
  ) => void;
  onAddGearRequirement: () => void;
  onUpdateGearRequirement: (
    id: string,
    value: string
  ) => void;
  onRemoveGearRequirement: (
    id: string
  ) => void;
}) {
  return (
    <div className="grid gap-7">
      <SubmissionGroup
        eyebrow="Charakterystyka"
        title="Parametry łowiska"
        description="Pola opcjonalne, które pomagają wędkarzowi lepiej ocenić charakter akwenu."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SubmissionInput
            label="Powierzchnia"
            value={form.area}
            onChange={(event) =>
              updateField(
                "area",
                event.target.value
              )
            }
            placeholder="np. 7 ha"
          />

          <SubmissionInput
            label="Średnia głębokość"
            value={
              form.averageDepth
            }
            onChange={(event) =>
              updateField(
                "averageDepth",
                event.target.value
              )
            }
            placeholder="np. 2,8 m"
          />

          <SubmissionInput
            label="Rodzaj dna"
            value={
              form.bottomType
            }
            onChange={(event) =>
              updateField(
                "bottomType",
                event.target.value
              )
            }
            placeholder="np. muliste"
          />

          <SubmissionInput
            label="Typ wody"
            value={form.waterType}
            onChange={(event) =>
              updateField(
                "waterType",
                event.target.value
              )
            }
            placeholder="np. staw, jezioro, rzeka"
          />
        </div>
      </SubmissionGroup>

      <SubmissionGroup
        eyebrow="Dostępność"
        title="Godziny otwarcia"
        description="Jeżeli łowisko działa całodobowo, nie musisz wpisywać osobnego harmonogramu."
      >
        <div className="grid gap-4">
          <SubmissionChoice
            label="Otwarte całodobowo"
            description="Łowisko jest dostępne przez całą dobę."
            checked={
              form.isOpenAllDay
            }
            onChange={(checked) =>
              updateField(
                "isOpenAllDay",
                checked
              )
            }
          />

          {!form.isOpenAllDay && (
            <SubmissionTextarea
              label="Godziny otwarcia"
              value={
                form.openingHours
              }
              onChange={(event) =>
                updateField(
                  "openingHours",
                  event.target.value
                )
              }
              placeholder="np. Poniedziałek–piątek: 7:00–20:00, sobota–niedziela: 6:00–22:00"
              rows={4}
            />
          )}
        </div>
      </SubmissionGroup>

      <SubmissionGroup
        eyebrow="Rekordy"
        title="Rekordowe ryby"
        description="Opcjonalnie dodaj największe znane ryby złowione na tym łowisku."
      >
        <div className="grid gap-3">
          {fishRecords.map(
            (record) => (
              <div
                key={record.id}
                className="grid gap-3 rounded-control border border-border bg-surface-muted p-4 lg:grid-cols-[minmax(0,1fr)_180px_auto]"
              >
                <SubmissionSelect
                  label="Gatunek ryby"
                  value={
                    record.fishName
                  }
                  onChange={(event) =>
                    onUpdateFishRecord(
                      record.id,
                      "fishName",
                      event.target.value
                    )
                  }
                >
                  <option
                    value=""
                    disabled
                  >
                    Wybierz rybę
                  </option>

                  {FISH_RECORD_OPTIONS.map(
                    (
                      fishName
                    ) => (
                      <option
                        key={
                          fishName
                        }
                        value={
                          fishName
                        }
                      >
                        {
                          fishName
                        }
                      </option>
                    )
                  )}
                </SubmissionSelect>

                <SubmissionInput
                  label="Waga w kg"
                  value={
                    record.weightKg
                  }
                  inputMode="decimal"
                  onChange={(event) =>
                    onUpdateFishRecord(
                      record.id,
                      "weightKg",
                      event.target.value
                    )
                  }
                  placeholder="np. 18,5"
                />

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-danger-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                    onClick={() =>
                      onRemoveFishRecord(
                        record.id
                      )
                    }
                  >
                    <TrashIcon className="h-4 w-4" />
                    Usuń
                  </Button>
                </div>
              </div>
            )
          )}

          {fishRecords.length ===
            0 && (
            <EmptyOptionalList
              text="Nie dodano jeszcze rekordowych ryb."
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-text-muted">
              {
                fishRecords.length
              }
              /{MAX_RECORDS}
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                fishRecords.length >=
                MAX_RECORDS
              }
              onClick={
                onAddFishRecord
              }
            >
              <AddCircleIcon className="h-4 w-4" />
              Dodaj rekordową rybę
            </Button>
          </div>
        </div>
      </SubmissionGroup>

      <SubmissionGroup
        eyebrow="Sprzęt"
        title="Wymagania sprzętowe"
        description="Dodaj tylko wymagania faktycznie obowiązujące na łowisku, np. mata karpiowa lub środek do dezynfekcji."
      >
        <div className="grid gap-3">
          {gearRequirements.map(
            (requirement) => (
              <div
                key={
                  requirement.id
                }
                className="grid gap-3 rounded-control border border-border bg-surface-muted p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
              >
                <SubmissionInput
                  label="Wymaganie"
                  value={
                    requirement.text
                  }
                  onChange={(event) =>
                    onUpdateGearRequirement(
                      requirement.id,
                      event.target.value
                    )
                  }
                  placeholder="np. Obowiązkowa mata karpiowa"
                  maxLength={240}
                />

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-danger-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                    onClick={() =>
                      onRemoveGearRequirement(
                        requirement.id
                      )
                    }
                  >
                    <TrashIcon className="h-4 w-4" />
                    Usuń
                  </Button>
                </div>
              </div>
            )
          )}

          {gearRequirements.length ===
            0 && (
            <EmptyOptionalList
              text="Nie dodano wymagań sprzętowych."
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-text-muted">
              {
                gearRequirements.length
              }
              /{MAX_REQUIREMENTS}
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                gearRequirements.length >=
                MAX_REQUIREMENTS
              }
              onClick={
                onAddGearRequirement
              }
            >
              <AddCircleIcon className="h-4 w-4" />
              Dodaj wymaganie
            </Button>
          </div>
        </div>
      </SubmissionGroup>

      <SubmissionGroup
        eyebrow="Zasady i ceny"
        title="Cennik i regulamin"
        description="Możesz wkleić treść bezpośrednio albo podać link do aktualnej wersji na stronie łowiska."
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="grid gap-4">
            <SubmissionTextarea
              label="Cennik"
              value={
                form.priceListText
              }
              onChange={(event) =>
                updateField(
                  "priceListText",
                  event.target.value
                )
              }
              placeholder="np. Wędkowanie dzienne: 40 zł, nocka: 80 zł..."
              rows={6}
            />

            <SubmissionInput
              label="Link do cennika"
              type="url"
              value={
                form.priceListUrl
              }
              onChange={(event) =>
                updateField(
                  "priceListUrl",
                  event.target.value
                )
              }
              placeholder="https://example.pl/cennik"
              error={
                errors.priceListUrl
              }
            />
          </div>

          <div className="grid gap-4">
            <SubmissionTextarea
              label="Regulamin"
              value={form.rulesText}
              onChange={(event) =>
                updateField(
                  "rulesText",
                  event.target.value
                )
              }
              placeholder="np. Mata obowiązkowa, zakaz używania plecionki..."
              rows={6}
            />

            <SubmissionInput
              label="Link do regulaminu"
              type="url"
              value={
                form.rulesUrl
              }
              onChange={(event) =>
                updateField(
                  "rulesUrl",
                  event.target.value
                )
              }
              placeholder="https://example.pl/regulamin"
              error={
                errors.rulesUrl
              }
            />
          </div>
        </div>
      </SubmissionGroup>
    </div>
  );
}

function EmptyOptionalList({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-control border border-dashed border-border-strong bg-surface-muted px-4 py-4 text-sm text-text-muted">
      {text}
    </div>
  );
}
