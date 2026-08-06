import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/auth";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusLabel(status: string) {
  if (status === "pending") return "Oczekuje";
  if (status === "approved") return "Zaakceptowane";
  if (status === "rejected") return "Odrzucone";
  if (status === "resolved") return "Rozwiązane";
  if (status === "hidden") return "Ukryte";

  return status;
}

function getStatusClass(status: string) {
  if (status === "pending") return "bg-amber-50 text-amber-700";

  if (status === "approved" || status === "resolved") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "rejected" || status === "hidden") {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

async function getRegisteredUsersCount() {
  try {
    const supabaseAdmin = createAdminClient();

    const perPage = 1000;
    let page = 1;
    let total = 0;

    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        console.error(
          "Nie udało się pobrać użytkowników:",
          error.message
        );

        return total;
      }

      const users = data.users ?? [];
      total += users.length;

      if (users.length < perPage) {
        break;
      }

      page += 1;
    }

    return total;
  } catch (error) {
    console.error(
      "Nie udało się pobrać liczby użytkowników:",
      error
    );

    return 0;
  }
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  if (!isAdminUser(user)) {
    redirect("/dashboard");
  }

  const [
    registeredUsersCount,
    lakesCount,
    lakeSubmissionsCount,
    pendingLakeSubmissionsCount,
    lakeCorrectionsCount,
    pendingLakeCorrectionsCount,
    catchReportsCount,
    pendingCatchReportsCount,
    catchesCount,
    publicCatchesCount,
    hiddenCatchesCount,
    tripsCount,
    gearCount,
    favouritesCount,
    ratingsCount,
    latestLakes,
    latestLakeSubmissions,
    latestLakeCorrections,
    latestCatchReports,
    latestPublicCatches,
  ] = await Promise.all([
    getRegisteredUsersCount(),

    prisma.lake.count(),

    prisma.lakeSubmission.count(),

    prisma.lakeSubmission.count({
      where: {
        status: "pending",
      },
    }),

    prisma.lakeCorrectionReport.count(),

    prisma.lakeCorrectionReport.count({
      where: {
        status: "pending",
      },
    }),

    prisma.fishingCatchReport.count(),

    prisma.fishingCatchReport.count({
      where: {
        status: "pending",
      },
    }),

    prisma.fishingCatch.count(),

    prisma.fishingCatch.count({
      where: {
        isPublic: true,
      },
    }),

    prisma.fishingCatch.count({
      where: {
        rankingStatus: "hidden",
      },
    }),

    prisma.fishingTrip.count(),

    prisma.fishingGear.count(),

    prisma.favourite.count(),

    prisma.rating.count(),

    prisma.lake.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        voivodeship: true,
        ownerType: true,
        createdAt: true,
      },
    }),

    prisma.lakeSubmission.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        city: true,
        voivodeship: true,
        status: true,
        createdAt: true,
      },
    }),

    prisma.lakeCorrectionReport.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        category: true,
        description: true,
        status: true,
        createdAt: true,
        lake: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),

    prisma.fishingCatchReport.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
        fishingCatch: {
          select: {
            id: true,
            fishName: true,
            weight: true,
            length: true,
            lakeName: true,
            userName: true,
          },
        },
      },
    }),

    prisma.fishingCatch.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        isPublic: true,
      },
      select: {
        id: true,
        fishName: true,
        weight: true,
        length: true,
        lakeName: true,
        userName: true,
        rankingStatus: true,
        createdAt: true,
      },
    }),
  ]);

  const pendingTotal =
    pendingLakeSubmissionsCount +
    pendingLakeCorrectionsCount +
    pendingCatchReportsCount;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-400 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
                Panel administratora
              </p>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Centrum zarządzania Rybio
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/80 sm:text-base">
                Zarządzaj zgłoszeniami łowisk, poprawkami danych,
                zgłoszeniami połowów, użytkownikami, rankingami oraz
                podstawowymi statystykami aplikacji.
              </p>
            </div>

            <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
              <p className="text-sm font-bold text-white/75">
                Oczekujące sprawy
              </p>

              <p className="mt-1 text-4xl font-black">
                {pendingTotal}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Łowiska w bazie"
          value={lakesCount}
          href="/admin/lowiska"
          description="Wszystkie zaakceptowane łowiska."
        />

        <StatCard
          label="Zgłoszenia łowisk"
          value={pendingLakeSubmissionsCount}
          href="/admin/zgloszenia-lowisk"
          description="Oczekujące na decyzję administratora."
          danger={pendingLakeSubmissionsCount > 0}
        />

        <StatCard
          label="Poprawki łowisk"
          value={pendingLakeCorrectionsCount}
          href="/admin/poprawki-lowisk"
          description="Zgłoszone błędy i aktualizacje danych."
          danger={pendingLakeCorrectionsCount > 0}
        />

        <StatCard
          label="Zgłoszenia połowów"
          value={pendingCatchReportsCount}
          href="/admin/zgloszenia-polowow"
          description="Połowy zgłoszone przez użytkowników."
          danger={pendingCatchReportsCount > 0}
        />

        <StatCard
          label="Użytkownicy"
          value={registeredUsersCount}
          href="/admin/uzytkownicy"
          description="Zarejestrowane konta w aplikacji."
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SmallStatCard
          label="Wszystkie zgłoszenia łowisk"
          value={lakeSubmissionsCount}
        />

        <SmallStatCard
          label="Wszystkie poprawki"
          value={lakeCorrectionsCount}
        />

        <SmallStatCard
          label="Wszystkie zgłoszenia połowów"
          value={catchReportsCount}
        />

        <SmallStatCard
          label="Ukryte połowy"
          value={hiddenCatchesCount}
        />

        <SmallStatCard
          label="Wszystkie połowy"
          value={catchesCount}
        />

        <SmallStatCard
          label="Publiczne połowy"
          value={publicCatchesCount}
        />

        <SmallStatCard
          label="Wyprawy"
          value={tripsCount}
        />

        <SmallStatCard
          label="Elementy ekwipunku"
          value={gearCount}
        />

        <SmallStatCard
          label="Ulubione łowiska"
          value={favouritesCount}
        />

        <SmallStatCard
          label="Oceny łowisk"
          value={ratingsCount}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-4">
        <AdminShortcut
          title="Zgłoszenia łowisk"
          description="Sprawdź łowiska dodane przez użytkowników i zdecyduj, czy mają trafić do bazy."
          href="/admin/zgloszenia-lowisk"
          buttonText="Przejdź do zgłoszeń"
          count={pendingLakeSubmissionsCount}
        />

        <AdminShortcut
          title="Zgłoszone poprawki"
          description="Przejrzyj zgłoszenia dotyczące błędnych lub nieaktualnych danych łowisk."
          href="/admin/poprawki-lowisk"
          buttonText="Przejdź do poprawek"
          count={pendingLakeCorrectionsCount}
        />

        <AdminShortcut
          title="Zgłoszenia połowów"
          description="Moderuj połowy zgłoszone przez innych użytkowników i ukrywaj nieprawidłowe wyniki."
          href="/admin/zgloszenia-polowow"
          buttonText="Przejdź do połowów"
          count={pendingCatchReportsCount}
        />

        <AdminShortcut
          title="Użytkownicy"
          description="Sprawdź listę zarejestrowanych użytkowników, status potwierdzenia e-maila i daty logowania."
          href="/admin/uzytkownicy"
          buttonText="Przejdź do użytkowników"
          count={0}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <PanelCard title="Ostatnio dodane łowiska">
          {latestLakes.length > 0 ? (
            <div className="space-y-3">
              {latestLakes.map((lake) => (
                <div
                  key={lake.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-slate-950">
                        {lake.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {lake.city}, woj. {lake.voivodeship}
                      </p>

                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        {lake.ownerType}
                      </p>
                    </div>

                    <Link
                      href={`/lowiska/${lake.slug}`}
                      className="w-fit rounded-2xl bg-white px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                    >
                      Podgląd
                    </Link>
                  </div>

                  <p className="mt-3 text-xs font-semibold text-slate-400">
                    Dodano: {formatDate(lake.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Brak dodanych łowisk." />
          )}
        </PanelCard>

        <PanelCard title="Ostatnie zgłoszenia łowisk">
          {latestLakeSubmissions.length > 0 ? (
            <div className="space-y-3">
              {latestLakeSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-slate-950">
                        {submission.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {submission.city}, woj.{" "}
                        {submission.voivodeship}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-black ${getStatusClass(
                        submission.status
                      )}`}
                    >
                      {getStatusLabel(submission.status)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-400">
                      Dodano: {formatDate(submission.createdAt)}
                    </p>

                    <Link
                      href="/admin/zgloszenia-lowisk"
                      className="text-sm font-bold text-blue-600 hover:text-blue-700"
                    >
                      Zobacz
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Brak zgłoszeń łowisk." />
          )}
        </PanelCard>

        <PanelCard title="Ostatnie poprawki łowisk">
          {latestLakeCorrections.length > 0 ? (
            <div className="space-y-3">
              {latestLakeCorrections.map((report) => (
                <div
                  key={report.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-slate-950">
                        {report.lake.name}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        Kategoria: {report.category}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-black ${getStatusClass(
                        report.status
                      )}`}
                    >
                      {getStatusLabel(report.status)}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {report.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-400">
                      Dodano: {formatDate(report.createdAt)}
                    </p>

                    <Link
                      href="/admin/poprawki-lowisk"
                      className="text-sm font-bold text-blue-600 hover:text-blue-700"
                    >
                      Zobacz
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Brak zgłoszonych poprawek." />
          )}
        </PanelCard>

        <PanelCard title="Ostatnie zgłoszenia połowów">
          {latestCatchReports.length > 0 ? (
            <div className="space-y-3">
              {latestCatchReports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-slate-950">
                        {report.fishingCatch.fishName}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {report.fishingCatch.lakeName ||
                          "Brak łowiska"}{" "}
                        •{" "}
                        {report.fishingCatch.userName ||
                          "Użytkownik"}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-black ${getStatusClass(
                        report.status
                      )}`}
                    >
                      {getStatusLabel(report.status)}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {report.reason}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-400">
                      Dodano: {formatDate(report.createdAt)}
                    </p>

                    <Link
                      href="/admin/zgloszenia-polowow"
                      className="text-sm font-bold text-blue-600 hover:text-blue-700"
                    >
                      Zobacz
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Brak zgłoszeń połowów." />
          )}
        </PanelCard>
      </section>

      <PanelCard title="Ostatnie publiczne połowy">
        {latestPublicCatches.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Ryba</th>
                    <th className="px-4 py-3">Łowisko</th>
                    <th className="px-4 py-3">Użytkownik</th>
                    <th className="px-4 py-3">Waga</th>
                    <th className="px-4 py-3">Długość</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Dodano</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {latestPublicCatches.map((fishingCatch) => (
                    <tr key={fishingCatch.id}>
                      <td className="px-4 py-3 font-bold text-slate-950">
                        {fishingCatch.fishName}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {fishingCatch.lakeName || "Brak"}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {fishingCatch.userName || "Użytkownik"}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {fishingCatch.weight
                          ? `${fishingCatch.weight} kg`
                          : "Brak"}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {fishingCatch.length
                          ? `${fishingCatch.length} cm`
                          : "Brak"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${getStatusClass(
                            fishingCatch.rankingStatus
                          )}`}
                        >
                          {getStatusLabel(
                            fishingCatch.rankingStatus
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(fishingCatch.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState text="Brak publicznych połowów." />
        )}
      </PanelCard>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  href,
  danger = false,
}: {
  label: string;
  value: number;
  description: string;
  href: string;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
        danger
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p
        className={`text-sm font-bold ${
          danger ? "text-amber-700" : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p className="mt-3 text-4xl font-black text-slate-950">
        {value}
      </p>

      <p
        className={`mt-3 text-sm leading-6 ${
          danger ? "text-amber-700" : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </Link>
  );
}

function SmallStatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function AdminShortcut({
  title,
  description,
  href,
  buttonText,
  count,
}: {
  title: string;
  description: string;
  href: string;
  buttonText: string;
  count: number;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-950">
            {title}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        {count > 0 && (
          <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-red-500 px-2 text-sm font-black text-white">
            {count}
          </span>
        )}
      </div>

      <Link
        href={href}
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
      >
        {buttonText}
      </Link>
    </div>
  );
}

function PanelCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-black text-slate-950">
        {title}
      </h2>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">
      {text}
    </div>
  );
}