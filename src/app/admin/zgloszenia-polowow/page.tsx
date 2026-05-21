import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CatchReportAdminActions } from "@/components/dashboard/CatchReportAdminActions";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "catch-images";

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
  email?: string | null;
  app_metadata?: {
    role?: string;
    [key: string]: unknown;
  };
  user_metadata?: {
    role?: string;
    [key: string]: unknown;
  };
}) {
  const adminEmails = getAdminEmails();
  const userEmail = user.email?.trim().toLowerCase() ?? "";

  return (
    user.app_metadata?.role === "admin" ||
    user.user_metadata?.role === "admin" ||
    adminEmails.includes(userEmail)
  );
}

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
  if (status === "accepted") return "Połów ukryty";
  if (status === "approved") return "Zaakceptowane";
  if (status === "resolved") return "Rozwiązane";
  if (status === "rejected") return "Odrzucone";

  return status;
}

function getStatusClass(status: string) {
  if (status === "pending") return "bg-amber-50 text-amber-700";

  if (
    status === "accepted" ||
    status === "approved" ||
    status === "resolved"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "rejected") return "bg-red-50 text-red-700";

  return "bg-slate-100 text-slate-600";
}

function formatWeight(weight: number | null) {
  if (weight === null) return "Brak";
  return `${weight.toFixed(2)} kg`;
}

function formatLength(length: number | null) {
  if (length === null) return "Brak";
  return `${length.toFixed(0)} cm`;
}

export default async function AdminCatchReportsPage() {
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
              city: true,
              voivodeship: true,
            },
          },
        },
      },
    },
  });

  const reportsWithPreview = await Promise.all(
    reports.map(async (report) => {
      let previewImageUrl = report.fishingCatch.imageUrl;

      if (report.fishingCatch.imagePath) {
        const { data } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(report.fishingCatch.imagePath, 60 * 60);

        previewImageUrl = data?.signedUrl ?? report.fishingCatch.imageUrl;
      }

      return {
        ...report,
        previewImageUrl,
      };
    })
  );

  const pendingCount = reports.filter(
    (report) => report.status === "pending"
  ).length;

  const hiddenCount = reports.filter(
    (report) =>
      report.status === "accepted" ||
      report.status === "approved" ||
      report.status === "resolved"
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
                Zgłoszenia połowów
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Weryfikuj zgłoszone połowy z rankingów łowisk. Możesz odrzucić
                zgłoszenie albo ukryć połów z publicznego rankingu.
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
          <StatCard label="Oczekujące" value={pendingCount} variant="warning" />
          <StatCard label="Ukryte połowy" value={hiddenCount} variant="success" />
          <StatCard
            label="Odrzucone zgłoszenia"
            value={rejectedCount}
            variant="danger"
          />
        </section>

        {reportsWithPreview.length > 0 ? (
          <section className="space-y-5">
            {reportsWithPreview.map((report) => (
              <article
                key={report.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="grid gap-0 xl:grid-cols-[280px_1fr]">
                  <div className="bg-slate-100">
                    {report.previewImageUrl ? (
                      <a
                        href={report.previewImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block h-full"
                      >
                        <img
                          src={report.previewImageUrl}
                          alt={`Połów: ${report.fishingCatch.fishName}`}
                          className="h-64 w-full object-cover transition duration-300 hover:scale-105 xl:h-full"
                        />
                      </a>
                    ) : (
                      <div className="flex h-64 items-center justify-center text-sm font-bold text-slate-400 xl:h-full">
                        Brak zdjęcia
                      </div>
                    )}
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${getStatusClass(
                              report.status
                            )}`}
                          >
                            {getStatusLabel(report.status)}
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                            {formatDate(report.createdAt)}
                          </span>
                        </div>

                        <h2 className="break-words text-2xl font-black text-slate-950">
                          {report.fishingCatch.fishName}
                        </h2>

                        <p className="mt-1 break-words text-sm text-slate-500">
                          Zgłoszone przez: {report.userEmail || report.userId}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row xl:shrink-0">
                        {report.fishingCatch.lake?.slug && (
                          <>
                            <Link
                              href={`/lowiska/${report.fishingCatch.lake.slug}`}
                              className="rounded-2xl bg-slate-100 px-4 py-2 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                            >
                              Łowisko w panelu
                            </Link>

                            <Link
                              href={`/lowiska-w-polsce/${report.fishingCatch.lake.slug}`}
                              className="rounded-2xl bg-blue-50 px-4 py-2 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                            >
                              Podgląd publiczny
                            </Link>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <InfoTile
                        label="Waga"
                        value={formatWeight(report.fishingCatch.weight)}
                      />

                      <InfoTile
                        label="Długość"
                        value={formatLength(report.fishingCatch.length)}
                      />

                      <InfoTile
                        label="Łowisko"
                        value={
                          report.fishingCatch.lakeName ||
                          report.fishingCatch.lake?.name ||
                          "Brak"
                        }
                      />

                      <InfoTile
                        label="Użytkownik"
                        value={report.fishingCatch.userName || "Użytkownik"}
                      />
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <InfoTile
                        label="Metoda"
                        value={report.fishingCatch.method || "Brak"}
                      />

                      <InfoTile
                        label="Przynęta"
                        value={report.fishingCatch.bait || "Brak"}
                      />

                      <InfoTile
                        label="Data połowu"
                        value={formatDate(report.fishingCatch.caughtAt)}
                      />

                      <InfoTile
                        label="Status rankingu"
                        value={getStatusLabel(report.fishingCatch.rankingStatus)}
                      />
                    </div>

                    <div className="mt-4 rounded-2xl bg-red-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-red-400">
                        Uzasadnienie zgłoszenia
                      </p>

                      <p className="mt-2 whitespace-pre-line break-words text-sm font-semibold leading-6 text-red-700">
                        {report.reason}
                      </p>
                    </div>

                    {report.fishingCatch.note && (
                      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Notatka przy połowie
                        </p>

                        <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-700">
                          {report.fishingCatch.note}
                        </p>
                      </div>
                    )}

                    {report.adminNote && (
                      <div className="mt-4 rounded-2xl bg-blue-50 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-400">
                          Notatka admina
                        </p>

                        <p className="mt-2 whitespace-pre-line break-words text-sm font-semibold leading-6 text-blue-700">
                          {report.adminNote}
                        </p>
                      </div>
                    )}

                    {report.status === "pending" && (
                      <div className="mt-5">
                        <CatchReportAdminActions reportId={report.id} />
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Brak zgłoszeń połowów
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Gdy użytkownicy zgłoszą połów z rankingu, pojawi się on tutaj.
            </p>

            <Link
              href="/admin"
              className="mt-5 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Wróć do panelu admina
            </Link>
          </section>
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
    <div className={`rounded-3xl border p-5 shadow-sm ${classes[variant]}`}>
      <p className="text-sm font-bold">{label}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
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