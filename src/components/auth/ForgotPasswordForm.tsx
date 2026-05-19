"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");
    setIsSuccess(false);

    const redirectTo = `${window.location.origin}/reset-hasla`;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      setMessage(error.message);
      setIsSuccess(false);
      setIsLoading(false);
      return;
    }

    setMessage(
      "Jeżeli konto z tym adresem e-mail istnieje, wysłaliśmy link do zresetowania hasła."
    );
    setIsSuccess(true);
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleResetPassword} className="space-y-5">
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
        disabled={isLoading}
        className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Wysyłanie linku..." : "Wyślij link do resetu hasła"}
      </button>
    </form>
  );
}