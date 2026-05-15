import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminCorrectionReportActions } from "@/components/dashboard/AdminCorrectionReportActions";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export default async function LakeCorrectionReportsAdminPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/");
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
        },
      },
    },
  });

  const pendingCount = reports.filter((report) => report.status === "pending")
    .length;

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Zgłoszone poprawki
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Tutaj trafiają zgłoszenia od użytkowników dotyczące błędów i
            nieaktualnych danych łowisk.
          </p>
        </div>

        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
          Oczekujące: {pendingCount}
        </div>
      </div>

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
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        report.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : report.status === "resolved"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                      }`}
                    >
                      {getStatusLabel(report.status)}
                    </span>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {getCategoryLabel(report.category)}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-950">
                    {report.lake.name}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Zgłaszający:{" "}
                    <span className="font-semibold text-slate-700">
                      {report.userEmail || report.userId}
                    </span>
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Data:{" "}
                    {new Intl.DateTimeFormat("pl-PL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(report.createdAt)}
                  </p>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Opis problemu
                    </p>

                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {report.description}
                    </p>
                  </div>

                  {report.adminNote && (
                    <div className="mt-4 rounded-2xl bg-blue-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-400">
                        Notatka admina
                      </p>

                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-blue-700">
                        {report.adminNote}
                      </p>
                    </div>
                  )}

                  <a
                    href={`/lowiska/${report.lake.slug}`}
                    className="mt-4 inline-flex rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    Otwórz łowisko
                  </a>
                </div>

                {report.status === "pending" && (
                  <AdminCorrectionReportActions reportId={report.id} />
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xl font-bold text-slate-950">
            Brak zgłoszonych poprawek
          </p>

          <p className="mt-2 text-slate-500">
            Gdy użytkownik zgłosi błąd na stronie łowiska, pojawi się on tutaj.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}

function getStatusLabel(status: string) {
  if (status === "pending") return "Oczekuje";
  if (status === "resolved") return "Rozwiązane";
  if (status === "rejected") return "Odrzucone";
  return status;
}

function getCategoryLabel(category: string) {
  if (category === "location") return "Lokalizacja";
  if (category === "price") return "Cennik";
  if (category === "rules") return "Regulamin";
  if (category === "contact") return "Kontakt";
  if (category === "amenities") return "Udogodnienia";
  if (category === "fish") return "Ryby";
  if (category === "closed") return "Łowisko zamknięte";
  return "Inny problem";
}