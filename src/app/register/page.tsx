import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
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
              Mapa łowisk • Połowy • Wyprawy • Społeczność
            </p>

            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Dołącz do Rybio i buduj swój wędkarski profil
            </h1>

            <p className="mt-5 text-lg leading-8 text-white/80">
              Zapisuj swoje połowy, dodawaj zdjęcia, sprawdzaj łowiska, planuj
              wyprawy i korzystaj z funkcji tworzonych z myślą o wędkarzach.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FeatureCard value="Łowiska" label="w publicznej bazie" />
            <FeatureCard value="Połowy" label="z wagą, długością i zdjęciem" />
            <FeatureCard value="Profil" label="statystyki i osiągnięcia" />
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
                  Rejestracja
                </p>

                <h2 className="text-3xl font-bold tracking-tight">
                  Załóż konto
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Utwórz konto i zacznij zapisywać połowy, dodawać zdjęcia,
                  planować wyprawy oraz korzystać z funkcji społecznościowych
                  Rybio.
                </p>
              </div>

              <RegisterForm />

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  Masz już konto?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Zaloguj się
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs leading-6 text-slate-400">
              Tworząc konto, akceptujesz zasady korzystania z serwisu Rybio.
              Szczegóły znajdziesz w{" "}
              <Link
                href="/regulamin"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Regulaminie
              </Link>{" "}
              oraz{" "}
              <Link
                href="/polityka-prywatnosci"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Polityce prywatności
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