import Link from "next/link";

export default function RegisterPage() {
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
              Mapa łowisk • Ekwipunek • Checklisty • Połowy
            </p>

            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Dołącz do Rybit i planuj wyprawy bez chaosu
            </h1>

            <p className="mt-5 text-lg leading-8 text-white/80">
              Zapisuj ulubione łowiska, twórz checklisty, prowadź dziennik
              połowów i miej cały sprzęt w jednym miejscu.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FeatureCard value="Mapa" label="łowisk w Twojej okolicy" />
            <FeatureCard value="Sprzęt" label="zawsze pod kontrolą" />
            <FeatureCard value="Checklisty" label="na każdą wyprawę" />
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
                  <p className="text-sm text-slate-500">
                    Panel wędkarza
                  </p>
                </div>
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">
                  Załóż konto
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Utwórz konto i zacznij zapisywać swoje łowiska, sprzęt oraz
                  wyprawy.
                </p>
              </div>

              <form className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Imię lub nazwa profilu
                  </label>

                  <input
                    id="name"
                    type="text"
                    placeholder="np. Piotr Nowak"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Adres e-mail
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="twoj@email.pl"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Hasło
                  </label>

                  <input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 znaków"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="passwordConfirmation"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Powtórz hasło
                  </label>

                  <input
                    id="passwordConfirmation"
                    type="password"
                    placeholder="Wpisz hasło ponownie"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                  />

                  <span className="text-sm leading-6 text-slate-600">
                    Akceptuję regulamin oraz politykę prywatności aplikacji
                    Rybit.
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Załóż darmowe konto
                </button>
              </form>

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
              Na tym etapie formularz jest tylko widokiem. Rejestrację
              podepniemy później pod bazę danych i system logowania.
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