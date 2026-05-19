import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
        <section className="hidden bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-400 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center">
              <img
                src="/logos/logo-rybio-biale.svg"
                alt="Rybio"
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="max-w-xl">
            <p className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              Wróć do swoich łowisk, połowów i wypraw
            </p>

            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Zaloguj się i kontynuuj swoją wędkarską historię
            </h1>

            <p className="mt-5 text-lg leading-8 text-white/80">
              Sprawdź zapisane łowiska, dodaj nowy połów, wróć do swoich
              statystyk, osiągnięć i zaplanuj kolejną wyprawę nad wodę.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FeatureCard value="Łowiska" label="ulubione miejsca" />
            <FeatureCard value="Połowy" label="historia wyników" />
            <FeatureCard value="Profil" label="statystyki i odznaki" />
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="inline-flex items-center">
                <img
                  src="/logos/logo-rybioo.svg"
                  alt="Rybio"
                  className="h-12 w-auto object-contain"
                />
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-8">
                <p className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                  Logowanie
                </p>

                <h2 className="text-3xl font-bold tracking-tight">
                  Zaloguj się
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Wróć do swojego konta, zapisanych łowisk, połowów, wypraw i
                  statystyk wędkarskich.
                </p>
              </div>

              <LoginForm />

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  Nie masz konta?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Załóż konto
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs leading-6 text-slate-400">
              Logując się do Rybio, korzystasz z serwisu zgodnie z{" "}
              <Link
                href="/regulamin"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Regulaminem
              </Link>{" "}
              oraz{" "}
              <Link
                href="/polityka-prywatnosci"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Polityką prywatności
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
      <p className="text-xl font-bold">{value}</p>
      <p className="mt-1 text-sm leading-6 text-white/75">{label}</p>
    </div>
  );
}