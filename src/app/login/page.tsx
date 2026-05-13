import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
        {/* LEFT SIDE */}
        <section className="hidden bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-400 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur">
                R
              </div>

              <div>
                <p className="text-2xl font-bold tracking-tight">Rybit</p>
                <p className="text-sm text-white/75">
                  Twoje centrum wędkarskich wypraw
                </p>
              </div>
            </Link>
          </div>

          <div className="max-w-xl">
            <p className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              Wróć do swoich łowisk, wypraw i checklist
            </p>

            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Zaloguj się i zaplanuj kolejną wyprawę
            </h1>

            <p className="mt-5 text-lg leading-8 text-white/80">
              Sprawdź zapisane łowiska, przygotuj sprzęt, wróć do dziennika
              połowów i miej wszystko pod kontrolą przed wyjazdem.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FeatureCard value="Mapa" label="zapisane łowiska" />
            <FeatureCard value="Sprzęt" label="Twój ekwipunek" />
            <FeatureCard value="Połowy" label="historia wyników" />
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">
                  R
                </div>

                <div>
                  <p className="text-2xl font-bold tracking-tight">Rybit</p>
                  <p className="text-sm text-slate-500">Panel wędkarza</p>
                </div>
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">
                  Zaloguj się
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Wróć do swoich łowisk, checklist, ekwipunku i dziennika
                  połowów.
                </p>
              </div>

              <LoginForm />

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  lub
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  G
                </span>
                Kontynuuj z Google
              </button>

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
              Na tym etapie ekran logowania jest widokiem. Prawdziwą
              autoryzację podepniemy później.
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