"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [ageConfirmation, setAgeConfirmation] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    acceptTerms &&
    acceptPrivacy &&
    ageConfirmation &&
    !isLoading;

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (!acceptTerms || !acceptPrivacy || !ageConfirmation) {
      setMessage("Musisz zaakceptować wymagane zgody, aby założyć konto.");
      return;
    }

    if (password.length < 8) {
      setMessage("Hasło musi mieć minimum 8 znaków.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          acceptedTerms: true,
          acceptedPrivacyPolicy: true,
          ageConfirmed: true,
          consentsAcceptedAt: new Date().toISOString(),
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    setMessage("Konto zostało utworzone. Możesz się teraz zalogować.");
    setIsLoading(false);

    router.push("/login");
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
        <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Tworzenie konta..." : "Załóż darmowe konto"}
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
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        required={required}
        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />

      <span>
        {children}{" "}
        {required && <span className="font-bold text-red-500">*</span>}
      </span>
    </label>
  );
}