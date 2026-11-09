import type {
  Prisma,
} from "@prisma/client";
import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";

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
  Button,
  ButtonLink,
} from "@/components/ui/Button";
import {
  Card,
} from "@/components/ui/Card";
import {
  PageHeader,
} from "@/components/ui/PageHeader";
import {
  Textarea,
} from "@/components/ui/Textarea";
import {
  clampAdminPage,
  formatAdminDate,
  getAdminPagination,
} from "@/lib/admin/admin-formatters";
import {
  getAdminClaimRoleLabel,
} from "@/lib/admin/admin-status";
import {
  requireAdmin,
} from "@/lib/auth";
import {
  prisma,
} from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

const PER_PAGE = 15;

type PageProps = {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
};

type OwnerClaimActionResult = {
  claimId: string;
  adminNote?: string;
};

export default async function OwnerClaimsAdminPage({
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

  const query =
    params.q?.trim() ?? "";

  const requestedPage =
    clampAdminPage(params.page);

  const where: Prisma.LakeOwnerClaimWhereInput =
    {
      ...(status !== "all"
        ? { status }
        : {}),
      ...(query
        ? {
            OR: [
              {
                claimantName: {
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
    approvedCount,
    rejectedCount,
    ownersCount,
    filteredCount,
  ] = await Promise.all([
    prisma.lakeOwnerClaim.count(),
    prisma.lakeOwnerClaim.count({
      where: {
        status: "pending",
      },
    }),
    prisma.lakeOwnerClaim.count({
      where: {
        status:
          "approved",
      },
    }),
    prisma.lakeOwnerClaim.count({
      where: {
        status:
          "rejected",
      },
    }),
    prisma.lakeOwner.count({
      where: {
        isActive: true,
      },
    }),
    prisma.lakeOwnerClaim.count({
      where,
    }),
  ]);

  const pagination =
    getAdminPagination(
      filteredCount,
      requestedPage,
      PER_PAGE
    );

  const claims =
    await prisma.lakeOwnerClaim.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: pagination.skip,
      take: PER_PAGE,
      include: {
        lake: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            voivodeship: true,
            contactName: true,
            contactPhone: true,
            contactEmail: true,
            contactWebsite: true,
          },
        },
      },
    });

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          eyebrow="Moderacja"
          title="Zgłoszenia właścicieli"
          description="Weryfikuj osoby chcące przejąć profil łowiska i nadawaj dostęp właścicielski dopiero po sprawdzeniu zgłoszenia."
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
            label="Oczekujące"
            value={pendingCount}
            emphasis={
              pendingCount > 0
            }
          />

          <AdminMetricCard
            label="Zatwierdzone"
            value={approvedCount}
          />

          <AdminMetricCard
            label="Odrzucone"
            value={rejectedCount}
          />

          <AdminMetricCard
            label="Aktywni właściciele"
            value={ownersCount}
          />
        </section>

        <div className="space-y-3">
          <AdminStatusTabs
            pathname="/admin/zgloszenia-wlascicieli"
            paramName="status"
            activeValue={status}
            params={{
              q:
                query ||
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
                  "approved",
                label:
                  "Zatwierdzone",
                count:
                  approvedCount,
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
            action="/admin/zgloszenia-wlascicieli"
            query={query}
            queryPlaceholder="Szukaj łowiska, osoby lub e-maila..."
            hiddenFields={{
              status:
                status !==
                "all"
                  ? status
                  : undefined,
            }}
            resetHref={
              status === "all"
                ? "/admin/zgloszenia-wlascicieli"
                : `/admin/zgloszenia-wlascicieli?status=${status}`
            }
          />
        </div>

        {claims.length > 0 ? (
          <>
            <div className="space-y-3">
              {claims.map(
                (claim) => (
                  <Card
                    key={claim.id}
                    className="overflow-hidden"
                  >
                    <details className="group">
                      <summary className="cursor-pointer list-none p-5 marker:hidden sm:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <AdminStatusBadge
                                status={
                                  claim.status
                                }
                              />

                              <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-text-muted">
                                {getAdminClaimRoleLabel(
                                  claim.claimantRole
                                )}
                              </span>
                            </div>

                            <h2 className="mt-3 font-display text-lg font-extrabold tracking-[-0.025em] text-text">
                              {
                                claim.lake.name
                              }
                            </h2>

                            <p className="mt-1 text-sm text-text-secondary">
                              {
                                claim.lake.city
                              }
                              , woj.{" "}
                              {
                                claim.lake.voivodeship
                              }
                            </p>

                            <p className="mt-2 text-xs text-text-muted">
                              {claim.claimantName ||
                                "Nie podano imienia"}
                              {" · "}
                              {claim.userEmail ||
                                "Brak e-maila"}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <span className="text-xs text-text-muted">
                              {formatAdminDate(
                                claim.createdAt
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
                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                          <div className="min-w-0 space-y-5">
                            <section>
                              <h3 className="text-[10px] font-black uppercase tracking-[0.13em] text-text-muted">
                                Dane zgłaszającego
                              </h3>

                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <AdminInfoItem
                                  label="Imię i nazwisko"
                                  value={
                                    claim.claimantName ||
                                    "Brak"
                                  }
                                />

                                <AdminInfoItem
                                  label="Telefon"
                                  value={
                                    claim.claimantPhone ||
                                    "Brak"
                                  }
                                />

                                <AdminInfoItem
                                  label="E-mail konta"
                                  value={
                                    claim.userEmail ||
                                    "Brak"
                                  }
                                />

                                <AdminInfoItem
                                  label="Rola"
                                  value={getAdminClaimRoleLabel(
                                    claim.claimantRole
                                  )}
                                />
                              </div>
                            </section>

                            <section>
                              <h3 className="text-[10px] font-black uppercase tracking-[0.13em] text-text-muted">
                                Wiadomość
                              </h3>

                              <div className="mt-3 rounded-control border border-border bg-surface px-4 py-4 text-sm leading-6 text-text-secondary">
                                {claim.message ||
                                  "Brak dodatkowej wiadomości."}
                              </div>
                            </section>

                            {claim.adminNote && (
                              <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.13em] text-primary-700">
                                  Notatka administratora
                                </h3>

                                <div className="mt-3 rounded-control border border-primary-200 bg-primary-50 px-4 py-4 text-sm leading-6 text-text-secondary">
                                  {
                                    claim.adminNote
                                  }
                                </div>
                              </section>
                            )}

                            {claim.status ===
                              "pending" && (
                              <section className="rounded-card border border-border bg-surface p-4 sm:p-5">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.13em] text-text-muted">
                                  Decyzja
                                </h3>

                                <form
                                  action={
                                    approveOwnerClaim
                                  }
                                  className="mt-4 space-y-4"
                                >
                                  <input
                                    type="hidden"
                                    name="claimId"
                                    value={
                                      claim.id
                                    }
                                  />

                                  <label className="grid gap-2">
                                    <span className="text-sm font-bold text-text-secondary">
                                      Notatka administratora
                                    </span>

                                    <Textarea
                                      name="adminNote"
                                      rows={4}
                                      maxLength={
                                        1000
                                      }
                                      placeholder="Opcjonalnie, np. potwierdzono telefonicznie..."
                                    />
                                  </label>

                                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                    <Button
                                      type="submit"
                                      variant="primary"
                                    >
                                      Zatwierdź i nadaj dostęp
                                    </Button>

                                    <Button
                                      type="submit"
                                      variant="danger"
                                      formAction={
                                        rejectOwnerClaim
                                      }
                                    >
                                      Odrzuć zgłoszenie
                                    </Button>
                                  </div>
                                </form>
                              </section>
                            )}
                          </div>

                          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
                            <Card className="p-4">
                              <p className="text-[10px] font-black uppercase tracking-[0.13em] text-text-muted">
                                Łowisko
                              </p>

                              <div className="mt-3 grid gap-2">
                                <AdminInfoItem
                                  label="Nazwa"
                                  value={
                                    claim.lake.name
                                  }
                                />

                                <AdminInfoItem
                                  label="Miejscowość"
                                  value={`${claim.lake.city}, ${claim.lake.voivodeship}`}
                                />

                                <AdminInfoItem
                                  label="Kontakt"
                                  value={
                                    claim.lake.contactName ||
                                    "Brak"
                                  }
                                />

                                <AdminInfoItem
                                  label="Telefon"
                                  value={
                                    claim.lake.contactPhone ||
                                    "Brak"
                                  }
                                />

                                <AdminInfoItem
                                  label="E-mail"
                                  value={
                                    claim.lake.contactEmail ||
                                    "Brak"
                                  }
                                />
                              </div>

                              <div className="mt-4 grid gap-2">
                                <ButtonLink
                                  href={`/admin/lowiska/${claim.lake.slug}/edytuj`}
                                  variant="outline"
                                  size="sm"
                                  fullWidth
                                >
                                  Edytuj łowisko
                                </ButtonLink>

                                <ButtonLink
                                  href={`/lowiska-w-polsce/${claim.lake.slug}`}
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

                            {claim.status ===
                              "approved" && (
                              <div className="rounded-card border border-success-border bg-success-subtle px-4 py-4">
                                <p className="text-sm font-extrabold text-success-foreground">
                                  Dostęp nadany
                                </p>

                                <p className="mt-1 text-xs leading-5 text-success-foreground/80">
                                  Użytkownik jest aktywnym właścicielem tego łowiska.
                                </p>
                              </div>
                            )}

                            {claim.status ===
                              "rejected" && (
                              <div className="rounded-card border border-danger-border bg-danger-subtle px-4 py-4">
                                <p className="text-sm font-extrabold text-danger-foreground">
                                  Zgłoszenie odrzucone
                                </p>

                                <p className="mt-1 text-xs leading-5 text-danger-foreground/80">
                                  Dostęp właścicielski nie został nadany.
                                </p>
                              </div>
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
              pathname="/admin/zgloszenia-wlascicieli"
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
                q:
                  query ||
                  undefined,
              }}
            />
          </>
        ) : (
          <AdminEmptyState
            title="Brak zgłoszeń właścicieli"
            description="Nie znaleziono zgłoszeń pasujących do aktualnych filtrów."
          />
        )}
      </div>
    </DashboardLayout>
  );
}

async function approveOwnerClaim(
  formData: FormData
) {
  "use server";

  const admin =
    await requireAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  const {
    claimId,
    adminNote,
  } =
    getOwnerClaimActionData(
      formData
    );

  if (!claimId) {
    redirect(
      "/admin/zgloszenia-wlascicieli"
    );
  }

  const claim =
    await prisma.lakeOwnerClaim.findUnique(
      {
        where: {
          id: claimId,
        },
        include: {
          lake: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }
    );

  if (!claim) {
    redirect(
      "/admin/zgloszenia-wlascicieli"
    );
  }

  await prisma.$transaction(
    async (transaction) => {
      await transaction.lakeOwner.upsert(
        {
          where: {
            lakeId_userId: {
              lakeId:
                claim.lakeId,
              userId:
                claim.userId,
            },
          },
          update: {
            userEmail:
              claim.userEmail,
            role: "owner",
            canEditLake:
              true,
            canManageReservations:
              true,
            canManageSpots:
              true,
            isActive: true,
          },
          create: {
            lakeId:
              claim.lakeId,
            userId:
              claim.userId,
            userEmail:
              claim.userEmail,
            role: "owner",
            canEditLake:
              true,
            canManageReservations:
              true,
            canManageSpots:
              true,
            isActive: true,
          },
        }
      );

      await transaction.lakeOwnerClaim.update(
        {
          where: {
            id: claim.id,
          },
          data: {
            status:
              "approved",
            adminNote:
              adminNote ||
              null,
            reviewedAt:
              new Date(),
            reviewedByUserId:
              admin.id,
          },
        }
      );

      await transaction.userNotification.create(
        {
          data: {
            userId:
              claim.userId,
            title:
              "Profil łowiska został przypisany",
            message: `Twoje zgłoszenie przejęcia profilu łowiska ${claim.lake.name} zostało zatwierdzone.`,
            href: `/lowiska-w-polsce/${claim.lake.slug}`,
            type:
              "success",
          },
        }
      );
    }
  );

  revalidatePath(
    "/admin/zgloszenia-wlascicieli"
  );
  revalidatePath("/admin");

  redirect(
    "/admin/zgloszenia-wlascicieli"
  );
}

async function rejectOwnerClaim(
  formData: FormData
) {
  "use server";

  const admin =
    await requireAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  const {
    claimId,
    adminNote,
  } =
    getOwnerClaimActionData(
      formData
    );

  if (!claimId) {
    redirect(
      "/admin/zgloszenia-wlascicieli"
    );
  }

  const claim =
    await prisma.lakeOwnerClaim.findUnique(
      {
        where: {
          id: claimId,
        },
        include: {
          lake: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }
    );

  if (!claim) {
    redirect(
      "/admin/zgloszenia-wlascicieli"
    );
  }

  await prisma.$transaction(
    async (transaction) => {
      await transaction.lakeOwnerClaim.update(
        {
          where: {
            id: claim.id,
          },
          data: {
            status:
              "rejected",
            adminNote:
              adminNote ||
              null,
            reviewedAt:
              new Date(),
            reviewedByUserId:
              admin.id,
          },
        }
      );

      await transaction.userNotification.create(
        {
          data: {
            userId:
              claim.userId,
            title:
              "Zgłoszenie przejęcia profilu odrzucone",
            message: `Twoje zgłoszenie przejęcia profilu łowiska ${claim.lake.name} zostało odrzucone.`,
            href: `/lowiska-w-polsce/${claim.lake.slug}`,
            type:
              "warning",
          },
        }
      );
    }
  );

  revalidatePath(
    "/admin/zgloszenia-wlascicieli"
  );
  revalidatePath("/admin");

  redirect(
    "/admin/zgloszenia-wlascicieli"
  );
}

function getOwnerClaimActionData(
  formData: FormData
): OwnerClaimActionResult {
  return {
    claimId: String(
      formData.get(
        "claimId"
      ) || ""
    ).trim(),
    adminNote: String(
      formData.get(
        "adminNote"
      ) || ""
    ).trim(),
  };
}

function normalizeStatus(
  value:
    | string
    | undefined
) {
  if (
    value === "approved" ||
    value === "rejected" ||
    value === "all"
  ) {
    return value;
  }

  return "pending";
}
