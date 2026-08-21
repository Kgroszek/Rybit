"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { AlertIcon } from "@/components/icons/AlertIcon";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { MarkerIcon } from "@/components/icons/MarkerIcon";
import { ReservationStatusBadge } from "@/components/owner/reservations/ReservationStatusBadge";
import {
  RESERVATION_STATUS_OPTIONS,
  RESERVATION_TYPE_OPTIONS,
  applyReservationPreset,
  reservationName,
  validateReservationForm,
} from "@/components/owner/reservations/reservation-utils";
import type {
  BookingTimes,
  OwnerReservationItem,
  OwnerSpotOption,
  ReservationFormState,
} from "@/components/owner/reservations/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/cn";

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function ReservationDialog({
  lakeSlug,
  form,
  spots,
  settings,
  sourceReservation,
  onChange,
  onClose,
  onSaved,
}: {
  lakeSlug: string;
  form: ReservationFormState;
  spots: OwnerSpotOption[];
  settings: BookingTimes;
  sourceReservation: OwnerReservationItem | null;
  onChange: (form: ReservationFormState) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const formId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef =
    useRef<HTMLDivElement | null>(null);
  const previousActiveRef =
    useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const isSavingRef = useRef(false);

  onCloseRef.current = onClose;

  const [isSaving, setIsSaving] =
    useState(false);

  isSavingRef.current = isSaving;
  const [error, setError] = useState("");
  const [cancelConfirm, setCancelConfirm] =
    useState(false);

  const isEditing = Boolean(form.id);

  useEffect(() => {
    previousActiveRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      if (event.key === "Escape") {
        if (!isSavingRef.current) {
          event.preventDefault();
          onCloseRef.current();
        }
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR
        )
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last =
        focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    const frame =
      window.requestAnimationFrame(() => {
        dialogRef.current
          ?.querySelector<HTMLElement>(
            "[data-autofocus]"
          )
          ?.focus({
            preventScroll: true,
          });
      });

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
      document.body.style.overflow =
        previousOverflow;

      window.requestAnimationFrame(() => {
        previousActiveRef.current?.focus();
      });
    };
  }, []);

  function patch<K extends keyof ReservationFormState>(
    key: K,
    value: ReservationFormState[K]
  ) {
    onChange({
      ...form,
      [key]: value,
    });
  }

  function changeScope(scope: "spot" | "lake") {
    if (scope === "spot") {
      onChange({
        ...form,
        scope: "spot",
        type: "reservation",
        spotId:
          form.spotId || spots[0]?.id || "",
        isPublicEvent: false,
      });
      return;
    }

    onChange({
      ...form,
      scope: "lake",
      type:
        form.scope === "lake" &&
        form.type !== "reservation"
          ? form.type
          : "block",
      spotId: "",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const validationError =
      validateReservationForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const endpoint = form.id
        ? `/api/owner/lakes/${lakeSlug}/reservations/${form.id}`
        : `/api/owner/lakes/${lakeSlug}/reservations`;

      const response = await fetch(endpoint, {
        method: form.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await response
        .json()
        .catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Nie udało się zapisać rezerwacji."
        );
      }

      toast.success({
        title: form.id
          ? "Rezerwacja została zaktualizowana."
          : "Rezerwacja została dodana.",
      });

      onSaved();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Nie udało się zapisać rezerwacji.";

      setError(message);

      toast.error({
        title:
          "Nie udało się zapisać rezerwacji.",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function cancelReservation() {
    if (!form.id) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/owner/lakes/${lakeSlug}/reservations/${form.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            status: "cancelled",
          }),
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Nie udało się anulować rezerwacji."
        );
      }

      toast.success({
        title: "Rezerwacja została anulowana.",
      });

      onSaved();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Nie udało się anulować rezerwacji.";

      setError(message);
      setCancelConfirm(false);

      toast.error({
        title:
          "Nie udało się anulować rezerwacji.",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  const selectedSpot = spots.find(
    (spot) => spot.id === form.spotId
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[1400] flex items-end justify-center overflow-hidden bg-navy-950/80 backdrop-blur-[4px] sm:items-center sm:p-6"
      onMouseDown={() => {
        if (!isSaving) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="flex min-h-0 w-full flex-col overflow-hidden rounded-t-modal border-border bg-surface shadow-float sm:max-w-[920px] sm:rounded-modal sm:border"
        style={{
          height: "min(92dvh, 900px)",
        }}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header className="shrink-0 border-b border-border px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                  {isEditing
                    ? "Szczegóły rezerwacji"
                    : "Nowa rezerwacja"}
                </p>

                {isEditing && (
                  <ReservationStatusBadge
                    status={form.status}
                  />
                )}
              </div>

              <h2
                id={titleId}
                className="mt-2 break-words font-display text-2xl font-extrabold tracking-[-0.03em] text-text sm:text-3xl"
              >
                {isEditing
                  ? sourceReservation
                    ? reservationName(
                        sourceReservation
                      )
                    : form.title ||
                      form.contactName ||
                      "Rezerwacja"
                  : "Dodaj termin"}
              </h2>

              <p
                id={descriptionId}
                className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary"
              >
                {form.scope === "spot"
                  ? selectedSpot
                    ? `${selectedSpot.name} · rezerwacja stanowiska`
                    : "Rezerwacja stanowiska"
                  : "Blokada lub wydarzenie obejmujące całe łowisko"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-muted text-text-secondary transition hover:bg-surface-hover hover:text-text disabled:opacity-50"
              aria-label="Zamknij"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-7 [overflow-anchor:none] [scrollbar-gutter:stable] sm:px-7 sm:py-8">
          {error && (
            <div
              role="alert"
              className="mb-7 flex items-start gap-3 rounded-control border border-danger-border bg-danger-subtle px-4 py-4 text-sm text-danger-foreground"
            >
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-bold">
                  Nie udało się zapisać zmian
                </p>
                <p className="mt-1 text-xs leading-5">
                  {error}
                </p>
              </div>
            </div>
          )}

          <form
            id={formId}
            onSubmit={handleSubmit}
            className="space-y-0"
          >
            <ReservationFormSection
              number="01"
              title="Zakres rezerwacji"
              description="Wybierz konkretne stanowisko albo zablokuj całe łowisko."
              first
            >
              <div
                className="grid grid-cols-2 gap-3"
                role="radiogroup"
                aria-label="Zakres rezerwacji"
              >
                <ScopeChoice
                  active={form.scope === "spot"}
                  onClick={() =>
                    changeScope("spot")
                  }
                  title="Stanowisko"
                  description={
                    spots.length > 0
                      ? "Rezerwacja konkretnego miejsca"
                      : "Najpierw dodaj aktywne stanowisko"
                  }
                  disabled={spots.length === 0}
                />

                <ScopeChoice
                  active={form.scope === "lake"}
                  onClick={() =>
                    changeScope("lake")
                  }
                  title="Całe łowisko"
                  description="Zawody, serwis lub blokada"
                />
              </div>

              <div className="mt-6">
                {form.scope === "spot" ? (
                  <ReservationSelect
                    label="Stanowisko"
                    value={form.spotId}
                    onChange={(event) =>
                      patch(
                        "spotId",
                        event.target.value
                      )
                    }
                    required
                    data-autofocus
                  >
                    <option value="">
                      Wybierz stanowisko
                    </option>

                    {spots.map((spot) => (
                      <option
                        key={spot.id}
                        value={spot.id}
                      >
                        {spot.name} · maks.{" "}
                        {spot.maxPeople} os.
                      </option>
                    ))}
                  </ReservationSelect>
                ) : (
                  <ReservationSelect
                    label="Rodzaj blokady / wydarzenia"
                    value={form.type}
                    onChange={(event) =>
                      patch(
                        "type",
                        event.target.value
                      )
                    }
                    data-autofocus
                  >
                    {RESERVATION_TYPE_OPTIONS.map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </ReservationSelect>
                )}
              </div>
            </ReservationFormSection>

            <ReservationFormSection
              number="02"
              title="Termin"
              description="Ustaw ręcznie godziny albo skorzystaj z godzin zdefiniowanych w ustawieniach rezerwacji."
            >
              <div className="flex flex-wrap gap-2">
                <PresetButton
                  label="Standard"
                  onClick={() =>
                    onChange(
                      applyReservationPreset(
                        form,
                        settings,
                        "standard"
                      )
                    )
                  }
                />
                <PresetButton
                  label="Doba"
                  onClick={() =>
                    onChange(
                      applyReservationPreset(
                        form,
                        settings,
                        "fullDay"
                      )
                    )
                  }
                />
                <PresetButton
                  label="Dzień"
                  onClick={() =>
                    onChange(
                      applyReservationPreset(
                        form,
                        settings,
                        "day"
                      )
                    )
                  }
                />
                <PresetButton
                  label="Noc"
                  onClick={() =>
                    onChange(
                      applyReservationPreset(
                        form,
                        settings,
                        "night"
                      )
                    )
                  }
                />
              </div>

              <div className="mt-6 grid gap-x-6 gap-y-6 sm:grid-cols-2">
                <ReservationInput
                  label="Od"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(event) =>
                    patch(
                      "startsAt",
                      event.target.value
                    )
                  }
                  required
                />

                <ReservationInput
                  label="Do"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(event) =>
                    patch(
                      "endsAt",
                      event.target.value
                    )
                  }
                  required
                />
              </div>
            </ReservationFormSection>

            <ReservationFormSection
              number="03"
              title={
                form.scope === "lake"
                  ? "Wydarzenie"
                  : "Rezerwacja"
              }
              description="Status i podstawowe informacje operacyjne."
            >
              <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <ReservationInput
                    label={
                      form.scope === "lake"
                        ? "Nazwa wydarzenia / tytuł"
                        : "Tytuł"
                    }
                    value={form.title}
                    onChange={(event) =>
                      patch(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder={
                      form.scope === "lake"
                        ? "np. Zawody karpiowe"
                        : "np. Rezerwacja weekendowa"
                    }
                    maxLength={160}
                  />
                </div>

                <ReservationSelect
                  label="Status"
                  value={form.status}
                  onChange={(event) =>
                    patch(
                      "status",
                      event.target.value
                    )
                  }
                >
                  {RESERVATION_STATUS_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </ReservationSelect>

                <ReservationInput
                  label="Liczba osób"
                  type="number"
                  min="1"
                  max="999"
                  step="1"
                  inputMode="numeric"
                  value={form.peopleCount}
                  onChange={(event) =>
                    patch(
                      "peopleCount",
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              {form.scope === "lake" && (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={
                    form.isPublicEvent
                  }
                  onClick={() =>
                    patch(
                      "isPublicEvent",
                      !form.isPublicEvent
                    )
                  }
                  className={cn(
                    "mt-6 flex w-full items-start rounded-control border px-4 py-4 text-left transition",
                    form.isPublicEvent
                      ? "border-primary-300 bg-primary-50"
                      : "border-border bg-surface-muted hover:border-primary-200"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[11px] font-black",
                      form.isPublicEvent
                        ? "border-primary bg-primary text-white"
                        : "border-border-strong bg-surface text-transparent"
                    )}
                    aria-hidden="true"
                  >
                    ✓
                  </span>

                  <span className="ml-3.5 min-w-0">
                    <span className="block text-sm font-bold text-text">
                      Wydarzenie publiczne
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-text-muted">
                      Oznacz wydarzenie jako publiczne, jeżeli może być pokazywane użytkownikom poza panelem właściciela.
                    </span>
                  </span>
                </button>
              )}
            </ReservationFormSection>

            <ReservationFormSection
              number="04"
              title={
                form.scope === "lake"
                  ? "Organizator"
                  : "Klient"
              }
              description="Dane kontaktowe osoby odpowiedzialnej za rezerwację."
            >
              <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <ReservationInput
                    label="Imię i nazwisko / nazwa"
                    value={form.contactName}
                    onChange={(event) =>
                      patch(
                        "contactName",
                        event.target.value
                      )
                    }
                    maxLength={160}
                    autoComplete="name"
                  />
                </div>

                <ReservationInput
                  label="Telefon"
                  value={form.contactPhone}
                  onChange={(event) =>
                    patch(
                      "contactPhone",
                      event.target.value
                    )
                  }
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={60}
                />

                <ReservationInput
                  label="E-mail"
                  type="email"
                  value={form.contactEmail}
                  onChange={(event) =>
                    patch(
                      "contactEmail",
                      event.target.value
                    )
                  }
                  autoComplete="email"
                  maxLength={160}
                />
              </div>
            </ReservationFormSection>

            <ReservationFormSection
              number="05"
              title="Notatki"
              description="Oddziel informacje o rezerwacji od prywatnej notatki dla obsługi łowiska."
              last
            >
              <div className="grid gap-6">
                <ReservationTextarea
                  label="Informacje do rezerwacji"
                  value={form.note}
                  onChange={(event) =>
                    patch(
                      "note",
                      event.target.value
                    )
                  }
                  rows={3}
                  maxLength={1200}
                  placeholder="np. przyjazd późnym wieczorem, 3 wędkarzy..."
                />

                <ReservationTextarea
                  label="Notatka wewnętrzna"
                  value={form.internalNote}
                  onChange={(event) =>
                    patch(
                      "internalNote",
                      event.target.value
                    )
                  }
                  rows={3}
                  maxLength={1200}
                  placeholder="Widoczna tylko w panelu właściciela."
                />
              </div>
            </ReservationFormSection>
          </form>
        </div>

        <footer className="shrink-0 border-t border-border bg-surface px-5 py-4 shadow-[0_-8px_24px_rgba(13,30,51,0.035)] sm:px-7 sm:py-5">
          {cancelConfirm ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-danger-foreground">
                  Anulować tę rezerwację?
                </p>
                <p className="mt-1 text-xs leading-5 text-text-muted">
                  Rezerwacja pozostanie w historii, ale przestanie blokować termin.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() =>
                    setCancelConfirm(false)
                  }
                  className="h-12 min-h-12"
                >
                  Wróć
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  isLoading={isSaving}
                  loadingLabel="Anulowanie…"
                  onClick={() =>
                    void cancelReservation()
                  }
                  className="h-12 min-h-12"
                >
                  Tak, anuluj
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div>
                {form.id &&
                  form.status !== "cancelled" && (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={isSaving}
                      onClick={() =>
                        setCancelConfirm(true)
                      }
                      className="h-12 min-h-12 text-danger-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                    >
                      Anuluj rezerwację
                    </Button>
                  )}
              </div>

              <div className="flex gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={onClose}
                  className="h-12 min-h-12 flex-1 sm:min-w-28 sm:flex-none"
                >
                  Zamknij
                </Button>

                <Button
                  type="submit"
                  form={formId}
                  isLoading={isSaving}
                  loadingLabel="Zapisywanie…"
                  className="h-12 min-h-12 flex-1 sm:min-w-40 sm:flex-none"
                >
                  {form.id
                    ? "Zapisz zmiany"
                    : "Dodaj rezerwację"}
                </Button>
              </div>
            </div>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
}

function ReservationFormSection({
  number,
  title,
  description,
  children,
  first = false,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
  first?: boolean;
  last?: boolean;
}) {
  return (
    <section
      className={cn(
        first
          ? "pt-0"
          : "border-t border-border pt-9",
        last ? "pb-0" : "pb-9"
      )}
    >
      <div className="mb-7 flex items-start">
        <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-xl bg-primary-100 px-2 text-[11px] font-black text-primary-700">
          {number}
        </span>

        <div className="ml-4 min-w-0 pt-0.5">
          <h3 className="font-display text-[17px] font-extrabold leading-6 tracking-[-0.02em] text-text sm:text-lg">
            {title}
          </h3>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-text-muted">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function ScopeChoice({
  active,
  onClick,
  title,
  description,
  disabled = false,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex min-h-[108px] items-start rounded-control border px-4 py-4 text-left transition",
        active
          ? "border-primary-300 bg-primary-50"
          : "border-border bg-surface-muted hover:border-primary-200 hover:bg-surface-hover",
        disabled &&
          "cursor-not-allowed opacity-50 hover:border-border hover:bg-surface-muted"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          active
            ? "border-primary"
            : "border-border-strong"
        )}
        aria-hidden="true"
      >
        {active && (
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
        )}
      </span>

      <span className="ml-3.5 min-w-0">
        <span className="flex items-center gap-2 text-sm font-bold text-text">
          {title === "Stanowisko" && (
            <MarkerIcon className="h-4 w-4 text-primary" />
          )}
          {title}
        </span>
        <span className="mt-1 block text-xs leading-5 text-text-muted">
          {description}
        </span>
      </span>
    </button>
  );
}

function ReservationFieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span className="block text-sm font-bold leading-5 text-text-secondary">
      {children}
      {required && (
        <span className="ml-1 text-danger">
          *
        </span>
      )}
    </span>
  );
}

function ReservationInput({
  label,
  required,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
}) {
  return (
    <label
      className="grid min-w-0"
      style={{
        rowGap: "12px",
      }}
    >
      <ReservationFieldLabel
        required={required}
      >
        {label}
      </ReservationFieldLabel>

      <Input
        {...props}
        required={required}
        className={cn(
          "h-12 text-[15px]",
          props.className
        )}
      />
    </label>
  );
}

function ReservationSelect({
  label,
  required,
  children,
  ...props
}: React.ComponentProps<typeof Select> & {
  label: string;
}) {
  return (
    <label
      className="grid min-w-0"
      style={{
        rowGap: "12px",
      }}
    >
      <ReservationFieldLabel
        required={required}
      >
        {label}
      </ReservationFieldLabel>

      <Select
        {...props}
        required={required}
        className={cn(
          "h-12 text-[15px]",
          props.className
        )}
      >
        {children}
      </Select>
    </label>
  );
}

function ReservationTextarea({
  label,
  required,
  ...props
}: React.ComponentProps<typeof Textarea> & {
  label: string;
}) {
  return (
    <label
      className="grid min-w-0"
      style={{
        rowGap: "12px",
      }}
    >
      <ReservationFieldLabel
        required={required}
      >
        {label}
      </ReservationFieldLabel>

      <Textarea
        {...props}
        required={required}
        className={cn(
          "min-h-28 text-[15px]",
          props.className
        )}
      />
    </label>
  );
}

function PresetButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
