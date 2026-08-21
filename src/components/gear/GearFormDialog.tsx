"use client";

import {
  useState,
  type FormEvent,
} from "react";

import { AlertIcon } from "@/components/icons/AlertIcon";
import {
  GearDefaultField,
  GearFormSection,
  GearFormStack,
  GearInputField,
  GearSelectField,
  GearTextareaField,
} from "@/components/gear/GearFormFields";
import {
  validateGearForm,
} from "@/components/gear/gear-utils";
import type {
  FishingGearDto,
  GearFormState,
} from "@/components/gear/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/ToastProvider";
import {
  GEAR_CATEGORIES,
  GEAR_CONDITIONS,
  GEAR_FISHING_METHODS,
  GEAR_STATUSES,
} from "@/lib/gear/gear-options";

export function GearFormDialog({
  form,
  editingItem,
  onChange,
  onClose,
  onSaved,
}: {
  form: GearFormState;
  editingItem:
    | FishingGearDto
    | null;
  onChange: (
    form: GearFormState
  ) => void;
  onClose: () => void;
  onSaved: (
    gear: FishingGearDto
  ) => void;
}) {
  const toast = useToast();

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const isEditing =
    Boolean(editingItem);

  function patch<
    K extends keyof GearFormState,
  >(
    key: K,
    value: GearFormState[K]
  ) {
    onChange({
      ...form,
      [key]: value,
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const validationError =
      validateGearForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    const endpoint = editingItem
      ? `/api/gear/${encodeURIComponent(
          editingItem.id
        )}`
      : "/api/gear";

    try {
      const response = await fetch(
        endpoint,
        {
          method: editingItem
            ? "PUT"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as
        | FishingGearDto
        | {
            message?: string;
          }
        | null;

      if (!response.ok) {
        const message =
          data &&
          "message" in data
            ? data.message
            : undefined;

        throw new Error(
          message ||
            "Nie udało się zapisać sprzętu."
        );
      }

      const saved =
        data as FishingGearDto;

      toast.success({
        title: isEditing
          ? "Sprzęt został zaktualizowany."
          : "Sprzęt został dodany.",
        description: isEditing
          ? "Zmiany są już widoczne w Twoim ekwipunku."
          : "Nowa pozycja została dodana do katalogu sprzętu.",
      });

      onSaved(saved);
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Nie udało się zapisać sprzętu.";

      setError(message);

      toast.error({
        title:
          "Nie udało się zapisać sprzętu.",
        description: message,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      onClose={onClose}
      eyebrow="Mój ekwipunek"
      title={
        isEditing
          ? "Edytuj sprzęt"
          : "Dodaj sprzęt"
      }
      description={
        isEditing
          ? "Zaktualizuj dane, stan techniczny i sposób wykorzystania tego elementu."
          : "Dodaj element do swojego katalogu. Później możesz wykorzystać go przy przygotowywaniu wypraw."
      }
      headerMeta={
        editingItem?.isDefault ? (
          <Badge variant="aqua">
            Na wyprawę
          </Badge>
        ) : undefined
      }
      busy={saving}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={onClose}
            className="h-12 min-h-12 sm:min-w-28"
          >
            Anuluj
          </Button>

          <Button
            type="submit"
            form="gear-form"
            isLoading={saving}
            loadingLabel="Zapisywanie…"
            className="h-12 min-h-12 sm:min-w-40"
          >
            {isEditing
              ? "Zapisz zmiany"
              : "Dodaj sprzęt"}
          </Button>
        </div>
      }
    >
      {error && (
        <div
          role="alert"
          className="mb-7 flex items-start gap-3 rounded-control border border-danger-border bg-danger-subtle px-4 py-4 text-sm text-danger-foreground"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />

          <div>
            <p className="font-bold">
              Sprawdź dane sprzętu
            </p>

            <p className="mt-1 text-xs leading-5">
              {error}
            </p>
          </div>
        </div>
      )}

      <form
        id="gear-form"
        onSubmit={handleSubmit}
      >
        <GearFormStack>
          <GearFormSection
            number="01"
            title="Podstawowe"
            description="Nazwa, kategoria i liczba sztuk."
          >
            <div
              className="grid min-w-0 sm:grid-cols-[minmax(0,1fr)_180px]"
              style={{
                columnGap: "24px",
                rowGap: "24px",
              }}
            >
              <GearInputField
                label="Nazwa sprzętu"
                value={form.name}
                onChange={(event) =>
                  patch(
                    "name",
                    event.target.value
                  )
                }
                placeholder="np. Shimano Catana 3000"
                maxLength={160}
                required
                data-autofocus
              />

              <GearInputField
                label="Ilość"
                type="number"
                min="1"
                max="9999"
                step="1"
                inputMode="numeric"
                value={form.quantity}
                onChange={(event) =>
                  patch(
                    "quantity",
                    event.target.value
                  )
                }
                required
              />

              <GearSelectField
                label="Kategoria"
                value={form.category}
                onChange={(event) =>
                  patch(
                    "category",
                    event.target.value
                  )
                }
                required
              >
                {GEAR_CATEGORIES.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  )
                )}
              </GearSelectField>
            </div>
          </GearFormSection>

          <GearFormSection
            number="02"
            title="Zastosowanie i stan"
            description="Określ metodę, stan techniczny i aktualny status użytkowania."
          >
            <div
              className="grid min-w-0 md:grid-cols-3"
              style={{
                columnGap: "24px",
                rowGap: "24px",
              }}
            >
              <GearSelectField
                label="Metoda"
                value={
                  form.fishingMethod
                }
                onChange={(event) =>
                  patch(
                    "fishingMethod",
                    event.target.value
                  )
                }
                required
              >
                {GEAR_FISHING_METHODS.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  )
                )}
              </GearSelectField>

              <GearSelectField
                label="Stan techniczny"
                value={form.condition}
                onChange={(event) =>
                  patch(
                    "condition",
                    event.target.value
                  )
                }
                required
              >
                {GEAR_CONDITIONS.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  )
                )}
              </GearSelectField>

              <GearSelectField
                label="Status użytkowania"
                value={form.status}
                onChange={(event) =>
                  patch(
                    "status",
                    event.target.value
                  )
                }
                required
              >
                {GEAR_STATUSES.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  )
                )}
              </GearSelectField>
            </div>
          </GearFormSection>

          <GearFormSection
            number="03"
            title="Producent i zakup"
            description="Opcjonalne dane pomagające identyfikować sprzęt i kontrolować jego wartość."
          >
            <div
              className="grid min-w-0 sm:grid-cols-2"
              style={{
                columnGap: "24px",
                rowGap: "24px",
              }}
            >
              <GearInputField
                label="Marka"
                value={form.brand}
                onChange={(event) =>
                  patch(
                    "brand",
                    event.target.value
                  )
                }
                placeholder="np. Shimano"
                maxLength={120}
              />

              <GearInputField
                label="Model"
                value={form.model}
                onChange={(event) =>
                  patch(
                    "model",
                    event.target.value
                  )
                }
                placeholder="np. Catana 3000"
                maxLength={160}
              />

              <GearInputField
                label="Cena za sztukę"
                type="number"
                min="0"
                max="10000000"
                step="0.01"
                inputMode="decimal"
                value={form.price}
                onChange={(event) =>
                  patch(
                    "price",
                    event.target.value
                  )
                }
                placeholder="np. 249"
              />

              <GearInputField
                label="Data zakupu"
                type="date"
                value={
                  form.purchaseDate
                }
                onChange={(event) =>
                  patch(
                    "purchaseDate",
                    event.target.value
                  )
                }
              />
            </div>
          </GearFormSection>

          <GearFormSection
            number="04"
            title="Notatka i wyprawy"
            description="Dodaj własny kontekst oraz oznacz sprzęt, który zwykle zabierasz ze sobą."
          >
            <div
              className="grid min-w-0"
              style={{
                rowGap: "24px",
              }}
            >
              <GearTextareaField
                label="Notatka"
                value={form.note}
                onChange={(event) =>
                  patch(
                    "note",
                    event.target.value
                  )
                }
                rows={5}
                maxLength={2500}
                placeholder="np. Do lekkiego spinningu, używany z plecionką 0.10."
              />

              <GearDefaultField
                checked={
                  form.isDefault
                }
                onChange={(checked) =>
                  patch(
                    "isDefault",
                    checked
                  )
                }
              />
            </div>
          </GearFormSection>
        </GearFormStack>
      </form>
    </Dialog>
  );
}
