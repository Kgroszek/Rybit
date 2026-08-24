"use client";

import {
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { PasswordField } from "@/components/settings/PasswordField";
import { SettingsFeedback } from "@/components/settings/SettingsFeedback";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type {
  SettingsFeedbackMessage,
} from "@/lib/account/account-types";
import {
  getPasswordStrength,
} from "@/lib/account/account-validation";
import { cn } from "@/lib/cn";

export function SecuritySettingsSection() {
  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    newPasswordRepeat,
    setNewPasswordRepeat,
  ] = useState("");

  const [
    message,
    setMessage,
  ] =
    useState<SettingsFeedbackMessage | null>(
      null
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const strength =
    useMemo(
      () =>
        getPasswordStrength(
          newPassword
        ),
      [newPassword]
    );

  const passwordsMatch =
    !newPasswordRepeat ||
    newPassword ===
      newPasswordRepeat;

  const passwordIsDifferent =
    !currentPassword ||
    !newPassword ||
    currentPassword !==
      newPassword;

  const canSubmit =
    Boolean(
      currentPassword &&
        newPassword &&
        newPasswordRepeat
    ) &&
    newPassword.length >= 8 &&
    passwordsMatch &&
    passwordIsDifferent;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!currentPassword) {
      setMessage({
        tone: "error",
        text:
          "Wpisz obecne hasło.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({
        tone: "error",
        text:
          "Nowe hasło musi mieć minimum 8 znaków.",
      });
      return;
    }

    if (
      newPassword !==
      newPasswordRepeat
    ) {
      setMessage({
        tone: "error",
        text:
          "Podane nowe hasła nie są takie same.",
      });
      return;
    }

    if (
      currentPassword ===
      newPassword
    ) {
      setMessage({
        tone: "error",
        text:
          "Nowe hasło musi być inne niż obecne hasło.",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response =
        await fetch(
          "/api/account/password",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              currentPassword,
              newPassword,
            }),
          }
        );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | {
              message?: string;
            }
          | null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Nie udało się zmienić hasła."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordRepeat("");

      setMessage({
        tone: "success",
        text:
          data?.message ||
          "Hasło zostało zmienione.",
      });
    } catch (error) {
      setMessage({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Nie udało się zmienić hasła.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
          Bezpieczeństwo
        </p>

        <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-[-0.03em] text-text">
          Hasło i ochrona konta
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          Zmieniaj hasło świadomie i korzystaj z unikalnego hasła, którego nie używasz w innych usługach.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>
              Zmiana hasła
            </CardTitle>

            <CardDescription>
              Dla bezpieczeństwa
              najpierw potwierdzimy
              Twoje obecne hasło.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="grid gap-5">
              <PasswordField
                label="Obecne hasło"
                value={
                  currentPassword
                }
                onChange={(
                  event
                ) => {
                  setCurrentPassword(
                    event.target
                      .value
                  );
                  setMessage(null);
                }}
                placeholder="Wpisz obecne hasło"
                autoComplete="current-password"
                maxLength={128}
              />

              <PasswordField
                label="Nowe hasło"
                value={newPassword}
                onChange={(
                  event
                ) => {
                  setNewPassword(
                    event.target
                      .value
                  );
                  setMessage(null);
                }}
                placeholder="Wpisz nowe hasło"
                autoComplete="new-password"
                maxLength={128}
                hint="Minimum 8 znaków. Dłuższe i zróżnicowane hasło jest bezpieczniejsze."
              />

              <PasswordStrengthMeter
                score={strength.score}
                label={strength.label}
                description={
                  strength.description
                }
              />

              <PasswordField
                label="Powtórz nowe hasło"
                value={
                  newPasswordRepeat
                }
                onChange={(
                  event
                ) => {
                  setNewPasswordRepeat(
                    event.target
                      .value
                  );
                  setMessage(null);
                }}
                placeholder="Powtórz nowe hasło"
                autoComplete="new-password"
                maxLength={128}
                aria-invalid={
                  !passwordsMatch ||
                  undefined
                }
              />

              {!passwordsMatch && (
                <p
                  role="alert"
                  className="-mt-2 text-xs font-bold text-danger-foreground"
                >
                  Podane nowe hasła
                  nie są takie same.
                </p>
              )}

              {!passwordIsDifferent && (
                <p
                  role="alert"
                  className="-mt-2 text-xs font-bold text-danger-foreground"
                >
                  Nowe hasło musi być
                  inne niż obecne.
                </p>
              )}

              <SettingsFeedback
                message={message}
              />
            </div>
          </CardContent>

          <CardFooter className="justify-end">
            <Button
              type="submit"
              isLoading={isLoading}
              loadingLabel="Zmienianie…"
              disabled={!canSubmit}
            >
              Zmień hasło
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card variant="subtle">
        <CardHeader>
          <CardTitle>
            Dobre praktyki
          </CardTitle>

          <CardDescription>
            Kilka prostych zasad
            znacząco podnosi
            bezpieczeństwo konta.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <ul className="grid gap-3 text-sm leading-6 text-text-secondary">
            <SecurityTip>
              Nie używaj tego samego
              hasła w kilku
              serwisach.
            </SecurityTip>

            <SecurityTip>
              Dłuższa fraza jest
              zwykle lepsza niż
              krótkie, skomplikowane
              hasło.
            </SecurityTip>

            <SecurityTip>
              Nie udostępniaj hasła
              innym osobom ani przez
              wiadomości.
            </SecurityTip>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function PasswordStrengthMeter({
  score,
  label,
  description,
}: {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  description: string;
}) {
  return (
    <div className="rounded-control border border-border bg-surface-muted px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-text-secondary">
          Siła hasła
        </p>

        <p
          className={cn(
            "text-xs font-extrabold",
            score === 0 &&
              "text-text-muted",
            score === 1 &&
              "text-danger-foreground",
            score === 2 &&
              "text-warning-foreground",
            score >= 3 &&
              "text-success-foreground"
          )}
        >
          {label}
        </p>
      </div>

      <div
        className="mt-3 grid grid-cols-4 gap-1.5"
        aria-hidden="true"
      >
        {Array.from(
          {
            length: 4,
          },
          (_, index) => (
            <span
              key={index}
              className={cn(
                "h-1.5 rounded-full bg-border",
                index < score &&
                  score <= 1 &&
                  "bg-danger",
                index < score &&
                  score === 2 &&
                  "bg-warning",
                index < score &&
                  score >= 3 &&
                  "bg-success"
              )}
            />
          )
        )}
      </div>

      <p className="mt-2 text-xs leading-5 text-text-muted">
        {description}
      </p>
    </div>
  );
}

function SecurityTip({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <li className="grid grid-cols-[22px_minmax(0,1fr)] gap-2.5">
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full bg-success-subtle text-[10px] font-black text-success-foreground"
        aria-hidden="true"
      >
        ✓
      </span>

      <span>{children}</span>
    </li>
  );
}
