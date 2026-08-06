import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminCorrectionReportActions } from "@/components/dashboard/AdminCorrectionReportActions";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
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
  if (status === "resolved") return "Rozwiązane";
  if (status === "rejected") return "Odrzucone";
  if (status === "approved") return "Zaakceptowane";

  return status;
}

function getStatusClass(status: string) {
  if (status === "pending") {
    return "bg-amber-50 text-amber-700";
  }

  if (status === "resolved" || status === "approved") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "rejected") {
    return "bg-red-50 text-red-600";
  }

  return "bg-slate-100 text-slate-600";
}

function getCategoryLabel(category: string) {
  if (category === "basic") return "Dane podstawowe";
  if (category === "address") return "Adres";
  if (category === "contact") return "Kontakt";
  if (category === "prices") return "Cennik";
  if (category === "rules") return "Regulamin";
  if (category === "amenities") return "Udogodnienia";
  if (category === "fish") return "Ryby";
  if (category === "images") return "Zdjęcia";
  if (category === "other") return "Inne";

  return category;
}

export default async function LakeCorrectionReportsAdminPage() {
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

  const reports = await prisma.lakeCorrectionReport.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      lake: {
        select: {
          name: true,
          slug: true,
          city: true,
          voivodeship: true,
        },
      },
    },
  });

  const pendingCount = reports.filter(
    (report) => report.status === "pending"
  ).length;

  const resolvedCount = reports.filter(
    (report) => report.status === "resolved"
  ).length;

  const rejectedCount = reports.filter(
    (report) => report.status === "rejected"
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                Panel administratora
              </p>

              <h1 className="text-3xl font-black tracking-tight text-slate-950">
                Zgłoszone poprawki łowisk
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Tutaj trafiają zgłoszenia od użytkowników dotyczące błędów,
                nieaktualnych danych lub brakujących informacji na profilach
                łowisk.
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

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Oczekujące"
            value={pendingCount}
            variant="warning"
          />

          <StatCard
            label="Rozwiązane"
            value={resolvedCount}
            variant="success"
          />

          <StatCard
            label="Odrzucone"
            value={rejectedCount}
            variant="danger"
          />
        </section>

        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${getStatusClass(
                          report.status
                        )}`}
                      >
                        {getStatusLabel(report.status)}
                      </span>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                        {getCategoryLabel(report.category)}
                      </span>
                    </div>

                    <h2 className="break-words text-xl font-black text-slate-950">
                      {report.lake.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {report.lake.city}, woj. {report.lake.voivodeship}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <InfoBox
                        label="Zgłaszający"
                        value={report.userEmail || report.userId}
                      />

                      <InfoBox
                        label="Data zgłoszenia"
                        value={formatDate(report.createdAt)}
                      />
                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        Opis problemu
                      </p>

                      <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-700">
                        {report.description}
                      </p>
                    </div>

                    {report.adminNote && (
                      <div className="mt-4 rounded-2xl bg-blue-50 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-400">
                          Notatka admina
                        </p>

                        <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-blue-700">
                          {report.adminNote}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/lowiska/${report.lake.slug}`}
                        className="inline-flex rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        Otwórz łowisko w panelu
                      </Link>

                      <Link
                        href={`/lowiska-w-polsce/${report.lake.slug}`}
                        className="inline-flex rounded-2xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                      >
                        Podgląd publiczny
                      </Link>
                    </div>
                  </div>

                  {report.status === "pending" && (
                    <div className="w-full xl:w-[360px] xl:shrink-0">
                      <AdminCorrectionReportActions
                        reportId={report.id}
                      />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Brak zgłoszonych poprawek
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Gdy użytkownicy zgłoszą błędne lub nieaktualne dane łowisk,
              pojawią się one w tym miejscu.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "warning" | "success" | "danger";
}) {
  const classes = {
    warning: "border-amber-100 bg-amber-50 text-amber-700",
    success: "border-emerald-100 bg-emerald-50 text-emerald-700",
    danger: "border-red-100 bg-red-50 text-red-700",
  };

  return (
    <div
      className={`rounded-3xl border p-5 shadow-sm ${classes[variant]}`}
    >
      <p className="text-sm font-bold">{label}</p>

      <p className="mt-3 text-4xl font-black">
        {value}
      </p>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}