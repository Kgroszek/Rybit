import type {
  Prisma,
} from "@prisma/client";
import type {
  ReactNode,
} from "react";
import {
  redirect,
} from "next/navigation";

import {
  AdminCorrectionActions,
} from "@/components/admin/moderation/AdminCorrectionActions";
import {
  AdminEmptyState,
} from "@/components/admin/shared/AdminEmptyState";
import {
  AdminFilterToolbar,
} from "@/components/admin/shared/AdminFilterToolbar";
import {
  AdminInfoItem,
} from "@/components/admin/shared/AdminInfoItem";
import {
  AdminMetricCard,
} from "@/components/admin/shared/AdminMetricCard";
import {
  AdminPagination,
} from "@/components/admin/shared/AdminPagination";
import {
  AdminStatusBadge,
} from "@/components/admin/shared/AdminStatusBadge";
import {
  AdminStatusTabs,
} from "@/components/admin/shared/AdminStatusTabs";
import {
  DashboardLayout,
} from "@/components/dashboard/DashboardLayout";
import {
  ButtonLink,
} from "@/components/ui/Button";
import {
  Card,
} from "@/components/ui/Card";
import {
  PageHeader,
} from "@/components/ui/PageHeader";
import {
  clampAdminPage,
  formatAdminDate,
  getAdminPagination,
} from "@/lib/admin/admin-formatters";
import {
  getAdminCorrectionCategoryLabel,
} from "@/lib/admin/admin-status";
import {
  requireAdmin,
} from "@/lib/auth";
import {
  prisma,
} from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

const PER_PAGE = 20;

const CATEGORY_OPTIONS = [
  {
    value: "",
    label:
      "Wszystkie kategorie",
  },
  {
    value: "basic",
    label:
      "Dane podstawowe",
  },
  {
    value: "address",
    label: "Adres",
  },
  {
    value: "contact",
    label: "Kontakt",
  },
  {
    value: "prices",
    label: "Cennik",
  },
  {
    value: "rules",
    label: "Regulamin",
  },
  {
    value: "amenities",
    label: "Udogodnienia",
  },
  {
    value: "fish",
    label: "Ryby",
  },
  {
    value: "images",
    label: "Zdjęcia",
  },
  {
    value: "other",
    label: "Inne",
  },
];

type PageProps = {
  searchParams: Promise<{
    status?: string;
    category?: string;
    q?: string;
    page?: string;
  }>;
};

export default async function LakeCorrectionReportsAdminPage({
  searchParams,
}: PageProps) {
  const admin =
    await requireAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  const params =
    await searchParams;

  const status =
    normalizeStatus(
      params.status
    );

  const category =
    params.category?.trim() ??
    "";

  const query =
    params.q?.trim() ?? "";

  const requestedPage =
    clampAdminPage(params.page);

  const where: Prisma.LakeCorrectionReportWhereInput =
    {
      ...(status !== "all"
        ? { status }
        : {}),
      ...(category
        ? { category }
        : {}),
      ...(query
        ? {
            OR: [
              {
                description: {
                  contains:
                    query,
                  mode:
                    "insensitive",
                },
              },
              {
                userEmail: {
                  contains:
                    query,
                  mode:
                    "insensitive",
                },
              },
              {
                lake: {
                  is: {
                    name: {
                      contains:
                        query,
                      mode:
                        "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

  const [
    allCount,
    pendingCount,
    resolvedCount,
    rejectedCount,
    filteredCount,
  ] = await Promise.all([
    prisma.lakeCorrectionReport.count(),
    prisma.lakeCorrectionReport.count({
      where: {
        status: "pending",
      },
    }),
    prisma.lakeCorrectionReport.count({
      where: {
        status:
          "resolved",
      },
    }),
    prisma.lakeCorrectionReport.count({
      where: {
        status:
          "rejected",
      },
    }),
    prisma.lakeCorrectionReport.count({
      where,
    }),
  ]);

  const pagination =
    getAdminPagination(
      filteredCount,
      requestedPage,
      PER_PAGE
    );

  const reports =
    await prisma.lakeCorrectionReport.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: pagination.skip,
      take: PER_PAGE,
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

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          eyebrow="Moderacja"
          title="Poprawki łowisk"
          description="Obsługuj zgłoszenia o błędnych lub nieaktualnych danych i zachowuj historię podjętych decyzji."
          actions={
            <ButtonLink
              href="/admin"
              variant="outline"
            >
              Panel admina
            </ButtonLink>
          }
        />

        <section className="grid gap-4 sm:grid-cols-3">
          <AdminMetricCard
            label="Oczekujące"
            value={pendingCount}
            emphasis={
              pendingCount > 0
            }
          />

          <AdminMetricCard
            label="Rozwiązane"
            value={resolvedCount}
          />

          <AdminMetricCard
            label="Odrzucone"
            value={rejectedCount}
          />
        </section>

        <div className="space-y-3">
          <AdminStatusTabs
            pathname="/admin/poprawki-lowisk"
            paramName="status"
            activeValue={status}
            params={{
              q:
                query ||
                undefined,
              category:
                category ||
                undefined,
            }}
            items={[
              {
                value:
                  "pending",
                label:
                  "Oczekujące",
                count:
                  pendingCount,
              },
              {
                value:
                  "resolved",
                label:
                  "Rozwiązane",
                count:
                  resolvedCount,
              },
              {
                value:
                  "rejected",
                label:
                  "Odrzucone",
                count:
                  rejectedCount,
              },
              {
                value: "all",
                label:
                  "Wszystkie",
                count: allCount,
              },
            ]}
          />

          <AdminFilterToolbar
            action="/admin/poprawki-lowisk"
            query={query}
            queryPlaceholder="Szukaj łowiska, zgłaszającego lub treści..."
            hiddenFields={{
              status:
                status !==
                "all"
                  ? status
                  : undefined,
            }}
            selectFields={[
              {
                name:
                  "category",
                label:
                  "Kategoria",
                value:
                  category,
                options:
                  CATEGORY_OPTIONS,
              },
            ]}
            resetHref={
              status === "all"
                ? "/admin/poprawki-lowisk"
                : `/admin/poprawki-lowisk?status=${status}`
            }
          />
        </div>

        {reports.length > 0 ? (
          <>
            <div className="space-y-3">
              {reports.map(
                (report) => (
                  <Card
                    key={report.id}
                    className="overflow-hidden"
                  >
                    <details className="group">
                      <summary className="cursor-pointer list-none p-5 marker:hidden sm:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <AdminStatusBadge
                                status={
                                  report.status
                                }
                              />

                              <span className="rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-primary-700">
                                {getAdminCorrectionCategoryLabel(
                                  report.category
                                )}
                              </span>
                            </div>

                            <h2 className="mt-3 font-display text-lg font-extrabold tracking-[-0.025em] text-text">
                              {
                                report.lake.name
                              }
                            </h2>

                            <p className="mt-1 text-sm text-text-secondary">
                              {
                                report.lake.city
                              }
                              , woj.{" "}
                              {
                                report.lake.voivodeship
                              }
                            </p>

                            <p className="mt-2 line-clamp-1 text-xs text-text-muted">
                              {
                                report.description
                              }
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <span className="text-xs text-text-muted">
                              {formatAdminDate(
                                report.createdAt
                              )}
                            </span>

                            <span className="text-xs font-extrabold text-primary-700">
                              Szczegóły
                            </span>

                            <span
                              aria-hidden="true"
                              className="text-lg font-black text-text-muted transition group-open:rotate-45"
                            >
                              +
                            </span>
                          </div>
                        </div>
                      </summary>

                      <div className="border-t border-border bg-surface-muted px-5 py-6 sm:px-6">
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                          <div className="min-w-0 space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <AdminInfoItem
                                label="Zgłaszający"
                                value={
                                  report.userEmail ||
                                  report.userId
                                }
                              />

                              <AdminInfoItem
                                label="Data zgłoszenia"
                                value={formatAdminDate(
                                  report.createdAt
                                )}
                              />
                            </div>

                            <ContentBlock
                              label="Opis problemu"
                            >
                              {
                                report.description
                              }
                            </ContentBlock>

                            {report.adminNote && (
                              <ContentBlock
                                label="Notatka administratora"
                                accent
                              >
                                {
                                  report.adminNote
                                }
                              </ContentBlock>
                            )}
                          </div>

                          <aside className="space-y-3">
                            <Card className="p-4">
                              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                                Łowisko
                              </p>

                              <div className="mt-3 grid gap-2">
                                <ButtonLink
                                  href={`/admin/lowiska/${report.lake.slug}/edytuj`}
                                  variant="outline"
                                  size="sm"
                                  fullWidth
                                >
                                  Edytuj łowisko
                                </ButtonLink>

                                <ButtonLink
                                  href={`/lowiska-w-polsce/${report.lake.slug}`}
                                  variant="ghost"
                                  size="sm"
                                  fullWidth
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Podgląd publiczny ↗
                                </ButtonLink>
                              </div>
                            </Card>

                            {report.status ===
                              "pending" && (
                              <Card className="p-4">
                                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                                  Decyzja
                                </p>

                                <AdminCorrectionActions
                                  reportId={
                                    report.id
                                  }
                                  lakeName={
                                    report.lake.name
                                  }
                                />
                              </Card>
                            )}
                          </aside>
                        </div>
                      </div>
                    </details>
                  </Card>
                )
              )}
            </div>

            <AdminPagination
              pathname="/admin/poprawki-lowisk"
              page={
                pagination.page
              }
              totalPages={
                pagination.totalPages
              }
              params={{
                status:
                  status !==
                  "all"
                    ? status
                    : undefined,
                category:
                  category ||
                  undefined,
                q:
                  query ||
                  undefined,
              }}
            />
          </>
        ) : (
          <AdminEmptyState
            title="Brak zgłoszonych poprawek"
            description="Nie znaleziono zgłoszeń pasujących do wybranych filtrów."
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function normalizeStatus(
  value:
    | string
    | undefined
) {
  if (
    value === "resolved" ||
    value === "rejected" ||
    value === "all"
  ) {
    return value;
  }

  return "pending";
}

function ContentBlock({
  label,
  accent = false,
  children,
}: {
  label: string;
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-control border border-primary-200 bg-primary-50 px-4 py-4"
          : "rounded-control border border-border bg-surface px-4 py-4"
      }
    >
      <p
        className={
          accent
            ? "text-[9px] font-black uppercase tracking-[0.12em] text-primary-700"
            : "text-[9px] font-black uppercase tracking-[0.12em] text-text-muted"
        }
      >
        {label}
      </p>

      <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-text-secondary">
        {children}
      </p>
    </div>
  );
}
