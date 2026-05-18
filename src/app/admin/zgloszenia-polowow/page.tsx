import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { CatchReportAdminActions } from "@/components/dashboard/CatchReportAdminActions";

export default async function AdminCatchReportsPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/");
  }

  const reports = await prisma.fishingCatchReport.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      fishingCatch: {
        include: {
          lake: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const pendingCount = reports.filter((report) => report.status === "pending").length;
  const acceptedCount = reports.filter((report) => report.status === "accepted").length;
  const rejectedCount = reports.filter((report) => report.status === "rejected").length;

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Zgłoszenia połowów
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Weryfikuj zgłoszone połowy z rankingów łowisk. Możesz odrzucić
            zgłoszenie albo ukryć połów z publicznego rankingu.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Wróć do panelu admina
        </Link>
      </div>

      <section className="mb-6 grid gap-5 md:grid-cols-3">
        <StatCard label="Oczekujące" value={String(pendingCount)} />
        <StatCard label="Ukryte połowy" value={String(acceptedCount)} />
        <StatCard label="Odrzucone zgłoszenia" value={String(rejectedCount)} />
      </section>

      {reports.length > 0 ? (
        <section className="space-y-5">
          {reports.map((report) => (
            <article
              key={report.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="grid gap-0 xl:grid-cols-[260px_1fr]">
                <div className="bg-slate-100">
                  {report.fishingCatch.imageUrl ? (
                    <img
                      src={report.fishingCatch.imageUrl}
                      alt={`Połów: ${report.fishingCatch.fishName}`}
                      className="h-64 w-full object-cover xl:h-full"
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center text-sm font-semibold text-slate-400 xl:h-full">
                      Brak zdjęcia
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="mb-3 flex flex-wrap gap-2">
                        <StatusBadge status={report.status} />

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          {formatDate(report.createdAt)}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold text-slate-950">
                        {report.fishingCatch.fishName}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Zgłoszone przez: {report.userEmail || report.userId}
                      </p>
                    </div>

                    {report.fishingCatch.lake?.slug && (
                      <Link
                        href={`/lowiska/${report.fishingCatch.lake.slug}`}
                        className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
                      >
                        Zobacz łowisko
                      </Link>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <InfoTile
                      label="Waga"
                      value={
                        report.fishingCatch.weight !== null
                          ? `${report.fishingCatch.weight.toFixed(2)} kg`
                          : "Brak"
                      }
                    />

                    <InfoTile
                      label="Długość"
                      value={
                        report.fishingCatch.length !== null
                          ? `${report.fishingCatch.length.toFixed(0)} cm`
                          : "Brak"
                      }
                    />

                    <InfoTile
                      label="Łowisko"
                      value={
                        report.fishingCatch.lakeName ||
                        report.fishingCatch.lake?.name ||
                        "Brak"
                      }
                    />
                  </div>

                  <div className="mt-4 rounded-2xl bg-red-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-400">
                      Uzasadnienie zgłoszenia
                    </p>

                    <p className="mt-2 text-sm font-semibold leading-6 text-red-700">
                      {report.reason}
                    </p>
                  </div>

                  {report.adminNote && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        Notatka admina
                      </p>

                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                        {report.adminNote}
                      </p>
                    </div>
                  )}

                  {report.status === "pending" && (
                    <CatchReportAdminActions reportId={report.id} />
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xl font-bold text-slate-950">
            Brak zgłoszeń połowów
          </p>

          <p className="mt-2 text-slate-500">
            Gdy użytkownicy zgłoszą połów z rankingu, pojawi się on tutaj.
          </p>
        </section>
      )}
    </DashboardLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "accepted") {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        Połów ukryty
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
        Zgłoszenie odrzucone
      </span>
    );
  }

  return (
    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
      Oczekuje
    </span>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}