"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const canSubmit =
    password.length >= 8 &&
    passwordConfirmation.length >= 8 &&
    password === passwordConfirmation &&
    !isLoading;

  async function handleUpdatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsSuccess(false);

    if (password.length < 8) {
      setMessage("Hasło musi mieć minimum 8 znaków.");
      return;
    }

    if (password !== passwordConfirmation) {
      setMessage("Hasła muszą być takie same.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(
        error.message ||
          "Nie udało się ustawić nowego hasła. Spróbuj ponownie."
      );
      setIsSuccess(false);
      setIsLoading(false);
      return;
    }

    setMessage("Hasło zostało zmienione. Możesz się teraz zalogować.");
    setIsSuccess(true);
    setIsLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <form onSubmit={handleUpdatePassword} className="space-y-5">
      <PasswordInput
        label="Nowe hasło"
        value={password}
        onChange={setPassword}
        showPassword={showPassword}
        onToggleShowPassword={() => setShowPassword((current) => !current)}
      />

      <PasswordInput
        label="Powtórz nowe hasło"
        value={passwordConfirmation}
        onChange={setPasswordConfirmation}
        showPassword={showPasswordConfirmation}
        onToggleShowPassword={() =>
          setShowPasswordConfirmation((current) => !current)
        }
      />

      <p className="text-xs leading-5 text-slate-400">
        Hasło powinno mieć minimum 8 znaków.
      </p>

      {message && (
        <div
          className={`rounded-2xl p-4 text-sm font-semibold ${
            isSuccess
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
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
        {isLoading ? "Zapisywanie..." : "Ustaw nowe hasło"}
      </button>
    </form>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  showPassword,
  onToggleShowPassword,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={showPassword ? "text" : "password"}
          placeholder="Minimum 8 znaków"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-24 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          required
          minLength={8}
        />

        <button
          type="button"
          onClick={onToggleShowPassword}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
        >
          {showPassword ? "Ukryj" : "Pokaż"}
        </button>
      </div>
    </div>
  );
}