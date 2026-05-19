import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getAdminEmails() {
  const singleAdminEmail = process.env.ADMIN_EMAIL ?? "";
  const multipleAdminEmails = process.env.ADMIN_EMAILS ?? "";

  return [singleAdminEmail, multipleAdminEmails]
    .join(",")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminUser(user: {
  email?: string;
  app_metadata?: { role?: string };
  user_metadata?: { role?: string };
}) {
  const adminEmails = getAdminEmails();
  const userEmail = user.email?.trim().toLowerCase() ?? "";

  return (
    user.app_metadata?.role === "admin" ||
    user.user_metadata?.role === "admin" ||
    adminEmails.includes(userEmail)
  );
}

function formatDate(date?: string | null) {
  if (!date) return "Brak";

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminUser(user)) {
    redirect("/dashboard");
  }

  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const users = data?.users ?? [];

  const sortedUsers = [...users].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const confirmedUsers = users.filter((item) => item.email_confirmed_at).length;
  const unconfirmedUsers = users.length - confirmedUsers;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
              Panel administratora
            </p>

            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              Zarejestrowani użytkownicy
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              Lista kont zarejestrowanych w Rybio. Dane pobierane są z Supabase
              Auth.
            </p>
          </div>

          <Link
            href="/admin"
            className="w-fit rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Wróć do panelu admina
          </Link>
        </div>
      </section>

      {error && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700">
          Nie udało się pobrać użytkowników: {error.message}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Wszyscy użytkownicy" value={users.length} />
        <StatCard label="Potwierdzone e-maile" value={confirmedUsers} />
        <StatCard label="Niepotwierdzone e-maile" value={unconfirmedUsers} />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-slate-950">
          Lista użytkowników
        </h2>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Użytkownik</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Status e-maila</th>
                  <th className="px-4 py-3">Utworzono</th>
                  <th className="px-4 py-3">Ostatnie logowanie</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {sortedUsers.map((item) => {
                  const profileName =
                    item.user_metadata?.name ||
                    item.user_metadata?.full_name ||
                    "Użytkownik";

                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-bold text-slate-950">
                        {profileName}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {item.email || "Brak"}
                      </td>

                      <td className="px-4 py-3">
                        {item.email_confirmed_at ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                            Potwierdzony
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                            Niepotwierdzony
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(item.created_at)}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(item.last_sign_in_at)}
                      </td>
                    </tr>
                  );
                })}

                {sortedUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm font-bold text-slate-500"
                    >
                      Brak użytkowników.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-black text-slate-950">{value}</p>
    </div>
  );
}