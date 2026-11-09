"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { SettingsFeedback } from "@/components/settings/SettingsFeedback";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type {
  SettingsFeedbackMessage,
} from "@/lib/account/account-types";

type AccountSettingsSectionProps = {
  initialName: string;
  initialEmail: string;
  publicProfileAvailable: boolean;
  publicProfileHref: string;
};

export function AccountSettingsSection({
  initialName,
  initialEmail,
  publicProfileAvailable,
  publicProfileHref,
}: AccountSettingsSectionProps) {
  const router = useRouter();

  const [
    savedName,
    setSavedName,
  ] = useState(initialName);

  const [name, setName] =
    useState(initialName);

  const [
    newEmail,
    setNewEmail,
  ] = useState("");

  const [
    profileMessage,
    setProfileMessage,
  ] =
    useState<SettingsFeedbackMessage | null>(
      null
    );

  const [
    emailMessage,
    setEmailMessage,
  ] =
    useState<SettingsFeedbackMessage | null>(
      null
    );

  const [
    isProfileLoading,
    setIsProfileLoading,
  ] = useState(false);

  const [
    isEmailLoading,
    setIsEmailLoading,
  ] = useState(false);

  const profileDirty =
    name.trim() !==
    savedName.trim();

  const emailDirty =
    newEmail
      .trim()
      .toLocaleLowerCase(
        "pl-PL"
      ) !==
      initialEmail
        .trim()
        .toLocaleLowerCase(
          "pl-PL"
        ) &&
    Boolean(newEmail.trim());

  const profileStateLabel =
    publicProfileAvailable
      ? "Aktywny"
      : "Nieaktywny";

  const profileStateDescription =
    publicProfileAvailable
      ? "Twój publiczny profil wędkarza jest dostępny i pokazuje zatwierdzone publiczne połowy."
      : "Profil publiczny pojawi się, gdy co najmniej jeden publiczny połów zostanie zatwierdzony.";

  async function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanName =
      name.trim();

    if (
      cleanName.length < 2
    ) {
      setProfileMessage({
        tone: "error",
        text:
          "Nazwa użytkownika musi mieć co najmniej 2 znaki.",
      });
      return;
    }

    setIsProfileLoading(true);
    setProfileMessage(null);

    try {
      const response =
        await fetch(
          "/api/account/profile",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name: cleanName,
            }),
          }
        );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | {
              message?: string;
              name?: string;
            }
          | null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Nie udało się zapisać danych profilu."
        );
      }

      const nextName =
        data?.name ||
        cleanName;

      setSavedName(nextName);
      setName(nextName);

      setProfileMessage({
        tone: "success",
        text:
          data?.message ||
          "Dane profilu zostały zapisane.",
      });

      router.refresh();
    } catch (error) {
      setProfileMessage({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Nie udało się zapisać danych profilu.",
      });
    } finally {
      setIsProfileLoading(false);
    }
  }

  async function handleEmailSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanEmail =
      newEmail
        .trim()
        .toLocaleLowerCase(
          "pl-PL"
        );

    if (!cleanEmail) {
      setEmailMessage({
        tone: "error",
        text:
          "Wpisz nowy adres e-mail.",
      });
      return;
    }

    if (
      cleanEmail ===
      initialEmail
        .trim()
        .toLocaleLowerCase(
          "pl-PL"
        )
    ) {
      setEmailMessage({
        tone: "error",
        text:
          "Nowy adres e-mail musi być inny niż aktualny.",
      });
      return;
    }

    setIsEmailLoading(true);
    setEmailMessage(null);

    try {
      const response =
        await fetch(
          "/api/account/email",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email: cleanEmail,
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
            "Nie udało się zmienić adresu e-mail."
        );
      }

      setEmailMessage({
        tone: "info",
        text:
          data?.message ||
          "Sprawdź skrzynkę e-mail i potwierdź zmianę adresu.",
      });

      setNewEmail("");
    } catch (error) {
      setEmailMessage({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Nie udało się zmienić adresu e-mail.",
      });
    } finally {
      setIsEmailLoading(false);
    }
  }

  const currentEmailLabel =
    useMemo(
      () =>
        initialEmail ||
        "Brak adresu e-mail",
      [initialEmail]
    );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
          Konto
        </p>

        <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-[-0.03em] text-text">
          Dane konta
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          Zarządzaj nazwą użytkownika, adresem e-mail i widocznością swojego profilu.
        </p>
      </div>

      <Card>
        <form
          onSubmit={
            handleProfileSubmit
          }
        >
          <CardHeader>
            <CardTitle>
              Dane profilu
            </CardTitle>

            <CardDescription>
              Nazwa jest używana w
              panelu Rybio i może być
              widoczna przy Twojej
              aktywności.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <label className="grid gap-2.5">
              <span className="text-sm font-bold text-text-secondary">
                Nazwa użytkownika
              </span>

              <Input
                value={name}
                onChange={(
                  event
                ) => {
                  setName(
                    event.target
                      .value
                  );
                  setProfileMessage(
                    null
                  );
                }}
                placeholder="np. Jakub"
                autoComplete="name"
                maxLength={80}
                aria-invalid={
                  Boolean(
                    profileMessage?.tone ===
                      "error"
                  ) || undefined
                }
              />

              <span className="text-xs leading-5 text-text-muted">
                Od 2 do 80 znaków.
              </span>
            </label>

            <div className="mt-4">
              <SettingsFeedback
                message={
                  profileMessage
                }
              />
            </div>
          </CardContent>

          <CardFooter className="justify-end">
            <Button
              type="submit"
              isLoading={
                isProfileLoading
              }
              loadingLabel="Zapisywanie…"
              disabled={
                !profileDirty ||
                name.trim().length <
                  2
              }
            >
              Zapisz dane
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <form
          onSubmit={
            handleEmailSubmit
          }
        >
          <CardHeader>
            <CardTitle>
              Adres e-mail
            </CardTitle>

            <CardDescription>
              Zmiana e-maila może
              wymagać potwierdzenia
              nowego adresu.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="rounded-control border border-border bg-surface-muted px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                Aktualny adres
              </p>

              <p className="mt-1.5 break-all text-sm font-extrabold text-text">
                {
                  currentEmailLabel
                }
              </p>
            </div>

            <label className="mt-5 grid gap-2.5">
              <span className="text-sm font-bold text-text-secondary">
                Nowy adres e-mail
              </span>

              <Input
                type="email"
                value={newEmail}
                onChange={(
                  event
                ) => {
                  setNewEmail(
                    event.target
                      .value
                  );
                  setEmailMessage(
                    null
                  );
                }}
                placeholder="nowy@email.pl"
                autoComplete="email"
                maxLength={254}
                aria-invalid={
                  Boolean(
                    emailMessage?.tone ===
                      "error"
                  ) || undefined
                }
              />

              <span className="text-xs leading-5 text-text-muted">
                Po wysłaniu zmiany
                sprawdź skrzynkę
                nowego adresu. Do
                czasu potwierdzenia
                konto może nadal
                korzystać z
                poprzedniego e-maila.
              </span>
            </label>

            <div className="mt-4">
              <SettingsFeedback
                message={
                  emailMessage
                }
              />
            </div>
          </CardContent>

          <CardFooter className="justify-end">
            <Button
              type="submit"
              isLoading={
                isEmailLoading
              }
              loadingLabel="Wysyłanie…"
              disabled={
                !emailDirty
              }
            >
              Zmień e-mail
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card variant="subtle">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle>
                Profil publiczny
              </CardTitle>

              <CardDescription>
                {
                  profileStateDescription
                }
              </CardDescription>
            </div>

            <span
              className={
                publicProfileAvailable
                  ? "inline-flex shrink-0 rounded-full bg-success-subtle px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-success-foreground"
                  : "inline-flex shrink-0 rounded-full bg-surface-strong px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-text-muted"
              }
            >
              {
                profileStateLabel
              }
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {publicProfileAvailable ? (
            <ButtonLink
              href={
                publicProfileHref
              }
              variant="outline"
              size="sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Zobacz profil publiczny ↗
            </ButtonLink>
          ) : (
            <ButtonLink
              href="/polowy?new=1"
              variant="outline"
              size="sm"
            >
              Dodaj połów
            </ButtonLink>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
