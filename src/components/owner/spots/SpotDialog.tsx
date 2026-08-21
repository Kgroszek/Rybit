"use client";

import {
  useState,
  type FormEvent,
} from "react";

import { AlertIcon } from "@/components/icons/AlertIcon";
import { OwnerDialog } from "@/components/owner/shared/OwnerDialog";
import {
  OwnerCheckboxField,
  OwnerInputField,
  OwnerTextareaField,
} from "@/components/owner/shared/OwnerFormField";
import {
  validateSpotForm,
} from "@/components/owner/spots/spot-utils";
import type {
  SpotFormState,
} from "@/components/owner/spots/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

export function SpotDialog({
  lakeSlug,
  lakeName,
  form,
  onChange,
  onClose,
  onSaved,
}: {
  lakeSlug: string;
  lakeName: string;
  form: SpotFormState;
  onChange: (form: SpotFormState) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [isSaving, setIsSaving] =
    useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(form.id);

  function patch<K extends keyof SpotFormState>(
    key: K,
    value: SpotFormState[K]
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
      validateSpotForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const endpoint = form.id
        ? `/api/owner/lakes/${encodeURIComponent(
            lakeSlug
          )}/spots/${encodeURIComponent(
            form.id
          )}`
        : `/api/owner/lakes/${encodeURIComponent(
            lakeSlug
          )}/spots`;

      const response = await fetch(endpoint, {
        method: form.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description:
            form.description.trim() || null,
          maxPeople: Number(form.maxPeople),
          isActive: form.isActive,
        }),
      });

      const data = (await response
        .json()
        .catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Nie udało się zapisać stanowiska."
        );
      }

      toast.success({
        title: isEditing
          ? "Stanowisko zostało zaktualizowane."
          : "Stanowisko zostało dodane.",
      });

      onSaved();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Nie udało się zapisać stanowiska.";

      setError(message);

      toast.error({
        title:
          "Nie udało się zapisać stanowiska.",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <OwnerDialog
      onClose={onClose}
      eyebrow={
        isEditing
          ? "Edycja stanowiska"
          : "Nowe stanowisko"
      }
      title={
        isEditing
          ? form.name || "Stanowisko"
          : "Dodaj stanowisko"
      }
      description={
        isEditing
          ? "Zmień nazwę, pojemność, opis lub dostępność stanowiska."
          : `Dodaj nowe miejsce do łowiska ${lakeName}. Po zapisaniu pojawi się w kalendarzu rezerwacji.`
      }
      headerMeta={
        isEditing ? (
          <Badge
            variant={
              form.isActive
                ? "success"
                : "neutral"
            }
          >
            {form.isActive
              ? "Aktywne"
              : "Nieaktywne"}
          </Badge>
        ) : undefined
      }
      busy={isSaving}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onClose}
            className="h-12 min-h-12 sm:min-w-28"
          >
            Anuluj
          </Button>

          <Button
            type="submit"
            form="owner-spot-form"
            isLoading={isSaving}
            loadingLabel="Zapisywanie…"
            className="h-12 min-h-12 sm:min-w-40"
          >
            {isEditing
              ? "Zapisz zmiany"
              : "Dodaj stanowisko"}
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
              Sprawdź dane stanowiska
            </p>
            <p className="mt-1 text-xs leading-5">
              {error}
            </p>
          </div>
        </div>
      )}

      <form
        id="owner-spot-form"
        onSubmit={handleSubmit}
        className="space-y-7"
      >
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_180px]">
          <OwnerInputField
            label="Nazwa stanowiska"
            value={form.name}
            onChange={(event) =>
              patch("name", event.target.value)
            }
            maxLength={120}
            placeholder="np. Stanowisko 7"
            required
            data-autofocus
          />

          <OwnerInputField
            label="Maks. liczba osób"
            type="number"
            min="1"
            max="99"
            step="1"
            inputMode="numeric"
            value={form.maxPeople}
            onChange={(event) =>
              patch(
                "maxPeople",
                event.target.value
              )
            }
            required
          />
        </div>

        <OwnerTextareaField
          label="Opis"
          value={form.description}
          onChange={(event) =>
            patch(
              "description",
              event.target.value
            )
          }
          maxLength={1200}
          rows={5}
          className="min-h-32"
          placeholder="np. blisko parkingu, duży pomost, miejsce na namiot..."
        />

        <OwnerCheckboxField
          checked={form.isActive}
          onChange={(checked) =>
            patch("isActive", checked)
          }
          label="Stanowisko aktywne"
          description="Nieaktywne stanowisko pozostaje w historii, ale nie będzie dostępne dla nowych rezerwacji."
        />

        {!form.isActive && (
          <div className="rounded-control border border-warning-border bg-warning-subtle px-4 py-4">
            <p className="text-sm font-bold text-warning-foreground">
              Stanowisko zostanie ukryte w nowych rezerwacjach
            </p>
            <p className="mt-1.5 text-xs leading-5 text-text-secondary">
              Historia i istniejące rezerwacje pozostaną zachowane.
            </p>
          </div>
        )}
      </form>
    </OwnerDialog>
  );
}
