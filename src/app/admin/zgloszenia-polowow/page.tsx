import type {
  Prisma,
} from "@prisma/client";
import {
  redirect,
} from "next/navigation";

import {
  AdminCatchModerationActions,
} from "@/components/admin/moderation/AdminCatchModerationActions";
import {
  AdminCatchReportActions,
} from "@/components/admin/moderation/AdminCatchReportActions";
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
  formatAdminLength,
  formatAdminWeight,
  getAdminPagination,
} from "@/lib/admin/admin-formatters";
import {
  getAdminCatchMethodLabel,
} from "@/lib/admin/admin-status";
import {
  requireAdmin,
} from "@/lib/auth";
import {
  prisma,
} from "@/lib/prisma";
import {
  createClient,
} from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

const BUCKET_NAME =
  "catch-images";
const PER_PAGE = 12;

type PageProps = {
  searchParams: Promise<{
    widok?: string;
    status?: string;
    q?: string;
    page?: string;
  }>;
};

export default async function AdminCatchReportsPage({
  searchParams,
}: PageProps) {
  const admin =
    await requireAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  const params =
    await searchParams;

  const view =
    params.widok ===
    "zgloszenia"
      ? "zgloszenia"
      : "moderacja";

  const status =
    normalizeReportStatus(
      params.status
    );

  const query =
    params.q?.trim() ?? "";

  const requestedPage =
    clampAdminPage(params.page);

  const [
    pendingRankingCount,
    pendingReportsCount,
    resolvedReportsCount,
    rejectedReportsCount,
    allReportsCount,
  ] = await Promise.all([
    prisma.fishingCatch.count({
      where: {
        isPublic: true,
        rankingStatus:
          "pending",
      },
    }),
    prisma.fishingCatchReport.count({
      where: {
        status: "pending",
      },
    }),
    prisma.fishingCatchReport.count({
      where: {
        status: {
          in: [
            "accepted",
            "approved",
            "resolved",
          ],
        },
      },
    }),
    prisma.fishingCatchReport.count({
      where: {
        status:
          "rejected",
      },
    }),
    prisma.fishingCatchReport.count(),
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          eyebrow="Moderacja"
          title="Połowy"
          description="Weryfikuj nowe połowy zgłoszone do rankingów oraz obsługuj zgłoszenia dotyczące wyników już opublikowanych."
          actions={
            <ButtonLink
              href="/admin"
              variant="outline"
            >
              Panel admina
            </ButtonLink>
          }
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard
            label="Do zatwierdzenia"
            value={
              pendingRankingCount
            }
            emphasis={
              pendingRankingCount >
              0
            }
          />

          <AdminMetricCard
            label="Zgłoszenia oczekujące"
            value={
              pendingReportsCount
            }
            emphasis={
              pendingReportsCount >
              0
            }
          />

          <AdminMetricCard
            label="Obsłużone zgłoszenia"
            value={
              resolvedReportsCount
            }
          />

          <AdminMetricCard
            label="Odrzucone zgłoszenia"
            value={
              rejectedReportsCount
            }
          />
        </section>

        <AdminStatusTabs
          pathname="/admin/zgloszenia-polowow"
          paramName="widok"
          activeValue={view}
          params={{}}
          items={[
            {
              value:
                "moderacja",
              label:
                "Do weryfikacji",
              count:
                pendingRankingCount,
            },
            {
              value:
                "zgloszenia",
              label:
                "Zgłoszone połowy",
              count:
                pendingReportsCount,
            },
          ]}
        />

        {view ===
        "moderacja" ? (
          <PendingCatchList
            query={query}
            requestedPage={
              requestedPage
            }
          />
        ) : (
          <ReportedCatchList
            query={query}
            status={status}
            requestedPage={
              requestedPage
            }
            counts={{
              all:
                allReportsCount,
              pending:
                pendingReportsCount,
              resolved:
                resolvedReportsCount,
              rejected:
                rejectedReportsCount,
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

async function PendingCatchList({
  query,
  requestedPage,
}: {
  query: string;
  requestedPage: number;
}) {
  const where: Prisma.FishingCatchWhereInput =
    {
      isPublic: true,
      rankingStatus:
        "pending",
      ...(query
        ? {
            OR: [
              {
                fishName: {
                  contains:
                    query,
                  mode:
                    "insensitive",
                },
              },
              {
                lakeName: {
                  contains:
                    query,
                  mode:
                    "insensitive",
                },
              },
              {
                userName: {
                  contains:
                    query,
                  mode:
                    "insensitive",
                },
              },
            ],
          }
        : {}),
    };

  const total =
    await prisma.fishingCatch.count({
      where,
    });

  const pagination =
    getAdminPagination(
      total,
      requestedPage,
      PER_PAGE
    );

  const catches =
    await prisma.fishingCatch.findMany({
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

  const supabase =
    await createClient();

  const withPreview =
    await Promise.all(
      catches.map(
        async (
          catchItem
        ) => ({
          ...catchItem,
          previewImageUrl:
            await getSignedImageUrl(
              supabase,
              catchItem.imagePath,
              catchItem.imageUrl
            ),
        })
      )
    );

  return (
    <section className="space-y-4">
      <AdminFilterToolbar
        action="/admin/zgloszenia-polowow"
        query={query}
        queryPlaceholder="Szukaj ryby, użytkownika lub łowiska..."
        hiddenFields={{
          widok:
            "moderacja",
        }}
        resetHref="/admin/zgloszenia-polowow"
      />

      {withPreview.length >
      0 ? (
        <>
          <div className="space-y-3">
            {withPreview.map(
              (
                catchItem
              ) => (
                <Card
                  key={
                    catchItem.id
                  }
                  className="overflow-hidden"
                >
                  <details className="group">
                    <summary className="cursor-pointer list-none marker:hidden">
                      <div className="grid gap-0 sm:grid-cols-[150px_minmax(0,1fr)]">
                        <div className="bg-surface-muted">
                          {catchItem.previewImageUrl ? (
                            <img
                              src={
                                catchItem.previewImageUrl
                              }
                              alt={`Połów: ${catchItem.fishName}`}
                              className="h-40 w-full object-cover sm:h-full"
                            />
                          ) : (
                            <div className="flex h-32 items-center justify-center text-xs font-bold text-text-muted sm:h-full">
                              Brak
                              zdjęcia
                            </div>
                          )}
                        </div>

                        <div className="p-5 sm:p-6">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <AdminStatusBadge
                                status="pending"
                              />

                              <h2 className="mt-3 font-display text-xl font-extrabold tracking-[-0.025em] text-text">
                                {
                                  catchItem.fishName
                                }
                              </h2>

                              <p className="mt-1 text-sm text-text-secondary">
                                {catchItem.userName ||
                                  catchItem.userId}
                                {" · "}
                                {catchItem.lakeName ||
                                  catchItem.lake?.name ||
                                  "Brak łowiska"}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-text-muted">
                                <span>
                                  {formatAdminWeight(
                                    catchItem.weight
                                  )}
                                </span>

                                <span>
                                  {formatAdminLength(
                                    catchItem.length
                                  )}
                                </span>

                                <span>
                                  {getAdminCatchMethodLabel(
                                    catchItem.method
                                  )}
                                </span>

                                <span>
                                  {formatAdminDate(
                                    catchItem.caughtAt
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
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
                        </div>
                      </div>
                    </summary>

                    <div className="border-t border-border bg-surface-muted px-5 py-6 sm:px-6">
                      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
                        <div className="min-w-0">
                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <AdminInfoItem
                              label="Waga"
                              value={formatAdminWeight(
                                catchItem.weight
                              )}
                            />

                            <AdminInfoItem
                              label="Długość"
                              value={formatAdminLength(
                                catchItem.length
                              )}
                            />

                            <AdminInfoItem
                              label="Metoda"
                              value={getAdminCatchMethodLabel(
                                catchItem.method
                              )}
                            />

                            <AdminInfoItem
                              label="Przynęta"
                              value={
                                catchItem.bait ||
                                "Brak"
                              }
                            />
                          </div>

                          {catchItem.note && (
                            <div className="mt-4 rounded-control border border-border bg-surface px-4 py-4">
                              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-text-muted">
                                Notatka
                                użytkownika
                              </p>

                              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-text-secondary">
                                {
                                  catchItem.note
                                }
                              </p>
                            </div>
                          )}
                        </div>

                        <aside className="space-y-3">
                          {catchItem.lake?.slug && (
                            <Card className="p-4">
                              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                                Łowisko
                              </p>

                              <div className="mt-3 grid gap-2">
                                <ButtonLink
                                  href={`/admin/lowiska/${catchItem.lake.slug}/edytuj`}
                                  variant="outline"
                                  size="sm"
                                  fullWidth
                                >
                                  Edytuj łowisko
                                </ButtonLink>

                                <ButtonLink
                                  href={`/lowiska-w-polsce/${catchItem.lake.slug}`}
                                  variant="ghost"
                                  size="sm"
                                  fullWidth
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Podgląd
                                  publiczny ↗
                                </ButtonLink>
                              </div>
                            </Card>
                          )}

                          <Card className="p-4">
                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                              Decyzja
                            </p>

                            <AdminCatchModerationActions
                              catchId={
                                catchItem.id
                              }
                              fishName={
                                catchItem.fishName
                              }
                            />
                          </Card>
                        </aside>
                      </div>
                    </div>
                  </details>
                </Card>
              )
            )}
          </div>

          <AdminPagination
            pathname="/admin/zgloszenia-polowow"
            page={
              pagination.page
            }
            totalPages={
              pagination.totalPages
            }
            params={{
              widok:
                "moderacja",
              q:
                query ||
                undefined,
            }}
          />
        </>
      ) : (
        <AdminEmptyState
          title="Brak połowów oczekujących"
          description="Wszystkie publiczne połowy zgłoszone do rankingu zostały już zweryfikowane."
        />
      )}
    </section>
  );
}

async function ReportedCatchList({
  query,
  status,
  requestedPage,
  counts,
}: {
  query: string;
  status: string;
  requestedPage: number;
  counts: {
    all: number;
    pending: number;
    resolved: number;
    rejected: number;
  };
}) {
  const statusWhere =
    status === "resolved"
      ? {
          status: {
            in: [
              "accepted",
              "approved",
              "resolved",
            ],
          },
        }
      : status === "all"
        ? {}
        : {
            status,
          };

  const where: Prisma.FishingCatchReportWhereInput =
    {
      ...statusWhere,
      ...(query
        ? {
            OR: [
              {
                reason: {
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
                fishingCatch: {
                  is: {
                    OR: [
                      {
                        fishName: {
                          contains:
                            query,
                          mode:
                            "insensitive",
                        },
                      },
                      {
                        lakeName: {
                          contains:
                            query,
                          mode:
                            "insensitive",
                        },
                      },
                      {
                        userName: {
                          contains:
                            query,
                          mode:
                            "insensitive",
                        },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

  const total =
    await prisma.fishingCatchReport.count({
      where,
    });

  const pagination =
    getAdminPagination(
      total,
      requestedPage,
      PER_PAGE
    );

  const reports =
    await prisma.fishingCatchReport.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: pagination.skip,
      take: PER_PAGE,
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

  const supabase =
    await createClient();

  const withPreview =
    await Promise.all(
      reports.map(
        async (report) => ({
          ...report,
          previewImageUrl:
            await getSignedImageUrl(
              supabase,
              report.fishingCatch
                .imagePath,
              report.fishingCatch
                .imageUrl
            ),
        })
      )
    );

  return (
    <section className="space-y-4">
      <AdminStatusTabs
        pathname="/admin/zgloszenia-polowow"
        paramName="status"
        activeValue={status}
        params={{
          widok:
            "zgloszenia",
          q:
            query ||
            undefined,
        }}
        items={[
          {
            value: "pending",
            label:
              "Oczekujące",
            count:
              counts.pending,
          },
          {
            value:
              "resolved",
            label:
              "Obsłużone",
            count:
              counts.resolved,
          },
          {
            value:
              "rejected",
            label:
              "Odrzucone",
            count:
              counts.rejected,
          },
          {
            value: "all",
            label:
              "Wszystkie",
            count:
              counts.all,
          },
        ]}
      />

      <AdminFilterToolbar
        action="/admin/zgloszenia-polowow"
        query={query}
        queryPlaceholder="Szukaj ryby, łowiska, użytkownika lub powodu..."
        hiddenFields={{
          widok:
            "zgloszenia",
          status:
            status !== "all"
              ? status
              : undefined,
        }}
        resetHref={`/admin/zgloszenia-polowow?widok=zgloszenia${
          status !== "all"
            ? `&status=${status}`
            : ""
        }`}
      />

      {withPreview.length >
      0 ? (
        <>
          <div className="space-y-3">
            {withPreview.map(
              (report) => (
                <Card
                  key={report.id}
                  className="overflow-hidden"
                >
                  <details className="group">
                    <summary className="cursor-pointer list-none marker:hidden">
                      <div className="grid gap-0 sm:grid-cols-[150px_minmax(0,1fr)]">
                        <div className="bg-surface-muted">
                          {report.previewImageUrl ? (
                            <img
                              src={
                                report.previewImageUrl
                              }
                              alt={`Połów: ${report.fishingCatch.fishName}`}
                              className="h-40 w-full object-cover sm:h-full"
                            />
                          ) : (
                            <div className="flex h-32 items-center justify-center text-xs font-bold text-text-muted sm:h-full">
                              Brak
                              zdjęcia
                            </div>
                          )}
                        </div>

                        <div className="p-5 sm:p-6">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <AdminStatusBadge
                                status={
                                  report.status
                                }
                              />

                              <h2 className="mt-3 font-display text-xl font-extrabold tracking-[-0.025em] text-text">
                                {
                                  report.fishingCatch.fishName
                                }
                              </h2>

                              <p className="mt-1 text-sm text-text-secondary">
                                Zgłosił:{" "}
                                {report.userEmail ||
                                  report.userId}
                              </p>

                              <p className="mt-2 line-clamp-1 text-xs text-danger-foreground">
                                {
                                  report.reason
                                }
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
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
                        </div>
                      </div>
                    </summary>

                    <div className="border-t border-border bg-surface-muted px-5 py-6 sm:px-6">
                      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
                        <div className="min-w-0 space-y-4">
                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <AdminInfoItem
                              label="Waga"
                              value={formatAdminWeight(
                                report.fishingCatch.weight
                              )}
                            />

                            <AdminInfoItem
                              label="Długość"
                              value={formatAdminLength(
                                report.fishingCatch.length
                              )}
                            />

                            <AdminInfoItem
                              label="Metoda"
                              value={getAdminCatchMethodLabel(
                                report.fishingCatch.method
                              )}
                            />

                            <AdminInfoItem
                              label="Łowisko"
                              value={
                                report.fishingCatch.lakeName ||
                                report.fishingCatch.lake?.name ||
                                "Brak"
                              }
                            />
                          </div>

                          <div className="rounded-control border border-danger-border bg-danger-subtle px-4 py-4">
                            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-danger-foreground">
                              Uzasadnienie
                              zgłoszenia
                            </p>

                            <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-danger-foreground">
                              {
                                report.reason
                              }
                            </p>
                          </div>

                          {report.fishingCatch.note && (
                            <div className="rounded-control border border-border bg-surface px-4 py-4">
                              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-text-muted">
                                Notatka przy
                                połowie
                              </p>

                              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-text-secondary">
                                {
                                  report.fishingCatch.note
                                }
                              </p>
                            </div>
                          )}

                          {report.adminNote && (
                            <div className="rounded-control border border-primary-200 bg-primary-50 px-4 py-4">
                              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-primary-700">
                                Notatka
                                administratora
                              </p>

                              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-text-secondary">
                                {
                                  report.adminNote
                                }
                              </p>
                            </div>
                          )}
                        </div>

                        <aside className="space-y-3">
                          {report.fishingCatch.lake?.slug && (
                            <Card className="p-4">
                              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                                Łowisko
                              </p>

                              <div className="mt-3 grid gap-2">
                                <ButtonLink
                                  href={`/admin/lowiska/${report.fishingCatch.lake.slug}/edytuj`}
                                  variant="outline"
                                  size="sm"
                                  fullWidth
                                >
                                  Edytuj łowisko
                                </ButtonLink>

                                <ButtonLink
                                  href={`/lowiska-w-polsce/${report.fishingCatch.lake.slug}`}
                                  variant="ghost"
                                  size="sm"
                                  fullWidth
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Podgląd
                                  publiczny ↗
                                </ButtonLink>
                              </div>
                            </Card>
                          )}

                          {report.status ===
                            "pending" && (
                            <Card className="p-4">
                              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                                Decyzja
                              </p>

                              <AdminCatchReportActions
                                reportId={
                                  report.id
                                }
                                fishName={
                                  report.fishingCatch.fishName
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
            pathname="/admin/zgloszenia-polowow"
            page={
              pagination.page
            }
            totalPages={
              pagination.totalPages
            }
            params={{
              widok:
                "zgloszenia",
              status:
                status !== "all"
                  ? status
                  : undefined,
              q:
                query ||
                undefined,
            }}
          />
        </>
      ) : (
        <AdminEmptyState
          title="Brak zgłoszeń dotyczących połowów"
          description="Nie znaleziono zgłoszeń pasujących do aktualnych filtrów."
        />
      )}
    </section>
  );
}

async function getSignedImageUrl(
  supabase: Awaited<
    ReturnType<
      typeof createClient
    >
  >,
  imagePath:
    | string
    | null,
  fallback:
    | string
    | null
) {
  if (!imagePath) {
    return fallback;
  }

  const { data } =
    await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(
        imagePath,
        60 * 60
      );

  return (
    data?.signedUrl ??
    fallback
  );
}

function normalizeReportStatus(
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
