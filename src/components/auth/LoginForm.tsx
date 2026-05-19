"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Nieprawidłowy e-mail lub hasło.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
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

        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          placeholder="Wpisz hasło"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          required
        />
      </div>

      {message && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Logowanie..." : "Zaloguj się"}
      </button>

      <div className="text-center">
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Nie pamiętasz hasła?
        </Link>
      </div>
    </form>
  );
}