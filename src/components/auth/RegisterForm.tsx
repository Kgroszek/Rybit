"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";

type MessageType = "info" | "success" | "error";

export function RegisterForm() {
  const supabase = createClient();
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [ageConfirmation, setAgeConfirmation] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("info");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    acceptTerms &&
    acceptPrivacy &&
    ageConfirmation &&
    !isLoading;

  function showMessage(type: MessageType, text: string) {
    setMessageType(type);
    setMessage(text);
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setMessageType("info");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      const errorMessage = "Podaj imię lub nazwę profilu.";

      showMessage("error", errorMessage);

      toast.error({
        title: "Brakuje nazwy profilu.",
        description: errorMessage,
      });

      return;
    }

    if (!trimmedEmail) {
      const errorMessage = "Podaj adres e-mail.";

      showMessage("error", errorMessage);

      toast.error({
        title: "Brakuje adresu e-mail.",
        description: errorMessage,
      });

      return;
    }

    if (password.length < 8) {
      const errorMessage = "Hasło musi mieć minimum 8 znaków.";

      showMessage("error", errorMessage);

      toast.error({
        title: "Hasło jest za krótkie.",
        description: errorMessage,
      });

      return;
    }

    if (!acceptTerms || !acceptPrivacy || !ageConfirmation) {
      const errorMessage =
        "Musisz zaakceptować wymagane zgody, aby założyć konto.";

      showMessage("error", errorMessage);

      toast.error({
        title: "Wymagane zgody.",
        description: errorMessage,
      });

      return;
    }

    setIsLoading(true);

    const toastId = toast.loading({
      title: "Tworzenie konta...",
      description: "Zakładamy konto i wysyłamy link aktywacyjny na e-mail.",
    });

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          name: trimmedName,
          acceptedTerms: true,
          acceptedPrivacyPolicy: true,
          ageConfirmed: true,
          consentsAcceptedAt: new Date().toISOString(),
        },
      },
    });

    setIsLoading(false);

    if (error) {
      const errorMessage =
        error.message === "User already registered"
          ? "Konto z tym adresem e-mail już istnieje. Spróbuj się zalogować albo zresetować hasło."
          : error.message;

      showMessage("error", errorMessage);

      toast.update(toastId, {
        type: "error",
        title: "Nie udało się utworzyć konta.",
        description: errorMessage,
        duration: 6000,
      });

      return;
    }

    setRegisteredEmail(trimmedEmail);
    setPassword("");
    setAcceptTerms(false);
    setAcceptPrivacy(false);
    setAgeConfirmation(false);

    const successMessage =
      "Konto zostało utworzone. Sprawdź skrzynkę e-mail i kliknij link aktywacyjny, aby potwierdzić konto.";

    showMessage("success", successMessage);

    toast.update(toastId, {
      type: "success",
      title: "Sprawdź skrzynkę e-mail.",
      description:
        "Wysłaliśmy link aktywacyjny. Kliknij go, aby potwierdzić konto.",
      duration: 7000,
    });

    if (data.session) {
      await supabase.auth.signOut();
    }
  }

  if (registeredEmail) {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-black text-white">
              ✓
            </div>

            <div>
              <h3 className="text-base font-black text-emerald-900">
                Konto zostało utworzone
              </h3>

              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Wysłaliśmy link aktywacyjny na adres:
              </p>

              <p className="mt-1 break-all text-sm font-black text-emerald-900">
                {registeredEmail}
              </p>

              <p className="mt-3 text-sm leading-6 text-emerald-800">
                Wejdź na swoją skrzynkę pocztową i kliknij link aktywacyjny,
                aby potwierdzić konto. Dopiero po potwierdzeniu adresu e-mail
                możesz się zalogować.
              </p>

              <p className="mt-3 rounded-2xl bg-white/70 p-3 text-xs font-semibold leading-5 text-emerald-800">
                Jeśli wiadomość nie pojawi się po kilku minutach, sprawdź folder
                SPAM, Oferty, Powiadomienia albo Inne.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/login"
          className="flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Przejdź do logowania
        </Link>

        <button
          type="button"
          onClick={() => {
            setRegisteredEmail("");
            setMessage("");
            setMessageType("info");
          }}
          className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Zarejestruj inny adres e-mail
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Imię lub nazwa profilu
        </label>

        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          type="text"
          placeholder="np. Piotr Nowak"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Adres e-mail
        </label>

        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="twoj@email.pl"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Hasło
        </label>

        <div className="relative">
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type={showPassword ? "text" : "password"}
            placeholder="Minimum 8 znaków"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-24 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            required
            minLength={8}
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
          >
            {showPassword ? "Ukryj" : "Pokaż"}
          </button>
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          Hasło powinno mieć minimum 8 znaków.
        </p>
      </div>


      <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <CheckboxField
          checked={acceptTerms}
          onChange={setAcceptTerms}
          required
        >
          Akceptuję{" "}
          <Link
            href="/regulamin"
            target="_blank"
            className="font-bold text-blue-600 hover:text-blue-700"
          >
            Regulamin serwisu Rybio
          </Link>{" "}
          oraz zobowiązuję się do korzystania z serwisu zgodnie z jego zasadami.
        </CheckboxField>

        <CheckboxField
          checked={acceptPrivacy}
          onChange={setAcceptPrivacy}
          required
        >
          Zapoznałem/am się z{" "}
          <Link
            href="/polityka-prywatnosci"
            target="_blank"
            className="font-bold text-blue-600 hover:text-blue-700"
          >
            Polityką prywatności
          </Link>{" "}
          i informacją o przetwarzaniu danych osobowych.
        </CheckboxField>

        <CheckboxField
          checked={ageConfirmation}
          onChange={setAgeConfirmation}
          required
        >
          Oświadczam, że mam ukończone 16 lat albo korzystam z serwisu za zgodą
          rodzica lub opiekuna prawnego.
        </CheckboxField>
      </div>

      {message && (
        <div
          className={`rounded-2xl p-4 text-sm font-semibold leading-6 ${
            messageType === "success"
              ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
              : messageType === "error"
                ? "border border-red-100 bg-red-50 text-red-700"
                : "border border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Tworzenie konta..." : "Załóż konto"}
      </button>
    </form>
  );
}

function CheckboxField({
  checked,
  onChange,
  children,
  required = false,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-xs font-medium leading-5 text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        required={required}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600"
      />

      <span>{children}</span>
    </label>
  );
}